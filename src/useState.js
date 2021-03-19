import { computed as vcomputed, onUnmounted, readonly, ref } from 'vue'
import {
	compose,
	defaultPath,
	expectArray,
	expectFunction,
	identity,
	setPath
} from './helpers'
import State from './state'

const computed = (state) => (f) => {
	expectFunction('useState.computed', f)
	return vcomputed(() => f(readonly(state.value)))
}

const reactive = (state) => (p, defaultValue) => {
	expectArray('useState.reactive', p)
	return computed(state)(defaultPath(defaultValue)(p))
}

const writable = (state) => (p, defaultValue) => {
	expectArray('useState.writable', p)
	return vcomputed({
		get: () => defaultPath(defaultValue)(p)(state.value),
		set: (val) => (state.value = setPath(p)(val)(state.value))
	})
}

const stateProps = (rootSetState, pState, pPath = []) => (p) => {
	expectArray('useState.useNamespace', p)
	const statePath = pPath.concat(p)
	const setState = compose(rootSetState)(setPath(statePath))
	const state = vcomputed({
		get: () => defaultPath({})(p)(pState.value),
		set: setState
	})
	return {
		state: computed(state)(identity),
		computed: computed(state),
		reactive: reactive(state),
		writable: writable(state),
		useNamespace: stateProps(rootSetState, state, statePath)
	}
}

const useState = (config = {}) => {
	const { manualUnsub = false } = config

	const state = ref({})
	const setState = (f) => {
		State.update(f)
	}
	const unsubscribe = State.subscribe((s) => {
		state.value = s
	})
	const props = stateProps(setState, state)([])

	if (manualUnsub === false) {
		onUnmounted(unsubscribe)
	} else {
		props.unsubscribe = unsubscribe
	}

	return props
}

export default useState
