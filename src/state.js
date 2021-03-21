import { BehaviorSubject, Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { expectFunction } from './lib/errors'

export default (function State() {
	let state = {}
	const bs = new BehaviorSubject(state)

	const setState = (val) => {
		state = val
		bs.next(val)
	}

	return {
		get observable() {
			return bs
		},
		update(f) {
			expectFunction('State.update', f)
			setState(f(state))
		},
		subscribe(f) {
			expectFunction('State.subscribe', f)

			const s = new Subject()

			bs.pipe(takeUntil(s)).subscribe(f)

			return () => {
				s.next()
				s.complete()
			}
		}
	}
})()
