import * as vscode from "vscode";
import { ITypeInfoResolver } from "./ITypeInfoResolver";
import { HoverContentSource } from "../hover/IHoverContentGenerator";
import { findBodyType } from "../parser/ts-parser";
import { extractTypeDefinition } from "../utils/ast-utils/extractTypeDefinition";
import { resolveModulePath } from "../utils/path-resolver";

/**
 * Type resolver for Next.js API route files
 * Specifically designed for Next.js App Router structure
 */
export class NextjsApiRouteTypeResolver implements ITypeInfoResolver {
  constructor(
    private routeFileFinder: (uri: string) => Promise<vscode.Uri | undefined>
  ) {}

  async resolveTypeInfo(uri: string): Promise<HoverContentSource | undefined> {
    const routeFilePath = await this.routeFileFinder(uri);
    if (!routeFilePath) {
      return undefined;
    }

    const typeInfo = await findBodyType(routeFilePath);
    if (!typeInfo) {
      return undefined;
    }

    let typeDefinitionText: string | undefined;
    let sourceInfo: string;

    // Handle different type sources
    if (typeInfo.localDefinition) {
      // Type is defined in the same file
      typeDefinitionText = typeInfo.localDefinition;
      sourceInfo = "*(Defined in same file)*";
    } else if (typeInfo.importPath) {
      // Type is imported or found in workspace
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        return undefined;
      }

      const typeFileUri = await resolveModulePath(
        typeInfo.importPath,
        workspaceFolders[0].uri
      );

      if (!typeFileUri) {
        return undefined;
      }

      typeDefinitionText = await extractTypeDefinition(
        typeFileUri,
        typeInfo.typeName
      );

      sourceInfo = `*From: \`${typeInfo.importPath}\`*`;
    } else {
      // No type source found
      return undefined;
    }

    if (!typeDefinitionText) {
      return undefined;
    }

    return {
      typeName: typeInfo.typeName,
      definition: typeDefinitionText,
      sourceInfo,
    };
  }
}
