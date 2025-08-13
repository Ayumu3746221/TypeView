import * as ts from "typescript";

/**
 * Interface for matching specific patterns in variable declarations
 */
export interface BodyPatternMatcher {
  /**
   * Check if the variable declaration matches the pattern
   */
  matches(
    declaration: ts.VariableDeclaration,
    sourceFile: ts.SourceFile
  ): boolean;

  /**
   * Extract type name from the matched declaration
   */
  extractTypeName(
    declaration: ts.VariableDeclaration,
    sourceFile: ts.SourceFile
  ): string | undefined;

  /**
   * Pattern name for debugging/logging
   */
  readonly name: string;
}
