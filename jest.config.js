module.exports = {
	rootDir: __dirname,
	modulePaths: ['<rootDir>/node_modules', '<rootDir>/src'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
		'^test/(.*)$': '<rootDir>/test/$1'
	},
	testMatch: ['<rootDir>/tests/**/*.spec.js'],
	testPathIgnorePatterns: ['/node_modules/'],
	watchPathIgnorePatterns: [
		'<rootDir>/node_modules/',
		'<rootDir>/coverage/',
		'<rootDir>/dist/'
	],
	collectCoverageFrom: ['<rootDir>/src/**/*.js'],
	coverageThreshold: {
		global: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100
		}
	},
	setupFiles: ['<rootDir>/jest.setup.js']
}
