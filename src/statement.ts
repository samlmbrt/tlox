import { Expression } from './expression';
import { Token } from './token';
export interface Visitor<T> {
  visitEmptyStatement(statement: EmptyStatement): T;
  visitExpressionStatement(statement: ExpressionStatement): T;
  visitPrintStatement(statement: PrintStatement): T;
  visitBreakStatement(statement: BreakStatement): T;
  visitContinueStatement(statement: ContinueStatement): T;
  visitVariableStatement(statement: VariableStatement): T;
  visitBlockStatement(statement: BlockStatement): T;
  visitIfStatement(statement: IfStatement): T;
  visitWhileStatement(statement: WhileStatement): T;
}

export abstract class Statement {
  abstract accept<T>(visitor: Visitor<T>): T;
}

export class EmptyStatement extends Statement {
  constructor() {
    super();
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitEmptyStatement(this);
  }
}

export class ExpressionStatement extends Statement {
  constructor(public expression: Expression) {
    super();
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitExpressionStatement(this);
  }
}

export class PrintStatement extends Statement {
  constructor(public expression: Expression) {
    super();
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitPrintStatement(this);
  }
}

export class BreakStatement extends Statement {
  constructor() {
    super();
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBreakStatement(this);
  }
}

export class ContinueStatement extends Statement {
  constructor() {
    super();
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitContinueStatement(this);
  }
}

export class VariableStatement extends Statement {
  constructor(public name: Token, public initializer: Expression | null) {
    super();
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitVariableStatement(this);
  }
}

export class BlockStatement extends Statement {
  constructor(public statements: Array<Statement>) {
    super();
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBlockStatement(this);
  }
}

export class IfStatement extends Statement {
  constructor(
    public condition: Expression,
    public ifBlock: Statement,
    public elseBlock: Statement | null
  ) {
    super();
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitIfStatement(this);
  }
}

export class WhileStatement extends Statement {
  constructor(public condition: Expression, public block: Statement) {
    super();
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitWhileStatement(this);
  }
}
