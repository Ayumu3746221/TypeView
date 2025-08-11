import * as ts from "typescript";

/**
 * Collect import statements from a TypeScript AST and update the import map.
 * @param node The AST node to analyze.
 * @param sourceFile The source file for text extraction.
 * @param importMap The map to update (typeName -> importPath)
 * @throws Error if import clause is missing (suggesting to separate types into files)
 */
function collectImportStatements(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  importMap: Map<string, string>
): void {
  if (!ts.isImportDeclaration(node)) {
    return;
  }

  const importPath = node.moduleSpecifier
    .getText(sourceFile)
    .replace(/['"]/g, "");

  if (!node.importClause) {
    throw new Error(
      `Import statement without import clause found: "${importPath}". ` +
        "Please separate types into dedicated files with proper named imports."
    );
  }

  // Handle named imports (e.g., import { UserType, PostType } from "@/lib/types")
  if (
    node.importClause.namedBindings &&
    ts.isNamedImports(node.importClause.namedBindings)
  ) {
    for (const element of node.importClause.namedBindings.elements) {
      const importName = element.name.text;
      importMap.set(importName, importPath);
    }
    return;
  }

  // Handle default imports (e.g., import UserType from "@/lib/types")
  if (node.importClause.name) {
    const defaultImportName = node.importClause.name.text;
    importMap.set(defaultImportName, importPath);
    return;
  }

  // If we reach here, it means there's an import clause but no named or default imports
  throw new Error(
    `Import statement with unsupported import clause found: "${importPath}". ` +
      'Please use named imports (import { Type } from "...") or default imports (import Type from "...").'
  );
}

export { collectImportStatements };
