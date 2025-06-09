# Slack-OpenHands Integration Bot

[日本語版](README.ja.md) | English

A system that integrates Slack bot with OpenHands, allowing you to use OpenHands AI assistant directly from Slack.

## Features

- Start conversations with OpenHands by mentioning the bot in Slack
- Continuous conversation within threads (no mention required for follow-ups)
- Automatic forwarding of OpenHands responses to Slack
- Direct message support
- Slash commands for status checking and management

## Requirements

- Node.js 18+
- OpenHands (running on localhost:3000)
- Slack App (Bot Token & Signing Secret)
- GitHub Token (for code operations in OpenHands)

## Setup

### 1. Clone the repository
```bash
git clone https://github.com/yourself-q/slack-openhands-integration.git
cd slack-openhands-integration
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment configuration
Copy `.env.example` to `.env` and set the required values:

```bash
cp .env.example .env
```

Configure the following in `.env` file:
```env
# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-actual-bot-token
SLACK_SIGNING_SECRET=your-actual-signing-secret
PORT=3001

# OpenHands Configuration
OPENHANDS_API_URL=http://localhost:3000
OPENHANDS_MODEL=lm_studio/devstral-small-2505
OPENHANDS_BASE_URL_MODEL=http://host.docker.internal:1234/v1/
OPENHANDS_API_KEY=dummy-api-key
OPENHANDS_AGENT=CodeActAgent
GITHUB_TOKEN=ghp_your-actual-github-token
```

### 4. Slack App Configuration

1. Create an app at [Slack API](https://api.slack.com/apps)
2. Get Bot Token (starts with `xoxb-`)
3. Get Signing Secret
4. Add the following scopes:
   - `app_mentions:read`
   - `chat:write`
   - `im:read`
   - `im:write`
   - `channels:read`
   - `groups:read`
   - `mpim:read`

### 5. External URL Setup

For development, you need an external URL for Slack to access your bot:

#### Using localhost.run (Easy)
```bash
ssh -R 80:localhost:3001 localhost.run
```

#### Using ngrok
```bash
ngrok http 3001
```

Set the obtained URL as **Request URL** in your Slack App settings.

### 6. Start the application
```bash
npm start
```

## Usage

### Basic Usage
1. Mention the bot in Slack: `@bot-name write a program`
2. OpenHands will respond
3. Continue the conversation in the same thread without mentioning the bot

### Slash Commands
- `/openhands-help` - Show help
- `/openhands-status` - Check OpenHands status
- `/openhands-conversations` - List active conversations
- `/openhands-open` - Open OpenHands WebUI

## System Architecture

```
Slack → Bot → OpenHands (Socket.IO) → LM Studio
                ↓
        Forward responses to Slack
```

## For Developers

### Project Structure
```
src/
├── index.js                 # Main Slack Bot application
├── openHandsSocketClient.js # OpenHands communication client
└── config.js               # Configuration management
```

### Development
```bash
npm run dev  # Auto-restart with nodemon
```

## License

MIT License

## Contributing

Pull requests and issue reports are welcome.