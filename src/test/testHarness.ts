export interface TestCase {
  name: string;
  run: () => void | Promise<void>;
}

export interface TestSuite {
  name: string;
  tests: TestCase[];
}

export const test = (
  name: string,
  run: TestCase['run']
): TestCase => ({ name, run });

export const defineSuite = (
  name: string,
  tests: TestCase[]
): TestSuite => ({ name, tests });
