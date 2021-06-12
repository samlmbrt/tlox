import { Expression } from './expression';

export interface Visitor<T> {
  visitExpressionStatement(expression: ExpressionStatement): T;
  visitPrintStatement(expression: PrintStatement): T;
}

export abstract class Statement {
  abstract accept<T>(visitor: Visitor<T>): T;
}

export class ExpressionStatement extends Statement {
  constructor(public expression: Expression) {
    super();

    // todosam: replace this by better logging mechanism
    // console.log('Creating an expression statement');
    // console.log(expression);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitExpressionStatement(this);
  }
}

export class PrintStatement extends Statement {
  constructor(public expression: Expression) {
    super();

    // todosam: replace this by better logging mechanism
    // console.log('Creating a print statement');
    // console.log(expression);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitPrintStatement(this);
  }
}
