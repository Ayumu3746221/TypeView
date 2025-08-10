import * as vscode from 'vscode';
import { IRouteResolver, ResolverConfig } from './resolvers/IRouteResolver';
import { NextjsAppRouterResolver } from "./resolvers/NextjsAppRouterResolver";
import { findBodyType } from './parser/ts-parser';

const resolverMap : Map<string, IRouteResolver> = new Map([
	['nextjs-app-router', new NextjsAppRouterResolver()]
]);

/**
 * Function to find the corresponding backend file from the URI
 * @param uri URI of the API used in the front end
 */
async function findRouteFileForUri(uri: string): Promise<vscode.Uri | undefined> {
	const config = vscode.workspace.getConfiguration('typeview');

	const allConfig = config.inspect('routeDirectories');
    console.log('=== Full Configuration Inspect ===');
    console.log('All config:', allConfig);
    console.log('Global value:', allConfig?.globalValue);
    console.log('Workspace value:', allConfig?.workspaceValue);
    console.log('Workspace folder value:', allConfig?.workspaceFolderValue);
    console.log('Default value:', allConfig?.defaultValue);
    console.log('=====================================');

	const framework = config.get<string>('framework');
	const routeDirs = config.get<string[]>('routeDirectories', []);

	console.log('=== Configuration Debug ===');
    console.log('Workspace folders:', vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath));
    console.log('Framework:', framework);
    console.log('Route directories:', routeDirs);
    console.log('========================');

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

	console.log('Congratulations, your extension "typeview" is now active!');

	const hoverProvider = vscode.languages.registerHoverProvider(
		['typescript', 'typescriptreact'],
		{
			async provideHover(document, position) {
				const line = document.lineAt(position.line).text;

				const match = line.match(/fetch\s*\(\s*['"](\/api[^'"]*)['"]/);
				if (!match || !match[1]) return null;

				const uri = match[1];

				const routeFilePath = await findRouteFileForUri(uri);

				if (routeFilePath) {

					const typeInfo = await findBodyType(routeFilePath);

					if (typeInfo) {
						console.log(`[SUCCESS] Found type ${typeInfo.typeName} from ${typeInfo.importPath}`);

						// TODO: Implement hover information
						return new vscode.Hover(`Type: ${typeInfo.typeName}\nFrom: ${typeInfo.importPath}`);
					} else {
						console.log(`[INFO] Could not parse type information for ${routeFilePath.fsPath}`);
					}
				}

				return null;
			}
		}
	)

	context.subscriptions.push(hoverProvider);
}

export function deactivate() {}
