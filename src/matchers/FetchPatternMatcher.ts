import { IHoverPatternMatcher } from "./IHoverPatternMatcher";

/**
 * Pattern matcher for fetch() API calls
 */
export class FetchPatternMatcher implements IHoverPatternMatcher {
  readonly name = "fetch-pattern";
  readonly priority = 10;

  extractUri(line: string, position: number): string | undefined {
    const match = line.match(/fetch\s*\(\s*['"](\/api[^'"]*)['"]/);
    return match?.[1];
  }

  getSupportedLanguages(): string[] {
    return ["typescript", "typescriptreact"];
  }
}
