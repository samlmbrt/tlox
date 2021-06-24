import { Literal, Token, TokenType } from './token';
import {
  AssignmentExpression,
  BinaryExpression,
  CommaExpression,
  LogicalOrExpression,
  LogicalAndExpression,
  CallExpression,
  GroupingExpression,
  LiteralExpression,
  TernaryExpression,
  UnaryExpression,
  CrementExpression,
  VariableExpression,
  Visitor as ExpressionVisitor,
} from './expression';
import {
  Statement,
  EmptyStatement,
  ExpressionStatement,
  FunctionStatement,
  PrintStatement,
  VariableStatement,
  Visitor as StatementVisitor,
  BlockStatement,
  IfStatement,
  WhileStatement,
  ForStatement,
  BreakStatement,
  ContinueStatement,
} from './statement';

export class AstPrinter implements ExpressionVisitor<Literal>, StatementVisitor<void> {
  private indentLevel = 0;
  private indentSize = 2;

  public print(statements: Array<Statement>): void {
    try {
      statements.forEach((statement) => {
        statement.accept(this);
      });
    } catch (error) {
      console.error(error.message);
    }
  }

  private printWithIndent(value: Literal): void {
    process.stdout.write(`${' '.repeat(this.indentLevel * this.indentSize)} ${value}\n`);
  }

  public visitBinaryExpression(expression: BinaryExpression): Literal {
    this.printWithIndent('[BinaryExpression]');
    this.indentLevel++;
    expression.left.accept(this);
    this.printWithIndent(`[Operator] (${expression.operator.lexeme})`);
    expression.right.accept(this);
    this.indentLevel--;
    return null;
  }

  public visitGroupingExpression(expression: GroupingExpression): Literal {
    this.printWithIndent('[GroupingExpression]');
    this.indentLevel++;
    expression.expression.accept(this);
    this.indentLevel--;
    return null;
  }

  public visitLiteralExpression(expression: LiteralExpression): Literal {
    this.printWithIndent(`[LiteralExpression] (${expression.value})`);
    return null;
  }

  public visitUnaryExpression(expression: UnaryExpression): Literal {
    this.printWithIndent('[UnaryExpression]');
    this.indentLevel++;
    this.printWithIndent(`[Operator] (${expression.operator.lexeme})`);
    expression.expression.accept(this);
    this.indentLevel--;
    return null;
  }

  public visitCrementExpression(expression: CrementExpression): Literal {
    this.printWithIndent('[CrementExpression]');
    this.indentLevel++;

    if (expression.operator.type === TokenType.PLUSPLUS) {
      this.printWithIndent('[IncrementExpression]');
    } else {
      this.printWithIndent('[DecrementExpression]');
    }

    this.indentLevel++;
    expression.expression.accept(this);
    this.indentLevel--;

    this.indentLevel--;
    return null;
  }

  public visitCallExpression(expression: CallExpression): Literal {
    // todosam
    throw 1;
  }

  public visitBlockStatement(statement: BlockStatement): void {
    this.printWithIndent('[BlockStatement]');
    this.indentLevel++;

    statement.statements.forEach((statement) => {
      statement.accept(this);
    });

    this.indentLevel--;
  }

  public visitIfStatement(statement: IfStatement): void {
    this.printWithIndent('[IfStatement]');
    this.indentLevel++;
    this.printWithIndent('[Condition]');
    this.indentLevel++;
    statement.condition.accept(this);
    this.indentLevel--;
    this.printWithIndent('[IfBlock]');
    this.indentLevel++;
    statement.ifBlock.accept(this);
    this.indentLevel--;
    if (statement.elseBlock) {
      this.printWithIndent('[ElseBlock]');
      this.indentLevel++;
      statement.elseBlock.accept(this);
      this.indentLevel--;
    }
    this.indentLevel--;
  }

