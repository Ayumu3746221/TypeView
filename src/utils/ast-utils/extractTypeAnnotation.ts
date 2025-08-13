import * as ts from "typescript";

/**
 * Extract type annotation from a variable declaration
 * @param declaration The variable declaration node
 * @param sourceFile The source file for text extraction
 * @returns The type name if found, undefined otherwise
 */
export function extractTypeAnnotation(
  declaration: ts.VariableDeclaration,
  sourceFile: ts.SourceFile
): string | undefined {
  if (declaration.type && ts.isTypeReferenceNode(declaration.type)) {
    return declaration.type.typeName.getText(sourceFile);
  }
  return undefined;
}
