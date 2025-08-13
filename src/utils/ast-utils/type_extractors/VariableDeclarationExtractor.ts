import * as ts from "typescript";
import { TypeDefinitionExtractor } from "./TypeDefinitionExtractor";

/**
 * Extractor for variable declarations (mainly for Zod schemas)
 */
export class VariableDeclarationExtractor implements TypeDefinitionExtractor {
  canHandle(node: ts.Node, typeName: string): boolean {
    if (!ts.isVariableStatement(node)) {
      return false;
    }

    const declaration = node.declarationList.declarations[0];
    return (
      declaration.name &&
      ts.isIdentifier(declaration.name) &&
      declaration.name.text === typeName
    );
  }

  extract(node: ts.Node, sourceFile: ts.SourceFile): string {
    return node.getText(sourceFile);
  }
}
