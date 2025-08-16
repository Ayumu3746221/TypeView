import { IHoverPatternMatcher } from "./IHoverPatternMatcher";

/**
 * Pattern matcher for axios API calls
 * Supports various axios calling patterns
 */
export class AxiosPatternMatcher implements IHoverPatternMatcher {
  readonly name = "axios-pattern";
  readonly priority = 8;

  extractUri(line: string, position: number): string | undefined {
    const patterns = [
      // axios.post('/api/users', data)
      /axios\.(?:post|put|patch|delete|get)\s*\(\s*['"](\/api[^'"]*)['"]/,
      // axios({ url: '/api/users', method: 'POST' })
      /axios\s*\(\s*\{[^}]*?url:\s*['"](\/api[^'"]*)['"]/,
    ];

    // Special case: check for axios instance pattern like client.get
    // but only if the line contains axios context
    if (line.includes("axios")) {
      const instancePattern =
        /(\w+)\.(?:post|put|patch|delete|get)\s*\(\s*['"](\/api[^'"]*)['"]/;
      const instanceMatch = line.match(instancePattern);
      if (
        instanceMatch &&
        instanceMatch[1] !== "http" &&
        instanceMatch[1] !== "fetch"
      ) {
        return instanceMatch[2];
      }
    }

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        // Return the last capture group which should be the API path
        return match[match.length - 1];
      }
    }

    return undefined;
  }

  getSupportedLanguages(): string[] {
    return ["typescript", "typescriptreact", "javascript", "javascriptreact"];
  }
}
