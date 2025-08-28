# TypeView

**TypeScript + Monorepo プロジェクトで API リクエストボディ型をホバー表示する VS Code 拡張機能**

![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/Ayumu3746221.typeview?style=flat-square)
![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/Ayumu3746221.typeview?style=flat-square)

**Languages:** [🇺🇸 English](./README.md) | [🇯🇵 日本語](./README_ja.md)

## 🎬 デモ

![デモ](./demo.gif)

**動作内容:** `fetch("/api/users")` にホバーするだけで、TypeScript リクエストボディ型定義とソース情報が即座に表示されます。

## 🚀 TypeView でできること

TypeView は API 開発において**瞬時の型可視化**を提供し、フロントエンドコードの API 呼び出しにホバーするだけで開発を革命的に改善します：

- ✨ **設定不要** - `fetch("/api/...")` や `axios.post("/api/...")` にホバーするだけ
- 🎯 **知的検出** - 対応する API ルートファイルを自動発見
- 📝 **豊富な型情報** - 完全な TypeScript インターフェース、型、Zod スキーマを表示
- 🔄 **複数パターン対応** - 型注釈、アサーション、モダンなバリデーションライブラリと連携
- 📍 **ソースコンテキスト** - 型のインポート元やローカル定義かを表示

### モダンな開発に最適

```typescript
// React コンポーネント内で - API パスにホバーするだけ！
const handleSubmit = async (userData: any) => {
  const response = await fetch("/api/users", {
    // 👈 ここにホバー！
    method: "POST",
    body: JSON.stringify(userData),
  });

  // axios でも動作
  await axios.post("/api/posts", postData); // 👈 ここにも！
};
```

**TypeView が即座に表示:**

```typescript
interface UserCreateInput {
  name: string;
  email: string;
  age?: number;
}
*From: `@/types/user`*
```

## 📦 インストール

1. VS Code を開く
2. 拡張機能を開く (Ctrl+Shift+X / Cmd+Shift+X)
3. "TypeView" を検索
4. インストールをクリック

または[VS Code マーケットプレース](https://marketplace.visualstudio.com/items?itemName=Ayumu3746221.typeview)から直接インストールできます。

## ⚙️ クイック設定

ワークスペースの `.vscode/settings.json` に以下を追加：

```json
{
  "typeview.framework": "nextjs-app-router",
  "typeview.routeDirectories": ["app/api"]
}
```

## 💡 対応パターン

TypeView の**拡張可能アーキテクチャ**が自動検出：

### 📋 API ルートパターン

```typescript
// ✅ 型注釈
const body: UserType = await req.json();

// ✅ 型アサーション
const body = (await req.json()) as UserType;

// ✅ Zod スキーマバリデーション
const body = UserSchema.parse(await req.json());

// ✅ ローカル型定義
interface LocalType {
  name: string;
}
```

### 🌐 HTTP ライブラリサポート

```typescript
// ✅ Fetch API（優先度: 10）
fetch("/api/users", { method: "POST" });

// ✅ Axios（優先度: 8）
axios.post("/api/users", data);
client.get("/api/posts");

// 🔧 カスタムライブラリも簡単に追加可能
```

### 📁 プロジェクト構成サポート

```
✅ Import型             ✅ ローカル定義            ✅ Zodスキーマ
app/api/users/route.ts   app/api/posts/route.ts    app/api/validate/route.ts
lib/types/user.ts        (同ファイル内の型)         (同ファイル内のスキーマ)
```

## 🚧 現在の状況

### ✅ 完全サポート

- Next.js App Router API ルート
- TypeScript (.ts) と React (.tsx) ファイル
- POST 関数ボディ型検出
- tsconfig.json エイリアスでのインポートパス解決
- ローカル・インポート型定義
- Zod スキーマバリデーションパターン

### 🔄 近日実装予定

- 全 HTTP メソッド（GET、PUT、DELETE）
- 追加フレームワーク（Hono、Express、FastAPI）
- より多くの HTTP ライブラリ（Superagent、Got）
- ゼロ設定セットアップ
- 強化されたデバッグツール

---

## 🏗️ 開発・アーキテクチャ

### 拡張可能設計

TypeView は拡張性のために構築されたモダンな **Strategy Pattern** アーキテクチャを特徴：

- **🔧 パターンマッチャー**: 新しい HTTP ライブラリサポートを簡単に追加
- **⚙️ 優先度システム**: 異なるパターンの実行順序を設定可能
- **🧪 依存性注入**: 完全にテスト可能で保守可能なコンポーネント
- **📊 プロフェッショナルログ**: VS Code OutputChannel 統合

### 品質保証

- ✅ **100 個の自動テスト** - 信頼性を保証する包括的カバレッジ
- 🔒 **TypeScript 安全性** - コードベース全体での厳格な型付け
- 🛡️ **堅牢なエラーハンドリング** - 障害時の優雅な劣化
- 📋 **VS Code 準拠** - 拡張機能制約との完全な互換性

詳細なアーキテクチャドキュメントと貢献ガイドラインについては、[開発者ガイド](./docs/DEVELOPER_GUIDE_ja.md)をご覧ください。

## 🤝 コントリビュート

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

**より良い型可視化でコーディングを楽しんでください！ 🎉**
