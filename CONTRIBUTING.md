# Contributing to Slack-OpenHands Bot

We welcome contributions from the community! Here's how you can help improve this project.

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/slack-openhands-bot.git
   cd slack-openhands-bot
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Set up your environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Slack tokens
   ```

## 🔧 Development

### Running in Development Mode
```bash
npm run dev
```

### Testing Changes
```bash
# Test OpenHands connection
npm run test-connection

# Manual testing with your Slack workspace
npm start
```

## 📝 Types of Contributions

### 🐛 Bug Reports
- Use GitHub Issues
- Include error messages and logs
- Describe steps to reproduce
- Mention your environment (Node.js version, OS, etc.)

### 💡 Feature Requests
- Use GitHub Issues with "enhancement" label
- Describe the use case
- Explain how it would help users

### 🛠️ Code Contributions
- Fork the repo and create a feature branch
- Follow existing code style
- Add comments for complex logic
- Test your changes thoroughly
- Submit a pull request

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Code follows existing style
- [ ] Changes are tested locally
- [ ] Documentation is updated if needed
- [ ] Commit messages are clear

### PR Description Should Include
- What changes were made
- Why the changes were needed
- How to test the changes
- Any breaking changes

## 🏗️ Project Structure

```
src/
├── index.js                 # Main Slack bot entry point
├── config.js               # Configuration management
├── openHandsSocketClient.js # OpenHands WebSocket client
└── simple-webhook-bot.js    # Alternative webhook implementation
```

## 🎯 Areas Where We Need Help

### 🔧 Technical Improvements
- **Error Handling**: Better error messages and recovery
- **Performance**: Optimize message processing
- **Testing**: Add automated tests
- **Docker**: Containerization support

### 📚 Documentation
- **Setup Guides**: Platform-specific instructions
- **Troubleshooting**: Common issues and solutions
- **Examples**: Real-world usage scenarios
- **Translations**: More language support

### 🌟 Features
- **Message Formatting**: Better Slack message styling
- **File Support**: Handle file uploads/downloads
- **Multi-workspace**: Support multiple Slack workspaces
- **Analytics**: Usage statistics and monitoring

## 🎨 Code Style

### JavaScript
- Use ES6+ features
- Prefer `const` over `let`
- Use meaningful variable names
- Add JSDoc comments for functions

### Commits
- Use conventional commit format
- Examples:
  - `feat: add file upload support`
  - `fix: handle connection timeouts`
  - `docs: update setup instructions`

## 🧪 Testing

### Manual Testing Checklist
- [ ] Bot responds to mentions
- [ ] Thread conversations work
- [ ] Direct messages work
- [ ] Slash commands function
- [ ] Error handling works
- [ ] OpenHands integration stable

### Automated Testing (Future)
We plan to add:
- Unit tests for core functions
- Integration tests with mock Slack API
- End-to-end testing framework

## 🤝 Community Guidelines

### Be Respectful
- Use inclusive language
- Help others learn
- Give constructive feedback
- Respect different perspectives

### Stay Focused
- Keep discussions relevant
- Use appropriate channels
- Search before asking questions

## 📞 Getting Help

### Questions?
- GitHub Discussions for general questions
- GitHub Issues for bug reports
- Check existing documentation first

### Response Times
- We aim to respond to issues within 48 hours
- Pull requests are reviewed within a week
- Complex features may take longer

## 🏆 Recognition

Contributors will be:
- Listed in the README
- Mentioned in release notes
- Invited to join core team (for significant contributions)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make OpenHands more accessible to everyone! 🙏