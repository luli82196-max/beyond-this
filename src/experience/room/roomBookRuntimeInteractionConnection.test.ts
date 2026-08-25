import assert from 'node:assert/strict'
import { createRoomBookRuntimeInteractionConnection } from './roomBookRuntimeInteractionConnection'

{
  const runtime = createRoomBookRuntimeInteractionConnection()
  assert.equal(runtime.connect(), null)
  const opened = runtime.open()
  assert.equal(opened?.page?.pageId, 'cover')
  assert.equal(opened?.visualMode, 'opened-book')
  assert.equal(runtime.next()?.page?.pageId, 'visual-rule')
  assert.equal(runtime.previous()?.page?.pageId, 'cover')
  runtime.disconnect()
}

{
  const runtime = createRoomBookRuntimeInteractionConnection()
  runtime.connect()
  assert.equal(runtime.handleKeyboard('Enter')?.page?.pageId, 'cover')
  assert.equal(runtime.handleKeyboard('ArrowRight')?.page?.pageId, 'visual-rule')
  assert.equal(runtime.handleKeyboard('ArrowLeft')?.page?.pageId, 'cover')
  assert.equal(runtime.handleKeyboard('Escape'), null)
  assert.equal(runtime.getVisual(), null)
  assert.equal(runtime.handleKeyboard('Enter')?.page?.pageId, 'cover')
  runtime.disconnect()
}

{
  const runtime = createRoomBookRuntimeInteractionConnection()
  runtime.connect()
  const first = runtime.open()
  const sourceSnapshot = JSON.stringify(first)
  let released = false
  runtime.subscribe((visual) => { if (visual === null) released = true })
  runtime.next()
  assert.equal(JSON.stringify(first), sourceSnapshot)
  assert.equal(first?.page?.pageId, 'cover')
  runtime.close()
  assert.equal(released, true)
  assert.deepEqual(first?.capabilities, { mutatesContent: false, controlsNavigation: false, controlsLifecycle: false, executesPageTransition: false })
  runtime.disconnect()
}

console.log('Phase 13.8.6 Book Runtime Interaction Connection tests passed')
