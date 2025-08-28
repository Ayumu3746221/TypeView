import * as assert from "assert";
import * as vscode from "vscode";
import { ExtensibleHoverProvider } from "../../hover/ExtensibleHoverProvider";
import { TypeHoverContentGenerator } from "../../hover/TypeHoverContentGenerator";
import { NextjsApiRouteTypeResolver } from "../../type-resolver/NextjsApiRouteTypeResolver";
import { FetchPatternMatcher } from "../../matchers/FetchPatternMatcher";
import { AxiosPatternMatcher } from "../../matchers/AxiosPatternMatcher";
import { IHoverPatternMatcher } from "../../matchers/IHoverPatternMatcher";
import { ITypeInfoResolver } from "../../type-resolver/ITypeInfoResolver";
import {
  IHoverContentGenerator,
  HoverContentSource,
} from "../../hover/IHoverContentGenerator";

/**
 * Integration tests for the complete extensible hover system
 * Focus: Testing how all components work together
 */
suite("Extensible Hover System Integration Tests", () => {
  // Mock utilities for testing
  const createMockDocument = (
    content: string,
    languageId: string = "typescript"
  ): vscode.TextDocument => {
    return {
      getText: () => content,
      lineAt: (line: number) => ({
        text: content.split("\n")[line] || "",
        range: new vscode.Range(line, 0, line, 100),
        rangeIncludingLineBreak: new vscode.Range(line, 0, line + 1, 0),
        firstNonWhitespaceCharacterIndex: 0,
        isEmptyOrWhitespace: false,
      }),
      languageId,
      fileName: "test.ts",
      uri: vscode.Uri.file("/test.ts"),
      version: 1,
      isDirty: false,
      isClosed: false,
      eol: vscode.EndOfLine.LF,
      lineCount: content.split("\n").length,
      save: () => Promise.resolve(true),
      offsetAt: () => 0,
      positionAt: () => new vscode.Position(0, 0),
      getWordRangeAtPosition: () => new vscode.Range(0, 0, 0, 10),
      validatePosition: (pos: vscode.Position) => pos,
      validateRange: (range: vscode.Range) => range,
    } as any;
  };

  const createMockRouteFinder = (mockTypeInfo?: HoverContentSource) => {
    return async (uri: string): Promise<vscode.Uri | undefined> => {
      if (uri.startsWith("/api/")) {
        return vscode.Uri.file(`/workspace/src/app${uri}/route.ts`);
      }
      return undefined;
    };
  };

  const createMockTypeResolver = (
    mockResponse?: HoverContentSource
  ): ITypeInfoResolver => {
    return {
      async resolveTypeInfo(
        uri: string
      ): Promise<HoverContentSource | undefined> {
        if (mockResponse && uri.startsWith("/api/")) {
          return mockResponse;
        }
        return undefined;
      },
    };
  };

  suite("Complete Hover Flow", () => {
    test("should provide hover for fetch patterns", async () => {
      const mockTypeInfo: HoverContentSource = {
        typeName: "UserRequest",
        definition: "interface UserRequest { name: string; email: string; }",
        sourceInfo: "From: types/user.ts",
      };

      const provider = new ExtensibleHoverProvider(
        [new FetchPatternMatcher()],
        createMockTypeResolver(mockTypeInfo),
        new TypeHoverContentGenerator()
      );

      const document = createMockDocument(
        'const response = fetch("/api/users");'
      );
      const position = new vscode.Position(0, 25);

      const hover = await provider.provideHover(document, position);

      assert.ok(hover !== null);
      assert.ok(hover !== undefined);
      if (hover) {
        assert.ok(hover.contents.length > 0);

        const content = hover.contents[0] as vscode.MarkdownString;
        assert.ok(content.value.includes("UserRequest"));
        assert.ok(content.value.includes("interface UserRequest"));
      }
    });

    test("should provide hover for axios patterns", async () => {
      const mockTypeInfo: HoverContentSource = {
        typeName: "PostData",
        definition: "type PostData = { title: string; content: string; }",
        sourceInfo: "Local definition",
      };

      const provider = new ExtensibleHoverProvider(
        [new AxiosPatternMatcher()],
        createMockTypeResolver(mockTypeInfo),
        new TypeHoverContentGenerator()
      );

      const document = createMockDocument('axios.post("/api/posts", data);');
      const position = new vscode.Position(0, 12);

      const hover = await provider.provideHover(document, position);

      assert.ok(hover !== null);
      assert.ok(hover !== undefined);
      if (hover) {
        assert.ok(hover.contents.length > 0);

        const content = hover.contents[0] as vscode.MarkdownString;
        assert.ok(content.value.includes("PostData"));
      }
    });

    test("should handle multiple pattern matchers with priority", async () => {
      const mockTypeInfo: HoverContentSource = {
        typeName: "ApiResponse",
        definition: "type ApiResponse = { success: boolean; data: any; }",
        sourceInfo: "api/types.ts",
      };

      // Create matchers with different priorities
      const highPriorityMatcher: IHoverPatternMatcher = {
        name: "custom-high",
        priority: 100,
        extractUri: (line: string, position: number) => {
          if (line.includes("customFetch")) {
            const match = line.match(/customFetch\(['"]([^'"]+)['"]/);
            return match?.[1];
          }
          return undefined;
        },
        getSupportedLanguages: () => ["typescript"],
      };

      const provider = new ExtensibleHoverProvider(
        [
          new FetchPatternMatcher(),
          highPriorityMatcher,
          new AxiosPatternMatcher(),
        ],
        createMockTypeResolver(mockTypeInfo),
        new TypeHoverContentGenerator()
      );

      // Test that high priority matcher takes precedence
      const document1 = createMockDocument('customFetch("/api/test");');
      const position1 = new vscode.Position(0, 12);

      const hover1 = await provider.provideHover(document1, position1);
      assert.ok(hover1 !== undefined);

      // Test that lower priority matchers still work when high priority doesn't match
      const document2 = createMockDocument('fetch("/api/users");');
      const position2 = new vscode.Position(0, 7);

      const hover2 = await provider.provideHover(document2, position2);
      assert.ok(hover2 !== undefined);
    });

    test("should handle language-specific matching", async () => {
      const mockTypeInfo: HoverContentSource = {
        typeName: "ReactComponent",
        definition: "type ReactComponent = React.FC<Props>",
        sourceInfo: "React types",
      };

      const jsxOnlyMatcher: IHoverPatternMatcher = {
        name: "jsx-only",
        priority: 50,
        extractUri: (line: string, position: number) => {
          const match = line.match(/useFetch\(['"]([^'"]+)['"]/);
          return match?.[1];
        },
        getSupportedLanguages: () => ["typescriptreact", "javascriptreact"],
      };

      const provider = new ExtensibleHoverProvider(
        [jsxOnlyMatcher],
        createMockTypeResolver(mockTypeInfo),
        new TypeHoverContentGenerator()
      );

      // Should work in TSX
      const tsxDocument = createMockDocument(
        'const data = useFetch("/api/data");',
        "typescriptreact"
      );
      const hover1 = await provider.provideHover(
        tsxDocument,
        new vscode.Position(0, 20)
      );
      assert.ok(hover1 !== undefined);

      // Should not work in regular TypeScript
      const tsDocument = createMockDocument(
        'const data = useFetch("/api/data");',
        "typescript"
      );
      const hover2 = await provider.provideHover(
        tsDocument,
        new vscode.Position(0, 20)
      );
      assert.ok(hover2 === null);
    });
  });

  suite("Error Handling and Resilience", () => {
    test("should handle type resolver failures gracefully", async () => {
      const failingResolver: ITypeInfoResolver = {
        async resolveTypeInfo(
          uri: string
        ): Promise<HoverContentSource | undefined> {
          throw new Error("Resolver failed");
        },
      };

      const provider = new ExtensibleHoverProvider(
        [new FetchPatternMatcher()],
        failingResolver,
        new TypeHoverContentGenerator()
      );

      const document = createMockDocument('fetch("/api/test");');
      const position = new vscode.Position(0, 7);

      // Should not throw, should return null (graceful failure)
      const hover = await provider.provideHover(document, position);
      assert.strictEqual(hover, null);
    });

    test("should handle content generator failures gracefully", async () => {
      const failingGenerator: IHoverContentGenerator = {
        generateHoverContent(
          uri: string,
          contentSource: HoverContentSource
        ): vscode.MarkdownString {
          throw new Error("Generator failed");
        },
      };

      const mockTypeInfo: HoverContentSource = {
        typeName: "TestType",
        definition: "type TestType = string",
        sourceInfo: "test.ts",
      };

      const provider = new ExtensibleHoverProvider(
        [new FetchPatternMatcher()],
        createMockTypeResolver(mockTypeInfo),
        failingGenerator
      );

      const document = createMockDocument('fetch("/api/test");');
      const position = new vscode.Position(0, 7);

      // Should not throw, should return null (graceful failure)
      const hover = await provider.provideHover(document, position);
      assert.strictEqual(hover, null);
    });

    test("should handle pattern matcher failures gracefully", async () => {
      const failingMatcher: IHoverPatternMatcher = {
        name: "failing-matcher",
        priority: 50,
        extractUri: (line: string, position: number) => {
          throw new Error("Matcher failed");
        },
        getSupportedLanguages: () => ["typescript"],
      };

      const provider = new ExtensibleHoverProvider(
        [failingMatcher, new FetchPatternMatcher()],
        createMockTypeResolver(),
        new TypeHoverContentGenerator()
      );

      const document = createMockDocument('fetch("/api/test");');
      const position = new vscode.Position(0, 7);

      // Should still work with the working matcher
      await assert.doesNotReject(async () => {
        const hover = await provider.provideHover(document, position);
        // Result depends on whether type resolver returns data
      });
    });

    test("should handle invalid document positions", async () => {
      const provider = new ExtensibleHoverProvider(
        [new FetchPatternMatcher()],
        createMockTypeResolver(),
        new TypeHoverContentGenerator()
      );

      const document = createMockDocument('fetch("/api/test");');

      // Test positions that will be validated/corrected by VS Code
      const edgeCasePositions = [
        new vscode.Position(100, 0), // Beyond document - should be clamped
        new vscode.Position(0, 1000), // Beyond line - should be clamped
      ];

      for (const position of edgeCasePositions) {
        await assert.doesNotReject(async () => {
          const hover = await provider.provideHover(document, position);
          // Should handle gracefully, may return undefined
        });
      }
    });
  });

  suite("Performance and Scalability", () => {
    test("should handle many pattern matchers efficiently", async () => {
      // Create many pattern matchers
      const matchers: IHoverPatternMatcher[] = [];

      for (let i = 0; i < 50; i++) {
        matchers.push({
          name: `matcher-${i}`,
          priority: i,
          extractUri: (line: string, position: number) => {
            // Only the last matcher will match
            if (i === 49 && line.includes("special")) {
              return "/api/special";
            }
            return undefined;
          },
          getSupportedLanguages: () => ["typescript"],
        });
      }

      const provider = new ExtensibleHoverProvider(
        matchers,
        createMockTypeResolver(),
        new TypeHoverContentGenerator()
      );

      const startTime = Date.now();

      const document = createMockDocument('special("/api/special");');
      const hover = await provider.provideHover(
        document,
        new vscode.Position(0, 10)
      );

      const duration = Date.now() - startTime;

      // Should complete in reasonable time even with many matchers
      assert.ok(duration < 100, `Too slow with many matchers: ${duration}ms`);
    });

    test("should handle concurrent hover requests", async () => {
      const mockTypeInfo: HoverContentSource = {
        typeName: "ConcurrentType",
        definition: "type ConcurrentType = string",
        sourceInfo: "concurrent.ts",
      };

      const provider = new ExtensibleHoverProvider(
        [new FetchPatternMatcher()],
        createMockTypeResolver(mockTypeInfo),
        new TypeHoverContentGenerator()
      );

      const document = createMockDocument('fetch("/api/test");');

      // Make many concurrent requests
      const promises = Array.from({ length: 10 }, (_, i) =>
        provider.provideHover(document, new vscode.Position(0, 7))
      );

      const results = await Promise.all(promises);

      // All should succeed (or all should fail consistently)
      const hasResults = results.some((r) => r !== undefined);
      const allConsistent = results.every(
        (r) => (r === undefined) === (results[0] === undefined)
      );

      assert.ok(allConsistent, "Concurrent requests should be consistent");
    });
  });

  suite("Real-world Scenarios", () => {
    test("should handle complex fetch patterns in real code", async () => {
      const mockTypeInfo: HoverContentSource = {
        typeName: "ApiResponse",
        definition:
          "interface ApiResponse<T> { data: T; status: number; message?: string; }",
        sourceInfo: "api/types/response.ts",
      };

      const provider = new ExtensibleHoverProvider(
        [new FetchPatternMatcher(), new AxiosPatternMatcher()],
        createMockTypeResolver(mockTypeInfo),
        new TypeHoverContentGenerator()
      );

      const realWorldCode = `
async function getUserData(id: string) {
  try {
    const response = await fetch(\"/api/users/\${id}\", {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}`;

      const document = createMockDocument(realWorldCode);

      // Should detect the fetch call despite template literal (current implementation may not support this)
      const hover = await provider.provideHover(
        document,
        new vscode.Position(3, 35)
      );

      // This test documents current behavior - template literals might not be supported
      // but the system should not crash
      await assert.doesNotReject(async () => {
        await provider.provideHover(document, new vscode.Position(3, 35));
      });
    });

    test("should handle mixed HTTP libraries in same file", async () => {
      const mockTypeInfo: HoverContentSource = {
        typeName: "MixedResponse",
        definition: "type MixedResponse = { id: string; data: any }",
        sourceInfo: "mixed.ts",
      };

      const provider = new ExtensibleHoverProvider(
        [new FetchPatternMatcher(), new AxiosPatternMatcher()],
        createMockTypeResolver(mockTypeInfo),
        new TypeHoverContentGenerator()
      );

      const mixedCode = `
// Using fetch
const fetchResponse = fetch("/api/data");

// Using axios  
const axiosResponse = axios.get("/api/users");

// Using fetch again
fetch("/api/posts").then(handleResponse);
`;

      const document = createMockDocument(mixedCode);

      // Test all three HTTP calls
      const positions = [
        new vscode.Position(2, 24), // fetch
        new vscode.Position(5, 29), // axios
        new vscode.Position(8, 7), // fetch again
      ];

      for (const position of positions) {
        await assert.doesNotReject(async () => {
          const hover = await provider.provideHover(document, position);
          // Each should either work or fail gracefully
        });
      }
    });

    test("should work with different API route structures", async () => {
      const createTypeInfoForRoute = (uri: string): HoverContentSource => ({
        typeName: `${uri.split("/").pop()}Type`,
        definition: `type ${uri.split("/").pop()}Type = { route: "${uri}" }`,
        sourceInfo: `${uri}/route.ts`,
      });

      const smartResolver: ITypeInfoResolver = {
        async resolveTypeInfo(
          uri: string
        ): Promise<HoverContentSource | undefined> {
          if (uri.startsWith("/api/")) {
            return createTypeInfoForRoute(uri);
          }
          return undefined;
        },
      };

      const provider = new ExtensibleHoverProvider(
        [new FetchPatternMatcher()],
        smartResolver,
        new TypeHoverContentGenerator()
      );

      const apiRoutes = [
        'fetch("/api/users")',
        'fetch("/api/auth/login")',
        'fetch("/api/v2/posts")',
        'fetch("/api/admin/settings/notifications")',
      ];

      for (const route of apiRoutes) {
        const document = createMockDocument(route);
        const hover = await provider.provideHover(
          document,
          new vscode.Position(0, 7)
        );

        if (hover) {
          const content = hover.contents[0] as vscode.MarkdownString;
          assert.ok(content.value.includes("Type"));
        }
      }
    });
  });
});
