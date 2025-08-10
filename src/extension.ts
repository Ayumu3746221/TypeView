import * as vscode from 'vscode';
import { IRouteResolver, ResolverConfig } from './resolvers/IRouteResolver';
import { NextjsAppRouterResolver } from "./resolvers/NextjsAppRouterResolver";
import { extractTypeDefinition, findBodyType } from './parser/ts-parser';
import { resolveModulePath } from './utils/path-resolver';

const resolverMap : Map<string, IRouteResolver> = new Map([
	['nextjs-app-router', new NextjsAppRouterResolver()]
]);

/**
 * Function to find the corresponding backend file from the URI
 * @param uri URI of the API used in the front end
 */
async function findRouteFileForUri(uri: string): Promise<vscode.Uri | undefined> {
	const config = vscode.workspace.getConfiguration('typeview');
	const framework = config.get<string>('framework');
	const routeDirs = config.get<string[]>('routeDirectories', []);

	if (!framework || !routeDirs || routeDirs.length === 0) {
		vscode.window.showInformationMessage('Please configure "typeview.framework" and "typeview.routeDirectories" in your settings.');
		return undefined;
	}

	const resolver = resolverMap.get(framework);
	if (!resolver) {
		vscode.window.showErrorMessage(`Framework "${framework}" is not supported.`);
		return undefined;
	}

	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders) return undefined;
	const rootUri = workspaceFolders[0].uri;

	const resolverConfig: ResolverConfig = {
		routeDirectoryUris: routeDirs.map(dir => vscode.Uri.joinPath(rootUri, dir))
	};

	return resolver.resolve(uri, resolverConfig);
}

export function activate(context: vscode.ExtensionContext) {
	const hoverProvider = vscode.languages.registerHoverProvider(
		['typescript', 'typescriptreact'],
		{
			async provideHover(document, position) {
				const line = document.lineAt(position.line).text;
				const match = line.match(/fetch\s*\(\s*['"](\/api[^'"]*)['"]/);

				if (!match || !match[1]) {
                	return null;
				}

				const uri = match[1];
				const routeFilePath = await findRouteFileForUri(uri);

				if (!routeFilePath) {
                	return null;
				}

				const typeInfo = await findBodyType(routeFilePath);

				if (!typeInfo) {
                	return null;
				}

				const workspaceFolders = vscode.workspace.workspaceFolders;
				if (!workspaceFolders) {
                	return null;
				}

				const typeFileUri = await resolveModulePath(typeInfo.importPath, workspaceFolders[0].uri);
				
				if (!typeFileUri) {
                	return null;
				}

				const typeDefinitionText = await extractTypeDefinition(typeFileUri, typeInfo.typeName);

				if (!typeDefinitionText) {
					return null;
				}

				const markdownString = new vscode.MarkdownString();
				markdownString.appendMarkdown(`**Request Body Type** for \`${uri}\`\n`);
				markdownString.appendCodeblock(typeDefinitionText, 'typescript');
				markdownString.appendMarkdown(`\n*From: \`${typeInfo.importPath}\`*`);

				return new vscode.Hover(markdownString);
			}
		}
	)

	context.subscriptions.push(hoverProvider);
}

export function deactivate() {}
