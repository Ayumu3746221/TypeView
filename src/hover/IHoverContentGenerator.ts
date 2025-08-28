import * as vscode from "vscode";

/**
 * Data structure for hover content source information
 */
export interface HoverContentSource {
  typeName: string;
  definition: string;
  sourceInfo: string;
}

/**
 * Interface for generating hover content
 */
export interface IHoverContentGenerator {
  /**
   * Generate hover content from type information
   * @param uri The API URI
   * @param contentSource The type information source
   * @returns VS Code MarkdownString for hover display
   */
  generateHoverContent(
    uri: string,
    contentSource: HoverContentSource
  ): vscode.MarkdownString;
}
