import { Literal, Token, TokenType } from './token';

export interface Visitor<T> {
  visitBinaryExpression(expression: BinaryExpression): T;
  visitGroupingExpression(expression: GroupingExpression): T;
  visitLiteralExpression(expression: LiteralExpression): T;
  visitUnaryExpression(expression: UnaryExpression): T;
  visitTernaryExpression(expression: TernaryExpression): T;
  visitCommaExpression(expression: CommaExpression): T;
  visitVariableExpression(expression: VariableExpression): T;
}

export abstract class Expression {
  abstract accept<T>(visitor: Visitor<T>): T;
}

export class BinaryExpression extends Expression {
  constructor(public left: Expression, public operator: Token, public right: Expression) {
    super();
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBinaryExpression(this);
  }
}

export class GroupingExpression extends Expression {
  constructor(public expression: Expression) {
    super();
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitGroupingExpression(this);
  }
}

export class LiteralExpression extends Expression {
  constructor(public value: Literal) {
    super();
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitLiteralExpression(this);
  }
}

export class UnaryExpression extends Expression {
  constructor(public operator: Token, public expression: Expression) {
    super();
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitUnaryExpression(this);
  }
}

export class TernaryExpression extends Expression {
  constructor(public left: Expression, public middle: Expression, public right: Expression) {
    super();
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitTernaryExpression(this);
  }
}

export class CommaExpression extends Expression {
  constructor(public left: Expression, public operator: Token, public right: Expression) {
    super();
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitCommaExpression(this);
  }
}

export class VariableExpression extends Expression {
  constructor(public name: Token) {
    super();
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitVariableExpression(this);
  }
}
