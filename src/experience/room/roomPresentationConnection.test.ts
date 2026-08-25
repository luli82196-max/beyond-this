import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { createRoomInteractionController } from './roomInteractionController'
import { createRoomPresentationConnection } from './roomPresentationConnection'
import { createPresentationStateContainer } from './roomPresentationStateContainer'

test('connected controller transitions commit presentation state', () => {
  const controller = createRoomInteractionController()
  const connection = createRoomPresentationConnection(controller)
  const states: string[] = []

  connection.subscribe((snapshot) => states.push(snapshot.presentation?.state ?? 'none'))
  connection.connect()
  controller.dispatch({ surface: 'interface', type: 'approach' })
  controller.dispatch({ surface: 'interface', type: 'attend' })

  assert.deepEqual(states, ['preview', 'focused'])
  assert.equal(connection.getSnapshot().presentation?.state, 'focused')
})

test('disconnect stops notifications and transition dispatch', () => {
  const controller = createRoomInteractionController()
  const connection = createRoomPresentationConnection(controller)
  let notifications = 0

  connection.subscribe(() => { notifications += 1 })
  connection.connect()
  controller.dispatch({ surface: 'interface', type: 'approach' })
  const beforeDisconnect = connection.getSnapshot()
  connection.disconnect()
  controller.dispatch({ surface: 'interface', type: 'attend' })

  assert.equal(notifications, 1)
  assert.equal(connection.getSnapshot(), beforeDisconnect)
  assert.equal(connection.isConnected(), false)
})

test('repeated connect and disconnect calls are idempotent', () => {
  const controller = createRoomInteractionController()
  const connection = createRoomPresentationConnection(controller)
  let notifications = 0

  connection.subscribe(() => { notifications += 1 })
  connection.connect()
  connection.connect()
  controller.dispatch({ surface: 'interface', type: 'approach' })
  connection.disconnect()
  connection.disconnect()
  controller.dispatch({ surface: 'interface', type: 'attend' })

  assert.equal(notifications, 1)
  assert.equal(connection.isConnected(), false)
})

test('surface switch publishes one atomic post-transition snapshot', () => {
  const controller = createRoomInteractionController()
  const connection = createRoomPresentationConnection(controller)
  const observed: Array<{ active: string | null; state: string | null }> = []

  connection.subscribe((snapshot) => {
    observed.push({
      active: snapshot.activeSurface,
      state: snapshot.presentation?.state ?? null,
    })
  })
  connection.connect()
  controller.dispatch({ surface: 'interface', type: 'approach' })
  controller.dispatch({ surface: 'interface', type: 'attend' })
  controller.dispatch({ surface: 'interface', type: 'activate' })
  observed.length = 0

  controller.dispatch({ surface: 'book', type: 'approach' })

  assert.deepEqual(observed, [{ active: 'book', state: 'preview' }])
  assert.equal(connection.getSnapshot().presentation?.surface, 'book')
  assert.equal(connection.getSnapshot().presentation?.state, 'preview')
})

test('subscriber errors are isolated from sibling subscribers and state commits', () => {
  const controller = createRoomInteractionController()
  const connection = createRoomPresentationConnection(controller)
  const states: string[] = []

  connection.subscribe(() => { throw new Error('observer failure') })
  connection.subscribe((snapshot) => states.push(snapshot.presentation?.state ?? 'none'))
  connection.connect()
  controller.dispatch({ surface: 'interface', type: 'approach' })

  assert.deepEqual(states, ['preview'])
  assert.equal(connection.getSnapshot().presentation?.state, 'preview')
})

test('bridge errors preserve snapshot identity and reconnect continues from it', () => {
  const controller = createRoomInteractionController()
  const container = createPresentationStateContainer()
  const connection = createRoomPresentationConnection(controller, container)

  connection.connect()
  controller.dispatch({ surface: 'interface', type: 'approach' })
  const beforeFailure = connection.getSnapshot()
  container.dispatch(Object.freeze({
    event: Object.freeze({ surface: 'invalid-surface', type: 'attend' }),
    previous: 'ambient',
    current: 'focus',
    changed: true,
  }) as never)
  assert.equal(connection.getSnapshot(), beforeFailure)

  connection.disconnect()
  const reconnectedStates: string[] = []
  connection.subscribe((snapshot) => reconnectedStates.push(snapshot.presentation?.state ?? 'none'))
  connection.connect()
  assert.equal(connection.getSnapshot(), beforeFailure)
  controller.dispatch({ surface: 'interface', type: 'attend' })

  assert.deepEqual(reconnectedStates, ['focused'])
  assert.equal(connection.getSnapshot().presentation?.state, 'focused')
})

