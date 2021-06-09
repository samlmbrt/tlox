import { readFileSync } from 'fs';
import { createInterface } from 'readline';
import { Interpreter } from './interpreter';
import { Parser } from './parser';
import { Scanner } from './scanner';

enum ErrorCode {
  BAD_USAGE = 1,
  INVALID_FILE,
  SCANNER_ERROR,
  PARSER_ERROR,
  RUNTIME_ERROR,
}

const runFile = (filePath: string) => {
  try {
    run(readFileSync(filePath, 'utf8'));
    if (hadScannerError) {
      process.exit(ErrorCode.SCANNER_ERROR);
    } else if (hadParserError) {
      process.exit(ErrorCode.PARSER_ERROR);
    } else if (hadRuntimeError) {
      process.exit(ErrorCode.RUNTIME_ERROR);
    }
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
    hadScannerError = false;
    hadParserError = false;
    hadRuntimeError = false;
    rl.prompt();
  });

  rl.setPrompt('> ');
  rl.prompt();
};

const run = (source: string) => {
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();
  if (scanner.hadError) {
    hadScannerError = true;
    return;
  }

  const parser = new Parser(tokens);
  const expression = parser.parse();
  // todosam: parse errors are thrown at the moment, fix this!

  const interpreter = new Interpreter();
  interpreter.interpret(expression);
  if (interpreter.hadError) {
    hadRuntimeError = true;
    return;
  }
};

// todo: use a better commnand-line parser when necessary
const commandLineArguments = process.argv.slice(2);
let hadScannerError = false;
let hadParserError = false;
let hadRuntimeError = false;

if (commandLineArguments.length > 1) {
  console.error('Usage: tlox [file]');
  process.exit(ErrorCode.BAD_USAGE);
} else if (commandLineArguments.length === 1) {
  runFile(process.argv[2]);
} else {
  runPrompt();
}
