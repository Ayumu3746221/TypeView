import * as vscode from 'vscode';

export interface ResolverConfig {
    routeDirectoryUris: vscode.Uri[];
}

export interface IRouteResolver {
    /**
     * Name used to identify the resolver.
     * Must match the value of “framework” in settings.json.
     */
    name: string;

    /**
     * Resolves the file path corresponding to the specified URI.
     * @param uri URI used in the front end (e.g., ‘/api/users’)
     * @param config Config generated from user settings
     * @returns URI of the file path. If not found, undefined.
     */
    resolve(uri: string, config: ResolverConfig): Promise<vscode.Uri | undefined>;
}