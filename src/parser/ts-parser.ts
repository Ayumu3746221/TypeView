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
    try { 
        const fileContent = Buffer.from(await vscode.workspace.fs.readFile(routeFileUri)).toString('utf8');

        // Generate AST (abstract syntax tree)
        const sourceFile = ts.createSourceFile(
            routeFileUri.fsPath,
            fileContent,
            ts.ScriptTarget.Latest,
            true
        );

        let bodyTypeName: string | undefined;
        const importMap = new Map<string, string>(); // typeName -> importPath

        function visit(node: ts.Node) {
            // --- 先に全てのインポート文を収集 ---
            if(ts.isImportDeclaration(node)) {
                if (node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
                    const importPath = node.moduleSpecifier.getText(sourceFile).replace(/['"]/g, '');

                    for (const element of node.importClause.namedBindings.elements) {
                        const importName = element.name.text;
                        importMap.set(importName, importPath);
                    }
                }
            }

            // --- bodyの型名を探す ---
            // `export function POST(...)` を探す
            if (ts.isFunctionDeclaration(node) && node.name?.text === 'POST') {
                
                // POST関数の内部だけを探索
                ts.forEachChild(node.body!, (childNode) => {
                    // `const body: Type = await req.json()` のパターンを探す
                    if (ts.isVariableStatement(childNode)) {
                        const declaration = childNode.declarationList.declarations[0];
                        // `req.json()` を呼び出しているかチェック
                        if (declaration.initializer && ts.isAwaitExpression(declaration.initializer)) {
                            if (declaration.initializer.expression.getText(sourceFile).endsWith(".json()")) {
                                
                                // 型注釈 (`: Type`) があるかチェック
                                if (declaration.type && ts.isTypeReferenceNode(declaration.type)) {
                                    bodyTypeName = declaration.type.typeName.getText(sourceFile);
                                }
                            }
                        }
                    }
                });
            }

            ts.forEachChild(node, visit);
        }

        visit(sourceFile);

        if (bodyTypeName && importMap.has(bodyTypeName)) {
            const importPath = importMap.get(bodyTypeName)!;
            return { typeName: bodyTypeName, importPath };
        }
        return undefined;
    } catch (error) {
        return undefined;
    }
}

/**
 * Extract the definition of a specific interface or type name as a string from the specified file.
 * @param typeFileUri The URI of the file where the type is defined
 * @param typeName The name of the type to extract
 */
export async function extractTypeDefinition(typeFileUri: vscode.Uri, typeName: string): Promise<string | undefined> {
    const fileContent = Buffer.from(await vscode.workspace.fs.readFile(typeFileUri)).toString('utf8');
    const sourceFile = ts.createSourceFile(typeFileUri.fsPath, fileContent, ts.ScriptTarget.Latest, true);

    let definition: string | undefined;

    function visit(node: ts.Node) {
        if ((ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) && node.name.text === typeName) {
            definition = node.getText(sourceFile);
        }
        if (!definition) {
            ts.forEachChild(node, visit);
        }
    }

    visit(sourceFile);
    return definition;
}