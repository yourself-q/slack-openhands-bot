const axios = require('axios');
const config = require('./config');

class SlackWebhook {
  constructor() {
    this.webhookUrl = config.slack.webhookUrl;
  }

  async sendMessage(text, threadId = null) {
    if (!this.webhookUrl) {
      console.error('SLACK_WEBHOOK_URL が設定されていません');
      return false;
    }

    try {
      const payload = {
        text: text
      };

      const response = await axios.post(this.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Slack Webhook送信成功');
      return true;
    } catch (error) {
      console.error('❌ Slack Webhook送信エラー:', error.message);
      return false;
    }
  }
}

module.exports = SlackWebhook;