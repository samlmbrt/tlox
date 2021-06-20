import {
  Expression,
  AssignmentExpression,
  BinaryExpression,
  CommaExpression,
  GroupingExpression,
  LiteralExpression,
  TernaryExpression,
  UnaryExpression,
  VariableExpression,
  LogicalOrExpression,
  LogicalAndExpression,
} from './expression';
import {
  Statement,
  EmptyStatement,
  ExpressionStatement,
  PrintStatement,
  VariableStatement,
  BlockStatement,
  IfStatement,
  WhileStatement,
} from './statement';
import { ParseError } from './error';
import { Token, TokenType } from './token';

export class Parser {
  public hasError = false;
  private currentTokenIndex = 0;

  constructor(private tokens: Array<Token>) {}

  public parseStatements(): Array<Statement> {
    const statements: Array<Statement> = [];

    while (!this.isCompleted()) {
      statements.push(this.declaration());
    }

    return statements;
  }

  public parseExpression(): Expression {
    return this.comma();
  }

  private declaration(): Statement {
    try {
      if (this.match(TokenType.VAR)) return this.variableDeclaration();
      return this.statement();
    } catch (error) {
      console.error(error.message);
      this.hasError = true;
      this.synchronize();
    }

    return new EmptyStatement();
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
    if (this.match(TokenType.LEFT_BRACE)) return new BlockStatement(this.blockStatement());
    if (this.match(TokenType.IF)) return this.ifStatement();
    if (this.match(TokenType.WHILE)) return this.whileStatement();
    if (this.match(TokenType.FOR)) return this.forStatement();
    return this.expressionStatement();
  }

  private printStatement(): Statement {
    const value = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value");
    return new PrintStatement(value);
  }

  private blockStatement(): Array<Statement> {
    const statements: Array<Statement> = [];

    while (!this.check(TokenType.RIGHT_BRACE) && !this.isCompleted()) {
      statements.push(this.declaration());
    }

    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block");
    return statements;
  }

  private ifStatement(): Statement {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' before condition");
    const condition = this.comma();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after condition");

    const ifBlock = this.statement();
    let elseBlock: Statement | null = null;
    if (this.match(TokenType.ELSE)) {
      elseBlock = this.statement();
    }

    return new IfStatement(condition, ifBlock, elseBlock);
  }

  private whileStatement(): Statement {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' before condition");
    const condition = this.comma();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after condition");
    const block = this.statement();

    return new WhileStatement(condition, block);
  }

  private forStatement(): Statement {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' before for clauses");

    let initializer = null;
    if (this.match(TokenType.SEMICOLON)) initializer = null;
    else if (this.match(TokenType.VAR)) initializer = this.variableDeclaration();
    else initializer = this.expressionStatement();

    let condition = null;
    if (!this.check(TokenType.SEMICOLON)) condition = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after loop condition");

    let increment = null;
    if (!this.check(TokenType.RIGHT_PAREN)) increment = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for clauses");

    let body = this.statement();

    // Desugaring into a while loop
    if (increment) body = new BlockStatement([body, new ExpressionStatement(increment)]);
    if (!condition) condition = new LiteralExpression(true);
    body = new WhileStatement(condition, body);

    if (initializer) body = new BlockStatement([initializer, body]);
    return body;
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

      console.error(this.logError(equals, 'invalid assignment target').message);
    }

    return expression;
  }

  private ternary(): Expression {
    const expression = this.logicalOr();

    if (this.match(TokenType.QUESTION)) {
      const middle = this.ternary();
      this.consume(TokenType.COLON, "Expect ':' in ternary operator.");
      const right = this.ternary();
      return new TernaryExpression(expression, middle, right);
    }

    return expression;
  }

  private logicalOr(): Expression {
    let expression = this.logicalAnd();

    while (this.match(TokenType.OR)) {
      const right = this.logicalAnd();
      expression = new LogicalOrExpression(expression, right);
    }

    return expression;
  }

  private logicalAnd(): Expression {
    let expression = this.equality();

    while (this.match(TokenType.AND)) {
      const right = this.equality();
      expression = new LogicalAndExpression(expression, right);
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
      throw this.logError(this.peek(), `unary ${unsupportedToken.lexeme} is not supported.`);
    }

    return this.primary();
  }

  private primary(): Expression {
    if (this.match(TokenType.FALSE)) return new LiteralExpression(false);
    if (this.match(TokenType.TRUE)) return new LiteralExpression(true);
    if (this.match(TokenType.NIL)) return new LiteralExpression(null);

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new LiteralExpression(this.previous().literal);
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return new VariableExpression(this.previous());
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expression = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new GroupingExpression(expression);
    }

    throw this.logError(this.peek(), 'expression expected');
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

    return this.peek().type === type;
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
    return this.peek().type == TokenType.EOF;
  }

  private synchronize(): void {
    this.advance();

    while (!this.isCompleted()) {
      const tokenType = this.previous().type;
      if (tokenType === TokenType.SEMICOLON) return;

      switch (this.peek().type) {
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

      this.advance();
    }
  }

  private logError(token: Token, message: string): ParseError {
    const location = token.type === TokenType.EOF ? 'end' : token.lexeme;
    return new ParseError(
      `[line: ${token.line}, column: ${token.column} at ${location}] error: ${message}`
    );
  }
}
