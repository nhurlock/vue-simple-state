import {
	compose,
	defaultTo,
	equals,
	filter,
	flip,
	lensPath,
	path,
	prop,
	set,
	type,
	useWith,
	values
} from 'ramda'

const compareBasicType = useWith(equals, [prop('name'), type])

const defaultPath = useWith(compose, [defaultTo, path])

const filterValues = flip(compose(values, flip(filter)))

const setPath = compose(set, lensPath)

export { compareBasicType, defaultPath, filterValues, setPath }
