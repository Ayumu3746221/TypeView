import * as vscode from "vscode";
import { IRouteResolver, ResolverConfig } from "./resolvers/IRouteResolver";
import { NextjsAppRouterResolver } from "./resolvers/NextjsAppRouterResolver";
import { IHoverPatternMatcher } from "./matchers/IHoverPatternMatcher";
import { FetchPatternMatcher } from "./matchers/FetchPatternMatcher";
import { AxiosPatternMatcher } from "./matchers/AxiosPatternMatcher";
import { ITypeInfoResolver } from "./type-resolver/ITypeInfoResolver";
import { TypeResolverFactory } from "./type-resolver/TypeResolverFactory";
import { IHoverContentGenerator } from "./hover/IHoverContentGenerator";
import { TypeHoverContentGenerator } from "./hover/TypeHoverContentGenerator";
import { ExtensibleHoverProvider } from "./hover/ExtensibleHoverProvider";

const resolverMap: Map<string, IRouteResolver> = new Map([
  ["nextjs-app-router", new NextjsAppRouterResolver()],
]);

/**
 * Function to find the corresponding backend file from the URI
 * @param uri URI of the API used in the front end
 */
async function findRouteFileForUri(
  uri: string
): Promise<vscode.Uri | undefined> {
  const config = vscode.workspace.getConfiguration("typeview");
  const framework = config.get<string>("framework");
  const routeDirs = config.get<string[]>("routeDirectories", []);

  if (!framework || !routeDirs || routeDirs.length === 0) {
    vscode.window.showInformationMessage(
      'Please configure "typeview.framework" and "typeview.routeDirectories" in your settings.'
    );
    return undefined;
  }

  const resolver = resolverMap.get(framework);
  if (!resolver) {
    vscode.window.showErrorMessage(
      `Framework "${framework}" is not supported.`
    );
    return undefined;
  }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return undefined;
  }

  const rootUri = workspaceFolders[0].uri;

  const resolverConfig: ResolverConfig = {
    routeDirectoryUris: routeDirs.map((dir) =>
      vscode.Uri.joinPath(rootUri, dir)
    ),
  };

  return resolver.resolve(uri, resolverConfig);
}

export function activate(context: vscode.ExtensionContext) {
  // Get framework configuration
  const config = vscode.workspace.getConfiguration("typeview");
  const framework = config.get<string>("framework");

  if (!framework) {
    vscode.window.showInformationMessage(
      'Please configure "typeview.framework" in your settings.'
    );
    return;
  }

  // Register pattern matchers
  const patternMatchers: IHoverPatternMatcher[] = [
    new FetchPatternMatcher(),
    new AxiosPatternMatcher(),
    // Future extensions can be added here:
    // new CustomPatternMatcher(),
  ];

  // Create framework-specific type resolver
  const typeResolver: ITypeInfoResolver | undefined =
    TypeResolverFactory.createResolver(framework, findRouteFileForUri);

  if (!typeResolver) {
    vscode.window.showErrorMessage(
      `Framework "${framework}" is not supported. Supported frameworks: ${TypeResolverFactory.getSupportedFrameworks().join(
        ", "
      )}`
    );
    return;
  }

  // Create hover content generator
  const contentGenerator: IHoverContentGenerator =
    new TypeHoverContentGenerator();

  // Create extensible hover provider
  const hoverProvider = new ExtensibleHoverProvider(
    patternMatchers,
    typeResolver,
    contentGenerator
  );

  // Get all supported languages from pattern matchers
  const supportedLanguages = new Set<string>();
  patternMatchers.forEach((matcher) =>
    matcher
      .getSupportedLanguages()
      .forEach((lang) => supportedLanguages.add(lang))
  );

  // Register hover provider for all supported languages
  const registration = vscode.languages.registerHoverProvider(
    Array.from(supportedLanguages),
    hoverProvider
  );

  context.subscriptions.push(registration);
}

export function deactivate() {}
