import { expectFunction } from './errors'

let onUnmountedHook

export const checkForHook = () => {
	try {
		const { onUnmounted } = require('vue')
		expectFunction('onUnmounted check', onUnmounted)
		onUnmountedHook = onUnmounted
	} catch (e) {
		onUnmountedHook = false
	}
}

checkForHook()

export default () => onUnmountedHook
