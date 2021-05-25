export function logSyntaxError(line: number, column: number, message: string): void {
  console.log(`[line: ${line}, column: ${column}] error: ${message}`);
}
