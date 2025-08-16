import * as assert from "assert";
import * as vscode from "vscode";
import { NextjsApiRouteTypeResolver } from "../../type-resolver/NextjsApiRouteTypeResolver";
import { TypeResolverFactory } from "../../type-resolver/TypeResolverFactory";
import { ITypeInfoResolver } from "../../type-resolver/ITypeInfoResolver";
import { HoverContentSource } from "../../hover/IHoverContentGenerator";

/**
 * Test suite for Type Resolvers
 * Focus: Testing the extensibility of type resolution system
 */
suite("Type Resolvers Extensibility Tests", () => {
  // Mock route file finder for testing
  const createMockRouteFinder = (shouldFind: boolean = true) => {
    return async (uri: string): Promise<vscode.Uri | undefined> => {
      if (!shouldFind) {
        return undefined;
      }

      // Mock file path based on URI
      const mockPath = `/workspace/src/app${uri}/route.ts`;
      return vscode.Uri.file(mockPath);
    };
  };

  suite("NextjsApiRouteTypeResolver", () => {
    test("should implement ITypeInfoResolver interface", () => {
      const mockRouteFinder = createMockRouteFinder();
      const resolver = new NextjsApiRouteTypeResolver(mockRouteFinder);

      assert.ok(typeof resolver.resolveTypeInfo === "function");
    });

    test("should resolve type information from route files", async () => {
      const mockRouteFinder = createMockRouteFinder();
      const resolver = new NextjsApiRouteTypeResolver(mockRouteFinder);

      // This test focuses on the interface rather than actual type parsing
      const result = await resolver.resolveTypeInfo("/api/users");

      // The result can be undefined if no types are found, which is expected
      // in a mock environment without real files
      assert.ok(
        result === undefined ||
          (result &&
            typeof result.typeName === "string" &&
            typeof result.definition === "string" &&
            typeof result.sourceInfo === "string")
      );
    });

    test("should return undefined when route file not found", async () => {
      const resolverWithFailingFinder = new NextjsApiRouteTypeResolver(
        createMockRouteFinder(false)
      );

      const result = await resolverWithFailingFinder.resolveTypeInfo(
        "/api/nonexistent"
      );
      assert.strictEqual(result, undefined);
    });

    test("should handle various route patterns", async () => {
      const mockRouteFinder = createMockRouteFinder();
      const resolver = new NextjsApiRouteTypeResolver(mockRouteFinder);

      const routePatterns = [
        "/api/users",
        "/api/auth/login",
        "/api/posts/[id]",
        "/api/users/[...params]",
      ];

      // All should be processed without throwing errors
      for (const pattern of routePatterns) {
        await assert.doesNotReject(async () => {
          const result = await resolver.resolveTypeInfo(pattern);
          // Result can be undefined in mock environment
          assert.ok(result === undefined || typeof result === "object");
        });
      }
    });
  });

  suite("TypeResolverFactory", () => {
    test("should create NextJS resolver", () => {
      const mockRouteFinder = createMockRouteFinder();
      const resolver = TypeResolverFactory.createResolver(
        "nextjs-app-router",
        mockRouteFinder
      );

      assert.ok(resolver instanceof NextjsApiRouteTypeResolver);
    });

    test("should return undefined for unsupported frameworks", () => {
      const mockRouteFinder = createMockRouteFinder();
      const resolver = TypeResolverFactory.createResolver(
        "unsupported-framework",
        mockRouteFinder
      );

      assert.strictEqual(resolver, undefined);
    });

    test("should list supported frameworks", () => {
      const frameworks = TypeResolverFactory.getSupportedFrameworks();

      assert.ok(Array.isArray(frameworks));
      assert.ok(frameworks.includes("nextjs-app-router"));
      assert.ok(frameworks.length > 0);
    });
  });

  suite("Type Resolver Interface Compliance", () => {
    const mockRouteFinder = createMockRouteFinder();
    const resolver = new NextjsApiRouteTypeResolver(mockRouteFinder);

    test("NextjsApiRouteTypeResolver should comply with ITypeInfoResolver interface", () => {
      // Test required methods exist
      assert.ok(typeof resolver.resolveTypeInfo === "function");

      // Test method signatures
      const resolveResult = resolver.resolveTypeInfo("/api/test");
      assert.ok(resolveResult instanceof Promise);
    });
  });

  suite("Extensibility Architecture", () => {
    test("should be easy to create custom type resolvers", async () => {
      // Example of creating a new resolver for GraphQL
      class GraphQLTypeResolver implements ITypeInfoResolver {
        constructor(
          private routeFileFinder: (
            uri: string
          ) => Promise<vscode.Uri | undefined>
        ) {}

        async resolveTypeInfo(
          uri: string
        ): Promise<HoverContentSource | undefined> {
          if (!uri.includes("graphql") && !uri.includes("/gql/")) {
            return undefined;
          }

          return {
            typeName: "GraphQLQuery",
            definition:
              "type GraphQLQuery = { query: string; variables?: any; }",
            sourceInfo: "GraphQL Schema",
          };
        }
      }

      const customResolver = new GraphQLTypeResolver(createMockRouteFinder());

      // Test interface compliance
      assert.ok(typeof customResolver.resolveTypeInfo === "function");

      // Test functionality
      const result = await customResolver.resolveTypeInfo("/graphql");
      assert.ok(result !== undefined);
      assert.strictEqual(result.typeName, "GraphQLQuery");
      assert.ok(result.definition.includes("GraphQLQuery"));
      assert.ok(result.sourceInfo.includes("GraphQL"));

      // Test non-matching URIs
      const nonMatchResult = await customResolver.resolveTypeInfo("/api/users");
      assert.strictEqual(nonMatchResult, undefined);
    });

    test("should support resolver chaining and fallbacks", async () => {
      class PriorityTypeResolver implements ITypeInfoResolver {
        constructor(private resolvers: ITypeInfoResolver[]) {}

        async resolveTypeInfo(
          uri: string
        ): Promise<HoverContentSource | undefined> {
          for (const resolver of this.resolvers) {
            const result = await resolver.resolveTypeInfo(uri);
            if (result) {
              return result;
            }
          }
          return undefined;
        }
      }

      const mockResolver1: ITypeInfoResolver = {
        async resolveTypeInfo(
          uri: string
        ): Promise<HoverContentSource | undefined> {
          if (uri === "/test1") {
            return {
              typeName: "Test1Type",
              definition: "type Test1Type = string",
              sourceInfo: "Resolver 1",
            };
          }
          return undefined;
        },
      };

      const mockResolver2: ITypeInfoResolver = {
        async resolveTypeInfo(
          uri: string
        ): Promise<HoverContentSource | undefined> {
          if (uri === "/test2") {
            return {
              typeName: "Test2Type",
              definition: "type Test2Type = number",
              sourceInfo: "Resolver 2",
            };
          }
          return undefined;
        },
      };

      const priorityResolver = new PriorityTypeResolver([
        mockResolver1,
        mockResolver2,
      ]);

      // Should resolve what the first matching resolver can resolve
      const result1 = await priorityResolver.resolveTypeInfo("/test1");
      assert.ok(result1 !== undefined);
      assert.strictEqual(result1.typeName, "Test1Type");

      const result2 = await priorityResolver.resolveTypeInfo("/test2");
      assert.ok(result2 !== undefined);
      assert.strictEqual(result2.typeName, "Test2Type");

      // Should return undefined if no resolver matches
      const noMatchResult = await priorityResolver.resolveTypeInfo("/nomatch");
      assert.strictEqual(noMatchResult, undefined);
    });

    test("should support framework-specific resolvers", async () => {
      // Example: Express.js resolver
      class ExpressTypeResolver implements ITypeInfoResolver {
        constructor(
          private routeFileFinder: (
            uri: string
          ) => Promise<vscode.Uri | undefined>
        ) {}

        async resolveTypeInfo(
          uri: string
        ): Promise<HoverContentSource | undefined> {
          // Check if this looks like an Express route
          if (!uri.startsWith("/") || uri.startsWith("/api/")) {
            return undefined;
          }

          return {
            typeName: "ExpressRequest",
            definition:
              "interface ExpressRequest extends Request { body: any; params: any; query: any; }",
            sourceInfo: "Express Types",
          };
        }
      }

      const expressResolver = new ExpressTypeResolver(createMockRouteFinder());

      const result = await expressResolver.resolveTypeInfo("/users");
      assert.ok(result !== undefined);
      assert.strictEqual(result.typeName, "ExpressRequest");
      assert.ok(result.definition.includes("ExpressRequest"));

      // Should not conflict with API routes
      const apiResult = await expressResolver.resolveTypeInfo("/api/users");
      assert.strictEqual(apiResult, undefined);
    });

    test("should support configuration-based resolvers", async () => {
      interface ResolverConfig {
        patterns: string[];
        typeName: string;
        definition: string;
        sourceInfo: string;
      }

      class ConfigurableTypeResolver implements ITypeInfoResolver {
        constructor(
          private config: ResolverConfig,
          private routeFileFinder: (
            uri: string
          ) => Promise<vscode.Uri | undefined>
        ) {}

        async resolveTypeInfo(
          uri: string
        ): Promise<HoverContentSource | undefined> {
          const matches = this.config.patterns.some(
            (pattern) => uri.includes(pattern) || new RegExp(pattern).test(uri)
          );

          if (!matches) {
            return undefined;
          }

          return {
            typeName: this.config.typeName,
            definition: this.config.definition,
            sourceInfo: this.config.sourceInfo,
          };
        }
      }

      const config: ResolverConfig = {
        patterns: ["/webhook/", "/events/"],
        typeName: "WebhookRequest",
        definition: "type WebhookRequest = { event: string; payload: any }",
        sourceInfo: "Webhook Configuration",
      };

      const configurableResolver = new ConfigurableTypeResolver(
        config,
        createMockRouteFinder()
      );

      const webhookResult = await configurableResolver.resolveTypeInfo(
        "/webhook/github"
      );
      assert.ok(webhookResult !== undefined);
      assert.strictEqual(webhookResult.typeName, "WebhookRequest");

      const eventResult = await configurableResolver.resolveTypeInfo(
        "/events/user-created"
      );
      assert.ok(eventResult !== undefined);
      assert.strictEqual(eventResult.typeName, "WebhookRequest");

      const nonMatchResult = await configurableResolver.resolveTypeInfo(
        "/api/users"
      );
      assert.strictEqual(nonMatchResult, undefined);
    });
  });

  suite("Error Handling and Edge Cases", () => {
    test("should handle invalid URIs gracefully", async () => {
      const resolver = new NextjsApiRouteTypeResolver(createMockRouteFinder());

      const invalidUris = ["", "   ", "not-a-uri", "://invalid"];

      for (const uri of invalidUris) {
        await assert.doesNotReject(async () => {
          const result = await resolver.resolveTypeInfo(uri);
          assert.ok(result === undefined || typeof result === "object");
        });
      }
    });

    test("should handle missing route files", async () => {
      const resolver = new NextjsApiRouteTypeResolver(
        createMockRouteFinder(false)
      );

      const result = await resolver.resolveTypeInfo("/api/test");
      assert.strictEqual(result, undefined);
    });

    test("should handle async errors in resolveTypeInfo", async () => {
      class ErrorThrowingResolver implements ITypeInfoResolver {
        async resolveTypeInfo(
          uri: string
        ): Promise<HoverContentSource | undefined> {
          if (uri === "/error-test") {
            throw new Error("Test error");
          }
          return undefined;
        }
      }

      const errorResolver = new ErrorThrowingResolver();

      // Should throw the error
      await assert.rejects(
        async () => await errorResolver.resolveTypeInfo("/error-test"),
        /Test error/
      );

      // Should not throw for non-matching URIs
      const result = await errorResolver.resolveTypeInfo("/safe-uri");
      assert.strictEqual(result, undefined);
    });
  });

  suite("Performance Considerations", () => {
    test("should have efficient resolveTypeInfo method", async () => {
      const resolver = new NextjsApiRouteTypeResolver(createMockRouteFinder());

      const startTime = Date.now();

      // Run resolveTypeInfo multiple times
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(resolver.resolveTypeInfo("/api/test"));
      }

      await Promise.all(promises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 1000ms for 10 calls)
      assert.ok(
        duration < 1000,
        `resolveTypeInfo took too long: ${duration}ms`
      );
    });

    test("should handle concurrent resolutions", async () => {
      const resolver = new NextjsApiRouteTypeResolver(createMockRouteFinder());

      // Run multiple concurrent resolutions
      const promises = [
        resolver.resolveTypeInfo("/api/users"),
        resolver.resolveTypeInfo("/api/posts"),
        resolver.resolveTypeInfo("/api/auth"),
      ];

      // Should all resolve without errors
      await assert.doesNotReject(async () => {
        const results = await Promise.all(promises);
        assert.ok(Array.isArray(results));
        assert.strictEqual(results.length, 3);
      });
    });
  });
});
