import { RuntimeError } from './error';
import { Literal, Token } from './token';

export class Environment {
  private values = new Map();

  constructor(private enclosingScope: Environment | null = null) {}

  define(name: string, value: Literal): void {
    this.values.set(name, value);
  }

  assign(token: Token, value: Literal): void {
    const name = token.lexeme;

    if (this.values.has(name)) {
      this.values.set(name, value);
      return;
    }

    if (this.enclosingScope) {
      this.enclosingScope.assign(token, value);
      return;
    }

    throw new RuntimeError(
      `[line: ${token.line}, column: ${token.column}] error: undefined variable '${name}'`
    );
  }

  get(token: Token): Literal {
    const name = token.lexeme;

    if (this.values.has(name)) {
      return this.values.get(name);
    }

    if (this.enclosingScope) {
      return this.enclosingScope.get(token);
    }

    throw new RuntimeError(
      `[line: ${token.line}, column: ${token.column}] error: undefined variable '${name}'`
    );
  }
}
