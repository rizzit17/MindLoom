/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@visualli/shared$': '<rootDir>/../shared/src',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          verbatimModuleSyntax: false,
          noUnusedLocals: false,
          module: 'commonjs',
          moduleResolution: 'node',
        },
      },
    ],
  },
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
};
