import config, { defaultConfig } from '@/config'

describe('src/config.js', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		config.reset()
	})

	it('returns the current config using get()', () => {
		expect(config.get()).toEqual(defaultConfig)
	})

	it('updates the config when successfully validated, overwriting default values', () => {
		expect(config.get()).toEqual(defaultConfig)

		config.set({ manualUnsub: true })

		expect(config.get()).toEqual({
			...defaultConfig,
			manualUnsub: true
		})
	})

	it('throws error when passed a non-object as a config', () => {
		expect(() => config.set('test')).toThrow(
			`${global.packageName}: config - must be of type "Object", received "String"`
		)
	})

	it('throws error when passed an unknown config option', () => {
		expect(() => config.set({ some: 'option' })).toThrow(
			`${global.packageName}: config - unknown option "some"`
		)
	})

	it('throws error when passed invalid config option value', () => {
		expect(() => config.set({ manualUnsub: 'test' })).toThrow(
			`${global.packageName}: config - "manualUnsub" expected "Boolean", received "String"`
		)
	})
})
