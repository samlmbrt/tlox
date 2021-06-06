import {
  BinaryExpression,
  CommaExpression,
  Expression,
  GroupingExpression,
  LiteralExpression,
  TernaryExpression,
  UnaryExpression,
  Visitor,
} from './expression';
import { Literal, TokenType } from './token';

class Interpreter implements Visitor<Literal> {
  public visitBinaryExpression(expression: BinaryExpression): Literal {
    const left = this.evaluate(expression.left);
    const right = this.evaluate(expression.right);

    switch (expression.operator.getType()) {
      case TokenType.GREATER:
        return (left as boolean) > (right as boolean);
      case TokenType.GREATER_EQUAL:
        return (left as boolean) >= (right as boolean);
      case TokenType.LESS:
        return (left as boolean) < (right as boolean);
      case TokenType.LESS_EQUAL:
        return (left as boolean) <= (right as boolean);
      case TokenType.BANG_EQUAL:
        return left !== right;
      case TokenType.EQUAL_EQUAL:
        return left === right;
      case TokenType.MINUS:
        return (left as number) - (right as number);
      case TokenType.SLASH:
        return (left as number) / (right as number);
      case TokenType.STAR:
        return (left as number) * (right as number);
      case TokenType.PLUS:
        if (typeof left === 'number' && typeof right === 'number') return left + right;
        if (typeof left === 'string' && typeof right === 'string') return left + right;
        break;
    }

    throw 'Unreachable code';
  }

  public visitGroupingExpression(expression: GroupingExpression): Literal {
    return this.evaluate(expression.expression);
  }

  public visitLiteralExpression(expression: LiteralExpression): Literal {
    return expression.value;
  }

  public visitUnaryExpression(expression: UnaryExpression): Literal {
    const operand = this.evaluate(expression.expression);

    switch (expression.operator.getType()) {
      case TokenType.BANG:
        return operand !== null && operand !== false;
      case TokenType.MINUS:
        // todosam: this is possibly null, fix!
        return -(operand as number);
    }

    throw 'Unreachable code';
  }

  public visitTernaryExpression(expression: TernaryExpression): Literal {
    throw new Error('Method not implemented.');
  }

  public visitCommaExpression(expression: CommaExpression): Literal {
    throw new Error('Method not implemented.');
  }

  private evaluate(expression: Expression): Literal {
    return expression.accept(this);
  }

  private isEqual(a: Literal, b: Literal): boolean {
    if (a === null && b === null) return true;
    if (a === null) return false;
    return a === b;
  }
}
