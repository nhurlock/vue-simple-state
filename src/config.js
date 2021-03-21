import { map, mergeRight, prop } from 'ramda'
import { schemas, validate } from './lib/schemas'

export const defaultConfig = map(prop('default'), schemas.config)

export default (function Config() {
	let setConfig = {}

	return {
		reset() {
			setConfig = {}
		},
		get() {
			return mergeRight(defaultConfig, setConfig)
		},
		set(config) {
			setConfig = validate('config', config)
		}
	}
})()
