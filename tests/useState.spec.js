import Vue from 'vue'
import { always } from '@/helpers'
import State from '@/state'
import useState from '@/useState'

jest.mock('vue')
describe('src/useState.js', () => {
	let unmounted

	beforeEach(() => {
		jest.clearAllMocks()
		State.update(always({}))
		Vue.readonly = (v) => ({
			get value() {
				return v.value
			}
		})
		Vue.ref = (v) => ({
			value: v
		})
		Vue.computed = (v) => {
			if (typeof v === 'function') {
				return {
					get value() {
						return v()
					}
				}
			}
			return {
				get value() {
					return v.get()
				},
				set value(val) {
					v.set(val)
				}
			}
		}
		Vue.onUnmounted = (v) => {
			unmounted = v
		}
	})

	afterEach(() => {
		if (unmounted) {
			unmounted()
		}
	})

	it('updates state ref when State is updated', () => {
		const { state } = useState()

		expect(state.value).toEqual({})

		State.update(always({ name: 'test' }))

		expect(state.value).toEqual({
			name: 'test'
		})
	})

	it('creates computed state variable', () => {
		const { computed } = useState()

		const test = computed((s) => s.name)

		expect(test.value).toBe(undefined)

		State.update(always({ name: 'test' }))

		expect(test.value).toBe('test')
	})

	it('throws TypeError when computed is not called with a function', () => {
		const { computed } = useState()

		expect(() => computed('test')).toThrow(
			new TypeError(
				'useState.computed expected function: received string'
			)
		)
	})

	it('creates reactive state variable by path', () => {
		const { reactive } = useState()

		const test = reactive(['name'])

		expect(test.value).toBe(undefined)

		State.update(always({ name: 'test' }))

		expect(test.value).toBe('test')
	})

	it('creates reactive state variable by path with default value', () => {
		const { state, reactive } = useState()

		const test = reactive(['name'], 'test')

		expect(test.value).toBe('test')
		expect(state.value).toEqual({})
	})

	it('throws TypeError when reactive is not called with an array', () => {
		const { reactive } = useState()

		expect(() => reactive('test')).toThrow(
			new TypeError('useState.reactive expected array: received string')
		)
	})

	it('creates writable state variable by path', () => {
		const { state, writable } = useState()

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
		const { state, writable } = useState()

		const test = writable(['name'], 'test')

		expect(test.value).toBe('test')
		expect(state.value).toEqual({})
	})

	it('throws TypeError when writable is not called with an array', () => {
		const { writable } = useState()

		expect(() => writable('test')).toThrow(
			new TypeError('useState.writable expected array: received string')
		)
	})

	it('creates namespaced state scoped to path', () => {
		const { state, useNamespace } = useState()
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
		const { useNamespace } = useState()

		expect(() => useNamespace('test')).toThrow(
			new TypeError(
				'useState.useNamespace expected array: received string'
			)
		)
	})

	it('creates namespaced computed state variable', () => {
		const { useNamespace } = useState()
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

	it('creates namespaced reactive state variable by path', () => {
		const { useNamespace } = useState()
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
		const { useNamespace } = useState()
		const { state, reactive } = useNamespace(['testing'])

		const test = reactive(['name'], 'test')

		expect(test.value).toBe('test')
		expect(state.value).toEqual({})
	})

	it('creates namespaced writable state variable by path', () => {
		const { state, useNamespace } = useState()
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
		const { useNamespace } = useState()
		const { state, writable } = useNamespace(['testing'])

		const test = writable(['name'], 'test')

		expect(test.value).toBe('test')
		expect(state.value).toEqual({})
	})
})
