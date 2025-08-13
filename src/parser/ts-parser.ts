import * as vscode from "vscode";
import * as ts from "typescript";
import { collectImportStatements } from "../utils/ast-utils/collectImportStatements";
import { findFunctionBodyType } from "./function-searcher";
import { AwaitReqJsonMatcher } from "../pattern_matcher/AwaitReqJsonMatcher";
import { TypeAssertionMatcher } from "../pattern_matcher/TypeAssertionMatcher";

export interface ParsedTypeInfo {
  typeName: string;
  importPath: string;
}

/**
 * Parse the specified route.ts file and find the type information for the POST request body.
 * @param routeFileUri The URI of the file to parse
 * @returns The parsed type information, or undefined if not found
 */
export async function findBodyType(
  routeFileUri: vscode.Uri
): Promise<ParsedTypeInfo | undefined> {
  try {
    const fileContent = Buffer.from(
      await vscode.workspace.fs.readFile(routeFileUri)
    ).toString("utf8");

    const sourceFile = ts.createSourceFile(
      routeFileUri.fsPath,
      fileContent,
      ts.ScriptTarget.Latest,
      true
    );

    const importMap = new Map<string, string>();

    // Collect import statements
    function visit(node: ts.Node) {
      try {
        collectImportStatements(node, sourceFile, importMap);
      } catch (importError: unknown) {
        const errorMessage =
          importError instanceof Error
            ? importError.message
            : String(importError);
        throw new Error(`In file ${routeFileUri.fsPath}: ${errorMessage}`);
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    // Search for body type using pattern matchers
    const patternMatchers = [
      new AwaitReqJsonMatcher(), // const body: Type = await req.json()
      new TypeAssertionMatcher(), // const body = await req.json() as Type
    ];

    const bodyTypeName = findFunctionBodyType(
      sourceFile,
      "POST",
      patternMatchers
    );

    if (bodyTypeName && importMap.has(bodyTypeName)) {
      const importPath = importMap.get(bodyTypeName)!;
      return { typeName: bodyTypeName, importPath };
    }
    return undefined;
  } catch (error) {
    console.error("Error in findBodyType:", error);
    return undefined;
  }
}

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

  let definition: string | undefined;

  function visit(node: ts.Node) {
    if (
      (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
      node.name.text === typeName
    ) {
      definition = node.getText(sourceFile);
    }
    if (!definition) {
      ts.forEachChild(node, visit);
    }
  }

  visit(sourceFile);
  return definition;
}
