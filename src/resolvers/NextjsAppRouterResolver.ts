// src/resolvers/NextjsAppRouterResolver.ts
import * as vscode from 'vscode';
import { IRouteResolver, ResolverConfig } from './IRouteResolver';
import * as path from 'path';

export class NextjsAppRouterResolver implements IRouteResolver {
    name = 'nextjs-app-router';

    async resolve(uri: string, config: ResolverConfig): Promise<vscode.Uri | undefined> {
        
        if(!uri.startsWith('/api')) {
            return undefined;
        }

        const pathWithoutApiPrefix = uri === '/api' ? '' : uri.substring('/api/'.length);
        const relativePath = path.join(pathWithoutApiPrefix , 'route.ts');

        for (const dirUri of config.routeDirectoryUris) {
            
            const fileUri = vscode.Uri.joinPath(dirUri, relativePath);

            try {
                await vscode.workspace.fs.stat(fileUri);
                return fileUri;
            } catch (error) {
                continue;
            }
        }

        return undefined;
    }
}