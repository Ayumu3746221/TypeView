# TypeView

**TypeScript + Monorepository プロジェクトで API のリクエストボディ型をホバー表示する VS Code 拡張機能**

![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/Ayumu3746221.typeview?style=flat-square)
![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/Ayumu3746221.typeview?style=flat-square)

[日本語版 README](./README_ja.md) | [English README](./README.md)

## 🚀 機能

- **ホバー型表示**: `fetch("/api/...")` の部分にマウスをホバーすると、TypeScript のリクエストボディ型が表示されます
- **Next.js App Router サポート**: Next.js App Router の API ルートとシームレスに連携
- **TypeScript パスエイリアス解決**: tsconfig.json で定義された `@/` などのパスエイリアスをサポート
- **複数の型定義パターン対応**: Import 型、ローカル型定義、Zod スキーマを自動検出
- **柔軟な型抽出**: 複数のコードパターンに対応した高度な AST 解析

![デモ](./demo.gif)

## 📦 インストール

1. VS Code を開く
2. 拡張機能を開く (Ctrl+Shift+X / Cmd+Shift+X)
3. "TypeView" を検索
4. インストールをクリック

または[VS Code マーケットプレース](https://marketplace.visualstudio.com/items?itemName=Ayumu3746221.typeview)から直接インストールできます。

## ⚙️ 設定

ワークスペースの `.vscode/settings.json` に以下の設定を追加してください：

```json
{
  "typeview.framework": "nextjs-app-router",
  "typeview.routeDirectories": ["app/api"]
}
```

### 設定項目

| 設定名                      | 説明                                                         | デフォルト値          |
| --------------------------- | ------------------------------------------------------------ | --------------------- |
| `typeview.framework`        | 使用するバックエンドフレームワーク                           | `"nextjs-app-router"` |
| `typeview.routeDirectories` | API ルートディレクトリ（ワークスペースルートからの相対パス） | `[]`                  |

## 🎯 使い方

1. ワークスペース設定を行う（上記参照）
2. TypeScript/TSX ファイルを開く
3. `fetch("/api/users")` のようなコードを書く
4. API パスの部分にホバーすると、リクエストボディの型定義が表示されます

## 💡 対応パターン

TypeView は以下の様々なコードパターンを自動検出します：

### 1. 型注釈パターン

```typescript
import { UserCreateInput } from "@/types/user";

export async function POST(req: Request) {
  const body: UserCreateInput = await req.json(); // Import型を検出
  return Response.json({ success: true });
}
```

### 2. 型アサーションパターン

```typescript
export async function POST(req: Request) {
  const body = (await req.json()) as UserCreateInput; // 型アサーションを検出
  return Response.json({ success: true });
}
```

### 3. ローカル型定義パターン

```typescript
// 同じファイル内で型定義
interface CreatePostRequest {
  title: string;
  content: string;
  tags?: string[];
}

export async function POST(req: Request) {
  const body: CreatePostRequest = await req.json(); // ローカル型を検出
  return Response.json({ success: true });
}
```

### 4. Zod スキーマパターン

```typescript
import { z } from "zod";

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional(),
});

export async function POST(req: Request) {
  const body = UserSchema.parse(await req.json()); // Zodスキーマを検出
  return Response.json({ success: true });
}
```

### ホバー表示例

コンポーネントで API を呼び出すとき：

```typescript
// コンポーネント内で
const handleSubmit = async (userData: any) => {
  const response = await fetch("/api/users", {
    // <- ここにホバー！
    method: "POST",
    body: JSON.stringify(userData),
  });
};
```

`"/api/users"` にホバーすると、該当する API ルートの型情報が表示されます：

```typescript
// Import型の場合
interface UserCreateInput {
  name: string;
  email: string;
  age?: number;
}
*From: `@/types/user`*

// ローカル定義の場合
interface CreatePostRequest {
  title: string;
  content: string;
  tags?: string[];
}
*(Defined in same file)*

// Zodスキーマの場合
const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional()
});
*From: `zod`*
```

## 📁 プロジェクト構成

プロジェクトは以下のような構成をサポートします：

### パターン 1: Import 型を使用する場合

```
your-project/
├── app/
│   └── api/
│       └── users/
│           └── route.ts        # APIルートファイル
├── lib/
│   └── types/
│       └── user.ts             # 型定義ファイル
└── .vscode/
    └── settings.json           # TypeView設定
```

### パターン 2: ローカル型定義を使用する場合

```
your-project/
├── app/
│   └── api/
│       └── posts/
│           └── route.ts        # APIルート + 型定義
└── .vscode/
    └── settings.json           # TypeView設定
```

### パターン 3: Zod スキーマを使用する場合

```
your-project/
├── app/
│   └── api/
│       └── validate/
│           └── route.ts        # APIルート + Zodスキーマ
└── .vscode/
    └── settings.json           # TypeView設定
```

## ✨ v0.2.0 の新機能

- **🔍 高度なパターンマッチング**: 複数のコードパターンを自動検出
- **📍 ローカル型定義サポート**: 同じファイル内の型定義を検出・表示
- **⚡ Zod スキーマ対応**: モダンな型検証ライブラリをサポート
- **🏗️ アーキテクチャ改善**: Strategy パターンによる拡張可能な設計
- **🧪 包括的テスト**: 34 個の自動テストで品質保証

## 🚧 制限事項

### 現在の制限事項

- Next.js App Router のみ対応
- `.ts` および `.tsx` ファイル拡張子のみ対応
- POST 関数のみサポート（GET、PUT、DELETE は今後対応予定）

### 予定されている機能

- Zero Config（設定不要）でのサポート
- 全 HTTP メソッド（GET、PUT、DELETE 等）のサポート
- Axios 等の fetch 関数以外の Http リクエストをサポート
- Hono など他フレームワークのサポート
- エラーハンドリングと診断機能の向上
- パフォーマンス最適化

## �🤝 コントリビュート

コントリビュートを歓迎します！[GitHub リポジトリ](https://github.com/Ayumu3746221/TypeView)で以下をお待ちしています：

- 🐛 バグレポート
- 💡 機能リクエスト
- 🔧 プルリクエスト
- 📖 ドキュメント改善

## 📝 ライセンス

MIT License - 詳細は [LICENSE](./LICENSE) をご覧ください。

## 🙋‍♂️ サポート

- 🐛 [Issue 報告](https://github.com/Ayumu3746221/TypeView/issues)
- 💬 [ディスカッション](https://github.com/Ayumu3746221/TypeView/discussions)
- ⭐ 役に立ったらプロジェクトにスターをお願いします！

---

**より良い型表示でコーディングを楽しんでください！ 🎉**
