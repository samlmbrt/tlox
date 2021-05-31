import { Literal, Token } from './token';

interface Visitor<T> {
  visitBinaryExpression(expression: BinaryExpression): T;
  visitGroupingExpression(expression: GroupingExpression): T;
  visitLiteralExpression(expression: LiteralExpression): T;
  visitUnaryExpression(expression: UnaryExpression): T;
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
  constructor(public operator: Token, public expression: UnaryExpression) {
    super();
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitUnaryExpression(this);
  }
}
