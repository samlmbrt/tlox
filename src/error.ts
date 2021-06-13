export class ParseError extends Error {}

export class RuntimeError extends Error {
  constructor(message: string) {
    super(`(runtime error) ${message}`);
  }
}
