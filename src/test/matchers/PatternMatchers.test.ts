import * as assert from "assert";
import { FetchPatternMatcher } from "../../matchers/FetchPatternMatcher";
import { AxiosPatternMatcher } from "../../matchers/AxiosPatternMatcher";
import { IHoverPatternMatcher } from "../../matchers/IHoverPatternMatcher";

/**
 * Test suite for Pattern Matchers
 * Focus: Testing the extensibility of pattern matching system
 */
suite("Pattern Matchers Extensibility Tests", () => {
  suite("FetchPatternMatcher", () => {
    test("should have correct interface implementation", () => {
      const matcher = new FetchPatternMatcher();

      // Verify interface compliance
      assert.ok(typeof matcher.name === "string");
      assert.ok(typeof matcher.priority === "number");
      assert.ok(typeof matcher.extractUri === "function");
      assert.ok(typeof matcher.getSupportedLanguages === "function");
      assert.ok(Array.isArray(matcher.getSupportedLanguages()));
    });

    test("should extract URIs from various fetch patterns", () => {
      const matcher = new FetchPatternMatcher();
      const testCases = [
        {
          line: 'fetch("/api/users")',
          position: 6,
          expected: "/api/users",
          description: "basic fetch call",
        },
        {
          line: 'await fetch("/api/posts", { method: "POST" })',
          position: 12,
          expected: "/api/posts",
          description: "fetch with options",
        },
        {
          line: '  const response = fetch("/api/auth/login");',
          position: 25,
          expected: "/api/auth/login",
          description: "fetch in assignment",
        },
        {
          line: "return fetch(`/api/users/${id}`)",
          position: 13,
          expected: undefined, // Template literals might not be supported
          description: "template literal (should not match)",
        },
      ];

      testCases.forEach((testCase) => {
        const result = matcher.extractUri(testCase.line, testCase.position);
        assert.strictEqual(
          result,
          testCase.expected,
          `Failed for ${testCase.description}: expected ${testCase.expected}, got ${result}`
        );
      });
    });

    test("should support TypeScript and TSX languages", () => {
      const matcher = new FetchPatternMatcher();
      const supportedLanguages = matcher.getSupportedLanguages();

      assert.ok(supportedLanguages.includes("typescript"));
      assert.ok(supportedLanguages.includes("typescriptreact"));
    });

    test("should have appropriate priority", () => {
      const matcher = new FetchPatternMatcher();

      // Fetch should have a reasonable default priority
      assert.ok(matcher.priority >= 0);
      assert.ok(matcher.priority <= 100);
    });
  });

  suite("AxiosPatternMatcher", () => {
    test("should extract URIs from various axios patterns", () => {
      const matcher = new AxiosPatternMatcher();
      const testCases = [
        {
          line: 'axios.get("/api/users")',
          position: 10,
          expected: "/api/users",
          description: "axios.get call",
        },
        {
          line: 'axios.post("/api/posts", data)',
          position: 11,
          expected: "/api/posts",
          description: "axios.post call",
        },
        {
          line: 'await axios.put("/api/users/1", updateData)',
          position: 16,
          expected: "/api/users/1",
          description: "axios.put call",
        },
        {
          line: 'axios.delete("/api/posts/123")',
          position: 13,
          expected: "/api/posts/123",
          description: "axios.delete call",
        },
        {
          line: 'const client = axios.create(); client.get("/api/data")',
          position: 47,
          expected: "/api/data",
          description: "axios instance call",
        },
      ];

      testCases.forEach((testCase) => {
        const result = matcher.extractUri(testCase.line, testCase.position);
        assert.strictEqual(
          result,
          testCase.expected,
          `Failed for ${testCase.description}: expected ${testCase.expected}, got ${result}`
        );
      });
    });

    test("should not match non-axios patterns", () => {
      const matcher = new AxiosPatternMatcher();
      const nonMatchingCases = [
        'fetch("/api/users")',
        'request.get("/api/posts")',
        'http.get("/api/data")',
        'superagent.get("/api/test")',
      ];

      nonMatchingCases.forEach((line) => {
        const result = matcher.extractUri(line, 10);
        assert.strictEqual(result, undefined, `Should not match: ${line}`);
      });
    });
  });

  suite("Pattern Matcher Interface Compliance", () => {
    test("All matchers should comply with IHoverPatternMatcher interface", () => {
      const allMatchers: IHoverPatternMatcher[] = [
        new FetchPatternMatcher(),
        new AxiosPatternMatcher(),
      ];

      allMatchers.forEach((matcher) => {
        // Test all required properties exist
        assert.ok(typeof matcher.name === "string");
        assert.ok(matcher.name.length > 0);

        assert.ok(typeof matcher.priority === "number");
        assert.ok(matcher.priority >= 0);

        // Test methods
        assert.ok(typeof matcher.extractUri === "function");
        assert.ok(typeof matcher.getSupportedLanguages === "function");

        // Test method return types
        const languages = matcher.getSupportedLanguages();
        assert.ok(Array.isArray(languages));
        assert.ok(languages.length > 0);

        // Test extractUri method
        const result = matcher.extractUri("test line", 0);
        assert.ok(result === undefined || typeof result === "string");
      });
    });

    test("should have unique names", () => {
      const allMatchers = [
        new FetchPatternMatcher(),
        new AxiosPatternMatcher(),
      ];
      const names = allMatchers.map((m) => m.name);
      const uniqueNames = [...new Set(names)];

      assert.strictEqual(
        names.length,
        uniqueNames.length,
        "All pattern matchers should have unique names"
      );
    });

    test("should support common languages", () => {
      const commonLanguages = ["typescript", "typescriptreact"];
      const allMatchers = [
        new FetchPatternMatcher(),
        new AxiosPatternMatcher(),
      ];

      allMatchers.forEach((matcher) => {
        const supportedLanguages = matcher.getSupportedLanguages();

        // At least one common language should be supported
        const hasCommonLanguage = commonLanguages.some((lang) =>
          supportedLanguages.includes(lang)
        );

        assert.ok(
          hasCommonLanguage,
          `${matcher.name} should support at least one common language`
        );
      });
    });
  });

  suite("Extensibility Architecture", () => {
    test("should be easy to create new pattern matchers", () => {
      // Example of creating a new matcher for superagent
      class SuperagentMatcher implements IHoverPatternMatcher {
        readonly name = "superagent";
        readonly priority = 5;

        extractUri(line: string, position: number): string | undefined {
          // Simple implementation for demonstration
          const match = line.match(
            /request\s*\.\s*(?:get|post|put|delete)\s*\(\s*['"]([^'"]+)['"]/
          );
          return match?.[1];
        }

        getSupportedLanguages(): string[] {
          return ["typescript", "typescriptreact", "javascript"];
        }
      }

      const customMatcher = new SuperagentMatcher();

      // Test that it implements the interface correctly
      assert.strictEqual(customMatcher.name, "superagent");
      assert.strictEqual(customMatcher.priority, 5);

      // Test functionality
      const result = customMatcher.extractUri('request.get("/api/test")', 12);
      assert.strictEqual(result, "/api/test");

      const languages = customMatcher.getSupportedLanguages();
      assert.ok(languages.includes("typescript"));
      assert.ok(languages.includes("javascript"));
    });

    test("should support priority-based ordering", () => {
      class HighPriorityMatcher implements IHoverPatternMatcher {
        readonly name = "high-priority";
        readonly priority = 100;
        extractUri(): string | undefined {
          return undefined;
        }
        getSupportedLanguages(): string[] {
          return ["typescript"];
        }
      }

      class LowPriorityMatcher implements IHoverPatternMatcher {
        readonly name = "low-priority";
        readonly priority = 1;
        extractUri(): string | undefined {
          return undefined;
        }
        getSupportedLanguages(): string[] {
          return ["typescript"];
        }
      }

      const matchers = [
        new LowPriorityMatcher(),
        new FetchPatternMatcher(),
        new HighPriorityMatcher(),
        new AxiosPatternMatcher(),
      ];

      // Sort by priority (highest first)
      const sortedMatchers = matchers.sort((a, b) => b.priority - a.priority);

      assert.strictEqual(sortedMatchers[0].name, "high-priority");
      assert.strictEqual(
        sortedMatchers[sortedMatchers.length - 1].name,
        "low-priority"
      );
    });

    test("should support language-specific matchers", () => {
      class JSXSpecificMatcher implements IHoverPatternMatcher {
        readonly name = "jsx-specific";
        readonly priority = 10;

        extractUri(line: string, position: number): string | undefined {
          // Example: JSX-specific pattern
          const match = line.match(/useFetch\s*\(\s*['"]([^'"]+)['"]/);
          return match?.[1];
        }

        getSupportedLanguages(): string[] {
          return ["typescriptreact", "javascriptreact"];
        }
      }

      const jsxMatcher = new JSXSpecificMatcher();
      const languages = jsxMatcher.getSupportedLanguages();

      assert.ok(languages.includes("typescriptreact"));
      assert.ok(languages.includes("javascriptreact"));
      assert.ok(!languages.includes("typescript"));

      // Test extraction
      const result = jsxMatcher.extractUri(
        'const data = useFetch("/api/data");',
        20
      );
      assert.strictEqual(result, "/api/data");
    });
  });

  suite("Performance and Edge Cases", () => {
    test("should handle malformed input gracefully", () => {
      const matchers = [new FetchPatternMatcher(), new AxiosPatternMatcher()];

      const malformedInputs = [
        "",
        "   ",
        "fetch(",
        'fetch("unclosed string',
        "fetch(123)",
        "fetch(null)",
        "axios.get",
        'axios.get("")',
        "random text without patterns",
      ];

      malformedInputs.forEach((input) => {
        matchers.forEach((matcher) => {
          // Should not throw
          assert.doesNotThrow(() => {
            const result = matcher.extractUri(input, 0);
            // Result should be either undefined or a valid string
            assert.ok(result === undefined || typeof result === "string");
          });
        });
      });
    });

    test("should handle various quote types", () => {
      const matcher = new FetchPatternMatcher();

      const quoteCases = [
        { line: "fetch('/api/users')", expected: "/api/users" },
        { line: 'fetch("/api/users")', expected: "/api/users" },
        { line: "fetch(`/api/users`)", expected: undefined }, // Template literals
      ];

      quoteCases.forEach((testCase) => {
        const result = matcher.extractUri(testCase.line, 6);
        assert.strictEqual(result, testCase.expected);
      });
    });

    test("should handle nested function calls", () => {
      const matcher = new FetchPatternMatcher();

      const nestedCases = [
        'fetch(getApiUrl("/api/users"))', // Should not match
        'fetch("/api/users").then(handleResponse)', // Should match
        'await fetch("/api/data").catch(handleError)', // Should match
      ];

      const results = nestedCases.map((line) => matcher.extractUri(line, 6));

      assert.strictEqual(results[0], undefined); // Nested call
      assert.strictEqual(results[1], "/api/users"); // With then
      assert.strictEqual(results[2], "/api/data"); // With catch
    });
  });
});
