import { createRoomBookRuntimeInteractionConnection } from './roomBookRuntimeInteractionConnection'
import { createRoomProcessRuntimeInteractionConnection } from './roomProcessRuntimeInteractionConnection'
import { createRoomProjectionRuntimeInteractionConnection } from './roomProjectionRuntimeInteractionConnection'

const assert = (condition: unknown, message: string): asserts condition => { if (!condition) throw new Error(message) }
const book = createRoomBookRuntimeInteractionConnection()
const process = createRoomProcessRuntimeInteractionConnection()
const projection = createRoomProjectionRuntimeInteractionConnection()

book.connect(); process.connect(); projection.connect()
const activeCount = () => Number(Boolean(book.getVisual())) + Number(Boolean(process.getVisual())) + Number(Boolean(projection.getOutput()))
const closeAll = () => { book.close(); process.close(); projection.close() }

book.open(); assert(activeCount() === 1 && book.getVisual(), 'Book must be the only active Room surface')
book.close(); assert(activeCount() === 0, 'closing Book must restore neutral Room input')
closeAll(); process.open(); assert(activeCount() === 1 && process.getVisual(), 'Process switch must release every previous surface')
process.handleKeyboard('ArrowRight'); assert(process.getVisual()?.activeDecisionIndex === 1, 'Process navigation must remain local to Process')
process.close(); assert(activeCount() === 0, 'closing Process must clear its local visual state')
closeAll(); projection.open(); assert(activeCount() === 1 && projection.getOutput()?.mediaBoundaryIntent?.type === 'prepare', 'Projection must be the only active surface and remain metadata-only')
projection.close(); assert(activeCount() === 0, 'closing Projection must release output and media intent')

book.open(); closeAll(); process.open(); assert(activeCount() === 1, 'surface switching must never expose two active surfaces')
closeAll(); projection.open(); assert(activeCount() === 1, 'the full Book to Process to Projection chain must remain exclusive')
projection.handleKeyboard('Escape'); assert(activeCount() === 0, 'Escape must return to the neutral Room')

book.disconnect(); process.disconnect(); projection.disconnect()
assert(activeCount() === 0, 'Room unmount must release all runtime output')
book.connect(); process.connect(); projection.connect()
assert(activeCount() === 0, 'Room remount must start deterministically neutral')
book.open(); assert(book.getVisual()?.page.pageId === 'cover', 'Book remount must reopen at its deterministic first page')
closeAll(); process.open(); process.next(); process.close(); assert(process.open()?.activeDecisionIndex === 0, 'Process reopen must restore the first decision')
closeAll(); projection.open(); assert(projection.getOutput()?.fragmentId === 'bt-p03-motion-study', 'Projection reopen must restore the canonical fragment')
closeAll(); book.disconnect(); process.disconnect(); projection.disconnect()

console.log('Phase MVP-01.3 Complete Room Experience Integration tests passed.')
