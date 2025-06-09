# Slack-OpenHands Integration Bot

English | [日本語版](README.ja.md)

Slack botとOpenHandsを連携させ、SlackからOpenHandsのAIアシスタントを利用できるシステムです。

## 機能

- Slackでメンションすることで、OpenHandsとの会話を開始
- スレッド内での継続的な会話（メンション不要）
- OpenHandsからの応答を自動的にSlackに転送
- ダイレクトメッセージでの利用
- スラッシュコマンドでのステータス確認・操作

## 必要な環境

- Node.js 18+
- OpenHands (localhost:3000で動作)
- Slack App（Bot Token・Signing Secret）
- GitHub Token（OpenHandsでのコード操作用）

## セットアップ

### 1. リポジトリのクローン
```bash
git clone https://github.com/yourself-q/slack-openhands-integration.git
cd slack-openhands-integration
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
`.env.example`をコピーして`.env`を作成し、必要な値を設定：

```bash
cp .env.example .env
```

`.env`ファイルに以下を設定：
```env
# Slack設定
SLACK_BOT_TOKEN=xoxb-your-actual-bot-token
SLACK_SIGNING_SECRET=your-actual-signing-secret
PORT=3001

# OpenHands設定
OPENHANDS_API_URL=http://localhost:3000
OPENHANDS_MODEL=lm_studio/devstral-small-2505
OPENHANDS_BASE_URL_MODEL=http://host.docker.internal:1234/v1/
OPENHANDS_API_KEY=dummy-api-key
OPENHANDS_AGENT=CodeActAgent
GITHUB_TOKEN=ghp_your-actual-github-token
```

### 4. Slack Appの設定

1. [Slack API](https://api.slack.com/apps)でアプリを作成
2. Bot Tokenを取得（`xoxb-`で始まる）
3. Signing Secretを取得
4. 以下のスコープを追加：
   - `app_mentions:read`
   - `chat:write`
   - `im:read`
   - `im:write`
   - `channels:read`
   - `groups:read`
   - `mpim:read`

### 5. 外部アクセス用URL設定

開発環境では、Slackからアクセスできるよう外部URLが必要です：

#### localhost.runを使用（簡単）
```bash
ssh -R 80:localhost:3001 localhost.run
```

#### ngrokを使用
```bash
ngrok http 3001
```

取得したURLをSlack Appの**Request URL**に設定してください。

### 6. 起動
```bash
npm start
```

## 使用方法

### 基本的な使い方
1. Slackでbotをメンション: `@bot-name プログラムを書いて`
2. OpenHandsが応答を返します
3. 同じスレッド内では、メンション無しで継続して会話可能

### スラッシュコマンド
- `/openhands-help` - ヘルプ表示
- `/openhands-status` - OpenHandsの稼働状況確認
- `/openhands-conversations` - アクティブな会話一覧
- `/openhands-open` - OpenHandsのWebUIを開く

## システム構成

```
Slack → Bot → OpenHands (Socket.IO) → LM Studio
                ↓
           応答をSlackに転送
```

## 開発者向け

### プロジェクト構造
```
src/
├── index.js                 # メインのSlack Botアプリ
├── openHandsSocketClient.js # OpenHandsとの通信クライアント
└── config.js               # 設定管理
```

### デバッグ
```bash
npm run dev  # nodemonで自動再起動
```

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告をお待ちしています。