test('disconnect releases controller, container, and subscriber ownership', () => {
  const controller = createRoomInteractionController()
  const connection = createRoomPresentationConnection(controller)

  connection.subscribe(() => undefined)
  connection.connect()
  assert.deepEqual(connection.getOwnership(), {
    controllerSubscription: true,
    containerSubscription: true,
    subscriberCount: 1,
  })

  connection.disconnect()
  assert.deepEqual(connection.getOwnership(), {
    controllerSubscription: false,
    containerSubscription: false,
    subscriberCount: 0,
  })
})

test('partial disconnect failure still releases remaining ownership and permits recovery', () => {
  const baseController = createRoomInteractionController()
  let firstRelease = true
  const controller = Object.freeze({
    ...baseController,
    subscribe(listener: Parameters<typeof baseController.subscribe>[0]) {
      const unsubscribe = baseController.subscribe(listener)
      return () => {
        unsubscribe()
        if (firstRelease) {
          firstRelease = false
          throw new Error('controller cleanup failure')
        }
      }
    },
  })
  const connection = createRoomPresentationConnection(controller)

  connection.connect()
  connection.disconnect()
  assert.deepEqual(connection.getOwnership(), {
    controllerSubscription: false,
    containerSubscription: false,
    subscriberCount: 0,
  })

  let notifications = 0
  connection.subscribe(() => { notifications += 1 })
  connection.connect()
  baseController.dispatch({ surface: 'interface', type: 'approach' })
  assert.equal(notifications, 1)
  assert.equal(connection.getSnapshot().presentation?.state, 'preview')
})

test('diagnostics snapshot reports connection, ownership, and latest lifecycle records', () => {
  const controller = createRoomInteractionController()
  const connection = createRoomPresentationConnection(controller)

  connection.subscribe(() => undefined)
  connection.connect()
  const transition = controller.dispatch({ surface: 'interface', type: 'approach' })
  const active = connection.getDiagnostics()

  assert.equal(Object.isFrozen(active), true)
  assert.equal(Object.isFrozen(active.ownership), true)
  assert.deepEqual(active, {
    connected: true,
    connectionCycle: 1,
    ownership: {
      controllerSubscription: true,
      containerSubscription: true,
      subscriberCount: 1,
    },
    subscriberCount: 1,
    lastTransition: transition,
    lastDisconnect: null,
    auditSequence: 2,
    auditTrail: [
      { sequence: 1, cycle: 1, action: 'connect' },
      { sequence: 2, cycle: 1, action: 'transition' },
    ],
  })

  connection.disconnect()
  const released = connection.getDiagnostics()
  assert.equal(released.connected, false)
  assert.equal(released.lastTransition, transition)
  assert.deepEqual(released.lastDisconnect, {
    cycle: 1,
    status: 'complete',
    releaseOrder: ['controller', 'container', 'subscribers'],
    cleanupErrors: [],
  })
  assert.equal(Object.isFrozen(released.lastDisconnect), true)
  assert.equal(Object.isFrozen(released.lastDisconnect?.releaseOrder), true)
  assert.equal(Object.isFrozen(released.auditTrail), true)
})

test('diagnostics observer errors are isolated from siblings and lifecycle state', () => {
  const controller = createRoomInteractionController()
  const connection = createRoomPresentationConnection(controller)
  const sequences: number[] = []

  connection.observeDiagnostics(() => { throw new Error('diagnostics observer failure') })
  connection.observeDiagnostics((diagnostics) => sequences.push(diagnostics.auditSequence))
  connection.connect()
  controller.dispatch({ surface: 'interface', type: 'approach' })
  connection.disconnect()

  assert.deepEqual(sequences, [1, 2, 3, 4, 5, 6])
  assert.equal(connection.getDiagnostics().connected, false)
})

test('audit sequence is monotonic and transitions remain traceable', () => {
  const controller = createRoomInteractionController()
  const connection = createRoomPresentationConnection(controller)

  connection.connect()
  controller.dispatch({ surface: 'interface', type: 'approach' })
  controller.dispatch({ surface: 'interface', type: 'attend' })
  connection.disconnect()

  const audit = connection.getDiagnostics().auditTrail
  assert.deepEqual(audit.map((entry) => entry.sequence), [1, 2, 3, 4, 5, 6, 7])
  assert.deepEqual(audit.map((entry) => entry.action), [
    'connect',
    'transition',
    'transition',
    'teardown-controller',
    'teardown-container',
    'teardown-subscribers',
    'disconnect',
  ])
  assert.equal(new Set(audit.map((entry) => entry.sequence)).size, audit.length)
})

