import { always } from '@/helpers'
import State from '@/state'

describe('src/state.js', () => {
	let updateSub
	let updateFn = jest.fn()

	beforeEach(() => {
		jest.clearAllMocks()
		State.update(always({}))
		updateSub = State.subscribe(updateFn)
	})

	afterEach(() => {
		if (updateSub) {
			updateSub()
		}
	})

	it('sets initial value on subscribe', () => {
		expect(updateFn).toHaveBeenCalledTimes(1)
		expect(updateFn).toHaveBeenCalledWith({})
	})

	it('notifies subscribers when updates are made', () => {
		State.update(always({ name: 'test' }))
		State.update(always({ name: 'test2' }))
		State.update(always({ name: 'test3' }))

		expect(updateFn).toHaveBeenCalledTimes(4)
		expect(updateFn.mock.calls).toEqual([
			[{}], // initial value on subscribe
			[{ name: 'test' }],
			[{ name: 'test2' }],
			[{ name: 'test3' }]
		])
	})

	it('throws TypeError when update is not called with a function', () => {
		expect(() => State.update('test')).toThrow(
			new TypeError('State.update expected function: received string')
		)
	})

	it('unsubscribes after subscribe return fn is called', () => {
		const testFn = jest.fn()
		const testSub = State.subscribe(testFn)

		expect(State.observable.observers.length).toBe(2) // updateFn + testFn

		testSub()

		expect(State.observable.observers.length).toBe(1) // updateFn

		State.update(always({ name: 'test' }))

		expect(testFn).toHaveBeenCalledTimes(1) // initial value on subscribe
		expect(testFn).toHaveBeenCalledWith({})
		expect(testFn).not.toHaveBeenCalledWith({
			name: 'test'
		})
	})

	it('throws TypeError when subscribe is not called with a function', () => {
		expect(() => State.subscribe('test')).toThrow(
			new TypeError('State.subscribe expected function: received string')
		)
	})
})
