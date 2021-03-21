import { readonly, ref, computed as vComputed } from '@vue/reactivity'
import { compose, identity, mergeRight } from 'ramda'
import { expectArray, expectFunction } from './lib/errors'
import { defaultPath, setPath } from './lib/helpers'
import { validate } from './lib/schemas'
import onUnmounted from './lib/onUnmounted'
import rootConfig from './config'
import State from './state'

const computed = (state) => (f) => {
	expectFunction('useState.computed', f)
	return vComputed(() => f(readonly(state.value)))
}

const reactive = (state) => (p, defaultValue) => {
	expectArray('useState.reactive', p)
	return computed(state)(defaultPath(defaultValue, p))
}

const writable = (state) => (p, defaultValue) => {
	expectArray('useState.writable', p)
	return vComputed({
		get: () => defaultPath(defaultValue, p)(state.value),
		set: (val) => (state.value = setPath(p)(val, state.value))
	})
}

const stateProps = (rootSetState, pState, pPath = []) => (p) => {
	expectArray('useState.useNamespace', p)
	const statePath = pPath.concat(p)
	const setState = compose(rootSetState, setPath(statePath))
	const state = vComputed({
		get: () => defaultPath({}, p)(pState.value),
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

const useState = (localConfig = {}) => {
	const { manualUnsub } = mergeRight(
		rootConfig.get(),
		validate('config', localConfig)
	)

	const state = ref({})
	const setState = (f) => {
		State.update(f)
	}
	const unsubscribe = State.subscribe((s) => {
		state.value = s
	})
	const props = stateProps(setState, state)([])

	if (manualUnsub === false && !!onUnmounted()) {
		onUnmounted()(unsubscribe)
	} else {
		props.unsubscribe = unsubscribe
	}

	return props
}

export default useState
