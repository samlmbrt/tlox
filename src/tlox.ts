import { readFileSync } from 'fs';
import { createInterface } from 'readline';
import { AstPrinter } from './astprinter';
import { Interpreter } from './interpreter';
import { Parser } from './parser';
import { Scanner } from './scanner';
import { Expression } from './expression';
import { Statement } from './statement';

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
    console.error(error);
    process.exit(ErrorCode.INVALID_FILE);
  }
};

const runPrompt = () => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  replMode = true;

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
  if (scanner.hasError) return ErrorCode.SCANNER_ERROR;

  const parser = new Parser(tokens);

  let expression = null;
  let statements = null;
  const shouldEvaluateExpression = replMode && !scanner.hasStatementTerminator;

  if (shouldEvaluateExpression) {
    expression = parser.parseExpression();
  } else {
    statements = parser.parseStatements();
  }

  if (parser.hasError) return ErrorCode.PARSER_ERROR;

  //todosam: command-line argument to dump AST?
  if (!shouldEvaluateExpression) {
    // const astPrinter = new AstPrinter();
    // astPrinter.print(statements as Array<Statement>);
  }

  const interpreter = new Interpreter();
  let success = true;
  if (shouldEvaluateExpression) {
    success = interpreter.interpretExpression(expression as Expression);
  } else {
    success = interpreter.interpretStatements(statements as Array<Statement>);
  }

  if (!success) return ErrorCode.RUNTIME_ERROR;
  return ErrorCode.NO_ERROR;
};

const commandLineArguments = process.argv.slice(2);
let replMode = false;

if (commandLineArguments.length > 1) {
  console.error('Usage: tlox [file]');
  process.exit(ErrorCode.BAD_USAGE);
} else if (commandLineArguments.length === 1) {
  runFile(process.argv[2]);
} else {
  runPrompt();
}
