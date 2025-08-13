// src/pattern_matcher/ZodParseMatcher.ts (将来の拡張)
import * as ts from "typescript";
import { BodyPatternMatcher } from "./BodyPatternMatcher";

/**
 * Matcher for `const body = Schema.parse(await req.json())` pattern
 */

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
    const expressionText = callExpression.expression.getText(sourceFile);

    // Look for .parse( pattern
    return expressionText.endsWith(".parse");
  }

  extractTypeName(
    declaration: ts.VariableDeclaration,
    sourceFile: ts.SourceFile
  ): string | undefined {
    // Zodの場合は型推論されるため、スキーマ名から型を推測する必要がある
    // より複雑な実装が必要（将来の課題）
    return undefined;
  }
}
