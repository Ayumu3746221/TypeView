import * as vscode from "vscode";
import { IHoverPatternMatcher } from "../matchers/IHoverPatternMatcher";
import { ITypeInfoResolver } from "../type-resolver/ITypeInfoResolver";
import { IHoverContentGenerator } from "./IHoverContentGenerator";

/**
 * Extensible hover provider that supports multiple pattern matchers
 */
export class ExtensibleHoverProvider implements vscode.HoverProvider {
  private outputChannel: vscode.OutputChannel;

  constructor(
    private patternMatchers: IHoverPatternMatcher[],
    private typeResolver: ITypeInfoResolver,
    private contentGenerator: IHoverContentGenerator
  ) {
    // Sort matchers by priority (highest first)
    this.patternMatchers.sort((a, b) => b.priority - a.priority);

    // Create output channel for debugging
    this.outputChannel = vscode.window.createOutputChannel("TypeView");
  }

  private logError(message: string, error?: any): void {
    const timestamp = new Date().toISOString();
    const errorDetails = error instanceof Error ? error.message : String(error);
    this.outputChannel.appendLine(
      `[${timestamp}] ${message}${error ? ": " + errorDetails : ""}`
    );
  }

  private logInfo(message: string): void {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] ${message}`);
  }

  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.Hover | null> {
    try {
      // Validate and sanitize position
      const validatedPosition = document.validatePosition(position);
      const line = document.lineAt(validatedPosition.line).text;

      // Try pattern matchers in priority order
      let uri: string | undefined;
      for (const matcher of this.patternMatchers) {
        try {
          if (matcher.getSupportedLanguages().includes(document.languageId)) {
            uri = matcher.extractUri(line, validatedPosition.character);
            if (uri) {
              this.logInfo(`Pattern matched by ${matcher.name}: ${uri}`);
              break;
            }
          }
        } catch (error) {
          // Continue with next matcher if one fails
          this.logError(`Pattern matcher failed: ${matcher.name}`, error);
          continue;
        }
      }

      if (!uri) {
        return null;
      }

      let contentSource;
      try {
        contentSource = await this.typeResolver.resolveTypeInfo(uri);
        if (contentSource) {
          this.logInfo(`Type resolved for ${uri}: ${contentSource.typeName}`);
        }
      } catch (error) {
        // Return null if type resolver fails
        this.logError("Type resolver failed", error);
        return null;
      }

      if (!contentSource) {
        return null;
      }

      try {
        const markdownString = this.contentGenerator.generateHoverContent(
          uri,
          contentSource
        );
        this.logInfo(`Hover content generated for ${uri}`);
        return new vscode.Hover(markdownString);
      } catch (error) {
        // Return null if content generator fails
        this.logError("Content generator failed", error);
        return null;
      }
    } catch (error) {
      // Catch all other errors
      this.logError("ExtensibleHoverProvider failed", error);
      return null;
    }
  }
}
