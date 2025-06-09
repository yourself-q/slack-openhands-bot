const { App } = require('@slack/bolt');
const config = require('./config');

console.log('🚀 Simple Slack bot starting...');

const app = new App({
  token: config.slack.botToken,
  signingSecret: config.slack.signingSecret,
  socketMode: false
});

// 基本的なメンション応答
app.event('app_mention', async ({ event, say }) => {
  console.log('📩 Mention received:', event.text);
  
  await say({
    text: `✅ ボット動作確認: メッセージ受信しました\n内容: ${event.text}`,
    thread_ts: event.thread_ts || event.ts
  });
});

// 基本的なスラッシュコマンド
app.command('/openhands-status', async ({ command, ack, respond }) => {
  await ack();
  console.log('📩 Command received: /openhands-status');
  
  await respond({
    text: "✅ ボット正常動作中",
    response_type: 'ephemeral'
  });
});

// アプリ起動
(async () => {
  try {
    await app.start(config.slack.port);
    console.log(`✅ Simple bot running on port ${config.slack.port}`);
  } catch (error) {
    console.error('❌ Bot startup failed:', error);
  }
})();