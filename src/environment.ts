import { RuntimeError } from './error';
import { Literal, Token } from './token';

export class Environment {
  private values = new Map();

  define(name: string, value: Literal): void {
    this.values.set(name, value);
  }

  assign(token: Token, value: Literal): void {
    const name = token.lexeme;
    if (this.values.has(name)) {
      this.values.set(name, value);
    }
  }

  get(token: Token): Literal {
    const name = token.lexeme;
    if (this.values.has(name)) {
      return this.values.get(name);
    }

    throw new RuntimeError(
      `[line: ${token.line}, column: ${token.column}] error: undefined variable '${name}'`
    );
  }
}
