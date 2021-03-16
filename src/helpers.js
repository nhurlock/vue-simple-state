import { path, over, lensPath } from 'ramda'

const compose = (f) => (g) => (x) => f(g(x))

const always = (v) => () => v

const defaultTo = (d) => (v) => (v == null || v !== v ? d : v)

const setPath = (p) => (v) => over(lensPath(p), always(v))

const expectTypeError = (type, validate) => (name, value) => {
	if (validate ? !validate(value) : typeof value !== type) {
		throw new TypeError(
			`${name} expected ${type}: received ${typeof value}`
		)
	}
}

const expectArray = expectTypeError('array', Array.isArray)

const expectFunction = expectTypeError('function')

export {
	compose,
	always,
	defaultTo,
	setPath,
	path,
	expectArray,
	expectFunction
}
