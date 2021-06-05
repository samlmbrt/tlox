import { Literal, Token } from './token';

interface Visitor<T> {
  visitBinaryExpression(expression: BinaryExpression): T;
  visitGroupingExpression(expression: GroupingExpression): T;
  visitLiteralExpression(expression: LiteralExpression): T;
  visitUnaryExpression(expression: UnaryExpression): T;
  visitTernaryExpression(expression: TernaryExpression): T;
  visitCommaExpression(expression: CommaExpression): T;
}

export abstract class Expression {
  abstract accept<T>(visitor: Visitor<T>): T;
}

export class BinaryExpression extends Expression {
  constructor(public left: Expression, public operator: Token, public right: Expression) {
    super();

    // todosam: replace this by better logging mechanism
    console.log('Creating a binary expression');
    console.log(left);
    console.log(operator);
    console.log(right);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBinaryExpression(this);
  }
}

export class GroupingExpression extends Expression {
  constructor(public expression: Expression) {
    super();

    // todosam: replace this by better logging mechanism
    console.log('Creating a grouping expression');
    console.log(expression);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitGroupingExpression(this);
  }
}

export class LiteralExpression extends Expression {
  constructor(public value: Literal) {
    super();

    // todosam: replace this by better logging mechanism
    console.log('Creating a literal expression');
    console.log(value);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitLiteralExpression(this);
  }
}

export class UnaryExpression extends Expression {
  constructor(public operator: Token, public expression: Expression) {
    super();

    // todosam: replace this by better logging mechanism
    console.log('Creating an unary expression');
    console.log(operator);
    console.log(expression);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitUnaryExpression(this);
  }
}

export class TernaryExpression extends Expression {
  constructor(public left: Expression, public middle: Expression, public right: Expression) {
    super();

    // todosam: replace this by better logging mechanism
    console.log('Creating a termary expression');
    console.log(left);
    console.log(middle);
    console.log(right);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitTernaryExpression(this);
  }
}

export class CommaExpression extends Expression {
  constructor(public left: Expression, public right: Expression) {
    super();

    // todosam: replace this by better logging mechanism
    console.log('Creating a comma expression');
    console.log(left);
    console.log(right);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitCommaExpression(this);
  }
}
