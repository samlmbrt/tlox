import {} from './error';
import { keywords, Literal, Token, TokenType } from './token';

export class Scanner {
  public hadError = false;
  private tokens: Array<Token> = [];
  private tokenStartIndex = 0;
  private tokenEndIndex = 0;
  private line = 1;
  private column = 0;

  constructor(private source: string) {}

  public scanTokens(): Array<Token> {
    while (!this.isCompleted()) {
      this.tokenStartIndex = this.tokenEndIndex;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, '\0', null, this.line, this.column));
    return this.tokens;
  }

  private dumpState(): void {
    console.log(`current token start index: ${this.tokenStartIndex}`);
    console.log(`current token end index: ${this.tokenEndIndex}`);
    console.log(`current line: ${this.line}`);
    console.log(this.tokens);
  }

  private scanToken(): void {
    const character = this.advance();

    switch (character) {
      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace
        break;
      case '\n':
        this.line++;
        this.column = 0;
        break;
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
      case '?':
        this.addToken(TokenType.QUESTION);
        break;
      case ':':
        this.addToken(TokenType.COLON);
        break;
      case '!':
        this.addToken(this.consumeNextIf('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case '=':
        this.addToken(this.consumeNextIf('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
        break;
      case '<':
        this.addToken(this.consumeNextIf('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case '>':
        this.addToken(this.consumeNextIf('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
        break;
      case '"':
        this.consumeString();
        break;
      case '/':
        if (this.consumeNextIf('/')) this.consumeLineComment();
        else if (this.consumeNextIf('*')) this.consumeBlockComment();
        else this.addToken(TokenType.SLASH);
        break;
      default:
        if (this.isDigit(character)) this.consumeNumber();
        else if (this.isAlpha(character)) this.consumeIdentifier();
        else this.logError(`unexpected character: ${character}`);
        break;
    }
  }

  private consumeNumber(): void {
    while (!this.isCompleted() && this.isDigit(this.peek())) this.advance();

    if (this.peek() === '.' && this.isDigit(this.peek(1))) {
      this.advance();

      while (!this.isCompleted() && this.isDigit(this.peek())) this.advance();
    }

    const text = this.source.substring(this.tokenStartIndex, this.tokenEndIndex);
    this.addToken(TokenType.NUMBER, parseFloat(text));
  }

  private consumeString(): void {
    while (!this.isCompleted() && this.peek() !== '"') {
      if (this.peek() === '\n') {
        this.line++;
        this.column = 0;
      }

      this.advance();
    }

    if (this.isCompleted()) {
      this.logError('unterminated string');
      return;
    }

    this.advance();

    const text = this.source.substring(this.tokenStartIndex + 1, this.tokenEndIndex - 1);
    this.addToken(TokenType.STRING, text);
  }

  private consumeIdentifier(): void {
    while (!this.isCompleted() && this.isAlphaNumeric(this.peek())) this.advance();

    const text = this.source.substring(this.tokenStartIndex, this.tokenEndIndex);
    const type = keywords.get(text) || TokenType.IDENTIFIER;
    this.addToken(type);
  }

  private consumeLineComment(): void {
    // Line comments are ignored by the scanner
    while (!this.isCompleted() && this.peek() !== '\n') this.advance();
  }

  private consumeBlockComment(): void {
    // Block comments are ignored by the scanner
    while (!this.isCompleted()) {
      if (this.peek(0) === '*' && this.peek(1) === '/') {
        this.advance();
        this.advance();
        return;
      }

      if (this.peek() === '\n') {
        this.line++;
        this.column = 0;
      }

      this.advance();
    }

    this.logError('unterminated block comment');
  }

  private consumeNextIf(match: string): boolean {
    if (this.isCompleted()) return false;
    if (this.source.charAt(this.tokenEndIndex) !== match) return false;

    this.tokenEndIndex++;
    return true;
  }

  private advance(): string {
    if (this.isCompleted()) return '\0';
    this.column++;

    return this.source.charAt(this.tokenEndIndex++);
  }

  private peek(positionsAhead = 0): string {
    if (this.tokenEndIndex + positionsAhead >= this.source.length) return '\0';

    return this.source.charAt(this.tokenEndIndex + positionsAhead);
  }

  private addToken(tokenType: TokenType, literal: Literal = null): void {
    const lexeme = this.source.substring(this.tokenStartIndex, this.tokenEndIndex);
    this.tokens.push(new Token(tokenType, lexeme, literal, this.line, this.column));
  }

  private isDigit(character: string): boolean {
    if (character.length !== 1) return false;

    const characterCode = character.charCodeAt(0);
    return characterCode >= 0x30 && characterCode <= 0x39;
  }

  private isAlpha(character: string): boolean {
    if (character.length !== 1) return false;

    const characterCode = character.charCodeAt(0);
    return (
      (characterCode >= 0x61 && characterCode <= 0x7a) ||
      (characterCode >= 0x41 && characterCode <= 0x5a) ||
      characterCode === 0x5f
    );
  }

  private isAlphaNumeric(character: string): boolean {
    return this.isAlpha(character) || this.isDigit(character);
  }

  private isCompleted(): boolean {
    return this.tokenEndIndex >= this.source.length;
  }

  private logError(message: string): void {
    this.hadError = true;
    console.error(`(scan error)[line: ${this.line}, column: ${this.column}] error: ${message}`);
  }
}
