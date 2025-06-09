const express = require('express');
const config = require('./config');
const OpenHandsSocketClient = require('./openHandsSocketClient');
const SlackWebhook = require('./slack-webhook');

const app = express();
const openHandsClient = new OpenHandsSocketClient();
const slackWebhook = new SlackWebhook();

app.use(express.json());

// シンプルなWebhookエンドポイント
app.post('/webhook', async (req, res) => {
  const { text, user_name } = req.body;
  
  console.log(`📩 Webhook受信: ${user_name} - ${text}`);
  
  if (!text || text.trim() === '') {
    res.status(200).send('OK');
    return;
  }

  try {
    // OpenHandsの健康チェック
    const healthStatus = await openHandsClient.healthCheck();
    if (!healthStatus) {
      await slackWebhook.sendMessage('申し訳ありません。OpenHandsサーバーに接続できません。');
      res.status(200).send('OK');
      return;
    }

    // Slackに応答を送信するコールバック
    const slackCallback = async (responseMessage) => {
      console.log(`📤 OpenHandsからの応答: ${responseMessage}`);
      await slackWebhook.sendMessage(responseMessage);
    };

    // OpenHandsにメッセージを送信
    const threadId = `webhook_${user_name}_${Date.now()}`;
    const response = await openHandsClient.sendMessage(threadId, text, slackCallback);
    
    // 初期応答をSlackに送信
    await slackWebhook.sendMessage(`📤 **送信**: "${text}"\n${response.message}`);

  } catch (error) {
    console.error('Error handling webhook:', error);
    await slackWebhook.sendMessage('エラーが発生しました。後でもう一度お試しください。');
  }

  res.status(200).send('OK');
});

// ステータス確認エンドポイント
app.get('/status', async (req, res) => {
  try {
    const healthStatus = await openHandsClient.healthCheck();
    res.json({
      status: 'running',
      openhands: healthStatus ? 'connected' : 'disconnected',
      webhook: config.slack.webhookUrl ? 'configured' : 'not configured'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// アプリ起動
(async () => {
  try {
    app.listen(config.slack.port, () => {
      console.log('⚡️ Simple Slack Webhook Bot is running!');
      console.log(`Listening on port ${config.slack.port}`);
      console.log(`Webhook endpoint: http://localhost:${config.slack.port}/webhook`);
    });
    
    // OpenHandsの接続確認
    const healthStatus = await openHandsClient.healthCheck();
    if (healthStatus) {
      console.log('✅ OpenHands connection verified');
    } else {
      console.log('⚠️  Warning: Could not connect to OpenHands');
    }

    // Webhook URL確認
    if (config.slack.webhookUrl) {
      console.log('✅ Slack Webhook URL configured');
    } else {
      console.log('⚠️  Warning: SLACK_WEBHOOK_URL not configured');
    }
  } catch (error) {
    console.error('Failed to start the app:', error);
  }
})();