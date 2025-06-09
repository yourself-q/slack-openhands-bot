# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-06-09

### 🎉 Initial Release

#### Added
- **Core Functionality**
  - Slack bot integration with OpenHands using Socket Mode
  - Thread-based conversation management (1 thread = 1 OpenHands project)
  - Direct message support for private conversations
  - Real-time message streaming from OpenHands to Slack

- **Slash Commands**
  - `/openhands-help` - Display help information
  - `/openhands-status` - Check OpenHands server connection
  - `/openhands-conversations` - List active conversations
  - `/openhands-open` - Get OpenHands WebUI link

- **Socket Mode Implementation**
  - No domain or webhook configuration required
  - WebSocket-based real-time communication
  - Automatic reconnection handling

- **Multi-language Support**
  - English interface
  - Japanese interface
  - Bilingual documentation (README.md / README_JP.md)

- **Configuration Management**
  - Environment variable based configuration
  - Configurable OpenHands model and agent settings
  - GitHub token integration support

#### Technical Features
- **WebSocket Client**: Custom OpenHands WebSocket client with event handling
- **Thread Mapping**: Slack thread ID to OpenHands conversation ID mapping
- **Message Processing**: Real-time message forwarding and response handling
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Logging**: Detailed console logging for debugging

#### Documentation
- Comprehensive README with setup instructions
- Japanese documentation (README_JP.md)
- Contributing guidelines (CONTRIBUTING.md)
- MIT License
- Environment variable examples (.env.example)

### 🛠️ Technical Details
- **Node.js**: 18+ compatibility
- **Dependencies**: Minimal dependency footprint
  - `@slack/bolt` for Slack integration
  - `socket.io-client` for WebSocket communication
  - `ws` for WebSocket support
  - `axios` for HTTP requests
  - `express` for web server functionality

### 🚀 Initial Configuration
- **Default Model**: `lm_studio/devstral-small-2505`
- **Default Agent**: `CodeActAgent`
- **Default Port**: 3001
- **OpenHands URL**: `http://localhost:3000`

---

## Planned Features

### [1.1.0] - Future Release
- **Enhanced Message Formatting**
  - Code syntax highlighting in Slack
  - Better markdown rendering
  - File attachment support

- **Improved Error Handling**
  - Retry mechanisms for failed requests
  - Better error messages with suggestions
  - Connection status indicators

### [1.2.0] - Future Release
- **Multi-workspace Support**
  - Support for multiple Slack workspaces
  - Workspace-specific configurations
  - Cross-workspace conversation management

- **Advanced Features**
  - Conversation export functionality
  - Usage analytics and metrics
  - Custom slash command creation

### [2.0.0] - Future Major Release
- **Docker Support**
  - Docker containerization
  - Docker Compose setup
  - Kubernetes deployment guides

- **Plugin System**
  - Extensible plugin architecture
  - Custom OpenHands agent support
  - Third-party integrations

---

## Migration Notes

### From Development Version
If you were using a development version of this bot:

1. **Update Dependencies**
   ```bash
   npm install
   ```

2. **Update Environment Variables**
   - Add `SLACK_APP_TOKEN` for Socket Mode
   - Remove webhook-related variables if using Socket Mode

3. **Update Slack App Configuration**
   - Enable Socket Mode in your Slack app
   - Generate App-Level Token
   - Update bot permissions if needed

---

## Support

For questions about changes or upgrade help:
- Check the [GitHub Issues](https://github.com/yourusername/slack-openhands-bot/issues)
- Read the [Contributing Guide](CONTRIBUTING.md)
- Refer to the [README](README.md) for setup instructions