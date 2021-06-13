import { readFileSync } from 'fs';
import { createInterface } from 'readline';
import { Interpreter } from './interpreter';
import { Parser } from './parser';
import { Scanner } from './scanner';

enum ErrorCode {
  NO_ERROR,
  BAD_USAGE,
  INVALID_FILE,
  SCANNER_ERROR,
  PARSER_ERROR,
  RUNTIME_ERROR,
}

const runFile = (filePath: string) => {
  try {
    const result = run(readFileSync(filePath, 'utf8'));
    if (result !== ErrorCode.NO_ERROR) process.exit(result);
  } catch (error) {
    console.log(error);
    process.exit(ErrorCode.INVALID_FILE);
  }
};

const runPrompt = () => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on('line', (line: string) => {
    run(line);
    rl.prompt();
  });

  rl.setPrompt('> ');
  rl.prompt();
};

const run = (source: string): ErrorCode => {
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();
  if (scanner.hadError) return ErrorCode.SCANNER_ERROR;

  const parser = new Parser(tokens);
  const statements = parser.parse();
  // todosam: parse errors are thrown at the moment, fix this!

  const interpreter = new Interpreter();
  interpreter.interpret(statements);
  if (interpreter.hadError) {
    return ErrorCode.RUNTIME_ERROR;
  }

  return ErrorCode.NO_ERROR;
};

const commandLineArguments = process.argv.slice(2);

if (commandLineArguments.length > 1) {
  console.error('Usage: tlox [file]');
  process.exit(ErrorCode.BAD_USAGE);
} else if (commandLineArguments.length === 1) {
  runFile(process.argv[2]);
} else {
  runPrompt();
}
