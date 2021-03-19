import Vue from 'vue'
import { always } from '@/helpers'
import State from '@/state'
import useState from '@/useState'

jest.mock('vue', () => ({
	...jest.requireActual('vue'),
	onUnmounted: jest.fn()
}))
describe('src/useState.js', () => {
	let testState

	beforeEach(() => {
		jest.clearAllMocks()
		State.update(always({}))
		testState = useState({ manualUnsub: true })
	})

	afterEach(() => {
		if (testState.unsubscribe) {
			testState.unsubscribe()
		}
	})

	it('updates state ref when State is updated', () => {
		const { state } = testState

		expect(state.value).toEqual({})

		State.update(always({ name: 'test' }))

		expect(state.value).toEqual({
			name: 'test'
		})
	})

	it('automatically unmounts onUnmounted', () => {
		let manualUnsub
		Vue.onUnmounted.mockImplementation((v) => {
			manualUnsub = v
		})

		useState()

		expect(State.observable.observers.length).toBe(2) // testState + useState

		manualUnsub()

		expect(State.observable.observers.length).toBe(1) // testState
	})

	it('creates computed state variable', () => {
		const { computed } = testState

		const test = computed((s) => s.name)

		expect(test.value).toBe(undefined)

		State.update(always({ name: 'test' }))

		expect(test.value).toBe('test')
	})

	it('does not allow mutation within a computed state variable', () => {
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
				'useState.computed expected function: received string'
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
			new TypeError('useState.reactive expected array: received string')
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
			new TypeError('useState.writable expected array: received string')
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
				'useState.useNamespace expected array: received string'
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
