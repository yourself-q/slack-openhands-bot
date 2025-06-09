# Slack-OpenHands Bot

Socket Mode対応でドメイン不要のSlack-OpenHands連携ボット

[🇺🇸 English](README.md) | 🇯🇵 日本語

## 概要

OpenHandsをSlackから直接操作できるボットです。Socket Modeを使用しているため、独自ドメインやWebhookの設定が不要で、簡単にセットアップできます。

## 特徴

- 🤖 SlackからOpenHandsと直接チャット
- 🧵 スレッドベースの会話管理（1スレッド = 1プロジェクト）
- 💬 ダイレクトメッセージ対応
- 🔌 Socket Mode（Webhook・ドメイン設定不要）
- ⚡ OpenHandsからのリアルタイム応答
- 🌐 日本語・英語対応

## プロジェクト説明

### 🎯 目的
OpenHandsは強力なAI開発支援ツールですが、Web UIでの操作が必要でした。このボットにより、普段使っているSlackから直接OpenHandsの機能を利用できるようになります。

### 💡 解決する課題
- **アクセス性**: Web UIを開かずにSlackから直接操作
- **チーム連携**: Slackのスレッド機能でプロジェクト管理
- **ハードルの低さ**: ドメイン設定不要で簡単導入
- **継続性**: 会話の文脈を保持した開発支援

### 🚀 使用場面
- コードレビューの依頼
- バグ修正の相談
- 新機能の実装支援
- ドキュメント作成
- チーム開発でのペアプログラミング

## クイックセットアップ

### 1. 前提条件

- Node.js 18以上
- OpenHandsが `http://localhost:3000` で動作中
- Slack管理者権限

### 2. Slackアプリ作成

1. https://api.slack.com/apps にアクセス
2. 「Create New App」→「From scratch」をクリック
3. アプリ名（例：「OpenHands Bot」）を入力してワークスペースを選択

### 3. ボット権限設定

Slackアプリ設定画面で：

**OAuth & Permissions** → Bot Token Scopes:
- `app_mentions:read`
- `chat:write`
- `im:read`
- `im:write`
- `commands`

**Socket Mode**:
- Socket Modeを有効化
- App-Level Tokenを作成（スコープ: `connections:write`）

### 4. ボットインストール

```bash
npm install
```

### 5. 環境変数設定

`.env`ファイルを作成:

```env
# OAuth & Permissions → Bot User OAuth Token から取得
SLACK_BOT_TOKEN=xoxb-your-bot-token

# Basic Information → Signing Secret から取得
SLACK_SIGNING_SECRET=your-signing-secret

# Socket Mode → App-Level Token から取得
SLACK_APP_TOKEN=xapp-your-app-token

# OpenHands設定
OPENHANDS_API_URL=http://localhost:3000
PORT=3001
```

### 6. チャンネルにボット追加

Slackで `/invite @your-bot-name` を実行してボットをチャンネルに招待

### 7. ボット起動

```bash
npm start
```

## 使用方法

### ボットにメンション
```
@openhands-bot CSVファイルを読み込むPythonスクリプトを作成して
```

### スレッドで継続
会話が開始されると、同じスレッド内で継続してやり取りできます（同一プロジェクトとして扱われます）。

### ダイレクトメッセージ
ボットへのDMでプライベートな会話も可能です。

### スラッシュコマンド

- `/openhands-help` - ヘルプ表示
- `/openhands-status` - OpenHands接続状態確認
- `/openhands-conversations` - アクティブな会話一覧
- `/openhands-open` - OpenHands WebUIリンク取得

## 仕組み

1. **スレッド管理**: Slackスレッド ↔ OpenHands会話のマッピング
2. **リアルタイム同期**: Socket接続でOpenHandsの応答をSlackにストリーミング
3. **文脈保持**: スレッド内で会話の文脈を維持
4. **ドメイン不要**: WebhookではなくSocket Modeを使用

## 設定

### OpenHands設定

`src/config.js`のデフォルト設定:

- **モデル**: `lm_studio/devstral-small-2505`
- **ベースURL**: `http://host.docker.internal:1234/v1/`
- **エージェント**: `CodeActAgent`

### 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `SLACK_BOT_TOKEN` | Bot User OAuth Token | ✅ |
| `SLACK_SIGNING_SECRET` | App Signing Secret | ✅ |
| `SLACK_APP_TOKEN` | Socket Mode用App-Level Token | ✅ |
| `OPENHANDS_API_URL` | OpenHandsベースURL | ✅ |
| `OPENHANDS_MODEL` | 使用するLLMモデル | ❌ |
| `OPENHANDS_AGENT` | エージェント種別 | ❌ |
| `PORT` | サーバーポート | ❌ |

## トラブルシューティング

### ボットが応答しない
1. OpenHandsの動作確認: `/openhands-status`
2. ボットがチャンネルに招待されているか確認
3. コンソールログでエラーを確認

### 権限エラー
1. 必要なOAuthスコープがすべて追加されているか確認
2. スコープ変更後はワークスペースに再インストール

### Socket接続エラー
1. `SLACK_APP_TOKEN`が正しいか確認
2. Slackアプリ設定でSocket Modeが有効になっているか確認

## 開発

```bash
# 開発モード（自動再起動）
npm run dev

# OpenHands接続テスト
npm run test-connection
```

## ライセンス

MIT License - 自由に改変・配布可能です！

## コントリビューション

1. リポジトリをフォーク
2. 機能ブランチを作成
3. プルリクエストを送信

---

OpenHandsコミュニティのために ❤️ で作られました