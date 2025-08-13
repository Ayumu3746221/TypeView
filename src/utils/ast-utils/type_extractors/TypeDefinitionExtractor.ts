import * as ts from "typescript";

/**
 * Base interface for type definition extractors
 */
export interface TypeDefinitionExtractor {
  /**
   * Check if this extractor can handle the given node and type name
   */
  canHandle(node: ts.Node, typeName: string): boolean;

  /**
   * Extract the type definition from the node
   */
  extract(node: ts.Node, sourceFile: ts.SourceFile): string;
}
