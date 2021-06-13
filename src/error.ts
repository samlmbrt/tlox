export class ParseError extends Error {
  constructor(message: string) {
    super(`(parse error) ${message}`);
  }
}

export class RuntimeError extends Error {
  constructor(message: string) {
    super(`(runtime error) ${message}`);
  }
}
