import * as vscode from "vscode";
import * as ts from "typescript";
import { TypeDefinitionExtractor } from "./type_extractors/TypeDefinitionExtractor";
import { InterfaceTypeExtractor } from "./type_extractors/InterfaceTypeExtractor";
import { VariableDeclarationExtractor } from "./type_extractors/VariableDeclarationExtractor";

/**
 * Extract the definition of a specific interface, type, or variable declaration from a file
 * @param typeFileUri The URI of the file where the type is defined
 * @param typeName The name of the type to extract
 * @returns The type definition as a string, or undefined if not found
 */
export async function extractTypeDefinition(
  typeFileUri: vscode.Uri,
  typeName: string
): Promise<string | undefined> {
  const fileContent = Buffer.from(
    await vscode.workspace.fs.readFile(typeFileUri)
  ).toString("utf8");
  const sourceFile = ts.createSourceFile(
    typeFileUri.fsPath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );

  // Initialize extractors
  const extractors: TypeDefinitionExtractor[] = [
    new InterfaceTypeExtractor(),
    new VariableDeclarationExtractor(),
  ];

  let definition: string | undefined;

  function visit(node: ts.Node) {
    if (definition) return; // Already found

    // Try each extractor
    for (const extractor of extractors) {
      if (extractor.canHandle(node, typeName)) {
        definition = extractor.extract(node, sourceFile);
        return;
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return definition;
}
