import { RuntimeError } from './error';
import {
  AssignmentExpression,
  BinaryExpression,
  CallExpression,
  CommaExpression,
  Expression,
  GroupingExpression,
  LiteralExpression,
  LogicalOrExpression,
  LogicalAndExpression,
  TernaryExpression,
  UnaryExpression,
  VariableExpression,
  Visitor,
  CrementExpression,
} from './expression';
import {
  ExpressionStatement,
  PrintStatement,
  VariableStatement,
  Statement,
  BlockStatement,
  IfStatement,
  WhileStatement,
  ForStatement,
  BreakStatement,
  ContinueStatement,
  FunctionStatement,
} from './statement';
import { Callable } from './callable';
import { Literal, Token, TokenType } from './token';
import { Environment } from './environment';
import { Function } from './function';
import { ClockFunction } from './native';

export class Interpreter implements Visitor<Literal>, Visitor<void> {
  public static globals = new Environment();
  private static environment = Interpreter.globals;

  constructor() {
    Interpreter.globals.define('clock', new ClockFunction());
  }

  public interpretStatements(statements: Array<Statement>): boolean {
    try {
      statements.forEach((statement) => {
        this.execute(statement);
      });
    } catch (error) {
      console.error(error.message);
      return false;
    }

    return true;
  }

  public interpretExpression(expression: Expression): boolean {
    try {
      console.log(this.evaluate(expression));
    } catch (error) {
      console.error(error.message);
      return false;
    }

    return true;
  }

