import { readFile } from 'node:fs/promises'
import process from 'node:process'

const DEFAULT_ORIGIN = 'https://beyond-this.vercel.app'
const TIMEOUT_MS = Number.parseInt(process.env.VERIFY_TIMEOUT_MS ?? '15000', 10)
const CONFIG_ONLY = process.argv.includes('--config-only')
const originArgument = process.argv.find((argument) => argument.startsWith('--origin='))
const origin = (originArgument?.slice('--origin='.length) || DEFAULT_ORIGIN).replace(/\/$/, '')
const results = []

function record(name, state, detail) {
  results.push({ state })
  console.log(`${state.padEnd(10)} ${name}: ${detail}`)
}

function header(response, name) {
  return response.headers.get(name) ?? '(absent)'
}

async function request(path, init = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(`${origin}${path}`, { redirect: 'follow', ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function runCheck(name, check) {
  try {
    await check()
  } catch (error) {
    record(name, 'UNVERIFIED', error instanceof Error ? error.message : String(error))
  }
}

async function checkConfig() {
  const [indexHtml, vercelText] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../vercel.json', import.meta.url), 'utf8'),
  ])
  const canonicalLinks = [...indexHtml.matchAll(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi)]
  const correctCanonical = canonicalLinks.length === 1
    && /href=["']https:\/\/beyond-this\.vercel\.app["']/.test(canonicalLinks[0][0])
  record('source canonical', correctCanonical ? 'PASS' : 'FAIL', correctCanonical ? 'unique and correct' : `expected one canonical; found ${canonicalLinks.length}`)

  let config
  try {
    config = JSON.parse(vercelText)
  } catch (error) {
    record('vercel.json syntax', 'FAIL', error instanceof Error ? error.message : String(error))
    return
  }
  record('vercel.json syntax', 'PASS', 'valid JSON')

  const expectedSource = '/((?!.*\\.[^/]+$).*)'
  const rewrite = config.rewrites?.find((entry) => entry.destination === '/index.html')
  const routingValid = config.rewrites?.length === 1 && rewrite?.source === expectedSource
  record('SPA/static routing contract', routingValid ? 'PASS' : 'FAIL', routingValid
    ? 'extensionless paths fall back; file-like paths remain 404 candidates'
    : `expected the single SPA rewrite source ${expectedSource}`)
}

function reportResponse(name, response, expectedStatuses, expectedType, extraHeaders = []) {
  const contentType = header(response, 'content-type')
  const state = expectedStatuses.includes(response.status)
    && (!expectedType || contentType.toLowerCase().includes(expectedType)) ? 'PASS' : 'FAIL'
  const details = [`status=${response.status}`, `content-type=${contentType}`,
    ...extraHeaders.map((name) => `${name}=${header(response, name)}`)]
  record(name, state, details.join(' | '))
}

async function checkProduction() {
  let homepageHtml = ''
  await runCheck('homepage', async () => {
    const response = await request('/')
    homepageHtml = await response.text()
    reportResponse('homepage', response, [200], 'text/html')
  })

  if (homepageHtml) {
    const matches = [...homepageHtml.matchAll(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi)]
    const correct = matches.length === 1
      && /href=["']https:\/\/beyond-this\.vercel\.app["']/.test(matches[0][0])
    record('production canonical', correct ? 'PASS' : 'FAIL', correct ? 'unique and correct' : `found ${matches.length}; expected ${DEFAULT_ORIGIN}`)
  } else {
    record('production canonical', 'UNVERIFIED', 'homepage body unavailable')
  }

  for (const [name, path, type] of [
    ['OG image', '/og/beyond-this-og.png', 'image/png'],
    ['favicon', '/icons/favicon-64.png', 'image/png'],
  ]) {
    await runCheck(name, async () => reportResponse(name, await request(path, { method: 'HEAD' }), [200], type))
  }

  const mp4 = '/media/after_the_second_sunset_motion_blocking_v01.mp4'
  await runCheck('MP4 HEAD', async () => reportResponse('MP4 HEAD', await request(mp4, { method: 'HEAD' }), [200], 'video/mp4', ['content-length', 'accept-ranges']))
  await runCheck('MP4 GET', async () => {
    const response = await request(mp4)
    reportResponse('MP4 GET', response, [200], 'video/mp4', ['content-length', 'accept-ranges'])
    await response.body?.cancel()
  })
  await runCheck('MP4 Range', async () => {
    const response = await request(mp4, { headers: { Range: 'bytes=0-1023' } })
    reportResponse('MP4 Range', response, [206], 'video/mp4', ['content-range', 'content-length', 'accept-ranges'])
    await response.body?.cancel()
  })

  for (const [name, path] of [
    ['Forest ambience OGG', '/audio/forest/forest-ambience-loop-v1.ogg'],
    ['Autumn leaves OGG', '/audio/forest/autumn-leaves-loop-v1.ogg'],
  ]) {
    await runCheck(name, async () => reportResponse(name, await request(path, { method: 'HEAD' }), [200], 'audio/ogg', ['content-length', 'cache-control']))
  }

  await runCheck('missing static asset', async () => reportResponse('missing static asset', await request('/__beyond_this_missing_asset__.png', { method: 'HEAD' }), [404], null))
  await runCheck('SPA fallback path', async () => reportResponse('SPA fallback path', await request('/experience', { method: 'HEAD' }), [200], 'text/html'))
}

console.log(`Beyond This launch evidence | origin=${origin} | timeout=${TIMEOUT_MS}ms`)
await checkConfig()
if (!CONFIG_ONLY) await checkProduction()

const count = (state) => results.filter((result) => result.state === state).length
console.log(`SUMMARY    PASS=${count('PASS')} FAIL=${count('FAIL')} UNVERIFIED=${count('UNVERIFIED')}`)
if (count('FAIL') > 0) process.exitCode = 1
else if (count('UNVERIFIED') > 0) process.exitCode = 2
