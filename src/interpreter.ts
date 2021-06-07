import { RuntimeError } from './error';
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
import { Literal, Token, TokenType } from './token';

export class Interpreter implements Visitor<Literal> {
  public hadError = false;

  public interpret(expression: Expression): void {
    try {
      const value = this.evaluate(expression);
      console.log(value);
    } catch (error) {
      console.log(error.message);
    }
  }

  public visitBinaryExpression(expression: BinaryExpression): Literal {
    const left = this.evaluate(expression.left);
    const right = this.evaluate(expression.right);
    const operator = expression.operator;

    switch (operator.getType()) {
      case TokenType.GREATER:
        this.checkNumberOperand(operator, left, right);
        return (left as boolean) > (right as boolean);
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperand(operator, left, right);
        return (left as boolean) >= (right as boolean);
      case TokenType.LESS:
        this.checkNumberOperand(operator, left, right);
        return (left as boolean) < (right as boolean);
      case TokenType.LESS_EQUAL:
        this.checkNumberOperand(operator, left, right);
        return (left as boolean) <= (right as boolean);
      case TokenType.BANG_EQUAL:
        this.checkNumberOperand(operator, left, right);
        return left !== right;
      case TokenType.EQUAL_EQUAL:
        this.checkNumberOperand(operator, left, right);
        return left === right;
      case TokenType.MINUS:
        this.checkNumberOperand(operator, left, right);
        return (left as number) - (right as number);
      case TokenType.SLASH:
        this.checkNumberOperand(operator, left, right);
        return (left as number) / (right as number);
      case TokenType.STAR:
        this.checkNumberOperand(operator, left, right);
        return (left as number) * (right as number);
      case TokenType.PLUS:
        if (typeof left === 'number' && typeof right === 'number') return left + right;
        if (typeof left === 'string' && typeof right === 'string') return left + right;
        this.logError(operator, 'Operands must be two numbers or two strings.');
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
    const operator = expression.operator;

    switch (operator.getType()) {
      case TokenType.BANG:
        return operand !== null && operand !== false;
      case TokenType.MINUS:
        this.checkNumberOperand(operator, operand);
        return -(operand as number);
    }

    throw 'Unreachable code';
  }

  public visitTernaryExpression(expression: TernaryExpression): Literal {
    return this.evaluate(expression.left)
      ? this.evaluate(expression.middle)
      : this.evaluate(expression.right);
  }

  public visitCommaExpression(expression: CommaExpression): Literal {
    throw new Error('Method not implemented.');
  }

  private evaluate(expression: Expression): Literal {
    return expression.accept(this);
  }

  private checkNumberOperand(operator: Token, ...operands: Array<Literal>): void {
    if (operands.every((operand) => typeof operand === 'number')) return;
    this.logError(operator, 'Operands must be numbers.');
  }

  private logError(token: Token, message: string): RuntimeError {
    console.error(`(interpreter)[line: ${token.getLine()}] error: ${message}`);
    this.hadError = true;
    throw new RuntimeError();
  }
}
