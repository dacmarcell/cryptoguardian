import type { Config } from "jest";
const config: Config = {
  clearMocks: true,
  coverageProvider: "v8",
  preset: "ts-jest",
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
  rootDir: ".",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  moduleDirectories: ["node_modules", "<rootDir>"],
};
export default config;
