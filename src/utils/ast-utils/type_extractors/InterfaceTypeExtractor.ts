import * as ts from "typescript";
import { TypeDefinitionExtractor } from "./TypeDefinitionExtractor";

/**
 * Extractor for interface and type alias declarations
 */
export class InterfaceTypeExtractor implements TypeDefinitionExtractor {
  canHandle(node: ts.Node, typeName: string): boolean {
    return (
      (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
      node.name.text === typeName
    );
  }

  extract(node: ts.Node, sourceFile: ts.SourceFile): string {
    return node.getFullText(sourceFile).trim();
  }
}
