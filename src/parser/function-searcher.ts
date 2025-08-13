// src/parser/function-searcher.ts
import * as ts from "typescript";
import { BodyPatternMatcher } from "../utils/ast-utils/pattern_matchers/BodyPatternMatcher";

/**
 * Search for a specific function in the source file
 * @param sourceFile The TypeScript source file
 * @param functionName The name of the function to search for (e.g., "POST", "GET")
 * @returns The function declaration if found, undefined otherwise
 */
export function findFunction(
  sourceFile: ts.SourceFile,
  functionName: string
): ts.FunctionDeclaration | undefined {
  let foundFunction: ts.FunctionDeclaration | undefined;

  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === functionName) {
      foundFunction = node;
      return; // Stop searching once found
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return foundFunction;
}

/**
 * Search for body type in a specific function using pattern matchers
 * @param functionNode The function declaration to search in
 * @param patternMatchers Array of pattern matchers to try
 * @param sourceFile The source file for text extraction
 * @returns The type name if found, undefined otherwise
 */
export function searchFunctionBodyType(
  functionNode: ts.FunctionDeclaration,
  patternMatchers: BodyPatternMatcher[],
  sourceFile: ts.SourceFile
): string | undefined {
  if (!functionNode.body) {
    return undefined;
  }

  let bodyTypeName: string | undefined;

  function visitFunctionBody(node: ts.Node) {
    // Only process variable statements
    if (ts.isVariableStatement(node)) {
      const declaration = node.declarationList.declarations[0];

      // Try each pattern matcher
      for (const matcher of patternMatchers) {
        if (matcher.matches(declaration, sourceFile)) {
          bodyTypeName = matcher.extractTypeName(declaration, sourceFile);
          if (bodyTypeName) {
            console.log(
              `Found type "${bodyTypeName}" using ${matcher.name} pattern`
            );
            return; // Stop searching once found
          }
        }
      }
    }

    ts.forEachChild(node, visitFunctionBody);
  }

  ts.forEachChild(functionNode.body, visitFunctionBody);
  return bodyTypeName;
}

/**
 * High-level function to find body type in a specific HTTP method
 * @param sourceFile The TypeScript source file
 * @param methodName The HTTP method name (e.g., "POST", "GET", "PUT")
 * @param patternMatchers Array of pattern matchers to use
 * @returns The type name if found, undefined otherwise
 */
export function findFunctionBodyType(
  sourceFile: ts.SourceFile,
  methodName: string,
  patternMatchers: BodyPatternMatcher[]
): string | undefined {
  const functionNode = findFunction(sourceFile, methodName);
  if (!functionNode) {
    return undefined;
  }

  return searchFunctionBodyType(functionNode, patternMatchers, sourceFile);
}
