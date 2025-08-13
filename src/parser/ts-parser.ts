import * as vscode from "vscode";
import * as ts from "typescript";
import { collectImportStatements } from "../utils/ast-utils/collectImportStatements";
import { findFunctionBodyType } from "./function-searcher";
import { findAnyLocalTypeDefinition } from "./local-type-searcher";
import { AwaitReqJsonMatcher } from "../utils/ast-utils/pattern_matchers/AwaitReqJsonMatcher";
import { TypeAssertionMatcher } from "../utils/ast-utils/pattern_matchers/TypeAssertionMatcher";
import { ZodParseMatcher } from "../utils/ast-utils/pattern_matchers/ZodParseMatcher";

export interface ParsedTypeInfo {
  typeName: string;
  importPath?: string; // Optional for local types
  localDefinition?: string; // For same-file definitions
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
      new ZodParseMatcher(), // const body = Schema.parse(await req.json())
    ];

    const bodyTypeName = findFunctionBodyType(
      sourceFile,
      "POST",
      patternMatchers
    );

    if (!bodyTypeName) {
      return undefined;
    }

    // First, check if type is imported
    if (importMap.has(bodyTypeName)) {
      const importPath = importMap.get(bodyTypeName)!;
      return { typeName: bodyTypeName, importPath };
    }

    // Second, check if type is defined locally in the same file
    const localDefinition = findAnyLocalTypeDefinition(
      sourceFile,
      bodyTypeName
    );
    if (localDefinition) {
      return {
        typeName: bodyTypeName,
        localDefinition,
      };
    }

    // Type not found in imports or local definitions
    console.log(
      `Type "${bodyTypeName}" not found in imports or local definitions`
    );
    return undefined;
  } catch (error) {
    return undefined;
  }
}
