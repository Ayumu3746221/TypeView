# TypeView アーキテクチャ

## 概要

TypeViewは、TypeScriptプロジェクトでAPIエンドポイントの型情報をホバー表示するVS Code拡張機能です。

## 全体の処理フロー

```mermaid
graph TD
    A[ユーザーがfetch文にホバー] --> B[HoverProvider起動]
    B --> C[正規表現でAPI URLを抽出]
    C --> D{API URLパターンマッチ?}
    D -->|No| E[null返却]
    D -->|Yes| F[設定から framework & routeDirectories 取得]
    F --> G[ResolverMap から適切なResolver取得]
    G --> H[Resolver.resolve でルートファイル特定]
    H --> I{ルートファイル存在?}
    I -->|No| E
    I -->|Yes| J[TSパーサーでAST解析]
    J --> K[POST関数内のbody型を抽出]
    K --> L{型情報見つかった?}
    L -->|No| E
    L -->|Yes| M[importMapから型の定義元ファイル特定]
    M --> N[パスリゾルバーで絶対パス解決]
    N --> O[型定義ファイルから型のテキスト抽出]
    O --> P[MarkdownStringでホバー内容作成]
    P --> Q[ユーザーに型情報表示]
```

## 主要コンポーネント

### 1. HoverProvider (`src/extension.ts`)
- エントリーポイント
- VS Code APIとの統合
- 全体の処理フローを制御

### 2. RouteResolver (`src/resolvers/`)
- API URLからバックエンドファイルへのマッピング
- フレームワーク固有のルーティング規則を実装
- 現在サポート: Next.js App Router

### 3. TypeScript Parser (`src/parser/ts-parser.ts`)
- TypeScript ASTの解析
- POST関数内の型注釈抽出
- import文の解析

### 4. PathResolver (`src/utils/path-resolver.ts`)
- tsconfig.jsonのパスエイリアス解決
- 相対パスから絶対パスへの変換

## データフロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant VSCode as VS Code
    participant HP as HoverProvider
    participant RR as RouteResolver
    participant TP as TypeParser
    participant PR as PathResolver

    User->>VSCode: fetch("/api/users")にホバー
    VSCode->>HP: provideHover()呼び出し
    HP->>HP: 正規表現でURL抽出
    HP->>RR: resolve("/api/users")
    RR->>RR: ルートファイル検索
    RR-->>HP: route.tsのURI
    HP->>TP: findBodyType(routeUri)
    TP->>TP: AST解析
    TP-->>HP: {typeName, importPath}
    HP->>PR: resolveModulePath()
    PR-->>HP: 型定義ファイルURI
    HP->>TP: extractTypeDefinition()
    TP-->>HP: 型定義テキスト
    HP->>HP: MarkdownString作成
    HP-->>VSCode: Hoverオブジェクト
    VSCode-->>User: 型情報表示
```

## 設定とカスタマイズ

### 設定パラメータ
- `typeview.framework`: 使用フレームワーク
- `typeview.routeDirectories`: APIルートディレクトリ

### 拡張ポイント
1. **新しいフレームワークサポート**: `IRouteResolver`を実装
2. **新しい型パターン**: `ts-parser.ts`のパターン拡張
3. **新しいパスリゾルバー**: `path-resolver.ts`の拡張

## エラーハンドリング

各段階でのエラーは`undefined`を返すことで処理され、最終的にホバー表示がされません。
これにより、通常の開発フローを妨げることなく、型情報が利用可能な場合のみ表示されます。