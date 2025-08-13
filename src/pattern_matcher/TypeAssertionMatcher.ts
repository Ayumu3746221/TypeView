import * as ts from "typescript";
import { BodyPatternMatcher } from "./BodyPatternMatcher";

/**
 * Matcher for `const body = await req.json() as Type` pattern
 * Supports both formatted and unformatted versions:
 * - const body = await req.json() as Type
 * - const body = (await req.json()) as Type
 */
export class TypeAssertionMatcher implements BodyPatternMatcher {
  readonly name = "type-assertion";

  matches(
    declaration: ts.VariableDeclaration,
    sourceFile: ts.SourceFile
  ): boolean {
    if (
      !declaration.initializer ||
      !ts.isAsExpression(declaration.initializer)
    ) {
      return false;
    }

    const asExpression = declaration.initializer;
    return this.isAwaitReqJsonExpression(asExpression.expression, sourceFile);
  }

  extractTypeName(
    declaration: ts.VariableDeclaration,
    sourceFile: ts.SourceFile
  ): string | undefined {
    if (declaration.initializer && ts.isAsExpression(declaration.initializer)) {
      const typeNode = declaration.initializer.type;
      if (ts.isTypeReferenceNode(typeNode)) {
        return typeNode.typeName.getText(sourceFile);
      }
    }
    return undefined;
  }

  /**
   * Check if the expression is await req.json(), handling parenthesized expressions
   */
  private isAwaitReqJsonExpression(
    expression: ts.Expression,
    sourceFile: ts.SourceFile
  ): boolean {
    // Handle parenthesized expressions: (await req.json())
    if (ts.isParenthesizedExpression(expression)) {
      return this.isAwaitReqJsonExpression(expression.expression, sourceFile);
    }

    // Handle direct await expressions: await req.json()
    if (ts.isAwaitExpression(expression)) {
      const awaitedText = expression.expression.getText(sourceFile);
      return awaitedText.endsWith(".json()");
    }

    return false;
  }
}
