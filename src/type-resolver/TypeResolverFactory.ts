import { ITypeInfoResolver } from "./ITypeInfoResolver";
import { NextjsApiRouteTypeResolver } from "./NextjsApiRouteTypeResolver";

/**
 * Factory for creating framework-specific type resolvers
 */
export class TypeResolverFactory {
  /**
   * Create a type resolver based on the framework
   * @param framework The framework identifier
   * @param routeFileFinder Function to find route files for the specific framework
   * @returns Type resolver instance or undefined if framework not supported
   */
  static createResolver(
    framework: string,
    routeFileFinder: (uri: string) => Promise<import("vscode").Uri | undefined>
  ): ITypeInfoResolver | undefined {
    switch (framework) {
      case "nextjs-app-router":
        return new NextjsApiRouteTypeResolver(routeFileFinder);

      // Future framework support can be added here:
      // case "express":
      //   return new ExpressApiTypeResolver(routeFileFinder);
      // case "fastify":
      //   return new FastifyApiTypeResolver(routeFileFinder);

      default:
        return undefined;
    }
  }

  /**
   * Get supported frameworks
   * @returns Array of supported framework identifiers
   */
  static getSupportedFrameworks(): string[] {
    return [
      "nextjs-app-router",
      // Future frameworks will be listed here
    ];
  }
}
