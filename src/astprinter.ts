import { Literal } from './token';
import {
  AssignmentExpression,
  BinaryExpression,
  CommaExpression,
  GroupingExpression,
  LiteralExpression,
  TernaryExpression,
  UnaryExpression,
  VariableExpression,
  Visitor as ExpressionVisitor,
} from './expression';
import {
  Statement,
  EmptyStatement,
  ExpressionStatement,
  PrintStatement,
  VariableStatement,
  Visitor as StatementVisitor,
  BlockStatement,
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

  public visitBlockStatement(statement: BlockStatement): void {
    this.printWithIndent('[BlockStatement]');
    this.indentLevel++;

    statement.statements.forEach((statement) => {
      statement.accept(this);
    });

    this.indentLevel--;
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
