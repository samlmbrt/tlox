import { RuntimeError } from './error';
import { Literal, Token } from './token';

export class Environment {
  private values = new Map();

  define(name: string, value: Literal): void {
    this.values.set(name, value);
  }

  assign(token: Token, value: Literal): void {
    const name = token.getLexeme();
    if (this.values.has(name)) {
      this.values.set(name, value);
    }
  }

  get(token: Token): Literal {
    const name = token.getLexeme();
    if (this.values.has(name)) {
      return this.values.get(name);
    }

    // todosam: fix error handling
    console.error(`(interpreter)[line: ${token.getLine()}] error: Undefined variable '${name}'`);
    throw new RuntimeError();
  }
}
