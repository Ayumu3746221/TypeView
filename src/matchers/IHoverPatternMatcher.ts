/**
 * Interface for pattern matching in code lines to extract API URIs
 */
export interface IHoverPatternMatcher {
  /**
   * Unique identifier for this matcher
   */
  readonly name: string;

  /**
   * Priority for pattern matching (higher number = higher priority)
   */
  readonly priority: number;

  /**
   * Extract URI pattern from a line of code
   * @param line The code line to analyze
   * @param position Character position in the line
   * @returns Extracted URI or undefined if no match
   */
  extractUri(line: string, position: number): string | undefined;

  /**
   * Get supported language IDs for this matcher
   * @returns Array of VS Code language IDs
   */
  getSupportedLanguages(): string[];
}
