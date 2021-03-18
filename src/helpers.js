import { path, over, lensPath } from 'ramda'

const always = (v) => () => v

const compose = (f) => (g) => (x) => f(g(x))

const defaultTo = (d) => (v) => (v == null || v !== v ? d : v)

const defaultPath = (d) => (p) => compose(defaultTo(d))(path(p))

const expectTypeError = (type, validate) => (name, value) => {
	if (validate ? !validate(value) : typeof value !== type) {
		throw new TypeError(
			`${name} expected ${type}: received ${typeof value}`
		)
	}
}

const expectArray = expectTypeError('array', Array.isArray)

const expectFunction = expectTypeError('function')

const identity = (v) => v

const setPath = (p) => (v) => over(lensPath(p), always(v))

export {
	always,
	compose,
	defaultPath,
	expectArray,
	expectFunction,
	identity,
	setPath
}
