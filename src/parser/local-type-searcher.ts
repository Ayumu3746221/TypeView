import * as ts from "typescript";
import { TypeDefinitionExtractor } from "../utils/ast-utils/type_extractors/TypeDefinitionExtractor";
import { InterfaceTypeExtractor } from "../utils/ast-utils/type_extractors/InterfaceTypeExtractor";
import { VariableDeclarationExtractor } from "../utils/ast-utils/type_extractors/VariableDeclarationExtractor";

/**
 * Search for type definitions within the same source file
 * @param sourceFile The TypeScript source file to search in
 * @param typeName The name of the type to find
 * @returns The type definition as a string, or undefined if not found
 */
export function findLocalTypeDefinition(
  sourceFile: ts.SourceFile,
  typeName: string
): string | undefined {
  const extractors: TypeDefinitionExtractor[] = [
    new InterfaceTypeExtractor(),
    new VariableDeclarationExtractor(),
  ];

  let definition: string | undefined;

  function visit(node: ts.Node) {
    if (definition) {
      return; // Already found
    }

    // Try each extractor
    for (const extractor of extractors) {
      if (extractor.canHandle(node, typeName)) {
        definition = extractor.extract(node, sourceFile);
        console.log(`Found local type "${typeName}" in same file`);
        return;
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return definition;
}

/**
 * Search for type alias definitions within the same source file
 * @param sourceFile The TypeScript source file to search in
 * @param typeName The name of the type alias to find
 * @returns The type alias definition as a string, or undefined if not found
 */
export function findLocalTypeAlias(
  sourceFile: ts.SourceFile,
  typeName: string
): string | undefined {
  let definition: string | undefined;

  function visit(node: ts.Node) {
    if (definition) {
      return; // Already found
    }

    // Check for type alias declarations
    if (ts.isTypeAliasDeclaration(node)) {
      const typeAliasName = node.name.text;

      if (typeAliasName === typeName) {
        definition = node.getFullText(sourceFile).trim();
        console.log(`Found local type alias "${typeName}" in same file`);
        return;
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return definition;
}

/**
 * Search for interface definitions within the same source file
 * @param sourceFile The TypeScript source file to search in
 * @param typeName The name of the interface to find
 * @returns The interface definition as a string, or undefined if not found
 */
export function findLocalInterface(
  sourceFile: ts.SourceFile,
  typeName: string
): string | undefined {
  let definition: string | undefined;

  function visit(node: ts.Node) {
    if (definition) {
      return; // Already found
    }

    // Check for interface declarations
    if (ts.isInterfaceDeclaration(node)) {
      const interfaceName = node.name.text;

      if (interfaceName === typeName) {
        definition = node.getFullText(sourceFile).trim();
        console.log(`Found local interface "${typeName}" in same file`);
        return;
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return definition;
}

/**
 * Comprehensive search for any type definition within the same source file
 * This function combines all local type search strategies
 * @param sourceFile The TypeScript source file to search in
 * @param typeName The name of the type to find
 * @returns The type definition as a string, or undefined if not found
 */
export function findAnyLocalTypeDefinition(
  sourceFile: ts.SourceFile,
  typeName: string
): string | undefined {
  // Try the comprehensive approach first (using extractors)
  let definition = findLocalTypeDefinition(sourceFile, typeName);
  if (definition) {
    return definition;
  }

  // Try specific type alias search
  definition = findLocalTypeAlias(sourceFile, typeName);
  if (definition) {
    return definition;
  }

  // Try specific interface search
  definition = findLocalInterface(sourceFile, typeName);
  if (definition) {
    return definition;
  }

  console.log(`Type "${typeName}" not found in same file`);
  return undefined;
}
