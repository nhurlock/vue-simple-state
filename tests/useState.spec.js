import Vue from 'vue'
import { always } from 'ramda'
import { State, config, useState } from '@/index'
import { checkForHook } from '@/lib/onUnmounted'

jest.mock('vue', () => ({
	...jest.requireActual('vue'),
	onUnmounted: jest.fn()
}))
describe('src/useState.js', () => {
	let testState
	let consoleWarn

	beforeEach(() => {
		jest.clearAllMocks()
		consoleWarn = console.warn
		config.set({ manualUnsub: true })
		State.update(always({}))
		testState = useState()
	})

	afterEach(() => {
		if (testState.unsubscribe) {
			testState.unsubscribe()
		}
		console.warn = consoleWarn
	})

	it('updates state ref when State is updated', () => {
		const { state } = testState

		expect(state.value).toEqual({})

		State.update(always({ name: 'test' }))

		expect(state.value).toEqual({
			name: 'test'
		})
	})

	it('automatically unsubscribes onUnmounted', () => {
		config.set({ manualUnsub: false })

		let manualUnsub
		Vue.onUnmounted.mockImplementation((v) => {
			manualUnsub = v
		})
		checkForHook()

		useState()

		expect(State.observable.observers.length).toBe(2) // testState + useState

		manualUnsub()

		expect(State.observable.observers.length).toBe(1) // testState
	})

	it('switches to manually unsubscribe if onUnmounted hook is not found (no vue 3 installed)', () => {
		config.set({ manualUnsub: false })

		Vue.onUnmounted = undefined
		checkForHook()

		const { unsubscribe } = useState()

		expect(State.observable.observers.length).toBe(2) // testState + useState

		unsubscribe()

		expect(State.observable.observers.length).toBe(1) // testState
	})

	it('throws error when passed an invalid config', () => {
		expect(() => useState('test')).toThrow(
			`${global.packageName}: config - must be of type "Object", received "String"`
		)
	})

	it('creates computed state variable', () => {
		const { computed } = testState

		const test = computed((s) => s.name)

		expect(test.value).toBe(undefined)

		State.update(always({ name: 'test' }))

		expect(test.value).toBe('test')
	})

	it('does not allow mutation within a computed state variable', () => {
		console.warn = jest.fn() // Vue's readonly warning is expected

		const { state, computed } = testState

		const test = computed((s) => {
			s.name = 'test'
			return s.name
		})

		expect(test.value).toBe(undefined)
		expect(state.value).toEqual({})
	})

	it('throws TypeError when computed is not called with a function', () => {
		const { computed } = testState

		expect(() => computed('test')).toThrow(
			new TypeError(
				`${global.packageName}: "useState.computed" expected "Function", received "String"`
			)
		)
	})

	it('creates reactive state variable by path', () => {
		const { reactive } = testState

		const test = reactive(['name'])

		expect(test.value).toBe(undefined)

		State.update(always({ name: 'test' }))

		expect(test.value).toBe('test')
	})

	it('creates reactive state variable by path with default value', () => {
		const { state, reactive } = testState

		const test = reactive(['name'], 'test')

		expect(test.value).toBe('test')
		expect(state.value).toEqual({})
	})

	it('throws TypeError when reactive is not called with an array', () => {
		const { reactive } = testState

		expect(() => reactive('test')).toThrow(
			new TypeError(
				`${global.packageName}: "useState.reactive" expected "Array", received "String"`
			)
		)
	})

	it('creates writable state variable by path', () => {
		const { state, writable } = testState

		const test = writable(['name'])

		expect(state.value).toEqual({})
		expect(test.value).toBe(undefined)

		test.value = 'test'

		expect(test.value).toBe('test')
		expect(state.value).toEqual({
			name: 'test'
		})
	})

	it('creates writable state variable by path with default value', () => {
		const { state, writable } = testState

		const test = writable(['name'], 'test')

		expect(test.value).toBe('test')
		expect(state.value).toEqual({})
	})

	it('throws TypeError when writable is not called with an array', () => {
		const { writable } = testState

		expect(() => writable('test')).toThrow(
			new TypeError(
				`${global.packageName}: "useState.writable" expected "Array", received "String"`
			)
		)
	})

	it('creates namespaced state scoped to path', () => {
		const { state, useNamespace } = testState
		const { state: namespacedState } = useNamespace(['testing'])

		expect(state.value).toEqual({})
		expect(namespacedState.value).toEqual({})

		State.update(always({ name: 'test' }))

		expect(state.value).toEqual({
			name: 'test'
		})
		expect(namespacedState.value).toEqual({})

		State.update((s) => ({
			...s,
			testing: {
				some: 'prop'
			}
		}))

		expect(state.value).toEqual({
			name: 'test',
			testing: {
				some: 'prop'
			}
		})
		expect(namespacedState.value).toEqual({
			some: 'prop'
		})
	})

	it('throws TypeError when useNamespace is not called with an array', () => {
		const { useNamespace } = testState

		expect(() => useNamespace('test')).toThrow(
			new TypeError(
				`${global.packageName}: "useState.useNamespace" expected "Array", received "String"`
			)
		)
	})

	it('creates namespaced computed state variable', () => {
		const { useNamespace } = testState
		const { computed } = useNamespace(['testing'])

		const test = computed((s) => s.name)

		expect(test.value).toBe(undefined)

		State.update(
			always({
				testing: {
					name: 'test'
				}
			})
		)

		expect(test.value).toBe('test')
	})

	it('does not allow mutation within a namespaced computed state variable', () => {
		console.warn = jest.fn() // Vue's readonly warning is expected

		const { useNamespace } = testState
		const { state, computed } = useNamespace(['testing'])

		const test = computed((s) => {
			s.name = 'test'
			return s.name
		})

		expect(test.value).toBe(undefined)
		expect(state.value).toEqual({})
	})

	it('creates namespaced reactive state variable by path', () => {
		const { useNamespace } = testState
		const { reactive } = useNamespace(['testing'])

		const test = reactive(['name'])

		expect(test.value).toBe(undefined)

		State.update(
			always({
				testing: {
					name: 'test'
				}
			})
		)

		expect(test.value).toBe('test')
	})

	it('creates namespaced reactive state variable by path with default value', () => {
		const { useNamespace } = testState
		const { state, reactive } = useNamespace(['testing'])

		const test = reactive(['name'], 'test')

		expect(test.value).toBe('test')
		expect(state.value).toEqual({})
	})

	it('creates namespaced writable state variable by path', () => {
		const { state, useNamespace } = testState
		const { state: namespacedState, writable } = useNamespace(['testing'])

		const test = writable(['name'])

		expect(test.value).toBe(undefined)

		test.value = 'test'

		expect(test.value).toBe('test')
		expect(namespacedState.value).toEqual({
			name: 'test'
		})
		expect(state.value).toEqual({
			testing: {
				name: 'test'
			}
		})
	})

	it('creates namespaced writable state variable by path with default value', () => {
		const { useNamespace } = testState
		const { state, writable } = useNamespace(['testing'])

		const test = writable(['name'], 'test')

		expect(test.value).toBe('test')
		expect(state.value).toEqual({})
	})

	it('allows creation of nested namespaces', () => {
		const { state: rootState, useNamespace } = testState
		const { useNamespace: useNestedNs } = useNamespace(['testing'])
		const { state, writable } = useNestedNs(['nested'])

		const test = writable(['prop'])

		expect(test.value).toBe(undefined)
		expect(state.value).toEqual({})

		test.value = 'test'

		expect(state.value).toEqual({
			prop: 'test'
		})
		expect(rootState.value).toEqual({
			testing: {
				nested: {
					prop: 'test'
				}
			}
		})
	})

	it('shares state between multiple observers', () => {
		const {
			state: state1,
			writable: writable1,
			unsubscribe: unsub1
		} = useState({
			manualUnsub: true
		})
		const {
			state: state2,
			writable: writable2,
			unsubscribe: unsub2
		} = useState({
			manualUnsub: true
		})

		expect(state1.value).toEqual({})
		expect(state2.value).toEqual({})

		const test1 = writable1(['test'])
		const test2 = writable2(['test'])

		expect(test1.value).toBe(undefined)

		test1.value = 'value'

		expect(state1.value).toEqual({
			test: 'value'
		})
		expect(test2.value).toBe('value')
		expect(state2.value).toEqual({
			test: 'value'
		})

		unsub1()
		unsub2()
	})
})
