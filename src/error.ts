import { Token } from './token';

export class ParseError extends Error {}
export class RuntimeError extends Error {
  constructor(private token: Token, public message: string) {
    super(message);
  }
}
