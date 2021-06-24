import { Callable } from './callable';
import { Interpreter } from './interpreter';
import { Literal } from './token';

export class ClockFunction implements Callable {
  arity(): number {
    return 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  call(interpreter: Interpreter, args: Literal[]): Literal {
    return Date.now() / 1000;
  }

  toString(): string {
    return '<native fn>';
  }
}
