# 変更履歴

"typeview" 拡張機能の重要な変更は全てこのファイルに記録されます。

このファイルの構成については [Keep a Changelog](http://keepachangelog.com/) を参照してください。

## [1.0.0] - 2025-08-17

### 追加

- **🏗️ 拡張可能なホバープロバイダーアーキテクチャ**

  - Strategy Pattern と Dependency Injection による完全なリライト
  - `ExtensibleHoverProvider`によるモジュール化されたテスト可能な設計
  - VS Code OutputChannel を使用したプロフェッショナルなログ機能
  - マルチフレームワーク対応の将来性のあるアーキテクチャ

- **🚀 複数 HTTP ライブラリサポート**

  - 優先度ベースのパターンマッチングシステム
  - **fetch API** サポート（優先度 10）- `fetch("/api/...")`
  - **axios** サポート（優先度 8）- `axios.post("/api/...", data)`
  - 新しい HTTP ライブラリを追加可能な拡張可能マッチャーシステム

- **🧪 包括的テストスイート**

  - **100+の自動テスト**で 100%パス率を実現
  - 実世界のシナリオに対応した統合テスト
  - パターンマッチャーのユニットテスト
  - 型リゾルバーのバリデーションテスト
  - 継続的品質保証

- **📋 高度なパターン検出**
  - 強化された型注釈検出
  - 改良された型アサーションサポート
  - 改善された Zod スキーマ統合
  - HTTP メソッド全体でのボディパターンマッチング

### 改善

- **型解決**: より高速で正確な型検出
- **エラーハンドリング**: 堅牢なエラーハンドリングとグレースフルデグラデーション
- **パフォーマンス**: 最適化された AST 解析と型抽出
- **コード品質**: ESLint コンプライアンスとクリーンアーキテクチャ
- **開発者体験**: 強化されたデバッグとログ機能

### 技術的改良

- **依存性注入**: 関心の分離のクリーンな実装
- **Strategy Pattern**: 拡張可能なパターンマッチングアーキテクチャ
- **Factory Pattern**: 一元化されたリゾルバー作成
- **出力チャンネル**: デバッグ用のプロフェッショナルログ
- **型安全性**: 全体を通じた強化された TypeScript 統合

### ドキュメント

- 包括的な開発者ガイド（英語・日本語）
- UML 図を含むアーキテクチャドキュメント
- VS Code マーケットプレース向けの README 最適化
- パターン使用例とベストプラクティス

### サポート HTTP ライブラリ＆パターン

1. **fetch API**:

   - `fetch("/api/users", { method: "POST", body: JSON.stringify(data) })`
   - `const response = await fetch("/api/endpoint")`

2. **axios**:

   - `axios.post("/api/users", userData)`
   - `await axios.put("/api/profile", profileData)`

3. **パターンタイプ**:
   - 型注釈: `const body: UserType = await req.json()`
   - 型アサーション: `const body = await req.json() as UserType`
   - Zod スキーマ: `const body = UserSchema.parse(await req.json())`
   - ローカル型定義とインポートされた型

### 設定

- 既存の設定との後方互換性を維持
- `typeview.framework`: バックエンドフレームワーク選択
- `typeview.routeDirectories`: API ルートディレクトリ設定
- 強化された設定バリデーションとエラーレポート

## [0.2.0] - 2025-08-13

### 追加

- **🔍 高度なパターンマッチングシステム**

  - 拡張可能なコードパターン検出のための Strategy pattern ベースアーキテクチャ
  - 単一コードベース内での複数 TypeScript パターンサポート
  - 自動パターン検出と優先度設定

- **📍 ローカル型定義サポート**

  - API ルートと同じファイルで定義された型の検出と表示
  - ローカルインターフェースと型エイリアスのサポート
  - 同一ファイル型定義へのインポート不要

- **⚡ Zod スキーマサポート**

  - Zod バリデーションスキーマの完全サポート
  - `Schema.parse(await req.json())`パターンの検出
  - 適切なシンタックスハイライトでの Zod スキーマ定義表示

- **🏗️ アーキテクチャ改良**
  - パターンマッチャーにおける Strategy pattern でのコードベースリファクタリング
  - 型抽出ロジックの再利用可能コンポーネントへの分離
  - 専用ユーティリティ関数による強化された AST 解析

### 改善

- **型アサーションパターン**: `await req.json() as Type` 構文のサポート追加
- **インポート解決**: インポート文の解析と解決の改良
- **エラーハンドリング**: より良いエラーハンドリングとグレースフルフォールバック
- **コード組織**: `pattern_matchers/`と`type_extractors/`によるモジュラーアーキテクチャ

### 技術的改良

- **包括的テスト**: 全パターンをカバーする 34+の自動テスト追加
- **TypeScript AST ユーティリティ**: 強化された AST 操作ユーティリティ
- **パフォーマンス**: 階層的優先度（Import > Local）による型検索最適化
- **コード品質**: ESLint コンプライアンスとクリーンコードプラクティス

### サポートパターン

1. **型注釈**: `const body: Type = await req.json()`
2. **型アサーション**: `const body = await req.json() as Type`
3. **ローカルインターフェース**: 同一ファイルインターフェース定義
4. **ローカル型エイリアス**: 同一ファイル型エイリアス定義
5. **Zod スキーマ**: `const body = Schema.parse(await req.json())`

### ドキュメント

- 包括的なパターン例での README 更新
- アーキテクチャドキュメント（`docs/ARCHITECTURE.md`）追加
- コードベース全体での強化された JSDoc コメント

### 設定

- 既存設定との後方互換性維持
- `typeview.framework`: バックエンドフレームワーク選択（現在は"nextjs-app-router"）
- `typeview.routeDirectories`: API ルートディレクトリ設定

## [0.1.0-pre] - 2025-08-10

### 追加

- **初期プレビューリリース** 🎉
- `fetch("/api/...")`呼び出しのホバー型表示
- Next.js App Router API ルートサポート
- TypeScript パスエイリアス解決（`@/`パターン）
- route.ts ファイルからの AST ベース型抽出
- `const body: Type = await req.json()`パターンサポート
- `.vscode/settings.json`によるワークスペース設定

### 機能

- **ホバープロバイダー**: ホバーで TypeScript リクエストボディタイプ表示
- **ルート解決**: 対応するルートファイルの自動検出
- **型抽出**: TypeScript AST を解析して型情報を抽出
- **パスエイリアスサポート**: tsconfig.json パスマッピング解決

### 設定

- `typeview.framework`: バックエンドフレームワーク選択（現在は"nextjs-app-router"）
- `typeview.routeDirectories`: API ルートディレクトリ設定

### 制限事項

- Next.js App Router のみサポート
- `.ts`と`.tsx`ファイルのみ対応
- 特定のコードパターンが必要: `const body: Type = await req.json()`

## [未リリース]

### 予定機能

- ゼロコンフィギュレーションサポート
- 全 HTTP メソッドサポート（GET、PUT、DELETE 等）
- Axios および他 HTTP ライブラリサポート
- Hono および他フレームワークサポート
- ワークスペース全体型検索
- パフォーマンス最適化
- より良いエラーハンドリングと診断機能
