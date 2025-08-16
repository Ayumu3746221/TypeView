import * as assert from "assert";
import * as vscode from "vscode";
import { TypeHoverContentGenerator } from "../../hover/TypeHoverContentGenerator";
import {
  IHoverContentGenerator,
  HoverContentSource,
} from "../../hover/IHoverContentGenerator";

/**
 * Test suite for Hover Content Generators
 * Focus: Testing the extensibility of content generation system
 */
suite("Hover Content Generator Extensibility Tests", () => {
  suite("TypeHoverContentGenerator", () => {
    test("should implement IHoverContentGenerator interface", () => {
      const generator = new TypeHoverContentGenerator();

      assert.ok(typeof generator.generateHoverContent === "function");
    });

    test("should generate hover content from type information", () => {
      const generator = new TypeHoverContentGenerator();
      const contentSource: HoverContentSource = {
        typeName: "UserRequest",
        definition: "interface UserRequest { name: string; email: string; }",
        sourceInfo: "From: types/user.ts",
      };

      const result = generator.generateHoverContent(
        "/api/users",
        contentSource
      );

      assert.ok(result instanceof vscode.MarkdownString);
      assert.ok(result.value.includes("UserRequest"));
      assert.ok(result.value.includes("interface UserRequest"));
      assert.ok(result.value.includes("types/user.ts"));
    });

    test("should handle various type definitions", () => {
      const generator = new TypeHoverContentGenerator();
      const testCases = [
        {
          contentSource: {
            typeName: "StringType",
            definition: "type StringType = string",
            sourceInfo: "From: types.ts",
          },
          expectedContent: ["StringType", "type StringType = string"],
        },
        {
          contentSource: {
            typeName: "ComplexInterface",
            definition:
              "interface ComplexInterface {\n  id: number;\n  data: any[];\n}",
            sourceInfo: "Defined in same file",
          },
          expectedContent: [
            "ComplexInterface",
            "interface ComplexInterface",
            "id: number",
          ],
        },
        {
          contentSource: {
            typeName: "GenericType",
            definition: "type GenericType<T> = T | null",
            sourceInfo: "Generic type definition",
          },
          expectedContent: ["GenericType", "GenericType<T>", "T | null"],
        },
      ];

      testCases.forEach((testCase, index) => {
        const result = generator.generateHoverContent(
          `/api/test${index}`,
          testCase.contentSource
        );

        testCase.expectedContent.forEach((expectedText) => {
          assert.ok(
            result.value.includes(expectedText),
            `Expected "${expectedText}" in hover content for test case ${index}`
          );
        });
      });
    });

    test("should format markdown correctly", () => {
      const generator = new TypeHoverContentGenerator();
      const contentSource: HoverContentSource = {
        typeName: "TestType",
        definition: "interface TestType { value: string; }",
        sourceInfo: "Test source",
      };

      const result = generator.generateHoverContent("/api/test", contentSource);

      // Should contain TypeScript code blocks
      assert.ok(result.value.includes("```typescript"));
      assert.ok(result.value.includes("```"));

      // Should be marked as trusted for rendering
      assert.ok(result.isTrusted);
    });
  });

  suite("Interface Compliance", () => {
    test("TypeHoverContentGenerator should comply with IHoverContentGenerator interface", () => {
      const generator = new TypeHoverContentGenerator();

      // Test required methods exist
      assert.ok(typeof generator.generateHoverContent === "function");

      // Test method signature
      const mockContent: HoverContentSource = {
        typeName: "TestType",
        definition: "type TestType = string",
        sourceInfo: "Test",
      };

      const result = generator.generateHoverContent("/test", mockContent);
      assert.ok(result instanceof vscode.MarkdownString);
    });
  });

  suite("Extensibility Architecture", () => {
    test("should be easy to create custom content generators", () => {
      // Example: Custom generator for API documentation
      class ApiDocumentationGenerator implements IHoverContentGenerator {
        generateHoverContent(
          uri: string,
          contentSource: HoverContentSource
        ): vscode.MarkdownString {
          const markdown = new vscode.MarkdownString();
          markdown.isTrusted = true;

          markdown.appendMarkdown(`## API Endpoint: \`${uri}\`\n\n`);
          markdown.appendMarkdown(
            `### Request Type: **${contentSource.typeName}**\n\n`
          );
          markdown.appendCodeblock(contentSource.definition, "typescript");
          markdown.appendMarkdown(
            `\n*Source: ${contentSource.sourceInfo}*\n\n`
          );
          markdown.appendMarkdown(`### Usage Example\n\n`);
          markdown.appendCodeblock(
            `const request: ${contentSource.typeName} = {\n  // Your request data here\n};`,
            "typescript"
          );

          return markdown;
        }
      }

      const customGenerator = new ApiDocumentationGenerator();

      const contentSource: HoverContentSource = {
        typeName: "CreateUserRequest",
        definition:
          "interface CreateUserRequest { name: string; email: string; }",
        sourceInfo: "api/types/user.ts",
      };

      const result = customGenerator.generateHoverContent(
        "/api/users",
        contentSource
      );

      assert.ok(result instanceof vscode.MarkdownString);
      assert.ok(result.value.includes("API Endpoint: `/api/users`"));
      assert.ok(result.value.includes("CreateUserRequest"));
      assert.ok(result.value.includes("Usage Example"));
      assert.ok(result.value.includes("const request: CreateUserRequest"));
    });

    test("should support themed content generators", () => {
      class MinimalContentGenerator implements IHoverContentGenerator {
        generateHoverContent(
          uri: string,
          contentSource: HoverContentSource
        ): vscode.MarkdownString {
          const markdown = new vscode.MarkdownString();
          markdown.isTrusted = true;

          // Minimal format - just the type definition
          markdown.appendCodeblock(contentSource.definition, "typescript");

          return markdown;
        }
      }

      class VerboseContentGenerator implements IHoverContentGenerator {
        generateHoverContent(
          uri: string,
          contentSource: HoverContentSource
        ): vscode.MarkdownString {
          const markdown = new vscode.MarkdownString();
          markdown.isTrusted = true;

          // Verbose format with all details
          markdown.appendMarkdown(`# 🔍 Type Information\n\n`);
          markdown.appendMarkdown(`**Endpoint:** \`${uri}\`\n\n`);
          markdown.appendMarkdown(
            `**Type Name:** \`${contentSource.typeName}\`\n\n`
          );
          markdown.appendMarkdown(
            `**Source:** ${contentSource.sourceInfo}\n\n`
          );
          markdown.appendMarkdown(`## Type Definition\n\n`);
          markdown.appendCodeblock(contentSource.definition, "typescript");
          markdown.appendMarkdown(`\n---\n*Generated by TypeView*`);

          return markdown;
        }
      }

      const contentSource: HoverContentSource = {
        typeName: "TestType",
        definition: "type TestType = { value: string }",
        sourceInfo: "test.ts",
      };

      const minimalGenerator = new MinimalContentGenerator();
      const verboseGenerator = new VerboseContentGenerator();

      const minimalResult = minimalGenerator.generateHoverContent(
        "/test",
        contentSource
      );
      const verboseResult = verboseGenerator.generateHoverContent(
        "/test",
        contentSource
      );

      // Minimal should be shorter
      assert.ok(minimalResult.value.length < verboseResult.value.length);

      // Both should contain the type definition
      assert.ok(minimalResult.value.includes("type TestType"));
      assert.ok(verboseResult.value.includes("type TestType"));

      // Only verbose should contain emojis and extra formatting
      assert.ok(!minimalResult.value.includes("🔍"));
      assert.ok(verboseResult.value.includes("🔍"));
      assert.ok(verboseResult.value.includes("Generated by TypeView"));
    });

    test("should support context-aware generators", () => {
      class ContextAwareGenerator implements IHoverContentGenerator {
        generateHoverContent(
          uri: string,
          contentSource: HoverContentSource
        ): vscode.MarkdownString {
          const markdown = new vscode.MarkdownString();
          markdown.isTrusted = true;

          // Customize content based on URI patterns
          if (uri.includes("/auth/")) {
            markdown.appendMarkdown(`🔐 **Authentication Endpoint**\n\n`);
          } else if (uri.includes("/users/")) {
            markdown.appendMarkdown(`👤 **User Management Endpoint**\n\n`);
          } else if (uri.includes("/api/v")) {
            const versionMatch = uri.match(/\/api\/(v\d+)\//);
            if (versionMatch) {
              markdown.appendMarkdown(
                `📦 **API ${versionMatch[1].toUpperCase()}**\n\n`
              );
            }
          }

          markdown.appendMarkdown(
            `**Type:** \`${contentSource.typeName}\`\n\n`
          );
          markdown.appendCodeblock(contentSource.definition, "typescript");

          return markdown;
        }
      }

      const generator = new ContextAwareGenerator();

      const testCases = [
        {
          uri: "/api/auth/login",
          expectedIcon: "🔐",
          expectedText: "Authentication Endpoint",
        },
        {
          uri: "/api/users/create",
          expectedIcon: "👤",
          expectedText: "User Management Endpoint",
        },
        {
          uri: "/api/v2/posts",
          expectedIcon: "📦",
          expectedText: "API V2",
        },
      ];

      testCases.forEach((testCase) => {
        const contentSource: HoverContentSource = {
          typeName: "TestType",
          definition: "type TestType = any",
          sourceInfo: "test",
        };

        const result = generator.generateHoverContent(
          testCase.uri,
          contentSource
        );

        assert.ok(result.value.includes(testCase.expectedIcon));
        assert.ok(result.value.includes(testCase.expectedText));
      });
    });

    test("should support generator composition", () => {
      class CompositeGenerator implements IHoverContentGenerator {
        constructor(private generators: IHoverContentGenerator[]) {}

        generateHoverContent(
          uri: string,
          contentSource: HoverContentSource
        ): vscode.MarkdownString {
          const markdown = new vscode.MarkdownString();
          markdown.isTrusted = true;

          // Combine content from all generators
          this.generators.forEach((generator, index) => {
            const generatorResult = generator.generateHoverContent(
              uri,
              contentSource
            );

            if (index > 0) {
              markdown.appendMarkdown(`\n---\n`);
            }

            markdown.appendMarkdown(generatorResult.value);
          });

          return markdown;
        }
      }

      const generator1: IHoverContentGenerator = {
        generateHoverContent(
          uri: string,
          contentSource: HoverContentSource
        ): vscode.MarkdownString {
          const md = new vscode.MarkdownString();
          md.appendMarkdown(`**Generator 1:** ${contentSource.typeName}\n`);
          return md;
        },
      };

      const generator2: IHoverContentGenerator = {
        generateHoverContent(
          uri: string,
          contentSource: HoverContentSource
        ): vscode.MarkdownString {
          const md = new vscode.MarkdownString();
          md.appendMarkdown(`**Generator 2:** ${contentSource.sourceInfo}\n`);
          return md;
        },
      };

      const composite = new CompositeGenerator([generator1, generator2]);

      const contentSource: HoverContentSource = {
        typeName: "TestType",
        definition: "type TestType = string",
        sourceInfo: "test.ts",
      };

      const result = composite.generateHoverContent("/test", contentSource);

      assert.ok(result.value.includes("**Generator 1:** TestType"));
      assert.ok(result.value.includes("**Generator 2:** test.ts"));
      assert.ok(result.value.includes("---")); // Separator
    });
  });

  suite("Content Formatting and Edge Cases", () => {
    test("should handle complex type definitions", () => {
      const generator = new TypeHoverContentGenerator();

      const complexTypes = [
        {
          typeName: "NestedType",
          definition: `interface NestedType {
  user: {
    profile: {
      name: string;
      settings: Record<string, any>;
    };
  };
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
  };
}`,
        },
        {
          typeName: "GenericUtility",
          definition:
            "type GenericUtility<T, K extends keyof T> = Pick<T, K> & { id: string }",
        },
        {
          typeName: "UnionType",
          definition:
            "type UnionType = 'active' | 'inactive' | 'pending' | { custom: string }",
        },
      ];

      complexTypes.forEach((typeInfo) => {
        const contentSource: HoverContentSource = {
          ...typeInfo,
          sourceInfo: "complex-types.ts",
        };

        assert.doesNotThrow(() => {
          const result = generator.generateHoverContent("/test", contentSource);

          assert.ok(result instanceof vscode.MarkdownString);
          assert.ok(result.value.includes(typeInfo.typeName));
          assert.ok(result.value.includes(typeInfo.definition));
        });
      });
    });

    test("should handle empty or malformed content", () => {
      const generator = new TypeHoverContentGenerator();

      const edgeCases = [
        {
          typeName: "",
          definition: "",
          sourceInfo: "",
        },
        {
          typeName: "ValidType",
          definition: "",
          sourceInfo: "empty-definition.ts",
        },
        {
          typeName: "",
          definition: "type AnonymousType = string",
          sourceInfo: "no-name.ts",
        },
      ];

      edgeCases.forEach((contentSource) => {
        assert.doesNotThrow(() => {
          const result = generator.generateHoverContent("/test", contentSource);
          assert.ok(result instanceof vscode.MarkdownString);
          // Should still produce some content, even if minimal
          assert.ok(result.value.length > 0);
        });
      });
    });

    test("should escape markdown special characters", () => {
      const generator = new TypeHoverContentGenerator();

      const contentSource: HoverContentSource = {
        typeName: "SpecialChars",
        definition:
          "type SpecialChars = { _underscore: string; *asterisk*: number; [key]: any }",
        sourceInfo: "special-*chars*_file_.ts",
      };

      const result = generator.generateHoverContent("/test", contentSource);

      // The definition should be in a code block, so special chars should be safe
      assert.ok(result.value.includes("```typescript"));
      assert.ok(result.value.includes("_underscore"));
      assert.ok(result.value.includes("*asterisk*"));
    });

    test("should handle long type definitions", () => {
      const generator = new TypeHoverContentGenerator();

      // Create a very long type definition
      const longDefinition = `interface VeryLongType {
${Array.from({ length: 50 }, (_, i) => `  field${i}: string;`).join("\n")}
}`;

      const contentSource: HoverContentSource = {
        typeName: "VeryLongType",
        definition: longDefinition,
        sourceInfo: "long-types.ts",
      };

      assert.doesNotThrow(() => {
        const result = generator.generateHoverContent("/test", contentSource);

        assert.ok(result instanceof vscode.MarkdownString);
        assert.ok(result.value.includes("VeryLongType"));
        assert.ok(result.value.includes("field0"));
        assert.ok(result.value.includes("field49"));
      });
    });
  });
});
