import * as vscode from 'vscode';
import * as ts from 'typescript';

export interface ParsedTypeInfo {
    typeName: string;    // e.g., "UserCreateInput"
    importPath: string;  // e.g., "@/lib/types"
}

/**
 * Parse the specified route.ts file and find the type information for the POST request body.
 * @param routeFileUri The URI of the file to parse
 * @returns The parsed type information, or undefined if not found
 */
export async function findBodyType(routeFileUri: vscode.Uri): Promise<ParsedTypeInfo | undefined> {
    const fileContent = Buffer.from(await vscode.workspace.fs.readFile(routeFileUri)).toString('utf8');

    // Generate AST (abstract syntax tree)
    const sourceFile = ts.createSourceFile(
        routeFileUri.fsPath,
        fileContent,
        ts.ScriptTarget.Latest,
        true
    );

    let bodyTypeName: string | undefined;

    // 3. ASTを巡回して、`const body: Type = ...` の `Type` を見つける
    // TODO: ここにASTを解析するロジックを実装する

    // 4. 型名が見つかったら、その型がどこからインポートされているかを探す
    // TODO: ここにimport文を解析するロジックを実装する

    return undefined;
}