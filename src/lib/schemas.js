import { flip, mapObjIndexed, pipe, propEq, type } from 'ramda'
import {
	SchemaError,
	createFieldValidationError,
	createSchemaValidationError,
	typeErrorMessage
} from './errors'
import { compareBasicType, filterValues } from './helpers'
import onUnmounted from './onUnmounted'

export const schemas = {
	config: {
		manualUnsub: {
			type: Boolean,
			default: !!onUnmounted()
		}
	}
}

const validationSuccess = {
	hasError: false
}

const validateSchemaField = (schema) => (key, value) => {
	if (key in schema) {
		const constraints = schema[key]

		if (!compareBasicType(constraints.type, value)) {
			return createFieldValidationError(
				typeErrorMessage(key, constraints.type, value)
			)
		}
		return validationSuccess
	}
	return createFieldValidationError(`unknown option "${key}"`)
}

const validateSchema = (schema, obj) => {
	const schemaErrors = pipe(
		mapObjIndexed(flip(validateSchemaField(schema))),
		filterValues(propEq('hasError', true))
	)(obj)
	return schemaErrors.length > 0
		? createSchemaValidationError(schemaErrors)
		: validationSuccess
}

const handleValidation = (schemaName, obj) => {
	const { hasError, errors } = validateSchema(schemas[schemaName], obj)

	if (!hasError) {
		return obj
	}
	throw new SchemaError(schemaName, errors)
}

const validate = (schemaName, obj) => {
	if (compareBasicType(Object, obj)) {
		return handleValidation(schemaName, obj)
	}
	throw new SchemaError(schemaName, [
		createFieldValidationError(
			`must be of type "Object", received "${type(obj)}"`
		)
	])
}

export { validate }
