import { readFileSync } from 'fs';
import { createInterface } from 'readline';
import { TokenType, Token } from './token';

enum ErrorCode {
  BAD_USAGE = 1,
  INVALID_FILE,
  INVALID_CODE,
}

const error = (line: number, message: string) => {
  report(line, '', message);
};

const report = (line: number, where: string, message: string) => {
  console.log(`[line: ${line}] error ${where}: ${message}`);
  hadError = true;
};

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
  console.log(source.trim().split(/\s+/));
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