test('multiple lifecycle cycles retain consistent cycle and teardown audit order', () => {
  const controller = createRoomInteractionController()
  const connection = createRoomPresentationConnection(controller)

  for (let cycle = 1; cycle <= 3; cycle += 1) {
    connection.connect()
    connection.disconnect()
  }

  const audit = connection.getDiagnostics().auditTrail
  for (let cycle = 1; cycle <= 3; cycle += 1) {
    assert.deepEqual(
      audit.filter((entry) => entry.cycle === cycle).map((entry) => entry.action),
      ['connect', 'teardown-controller', 'teardown-container', 'teardown-subscribers', 'disconnect'],
    )
  }
  assert.equal(connection.getDiagnostics().connectionCycle, 3)
})

test('diagnostics observer cleanup stops delivery without affecting connection audit', () => {
  const controller = createRoomInteractionController()
  const connection = createRoomPresentationConnection(controller)
  let notifications = 0
  const unsubscribe = connection.observeDiagnostics(() => { notifications += 1 })

  connection.connect()
  unsubscribe()
  unsubscribe()
  connection.disconnect()

  assert.equal(notifications, 1)
  assert.equal(connection.getDiagnostics().auditSequence, 5)
})

test('multiple connection cycles retain consistent released diagnostics', () => {
  const controller = createRoomInteractionController()
  const connection = createRoomPresentationConnection(controller)

  for (let cycle = 1; cycle <= 4; cycle += 1) {
    connection.subscribe(() => undefined)
    connection.connect()
    connection.disconnect()
    assert.deepEqual(connection.getOwnership(), {
      controllerSubscription: false,
      containerSubscription: false,
      subscriberCount: 0,
    })
    assert.equal(connection.getDiagnostics().connectionCycle, cycle)
    assert.equal(connection.getDiagnostics().lastDisconnect?.cycle, cycle)
  }
})

test('teardown order is stable and cleanup failures are recorded by resource', () => {
  const order: string[] = []
  const baseController = createRoomInteractionController()
  const baseContainer = createPresentationStateContainer()
  const controller = Object.freeze({
    ...baseController,
    subscribe(listener: Parameters<typeof baseController.subscribe>[0]) {
      const unsubscribe = baseController.subscribe(listener)
      return () => {
        order.push('controller')
        unsubscribe()
        throw new Error('recorded cleanup failure')
      }
    },
  })
  const container = Object.freeze({
    ...baseContainer,
    subscribe(listener: Parameters<typeof baseContainer.subscribe>[0]) {
      const unsubscribe = baseContainer.subscribe(listener)
      return () => {
        order.push('container')
        unsubscribe()
      }
    },
  })
  const connection = createRoomPresentationConnection(controller, container)
  connection.subscribe(() => order.push('subscriber notification'))

  connection.connect()
  connection.disconnect()

  assert.deepEqual(order, ['controller', 'container'])
  assert.deepEqual(connection.getDiagnostics().lastDisconnect, {
    cycle: 1,
    status: 'complete',
    releaseOrder: ['controller', 'container', 'subscribers'],
    cleanupErrors: ['controller'],
  })
})

test('stale callbacks cannot notify or dispatch after teardown and reconnect', () => {
  const baseController = createRoomInteractionController()
  const captured: Array<Parameters<typeof baseController.subscribe>[0]> = []
  const controller = Object.freeze({
    ...baseController,
    subscribe(listener: Parameters<typeof baseController.subscribe>[0]) {
      captured.push(listener)
      return baseController.subscribe(listener)
    },
  })
  const connection = createRoomPresentationConnection(controller)
  let staleNotifications = 0

  connection.subscribe(() => { staleNotifications += 1 })
  connection.connect()
  const staleCallback = captured[0]
  connection.disconnect()
  connection.connect()
  const beforeStaleDispatch = connection.getSnapshot()
  staleCallback(Object.freeze({
    event: Object.freeze({ surface: 'interface', type: 'approach' }),
    previous: 'passing',
    current: 'ambient',
    changed: true,
  }))

  assert.equal(connection.getSnapshot(), beforeStaleDispatch)
  assert.equal(staleNotifications, 0)
})
