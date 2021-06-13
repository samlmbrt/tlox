import {
  AssignmentExpression,
  BinaryExpression,
  CommaExpression,
  Expression,
  GroupingExpression,
  LiteralExpression,
  TernaryExpression,
  UnaryExpression,
  VariableExpression,
} from './expression';
import { Statement, ExpressionStatement, PrintStatement, VariableStatement } from './statement';
import { ParseError } from './error';
import { Token, TokenType } from './token';

export class Parser {
  private currentTokenIndex = 0;

  constructor(private tokens: Array<Token>) {}

  public parse(): Array<Statement> {
    const statements: Array<Statement> = [];

    while (!this.isCompleted()) {
      statements.push(this.declaration());
    }

    return statements;
  }

  private declaration(): Statement {
    try {
      if (this.match(TokenType.VAR)) return this.variableDeclaration();
      return this.statement();
    } catch (error) {
      this.synchronize();
    }

    // todosam: fix this
    throw 'Unreachable code';
  }

  private variableDeclaration(): Statement {
    const name = this.consume(TokenType.IDENTIFIER, 'Expect variable name.');
    let initializer: Expression | null = null;
    if (this.match(TokenType.EQUAL)) {
      initializer = this.expression();
    }

    this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration");
    return new VariableStatement(name, initializer);
  }

  private statement(): Statement {
    if (this.match(TokenType.PRINT)) return this.printStatement();
    return this.expressionStatement();
  }

  private printStatement(): Statement {
    const value = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value");
    return new PrintStatement(value);
  }

  private expressionStatement(): Statement {
    const value = this.comma();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value");
    return new ExpressionStatement(value);
  }

  private comma(): Expression {
    let expression = this.expression();

    while (this.match(TokenType.COMMA)) {
      const operator = this.previous();
      const right = this.expression();
      expression = new CommaExpression(expression, operator, right);
    }

    return expression;
  }

  private expression(): Expression {
    return this.assignment();
  }

  private assignment(): Expression {
    const expression = this.ternary();

    if (this.match(TokenType.EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expression instanceof VariableExpression) {
        const name = expression.name;
        return new AssignmentExpression(name, value);
      }

      // todosam: log error without throwing
    }

    return expression;
  }

  private ternary(): Expression {
    const expression = this.equality();

    if (this.match(TokenType.QUESTION)) {
      const middle = this.ternary();
      this.consume(TokenType.COLON, "Expect ':' in ternary operator.");
      const right = this.ternary();
      return new TernaryExpression(expression, middle, right);
    }

    return expression;
  }

  private equality(): Expression {
    let expression = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expression = new BinaryExpression(expression, operator, right);
    }

    return expression;
  }

  private comparison(): Expression {
    let expression = this.term();

    while (
      this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)
    ) {
      const operator = this.previous();
      const right = this.term();
      expression = new BinaryExpression(expression, operator, right);
    }

    return expression;
  }

  private term(): Expression {
    let expression = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      expression = new BinaryExpression(expression, operator, right);
    }

    return expression;
  }

  private factor(): Expression {
    let expression = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous();
      const right = this.unary();
      expression = new BinaryExpression(expression, operator, right);
    }

    return expression;
  }

  private unary(): Expression {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new UnaryExpression(operator, right);
    } else if (
      this.match(
        TokenType.PLUS,
        TokenType.SLASH,
        TokenType.STAR,
        TokenType.BANG_EQUAL,
        TokenType.EQUAL_EQUAL,
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL
      )
    ) {
      const unsupportedToken = this.previous();
      throw this.logError(this.peek(), `Unary ${unsupportedToken.getLexeme()} is not supported.`);
    }

    return this.primary();
  }

  private primary(): Expression {
    if (this.match(TokenType.FALSE)) return new LiteralExpression(false);
    if (this.match(TokenType.TRUE)) return new LiteralExpression(true);
    if (this.match(TokenType.NIL)) return new LiteralExpression(null);

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new LiteralExpression(this.previous().getLiteral());
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return new VariableExpression(this.previous());
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expression = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new GroupingExpression(expression);
    }

    throw this.logError(this.peek(), 'Expression expected');
  }

  private consume(tokenType: TokenType, message: string) {
    if (this.check(tokenType)) return this.advance();

    throw this.logError(this.peek(), message);
  }

  private match(...types: Array<TokenType>): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isCompleted()) return false;

    return this.peek().getType() === type;
  }

  private advance(): Token {
    if (!this.isCompleted()) this.currentTokenIndex++;

    return this.previous();
  }

  private peek(): Token {
    return this.tokens[this.currentTokenIndex];
  }

  private previous(): Token {
    return this.tokens[Math.max(0, this.currentTokenIndex - 1)];
  }

  private isCompleted(): boolean {
    return this.peek().getType() == TokenType.EOF;
  }

  private synchronize(): void {
    this.advance();

    while (!this.isCompleted()) {
      const tokenType = this.previous().getType();
      if (tokenType === TokenType.SEMICOLON) return;

      switch (tokenType) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }
    }

    this.advance();
  }

  private logError(token: Token, message: string): ParseError {
    const location = token.getType() === TokenType.EOF ? 'end' : token.getLexeme();
    console.error(`(parser)[line: ${token.getLine()} at ${location}] error: ${message}`);
    return new ParseError();
  }
}
