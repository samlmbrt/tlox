import { BinaryExpression, Expression } from './expression';
import { Token, TokenType } from './token';

export class Paser {
  private currentTokenIndex = 0;

  constructor(private tokens: Array<Token>) {}

  private expression(): Expression {
    return this.equality();
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
    // todo
    return this.equality();
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
}