  public visitBinaryExpression(expression: BinaryExpression): Literal {
    const left = this.evaluate(expression.left);
    const right = this.evaluate(expression.right);
    const operator = expression.operator;

    switch (operator.type) {
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
        if (right === 0) throw this.logError(operator, 'you cannot divide by 0.');
        return (left as number) / (right as number);
      case TokenType.STAR:
        this.checkNumberOperand(operator, left, right);
        return (left as number) * (right as number);
      case TokenType.PLUS:
        if (typeof left === 'number' && typeof right === 'number') return left + right;
        if (typeof left === 'string' && typeof right === 'string') return left + right;
        throw this.logError(operator, 'operands must be two numbers or two strings.');
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

    switch (operator.type) {
      case TokenType.BANG:
        return operand !== null && operand !== false;
      case TokenType.MINUS:
        this.checkNumberOperand(operator, operand);
        return -(operand as number);
    }

    return null;
  }

  public visitCrementExpression(expression: CrementExpression): Literal {
    // todosam: simplify
    const target = expression.expression;
    const operator = expression.operator;
    let operand = null;

    if (target instanceof VariableExpression) {
      operand = Interpreter.environment.get(target.name);
      this.checkNumberOperand(operator, operand);
      operand = operand as number;

      switch (operator.type) {
        case TokenType.PLUSPLUS:
          Interpreter.environment.assign(target.name, ++operand);
          return operand;
        case TokenType.MINUSMINUS:
          Interpreter.environment.assign(target.name, --operand);
          return operand;
      }
    } else {
      operand = this.evaluate(target);
      this.checkNumberOperand(operator, operand);
      operand = operand as number;

      switch (operator.type) {
        case TokenType.PLUSPLUS:
          return ++operand;
        case TokenType.MINUSMINUS:
          return --operand;
      }
    }

    return null;
  }

  public visitTernaryExpression(expression: TernaryExpression): Literal {
    return this.evaluate(expression.left)
      ? this.evaluate(expression.middle)
      : this.evaluate(expression.right);
  }

  public visitCommaExpression(expression: CommaExpression): Literal {
    // todosam: make this usable by any upcoming expression types
    if (expression.left instanceof CommaExpression) this.visitCommaExpression(expression.left);
    if (expression.right instanceof CommaExpression) this.visitCommaExpression(expression.right);
    if (expression.left instanceof LiteralExpression) expression.left.value;

    if (expression.right instanceof LiteralExpression) {
      expression.right.value;
      return expression.right.value;
    }

    return null;
  }

  public visitLogicalOrExpression(expression: LogicalOrExpression): Literal {
    const left = this.evaluate(expression.left);
    return left ? left : this.evaluate(expression.right);
  }

  public visitLogicalAndExpression(expression: LogicalAndExpression): Literal {
    const left = this.evaluate(expression.left);
    return left ? this.evaluate(expression.right) : left;
  }

  public visitVariableExpression(expression: VariableExpression): Literal {
    const value = Interpreter.environment.get(expression.name);
    if (value === undefined) {
      throw this.logError(expression.name, 'cannot evaluate uninitialized variable.');
    }
    return Interpreter.environment.get(expression.name);
  }

  public visitAssignmentExpression(expression: AssignmentExpression): Literal {
    const value = this.evaluate(expression.value);
    Interpreter.environment.assign(expression.name, value);
    return value;
  }

  public visitCallExpression(expression: CallExpression): Literal {
    const callee = this.evaluate(expression.callee);
    const args: Array<Literal> = [];

    expression.args.forEach((arg: Expression) => {
      args.push(this.evaluate(arg));
    });

    // todosam: fix check
    // if (!(callee instanceof Callable)) {
    //   throw this.logError(expression.paren, 'can only call functions and classes.');
    // }

    const func = callee as Callable;

    if (args.length !== func.arity()) {
      this.logError(expression.paren, `Expected ${func.arity} arguments, but got ${args.length}`);
    }

    return func.call(this, args);
  }

  public visitEmptyStatement(): void {
    // noop
  }

  public visitBlockStatement(statement: BlockStatement): void {
    this.executeBlock(statement.statements, new Environment(Interpreter.environment));
  }

  public visitIfStatement(statement: IfStatement): void {
    const conditionResult = this.evaluate(statement.condition);
    if (conditionResult) this.execute(statement.ifBlock);
    else if (statement.elseBlock) this.execute(statement.elseBlock);
  }

  public visitWhileStatement(statement: WhileStatement): void {
    while (this.evaluate(statement.condition)) {
      try {
        this.execute(statement.block);
      } catch (tokenType) {
        if (tokenType === TokenType.BREAK) break;
        if (tokenType === TokenType.CONTINUE) continue;
      }
    }
  }

  public visitForStatement(statement: ForStatement): void {
    for (
      statement.initializer ? this.execute(statement.initializer) : true;
      statement.condition ? this.evaluate(statement.condition) : true;
      statement.increment ? this.evaluate(statement.increment) : true
    ) {
      try {
        this.execute(statement.body);
      } catch (tokenType) {
        if (tokenType === TokenType.BREAK) break;
        if (tokenType === TokenType.CONTINUE) continue;
      }
    }
  }

  public visitFunctionStatement(statement: FunctionStatement): void {
    const func = new Function(statement);
    Interpreter.environment.define(statement.name.lexeme, func);
  }

  public visitExpressionStatement(statement: ExpressionStatement): void {
    this.evaluate(statement.expression);
  }

  public visitPrintStatement(statement: PrintStatement): void {
    const value = this.evaluate(statement.expression);
    console.log(value);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public visitBreakStatement(statement: BreakStatement): void {
    throw TokenType.BREAK;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public visitContinueStatement(statement: ContinueStatement): void {
    throw TokenType.CONTINUE;
  }

  public visitVariableStatement(statement: VariableStatement): void {
    let value: Literal = undefined;
    if (statement.initializer) {
      value = this.evaluate(statement.initializer);
    }

    Interpreter.environment.define(statement.name.lexeme, value);
  }

  public executeBlock(statements: Array<Statement>, environment: Environment): void {
    const previousEnvironment = Interpreter.environment;

    try {
      Interpreter.environment = environment;
      statements.forEach((statement) => {
        this.execute(statement);
      });
    } finally {
      Interpreter.environment = previousEnvironment;
    }
  }

  private evaluate(expression: Expression): Literal {
    return expression.accept(this);
  }

  private execute(statement: Statement) {
    statement.accept(this);
  }

  private checkNumberOperand(operator: Token, ...operands: Array<Literal>): void {
    if (operands.every((operand) => typeof operand === 'number')) return;
    throw this.logError(operator, 'operands must be numbers.');
  }

  private logError(token: Token, message: string): RuntimeError {
    const location = token.type === TokenType.EOF ? 'end' : token.lexeme;
    throw new RuntimeError(
      `[line: ${token.line}, column: ${token.column} at ${location}] error: ${message}`
    );
  }
}
