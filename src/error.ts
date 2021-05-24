export function logError(line: number, where: string, message: string): void {
  console.log(`[line: ${line}] error ${where}: ${message}`);
}
