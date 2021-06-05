import { readFileSync } from 'fs';
import { createInterface } from 'readline';
import { Scanner } from './scanner';
import { Parser } from './parser';

enum ErrorCode {
  BAD_USAGE = 1,
  INVALID_FILE,
  INVALID_CODE,
}

const runFile = (filePath: string) => {
  try {
    run(readFileSync(filePath, 'utf8'));
    if (hadError) {
      process.exit(ErrorCode.INVALID_CODE);
    }
  } catch (err) {
    console.error(`Could not open file: ${filePath}`);
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
    hadError = false;
    rl.prompt();
  });

  rl.setPrompt('> ');
  rl.prompt();
};

const run = (source: string) => {
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();
  if (scanner.hadError) return;

  const parser = new Parser(tokens);
  parser.parse();
  if (parser.hadError) return;
};

// todo: use a better commnand-line parser when necessary
const commandLineArguments = process.argv.slice(2);
let hadError = false;

if (commandLineArguments.length > 1) {
  console.error('Usage: tlox [file]');
  process.exit(ErrorCode.BAD_USAGE);
} else if (commandLineArguments.length === 1) {
  runFile(process.argv[2]);
} else {
  runPrompt();
}
