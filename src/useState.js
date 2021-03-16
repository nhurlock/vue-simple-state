import { computed as vcomputed, onUnmounted, ref, readonly } from 'vue'
import {
	setPath,
	compose,
	defaultTo,
	path,
	expectArray,
	expectFunction
} from './helpers'
import State from './state'

const computed = (state) => (f) => {
	expectFunction('useState.computed', f)
	return vcomputed(() => f(state.value))
}

const reactive = (state) => (p, defaultValue) => {
	expectArray('useState.reactive', p)
	return computed(state)(compose(defaultTo(defaultValue))(path(p)))
}

const writable = (state, setState) => (p, defaultValue) => {
	expectArray('useState.writable', p)
	return vcomputed({
		get: () => defaultTo(defaultValue)(path(p)(state.value)),
		set: compose(setState)(setPath(p))
	})
}

const stateProps = (state, setState) => ({
	state: readonly(state),
	reactive: reactive(state),
	computed: computed(state),
	writable: writable(state, setState),
	useNamespace: createNamespace(state, setState)
})

const createNamespace = (state, setState) => (p) => {
	expectArray('useState.useNamespace', p)

	const namespacedState = writable(state, setState)(p, {})
	const setNamespacedState = (f) => {
		namespacedState.value = f(namespacedState.value)
	}

	return stateProps(namespacedState, setNamespacedState)
}

const useState = () => {
	let state = ref({})
	const setState = (f) => {
		State.update(f)
	}

	onUnmounted(
		State.subscribe((s) => {
			state.value = s
		})
	)

	return stateProps(state, setState)
}

export default useState
