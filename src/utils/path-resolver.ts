import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Interpret path aliases in tsconfig.json and convert module paths to absolute file paths.
 * @param importPath e.g., '@_'/lib/types'
 * @param workspaceRoot The root URI of the workspace
 * @returns The resolved absolute path URI of the file, or undefined if not found
 */
export async function resolveModulePath(importPath: string, workspaceRoot: vscode.Uri): Promise<vscode.Uri | undefined> {
    const tsconfigPath = path.join(workspaceRoot.fsPath, 'tsconfig.json');

    if (!fs.existsSync(tsconfigPath)) {
        return undefined;
    }

    try {
        const tsconfigRaw = fs.readFileSync(tsconfigPath, 'utf8');
        const tsconfig = JSON.parse(tsconfigRaw);
        const compilerOptions = tsconfig.compilerOptions;
        const paths = compilerOptions.paths;

        if (paths) {
            for (const alias in paths) {
                // "@/*" -> "@/" に変換
                const aliasPrefix = alias.replace('*', '');
                
                if (importPath.startsWith(aliasPrefix)) {
                    // "./*" -> "./" に変換  
                    const aliasTarget = paths[alias][0].replace('*', '');
                    
                    // "@/lib/types" -> "lib/types"
                    const relativePart = importPath.substring(aliasPrefix.length);
                    
                    // "./lib/types" を生成
                    const resolvedPath = path.join(aliasTarget, relativePart);
                    
                    const extensions = ['.ts', '.tsx'];
                    for (const ext of extensions) {
                        const fullPath = resolvedPath + ext;
                        const fileUri = vscode.Uri.joinPath(workspaceRoot, fullPath);
                        
                        if (fs.existsSync(fileUri.fsPath)) {
                            return fileUri;
                        }
                    }
                }
            }
        }
    } catch (e) {
        return undefined;
    }
    
    return undefined;
}