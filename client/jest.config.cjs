/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', {
      jsc: {
        target: 'es2021',
        parser: {
          syntax: 'typescript',
          tsx: true,
        },
        transform: { react: { runtime: 'automatic' } },
      },
      module: { type: 'es6' },
    }],
  },
  moduleNameMapper: {
    // CSS modules and files
    '^.+\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Static assets
    '^.+\\.(jpg|jpeg|png|gif|webp|svg|mp4|mp3|wav|ogg|m4a|aac)$': '<rootDir>/src/test/__mocks__/fileMock.js',
    // Vite alias
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/index.{js,ts,tsx}',
    '!src/main.{js,ts,tsx}',
    '!src/vite-env.d.ts',
  ],
};