  public visitWhileStatement(statement: WhileStatement): void {
    this.printWithIndent('[WhileStatement]');
    this.indentLevel++;
    this.printWithIndent('[Condition]');
    this.indentLevel++;
    statement.condition.accept(this);
    this.indentLevel--;
    this.printWithIndent('[Block]');
    this.indentLevel++;
    statement.block.accept(this);
    this.indentLevel--;
    this.indentLevel--;
  }

  public visitForStatement(statement: ForStatement): void {
    this.printWithIndent('[ForStatement]');
    this.indentLevel++;

    this.printWithIndent('[Initializer]');
    this.indentLevel++;
    if (statement.initializer !== null) {
      statement.initializer.accept(this);
    } else {
      this.printWithIndent('[Empty]');
    }
    this.indentLevel--;

    this.printWithIndent('[Condition]');
    this.indentLevel++;
    if (statement.condition !== null) {
      statement.condition.accept(this);
    } else {
      this.printWithIndent('[Empty]');
    }
    this.indentLevel--;

    this.printWithIndent('[Increment]');
    this.indentLevel++;
    if (statement.increment !== null) {
      statement.increment.accept(this);
    } else {
      this.printWithIndent('[Empty]');
    }
    this.indentLevel--;

    this.indentLevel--;
  }

  public visitFunctionStatement(statement: FunctionStatement): void {
    // todosam
    throw 1;
  }

  public visitExpressionStatement(statement: ExpressionStatement): void {
    this.printWithIndent('[ExpressionStatement]');
    this.indentLevel++;
    statement.expression.accept(this);
    this.indentLevel--;
  }

  public visitPrintStatement(statement: PrintStatement): void {
    this.printWithIndent('[PrintStatement]');
    this.indentLevel++;
    statement.expression.accept(this);
    this.indentLevel--;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public visitBreakStatement(statement: BreakStatement): void {
    this.printWithIndent('[BreakStatement]');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public visitContinueStatement(statement: ContinueStatement): void {
    this.printWithIndent('[ContinueStatement]');
  }

  public visitVariableStatement(statement: VariableStatement): void {
    this.printWithIndent('[VariableStatement]');
    this.indentLevel++;
    this.printWithIndent(`[Variable] (${statement.name.lexeme})`);
    statement.initializer?.accept(this);
    this.indentLevel--;
  }

  public visitTernaryExpression(expression: TernaryExpression): Literal {
    this.printWithIndent('[TernaryExpression]');
    this.indentLevel++;
    expression.left.accept(this);
    expression.middle.accept(this);
    expression.right.accept(this);
    this.indentLevel--;
    return null;
  }

  public visitCommaExpression(expression: CommaExpression): Literal {
    this.printWithIndent('[CommaExpression]');
    this.indentLevel++;
    expression.left.accept(this);
    expression.right.accept(this);
    this.indentLevel--;
    return null;
  }

  public visitLogicalOrExpression(expression: LogicalOrExpression): Literal {
    this.printWithIndent('[LogicalOrExpression]');
    this.indentLevel++;
    expression.left.accept(this);
    expression.right.accept(this);
    this.indentLevel--;
    return null;
  }

  public visitLogicalAndExpression(expression: LogicalAndExpression): Literal {
    this.printWithIndent('[LogicalAndExpression]');
    this.indentLevel++;
    expression.left.accept(this);
    expression.right.accept(this);
    this.indentLevel--;
    return null;
  }

  public visitVariableExpression(expression: VariableExpression): Literal {
    this.printWithIndent(`[VariableExpression] (${expression.name.lexeme})`);
    return null;
  }

  public visitAssignmentExpression(expression: AssignmentExpression): Literal {
    this.printWithIndent('[AssignmentExpression]');
    this.indentLevel++;
    this.printWithIndent(`[Variable] (${expression.name.lexeme})`);
    expression.value.accept(this);
    this.indentLevel--;
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public visitEmptyStatement(statement: EmptyStatement): void {
    // noop
  }
}
