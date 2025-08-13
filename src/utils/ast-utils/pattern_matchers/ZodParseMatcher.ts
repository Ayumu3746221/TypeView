import * as ts from "typescript";
import { BodyPatternMatcher } from "./BodyPatternMatcher";

export class ZodParseMatcher implements BodyPatternMatcher {
  readonly name = "zod-parse";

  matches(
    declaration: ts.VariableDeclaration,
    sourceFile: ts.SourceFile
  ): boolean {
    if (
      !declaration.initializer ||
      !ts.isCallExpression(declaration.initializer)
    ) {
      return false;
    }

    const callExpression = declaration.initializer;

    // Check for .parse() method call
    if (ts.isPropertyAccessExpression(callExpression.expression)) {
      const methodName = callExpression.expression.name.text;
      return methodName === "parse";
    }

    return false;
  }

  extractTypeName(
    declaration: ts.VariableDeclaration,
    sourceFile: ts.SourceFile
  ): string | undefined {
    if (
      !declaration.initializer ||
      !ts.isCallExpression(declaration.initializer)
    ) {
      return undefined;
    }

    const callExpression = declaration.initializer;

    // Extract schema name (UserSchema.parse → UserSchema)
    if (ts.isPropertyAccessExpression(callExpression.expression)) {
      const schemaName =
        callExpression.expression.expression.getText(sourceFile);

      // Return schema name as-is, no transformation needed!
      return schemaName;
    }

    return undefined;
  }
}
