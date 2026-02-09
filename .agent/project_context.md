# TOEIC Neural Academy - プロジェクトコンテキスト

## プロジェクト概要
**プロジェクト名**: TOEIC Neural Academy  
**ターゲット資格**: TOEIC (Test of English for International Communication)  
**目的**: 英語学習を効率化する次世代AIパワード学習プラットフォーム

## 技術スタック

### フロントエンド
- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animation**: Framer Motion
- **UI Theme**: Neural Link（Glassmorphism、ダークモード）

### バックエンド
- **Database**: PostgreSQL
- **ORM/Query**: Prisma
- **API**: Next.js API Routes
- **Cache**: Dexie.js (ブラウザキャッシュ)

### AI機能
- **TTS**: Web Speech API（英語読み上げ）
- **分析**: カスタム学習分析エンジン

### デプロイ
- **Platform**: Vercel / Netlify
- **Version Control**: Git/GitHub

## アーキテクチャパターン

### デザインシステム
- **配色**: Slate-950ベース、Cyan-400/Indigo-500アクセント
- **視覚効果**: WebGL Neural Background、Glassmorphism、発光エフェクト
- **タイポグラフィ**: Black Italic Uppercase（英語サブタイトル）

### モバイル最適化
- **分野選択**: 2カラムグリッドレイアウト
- **ナビゲーション**: ボトムナビゲーション
- **タッチターゲット**: 適切なサイズ確保

## 主要機能

### 1. 学習エンジン
- 4択クイズシステム（TOEIC形式）
- キーボードショートカット（1-4選択、Enter次へ、Esc終了）
- 即時解説（Root Analysis）
- 英語TTS読み上げ機能
- プログレス管理・タイマー

### 2. 学習モード
- パート別学習（Part 1-7対応）
- 単語・フレーズフラッシュカード
- リスニング特化モード
- リーディング特化モード

### 3. データ分析
- ダッシュボード（総学習数、予測スコア）
- パート別正答率チャート
- 弱点分析（エラー密度）
- 学習履歴（Neural Logs）

### 4. コミュニティ機能
- 問題投稿（Logic Submission）
- 通知システム
- お問い合わせフォーム

### 5. 管理者機能
- ユーザー管理
- メッセージ管理
- 投稿承認システム
- 問題・カテゴリ管理
- 通知配信
- タスク管理（Admin TODO）

## TOEIC特有の要件

### パート構成
- **Part 1**: 写真描写問題
- **Part 2**: 応答問題
- **Part 3**: 会話問題
- **Part 4**: 説明文問題
- **Part 5**: 短文穴埋め問題
- **Part 6**: 長文穴埋め問題
- **Part 7**: 読解問題

### スコアリング
- 予測スコア算出（正答率ベース）
- パート別弱点分析
- 目標スコア設定機能

## バージョン管理
- **現在のバージョン**: v1.0.0_STABLE
- **バージョニング**: セマンティックバージョニング
- **表示場所**: App.tsxフッター

## 開発ワークフロー
1. 機能実装
2. 細かいコミット（日本語+英語メッセージ）
3. ビルド検証
4. デプロイ

## 品質基準
- モバイルUX最優先
- 未来的でプレミアムなデザイン
- 高速なレスポンス
- 英語学習に最適化されたUI/UX
- アクセシビリティ対応
