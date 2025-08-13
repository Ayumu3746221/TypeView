// src/utils/ast-utils/AwaitReqJsonMatcher.ts
import * as ts from "typescript";
import { BodyPatternMatcher } from "./BodyPatternMatcher";

/**
 * Matcher for `const body: Type = await req.json()` pattern
 */
export class AwaitReqJsonMatcher implements BodyPatternMatcher {
  readonly name = "await-req-json";

  matches(
    declaration: ts.VariableDeclaration,
    sourceFile: ts.SourceFile
  ): boolean {
    // Check if initializer exists and is await expression
    if (
      !declaration.initializer ||
      !ts.isAwaitExpression(declaration.initializer)
    ) {
      return false;
    }

    // Check if the awaited expression ends with .json()
    const awaitedExpression =
      declaration.initializer.expression.getText(sourceFile);
    return awaitedExpression.endsWith(".json()");
  }

  extractTypeName(
    declaration: ts.VariableDeclaration,
    sourceFile: ts.SourceFile
  ): string | undefined {
    // Check if type annotation exists and is a type reference
    if (declaration.type && ts.isTypeReferenceNode(declaration.type)) {
      return declaration.type.typeName.getText(sourceFile);
    }
    return undefined;
  }
}
