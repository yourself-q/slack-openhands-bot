# Slack-OpenHands Bot　[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/yourself-q/slack-openhands-bot)

A Slack bot that integrates with OpenHands using Socket Mode (no domain required).

🇺🇸 English | [🇯🇵 日本語](README_JP.md)

## Project Overview

### 🎯 Purpose
OpenHands is a powerful AI development assistant, but traditionally requires web UI interaction. This bot brings OpenHands functionality directly into Slack, where teams already collaborate daily.

### 💡 Problems It Solves
- **Accessibility**: Direct OpenHands access from Slack without opening web UI
- **Team Collaboration**: Project management through Slack's threading system
- **Easy Setup**: No domain configuration required with Socket Mode
- **Context Continuity**: Maintains conversation context for ongoing development

### 🚀 Use Cases
- Code review requests
- Bug fixing consultations  
- New feature implementation support
- Documentation generation
- Team pair programming sessions

## Features

- 🤖 Chat with OpenHands directly from Slack
- 🧵 Thread-based conversations (each thread = separate project)
- 💬 Direct message support
- 🔌 Socket Mode (no webhook/domain setup needed)
- ⚡ Real-time responses from OpenHands

## Quick Setup

### 1. Prerequisites

- Node.js 18+ installed
- OpenHands running on `http://localhost:3000`
- Slack workspace with admin permissions

### 2. Create Slack App

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name your app (e.g., "OpenHands Bot") and select workspace

### 3. Configure Bot Permissions

In your Slack app:

**OAuth & Permissions** → Bot Token Scopes:
- `app_mentions:read`
- `chat:write`
- `im:read`
- `im:write`
- `commands`

**Socket Mode**:
- Enable Socket Mode
- Create App-Level Token with scope: `connections:write`

### 4. Install Bot

```bash
npm install
```

### 5. Environment Setup

Create `.env` file:

```env
# Get from "OAuth & Permissions" → Bot User OAuth Token
SLACK_BOT_TOKEN=xoxb-your-bot-token

# Get from "Basic Information" → Signing Secret
SLACK_SIGNING_SECRET=your-signing-secret

# Get from "Socket Mode" → App-Level Token
SLACK_APP_TOKEN=xapp-your-app-token

# OpenHands configuration
OPENHANDS_API_URL=http://localhost:3000
PORT=3001
```

### 6. Add Bot to Channels

In Slack, type `/invite @your-bot-name` in channels where you want to use it.

### 7. Start Bot

```bash
npm start
```

## Usage

### Mention the Bot
```
@openhands-bot Create a Python script that reads a CSV file
```

### Continue in Thread
Once a conversation starts, you can continue in the same thread for the same project context.

### Direct Messages
Send direct messages to the bot for private conversations.

### Slash Commands

- `/openhands-help` - Show help
- `/openhands-status` - Check OpenHands connection
- `/openhands-conversations` - List active conversations
- `/openhands-open` - Get OpenHands WebUI link

## How It Works

1. **Thread Management**: Each Slack thread maps to an OpenHands conversation
2. **Real-time Sync**: Socket connection streams OpenHands responses to Slack
3. **Context Preservation**: Conversations maintain context within threads
4. **No Domain Required**: Uses Slack's Socket Mode instead of webhooks

## Configuration

### OpenHands Settings

Default configuration in `src/config.js`:

- **Model**: `lm_studio/devstral-small-2505`
- **Base URL**: `http://host.docker.internal:1234/v1/`
- **Agent**: `CodeActAgent`

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SLACK_BOT_TOKEN` | Bot User OAuth Token | ✅ |
| `SLACK_SIGNING_SECRET` | App Signing Secret | ✅ |
| `SLACK_APP_TOKEN` | App-Level Token for Socket Mode | ✅ |
| `OPENHANDS_API_URL` | OpenHands base URL | ✅ |
| `OPENHANDS_MODEL` | LLM model to use | ❌ |
| `OPENHANDS_AGENT` | Agent type | ❌ |
| `PORT` | Server port | ❌ |

## Troubleshooting

### Bot not responding
1. Check OpenHands is running: `/openhands-status`
2. Verify bot is invited to channel
3. Check console logs for errors

### Permission errors
1. Ensure all required OAuth scopes are added
2. Reinstall bot to workspace after scope changes

### Socket connection issues
1. Verify `SLACK_APP_TOKEN` is correct
2. Ensure Socket Mode is enabled in Slack app settings

## Development

```bash
# Development mode with auto-restart
npm run dev

# Test OpenHands connection
npm run test-connection
```

## License

MIT License - feel free to modify and distribute!

## Contributing

1. Fork the repository
2. Create your feature branch
3. Submit a pull request

---

Made with ❤️ for the OpenHands community
