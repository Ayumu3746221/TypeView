import * as assert from "assert";
import * as vscode from "vscode";
import { ExtensibleHoverProvider } from "../../hover/ExtensibleHoverProvider";
import { IHoverPatternMatcher } from "../../matchers/IHoverPatternMatcher";
import {
  IHoverContentGenerator,
  HoverContentSource,
} from "../../hover/IHoverContentGenerator";
import { ITypeInfoResolver } from "../../type-resolver/ITypeInfoResolver";

/**
 * Test suite for ExtensibleHoverProvider
 * Focus: Testing the extensibility architecture of the hover system
 */
suite("ExtensibleHoverProvider Extensibility Tests", () => {
  // Mock pattern matcher for testing
  class MockPatternMatcher implements IHoverPatternMatcher {
    readonly name: string;
    readonly priority: number;

    constructor(
      private pattern: string,
      priority: number = 1,
      private shouldMatch: boolean = true
    ) {
      this.name = `mock-${this.pattern}`;
      this.priority = priority;
    }

    extractUri(line: string, position: number): string | undefined {
      if (this.shouldMatch && line.includes(this.pattern)) {
        const match = line.match(
          new RegExp(`${this.pattern}[.\\w]*\\s*\\(\\s*['"](.*?)['"]`)
        );
        return match?.[1];
      }
      return undefined;
    }

    getSupportedLanguages(): string[] {
      return ["typescript", "typescriptreact"];
    }
  }

  // Mock content generator for testing
  class MockContentGenerator implements IHoverContentGenerator {
    constructor(private content: string) {}

    generateHoverContent(
      uri: string,
      contentSource: HoverContentSource
    ): vscode.MarkdownString {
      const markdown = new vscode.MarkdownString();
      markdown.appendMarkdown(`${this.content} for \`${uri}\``);
      markdown.appendCodeblock(contentSource.definition, "typescript");
      return markdown;
    }
  }

  // Mock type resolver for testing
  class MockTypeResolver implements ITypeInfoResolver {
    constructor(private shouldResolve: boolean = true) {}

    async resolveTypeInfo(
      uri: string
    ): Promise<HoverContentSource | undefined> {
      if (!this.shouldResolve) {
        return undefined;
      }

      return {
        typeName: "MockType",
        definition: `interface MockType { uri: "${uri}"; }`,
        sourceInfo: "Mock source",
      };
    }
  }

  suite("Pattern Matcher Priority System", () => {
    test("should execute pattern matchers in priority order", async () => {
      const lowPriorityMatcher = new MockPatternMatcher("fetch", 1, false);
      const highPriorityMatcher = new MockPatternMatcher("axios", 10, true);
      const mediumPriorityMatcher = new MockPatternMatcher("request", 5, false);

      const typeResolver = new MockTypeResolver();
      const contentGenerator = new MockContentGenerator("**Test Content**");

      const hoverProvider = new ExtensibleHoverProvider(
        [lowPriorityMatcher, mediumPriorityMatcher, highPriorityMatcher],
        typeResolver,
        contentGenerator
      );

      const mockDocument = {
        languageId: "typescript",
        lineAt: (line: number) => ({
          text: 'axios.post("/api/users", data)',
        }),
        validatePosition: (pos: vscode.Position) => pos,
      } as vscode.TextDocument;

      const mockPosition = new vscode.Position(0, 0);

      const result = await hoverProvider.provideHover(
        mockDocument,
        mockPosition
      );

      // Should match the highest priority matcher (axios)
      assert.ok(result);
      assert.ok(result.contents[0] instanceof vscode.MarkdownString);
      const content = result.contents[0] as vscode.MarkdownString;
      assert.ok(content.value.includes("/api/users"));
    });

    test("should fall back to lower priority matchers when higher ones fail", async () => {
      const highPriorityMatcher = new MockPatternMatcher("axios", 10, false); // Won't match
      const lowPriorityMatcher = new MockPatternMatcher("fetch", 1, true); // Will match

      const typeResolver = new MockTypeResolver();
      const contentGenerator = new MockContentGenerator("**Fallback Content**");

      const hoverProvider = new ExtensibleHoverProvider(
        [highPriorityMatcher, lowPriorityMatcher],
        typeResolver,
        contentGenerator
      );

      const mockDocument = {
        languageId: "typescript",
        lineAt: (line: number) => ({
          text: 'fetch("/api/posts")',
        }),
        validatePosition: (pos: vscode.Position) => pos,
      } as vscode.TextDocument;

      const mockPosition = new vscode.Position(0, 0);

      const result = await hoverProvider.provideHover(
        mockDocument,
        mockPosition
      );

      // Should match the lower priority matcher since higher one failed
      assert.ok(result);
      const content = result.contents[0] as vscode.MarkdownString;
      assert.ok(content.value.includes("/api/posts"));
      assert.ok(content.value.includes("**Fallback Content**"));
    });
  });

  suite("Language Support Extensibility", () => {
    test("should respect language-specific pattern matchers", async () => {
      class TypeScriptOnlyMatcher extends MockPatternMatcher {
        getSupportedLanguages(): string[] {
          return ["typescript"];
        }
      }

      class JSXOnlyMatcher extends MockPatternMatcher {
        getSupportedLanguages(): string[] {
          return ["typescriptreact"];
        }
      }

      const tsOnlyMatcher = new TypeScriptOnlyMatcher("fetch", 1, true);
      const jsxOnlyMatcher = new JSXOnlyMatcher("axios", 2, true);

      const typeResolver = new MockTypeResolver();
      const contentGenerator = new MockContentGenerator(
        "**Language Specific**"
      );

      const hoverProvider = new ExtensibleHoverProvider(
        [tsOnlyMatcher, jsxOnlyMatcher],
        typeResolver,
        contentGenerator
      );

      // Test TypeScript document - should only use TypeScript matcher
      const tsDocument = {
        languageId: "typescript",
        lineAt: (line: number) => ({ text: 'fetch("/api/ts")' }),
        validatePosition: (pos: vscode.Position) => pos,
      } as vscode.TextDocument;

      const tsResult = await hoverProvider.provideHover(
        tsDocument,
        new vscode.Position(0, 0)
      );
      assert.ok(tsResult);

      // Test TSX document - should only use JSX matcher
      const jsxDocument = {
        languageId: "typescriptreact",
        lineAt: (line: number) => ({ text: 'axios.get("/api/jsx")' }),
        validatePosition: (pos: vscode.Position) => pos,
      } as vscode.TextDocument;

      const jsxResult = await hoverProvider.provideHover(
        jsxDocument,
        new vscode.Position(0, 0)
      );
      assert.ok(jsxResult);

      // Test unsupported language - should return null
      const jsDocument = {
        languageId: "javascript",
        lineAt: (line: number) => ({ text: 'fetch("/api/js")' }),
        validatePosition: (pos: vscode.Position) => pos,
      } as vscode.TextDocument;

      const jsResult = await hoverProvider.provideHover(
        jsDocument,
        new vscode.Position(0, 0)
      );
      assert.strictEqual(jsResult, null);
    });
  });

  suite("Component Composition Extensibility", () => {
    test("should allow swapping type resolvers", async () => {
      class CustomTypeResolver implements ITypeInfoResolver {
        async resolveTypeInfo(
          uri: string
        ): Promise<HoverContentSource | undefined> {
          return {
            typeName: "CustomType",
            definition: `type CustomType = { customField: string; uri: "${uri}"; }`,
            sourceInfo: "Custom resolver",
          };
        }
      }

      const patternMatcher = new MockPatternMatcher("fetch", 1, true);
      const contentGenerator = new MockContentGenerator("**Custom Resolver**");

      // Test with default resolver
      const defaultResolver = new MockTypeResolver();
      const hoverProvider1 = new ExtensibleHoverProvider(
        [patternMatcher],
        defaultResolver,
        contentGenerator
      );

      // Test with custom resolver
      const customResolver = new CustomTypeResolver();
      const hoverProvider2 = new ExtensibleHoverProvider(
        [patternMatcher],
        customResolver,
        contentGenerator
      );

      const mockDocument = {
        languageId: "typescript",
        lineAt: (line: number) => ({ text: 'fetch("/api/test")' }),
        validatePosition: (pos: vscode.Position) => pos,
      } as vscode.TextDocument;

      const mockPosition = new vscode.Position(0, 0);

      // Compare results
      const result1 = await hoverProvider1.provideHover(
        mockDocument,
        mockPosition
      );
      const result2 = await hoverProvider2.provideHover(
        mockDocument,
        mockPosition
      );

      assert.ok(result1);
      assert.ok(result2);

      const content1 = (result1.contents[0] as vscode.MarkdownString).value;
      const content2 = (result2.contents[0] as vscode.MarkdownString).value;

      // Should have different content based on resolver
      assert.ok(content1.includes("MockType"));
      assert.ok(content2.includes("CustomType"));
    });

    test("should allow swapping content generators", async () => {
      class MinimalContentGenerator implements IHoverContentGenerator {
        generateHoverContent(
          uri: string,
          contentSource: HoverContentSource
        ): vscode.MarkdownString {
          const markdown = new vscode.MarkdownString();
          markdown.appendMarkdown(`Minimal: ${contentSource.typeName}`);
          return markdown;
        }
      }

      class VerboseContentGenerator implements IHoverContentGenerator {
        generateHoverContent(
          uri: string,
          contentSource: HoverContentSource
        ): vscode.MarkdownString {
          const markdown = new vscode.MarkdownString();
          markdown.appendMarkdown(`**Verbose API Documentation**\n`);
          markdown.appendMarkdown(`**Endpoint**: \`${uri}\`\n`);
          markdown.appendMarkdown(`**Type**: \`${contentSource.typeName}\`\n`);
          markdown.appendMarkdown(`**Source**: ${contentSource.sourceInfo}\n`);
          markdown.appendCodeblock(contentSource.definition, "typescript");
          return markdown;
        }
      }

      const patternMatcher = new MockPatternMatcher("fetch", 1, true);
      const typeResolver = new MockTypeResolver();

      const minimalGenerator = new MinimalContentGenerator();
      const verboseGenerator = new VerboseContentGenerator();

      const hoverProvider1 = new ExtensibleHoverProvider(
        [patternMatcher],
        typeResolver,
        minimalGenerator
      );

      const hoverProvider2 = new ExtensibleHoverProvider(
        [patternMatcher],
        typeResolver,
        verboseGenerator
      );

      const mockDocument = {
        languageId: "typescript",
        lineAt: (line: number) => ({ text: 'fetch("/api/test")' }),
        validatePosition: (pos: vscode.Position) => pos,
      } as vscode.TextDocument;

      const mockPosition = new vscode.Position(0, 0);

      const result1 = await hoverProvider1.provideHover(
        mockDocument,
        mockPosition
      );
      const result2 = await hoverProvider2.provideHover(
        mockDocument,
        mockPosition
      );

      assert.ok(result1);
      assert.ok(result2);

      const content1 = (result1.contents[0] as vscode.MarkdownString).value;
      const content2 = (result2.contents[0] as vscode.MarkdownString).value;

      // Minimal should be shorter
      assert.ok(content1.includes("Minimal: MockType"));
      assert.ok(!content1.includes("**Verbose"));

      // Verbose should be longer and more detailed
      assert.ok(content2.includes("**Verbose API Documentation**"));
      assert.ok(content2.includes("**Endpoint**"));
      assert.ok(content2.includes("**Type**"));
    });
  });

  suite("Error Handling and Resilience", () => {
    test("should handle type resolver failures gracefully", async () => {
      const patternMatcher = new MockPatternMatcher("fetch", 1, true);
      const failingResolver = new MockTypeResolver(false); // Will return undefined
      const contentGenerator = new MockContentGenerator("**Test**");

      const hoverProvider = new ExtensibleHoverProvider(
        [patternMatcher],
        failingResolver,
        contentGenerator
      );

      const mockDocument = {
        languageId: "typescript",
        lineAt: (line: number) => ({ text: 'fetch("/api/test")' }),
        validatePosition: (pos: vscode.Position) => pos,
      } as vscode.TextDocument;

      const result = await hoverProvider.provideHover(
        mockDocument,
        new vscode.Position(0, 0)
      );

      // Should return null when type resolver fails
      assert.strictEqual(result, null);
    });

    test("should handle missing pattern matches gracefully", async () => {
      const nonMatchingMatcher = new MockPatternMatcher("axios", 1, false);
      const typeResolver = new MockTypeResolver();
      const contentGenerator = new MockContentGenerator("**Test**");

      const hoverProvider = new ExtensibleHoverProvider(
        [nonMatchingMatcher],
        typeResolver,
        contentGenerator
      );

      const mockDocument = {
        languageId: "typescript",
        lineAt: (line: number) => ({ text: 'fetch("/api/test")' }),
        validatePosition: (pos: vscode.Position) => pos,
      } as vscode.TextDocument;

      const result = await hoverProvider.provideHover(
        mockDocument,
        new vscode.Position(0, 0)
      );

      // Should return null when no patterns match
      assert.strictEqual(result, null);
    });
  });

  suite("Real-world Integration Scenarios", () => {
    test("should support multiple HTTP libraries in the same project", async () => {
      const fetchMatcher = new MockPatternMatcher("fetch", 1, true);
      const axiosMatcher = new MockPatternMatcher("axios", 2, true);
      const superagentMatcher = new MockPatternMatcher("request", 3, true);

      const typeResolver = new MockTypeResolver();
      const contentGenerator = new MockContentGenerator(
        "**Multi-library Support**"
      );

      const hoverProvider = new ExtensibleHoverProvider(
        [fetchMatcher, axiosMatcher, superagentMatcher],
        typeResolver,
        contentGenerator
      );

      const testCases = [
        { line: 'fetch("/api/users")', expected: "/api/users" },
        { line: 'axios.get("/api/posts")', expected: "/api/posts" },
        { line: 'request.post("/api/auth")', expected: "/api/auth" },
      ];

      for (const testCase of testCases) {
        const mockDocument = {
          languageId: "typescript",
          lineAt: (line: number) => ({ text: testCase.line }),
          validatePosition: (pos: vscode.Position) => pos,
        } as vscode.TextDocument;

        const result = await hoverProvider.provideHover(
          mockDocument,
          new vscode.Position(0, 0)
        );

        assert.ok(result);
        const content = (result.contents[0] as vscode.MarkdownString).value;
        assert.ok(content.includes(testCase.expected));
      }
    });
  });
});
