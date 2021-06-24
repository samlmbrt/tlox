import { Literal } from './token';
import { Interpreter } from './interpreter';

export abstract class Callable {
  abstract arity(): number;
  abstract call(interpreter: Interpreter, args: Array<Literal>): Literal;
  abstract toString(): string;
}
