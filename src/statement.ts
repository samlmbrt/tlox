import { Expression } from './expression';
import { Token } from './token';
export interface Visitor<T> {
  visitExpressionStatement(expression: ExpressionStatement): T;
  visitPrintStatement(expression: PrintStatement): T;
  visitVariableStatement(expression: VariableStatement): T;
}

export abstract class Statement {
  abstract accept<T>(visitor: Visitor<T>): T;
}

export class ExpressionStatement extends Statement {
  constructor(public expression: Expression) {
    super();
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitExpressionStatement(this);
  }
}

export class PrintStatement extends Statement {
  constructor(public expression: Expression) {
    super();
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitPrintStatement(this);
  }
}

export class VariableStatement extends Statement {
  constructor(public name: Token, public initializer: Expression | null) {
    super();
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitVariableStatement(this);
  }
}
