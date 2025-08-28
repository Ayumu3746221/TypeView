import * as vscode from "vscode";
import {
  IHoverContentGenerator,
  HoverContentSource,
} from "./IHoverContentGenerator";

/**
 * Default implementation for generating TypeScript type hover content
 */
export class TypeHoverContentGenerator implements IHoverContentGenerator {
  generateHoverContent(
    uri: string,
    contentSource: HoverContentSource
  ): vscode.MarkdownString {
    const markdownString = new vscode.MarkdownString();
    markdownString.isTrusted = true;
    markdownString.appendMarkdown(`**Request Body Type** for \`${uri}\`\n`);
    markdownString.appendCodeblock(contentSource.definition, "typescript");
    markdownString.appendMarkdown(`\n${contentSource.sourceInfo}`);

    return markdownString;
  }
}
