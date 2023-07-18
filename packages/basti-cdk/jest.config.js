// eslint-disable-next-line unicorn/prefer-module
module.exports = {
  roots: ['.'],
  testMatch: ['**/**.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
