require('dotenv').config();

module.exports = {
  slack: {
    botToken: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    port: process.env.PORT || 3001
  },
  openhands: {
    baseUrl: process.env.OPENHANDS_API_URL || 'http://localhost:3000',
    model: process.env.OPENHANDS_MODEL || 'lm_studio/devstral-small-2505',
    baseUrlModel: process.env.OPENHANDS_BASE_URL_MODEL || 'http://host.docker.internal:1234/v1/',
    apiKey: process.env.OPENHANDS_API_KEY || 'dummy-api-key',
    agent: process.env.OPENHANDS_AGENT || 'CodeActAgent',
    githubToken: process.env.GITHUB_TOKEN
  }
};