import { Callable } from './callable';
import { Environment } from './environment';
import { Interpreter } from './interpreter';
import { FunctionStatement } from './statement';
import { Literal } from './token';

export class Function implements Callable {
  constructor(private declaration: FunctionStatement) {}

  arity(): number {
    return this.declaration.params.length;
  }

  call(interpreter: Interpreter, args: Literal[]): Literal {
    const environment = new Environment(Interpreter.globals);
    this.declaration.params.forEach((param, index) => {
      environment.define(this.declaration.params[index].lexeme, args[index]);
    });

    interpreter.executeBlock(this.declaration.body, environment);
    return null;
  }

  toString(): string {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}
