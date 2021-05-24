import { logError } from './error';
import { keywords, Literal, Token, TokenType } from './token';

export class Scanner {
  private tokens: Array<Token> = [];
  private start = 0;
  private current = 0;
  private line = 1;

  constructor(private source: string) {}

  scanTokens(): Array<Token> {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, '', null, this.line));
    return this.tokens;
  }

  dumpState(): void {
    console.log(`Start: ${this.start}`);
    console.log(`Current: ${this.current}`);
    console.log(`Line: ${this.line}`);
    console.log(this.tokens);
  }

  private scanToken(): void {
    const character = this.advance();

    switch (character) {
      case '(':
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ')':
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case '{':
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case '}':
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case ',':
        this.addToken(TokenType.COMMA);
        break;
      case '.':
        this.addToken(TokenType.DOT);
        break;
      case '-':
        this.addToken(TokenType.MINUS);
        break;
      case '+':
        this.addToken(TokenType.PLUS);
        break;
      case ';':
        this.addToken(TokenType.SEMICOLON);
        break;
      case '*':
        this.addToken(TokenType.STAR);
        break;
      case '!':
        this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case '=':
        this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
        break;
      case '<':
        this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case '>':
        this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
        break;
      case '/':
        if (this.match('/')) {
          while (this.peek() !== '\n' && !this.isAtEnd()) {
            this.advance();
          }
        }
        break;
      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace
        break;
      case '\n':
        this.line++;
        break;
      case '"':
        this.string();
        break;
      default:
        if (this.isDigit(character.charCodeAt(0))) {
          this.number();
        } else if (this.isAlpha(character.charCodeAt(0))) {
          this.identifier();
        } else {
          logError(this.line, '', 'Unexpected character.');
        }
    }
  }

  private string(): void {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\n') {
        this.line++;
      }

      this.advance();
    }

    if (this.isAtEnd()) {
      logError(this.line, '', 'Unterminated string.');
      return;
    }

    this.advance();

    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  private number(): void {
    while (this.isDigit(this.peek().charCodeAt(0)) && !this.isAtEnd()) {
      this.advance();
    }

    if (this.peek() === '.' && this.isDigit(this.peekNext().charCodeAt(0))) {
      this.advance();

      while (this.isDigit(this.peek().charCodeAt(0))) {
        this.advance();
      }
    }

    const candidate = parseFloat(this.source.substring(this.start, this.current));
    this.addToken(TokenType.NUMBER, candidate);
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek().charCodeAt(0))) {
      this.advance();
    }

    const text = this.source.substring(this.start, this.current);
    const type = keywords.get(text) || TokenType.IDENTIFIER;
    this.addToken(type);
  }

  private isDigit(characterCode: number): boolean {
    return characterCode >= 0x30 && characterCode <= 0x39;
  }

  private isAlpha(characterCode: number): boolean {
    return (
      (characterCode >= 0x61 && characterCode <= 0x7a) ||
      (characterCode >= 0x41 && characterCode <= 0x5a) ||
      characterCode === 0x5f
    );
  }

  private isAlphaNumeric(characterCode: number): boolean {
    return this.isAlpha(characterCode) || this.isDigit(characterCode);
  }

  private peek(): string {
    if (this.isAtEnd()) {
      return '\0';
    }

    return this.source.charAt(this.current);
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) {
      return '\0';
    }

    return this.source.charAt(this.current + 1);
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) {
      return false;
    }

    if (this.source.charAt(this.current) !== expected) {
      return false;
    }

    this.current++;
    return true;
  }

  private advance(): string {
    return this.source.charAt(this.current++);
  }

  private addToken(tokenType: TokenType, literal: Literal = null): void {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(tokenType, text, literal, this.line));
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }
}
