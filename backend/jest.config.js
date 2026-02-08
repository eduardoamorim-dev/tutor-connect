module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  testMatch: ["**/*.test.js"],
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "services/**/*.js",
    "service/**/*.js",
    "repositories/**/*.js",
    "middleware/**/*.js",
    "routes/**/*.js",
    "helpers/**/*.js",
    "config/schemas.js",
    "!services/googleCalendarService.js",
    "!**/node_modules/**",
    "!**/coverage/**",
  ],
  coverageThreshold: {
    global: {
      branches: 55,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  setupFiles: ["<rootDir>/__tests__/setup.js"],
  testTimeout: 30000,
};
