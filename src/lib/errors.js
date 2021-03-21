import { join, map, pipe, prop, type } from 'ramda'
import { compareBasicType } from './helpers'

const generalErrorMessage = (message) => `vue-simple-state: ${message}`

const typeErrorMessage = (name, expected, received) =>
	`"${name}" expected "${expected.name}", received "${type(received)}"`

const expectTypeError = (expectedType) => (name, value) => {
	if (!compareBasicType(expectedType, value)) {
		throw new TypeError(
			generalErrorMessage(typeErrorMessage(name, expectedType, value))
		)
	}
}

const expectArray = expectTypeError(Array)

const expectFunction = expectTypeError(Function)

const createFieldValidationError = (reason) => ({
	hasError: true,
	reason
})

const createSchemaValidationError = (errors) => ({
	hasError: true,
	errors
})

class SchemaError extends Error {
	constructor(schemaName, errors) {
		super(
			generalErrorMessage(
				`${schemaName} - ${pipe(
					map(prop('reason')),
					join(', ')
				)(errors)}`
			)
		)
	}
}

export {
	SchemaError,
	typeErrorMessage,
	expectArray,
	expectFunction,
	createFieldValidationError,
	createSchemaValidationError
}
