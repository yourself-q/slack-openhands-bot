const { App } = require('@slack/bolt');
const config = require('./config');
const OpenHandsSocketClient = require('./openHandsSocketClient');

const app = new App({
  token: config.slack.botToken,
  signingSecret: config.slack.signingSecret,
  socketMode: true,  // これでWebhookのようにドメイン不要になります
  appToken: process.env.SLACK_APP_TOKEN  // Socket Modeに必要
});

const openHandsClient = new OpenHandsSocketClient();

// OpenHandsのメンション検知
app.event('app_mention', async ({ event, say }) => {
  try {
    const threadId = event.thread_ts || event.ts;
    const message = event.text.replace(/<@[^>]+>/g, '').trim();
    
    console.log('🔍 === SLACK EVENT DETAILS ===');
    console.log(`📩 Event Type: app_mention`);
    console.log(`👤 User: ${event.user}`);
    console.log(`📝 Raw Text: "${event.text}"`);
    console.log(`✏️ Cleaned Message: "${message}"`);
    console.log(`🧵 Thread ID: ${threadId}`);
    console.log(`⏰ Timestamp: ${event.ts}`);
    console.log(`📱 Channel: ${event.channel}`);
    console.log('=========================');
    
    // OpenHandsが稼働しているかチェック
    const healthStatus = await openHandsClient.healthCheck();
    if (!healthStatus) {
      await say({
        text: "Sorry, unable to connect to OpenHands server. Please check if the server is running.",
        thread_ts: threadId
      });
      return;
    }

    // Slackに応答を送信するコールバック関数
    const slackCallback = async (responseMessage, responseThreadId) => {
      console.log(`📤 slackCallback呼び出し: threadId=${responseThreadId}, message=${responseMessage}`);
      try {
        await say({
          text: responseMessage,
          thread_ts: responseThreadId || threadId
        });
        console.log(`✅ Slack送信成功`);
      } catch (error) {
        console.error('❌ Slack送信エラー:', error);
      }
    };

    // 既存の会話があるかチェック
    const existingConversation = openHandsClient.getConversationId(threadId);
    
    let response;
    if (existingConversation) {
      // 既存の会話があればダイレクト送信
      console.log(`🔄 既存会話でダイレクト送信: ${existingConversation}`);
      await openHandsClient.sendDirectMessage(threadId, message, slackCallback);
      response = {
        message: `📤 **送信**: "${message}"`,
        conversationId: existingConversation,
        openHandsUrl: openHandsClient.getOpenHandsUrl(threadId)
      };
    } else {
      // 新しい会話を作成
      console.log(`🆕 新しい会話を作成`);
      response = await openHandsClient.sendMessage(threadId, message, slackCallback);
    }
    
    await say({
      text: response.message,
      thread_ts: threadId
    });

  } catch (error) {
    console.error('Error handling mention:', error);
    await say({
      text: "An error occurred. Please try again later.",
      thread_ts: event.thread_ts || event.ts
    });
  }
});

// すべてのメッセージイベント（DM + スレッド内）
app.event('message', async ({ event, say }) => {
  // ボット自身のメッセージは無視
  if (event.bot_id) return;
  
  // DM処理
  if (event.channel_type === 'im') {
    try {
      const threadId = `dm_${event.user}_${event.ts}`;
      const message = event.text;
      
      console.log('🔍 === DM EVENT DETAILS ===');
      console.log(`📩 Event Type: direct_message`);
      console.log(`👤 User: ${event.user}`);
      console.log(`📝 Message: "${message}"`);
      console.log(`🧵 Thread ID: ${threadId}`);
      console.log('=========================');
      
      const healthStatus = await openHandsClient.healthCheck();
      if (!healthStatus) {
        await say("Sorry, unable to connect to OpenHands server.");
        return;
      }

      // DMでの応答コールバック
      const dmCallback = async (responseMessage, responseThreadId) => {
        console.log(`📤 dmCallback呼び出し: message=${responseMessage}`);
        try {
          await say(responseMessage);
          console.log(`✅ DM送信成功`);
        } catch (error) {
          console.error('❌ DM送信エラー:', error);
        }
      };

      const response = await openHandsClient.sendMessage(threadId, message, dmCallback);
      
      await say(response.message);

    } catch (error) {
      console.error('Error handling DM:', error);
      await say("An error occurred. Please try again later.");
    }
    return;
  }
  
  // スレッド内メッセージの処理（既存の会話がある場合のみ）
  if (event.thread_ts && event.channel_type !== 'im') {
    const threadId = event.thread_ts;
    const conversationId = openHandsClient.getConversationId(threadId);
    
    if (conversationId) {
      console.log('🔍 === THREAD MESSAGE ===');
      console.log(`👤 User: ${event.user}`);
      console.log(`📝 Message: "${event.text}"`);
      console.log(`🧵 Thread ID: ${threadId}`);
      console.log(`💬 Conversation ID: ${conversationId}`);
      console.log('=======================');
      
      try {
        // スレッド内応答コールバック
        const threadCallback = async (responseMessage, responseThreadId) => {
          console.log(`📤 threadCallback呼び出し: threadId=${responseThreadId}, message=${responseMessage}`);
          try {
            await say({
              text: responseMessage,
              thread_ts: responseThreadId || threadId
            });
            console.log(`✅ スレッド送信成功`);
          } catch (error) {
            console.error('❌ スレッド送信エラー:', error);
          }
        };

        // 既存の会話で直接メッセージ送信（awaiting_user_input待機なし）
        await openHandsClient.sendDirectMessage(threadId, event.text, threadCallback);
        
      } catch (error) {
        console.error('Error handling thread message:', error);
        await say({
          text: "An error occurred. Please continue directly on OpenHands.",
          thread_ts: threadId
        });
      }
    }
  }
});

// ヘルプコマンド
app.command('/openhands-help', async ({ command, ack, respond }) => {
  await ack();
  
  const helpText = `
*OpenHands Slack Bot Help*

This bot integrates OpenHands with Slack.

*Usage:*
• Mention the bot and send a message to get OpenHands responses
• Conversations within the same thread are treated as the same project
• Direct messages are also supported

*Configuration:*
• OpenHands URL: ${config.openhands.baseUrl}
• Model: ${config.openhands.model}
• Agent: ${config.openhands.agent}

*Commands:*
• \`/openhands-help\` - Show this help
• \`/openhands-status\` - Check OpenHands status
• \`/openhands-conversations\` - List active conversations
• \`/openhands-open\` - Open OpenHands WebUI
`;

  await respond({
    text: helpText,
    response_type: 'ephemeral'
  });
});

// ステータス確認コマンド
app.command('/openhands-status', async ({ command, ack, respond }) => {
  await ack();
  
  try {
    const healthStatus = await openHandsClient.healthCheck();
    const statusText = healthStatus 
      ? "✅ OpenHands server is running normally"
      : "❌ Unable to connect to OpenHands server";
    
    await respond({
      text: statusText,
      response_type: 'ephemeral'
    });
  } catch (error) {
    await respond({
      text: "❌ Error occurred while checking status",
      response_type: 'ephemeral'
    });
  }
});

// 会話一覧コマンド
app.command('/openhands-conversations', async ({ command, ack, respond }) => {
  await ack();
  
  try {
    const conversations = openHandsClient.getAllConversations();
    
    if (conversations.length === 0) {
      await respond({
        text: "No active conversations found.",
        response_type: 'ephemeral'
      });
      return;
    }

    let responseText = "*🗂️ Active Conversations:*\n\n";
    conversations.forEach((conv, index) => {
      responseText += `${index + 1}. **Thread**: ${conv.threadId}\n`;
      responseText += `   **Conversation ID**: \`${conv.conversationId}\`\n`;
      responseText += `   **OpenHands**: ${conv.url}\n\n`;
    });

    await respond({
      text: responseText,
      response_type: 'ephemeral'
    });
  } catch (error) {
    await respond({
      text: "❌ Error occurred while fetching conversations",
      response_type: 'ephemeral'
    });
  }
});

// OpenHandsを開くコマンド
app.command('/openhands-open', async ({ command, ack, respond }) => {
  await ack();
  
  const url = openHandsClient.getOpenHandsUrl(command.channel_id);
  
  await respond({
    text: `🚀 Open OpenHands: ${url}`,
    response_type: 'ephemeral'
  });
});

// アプリ起動
(async () => {
  try {
    await app.start();
    console.log('⚡️ Slack bot is running in Socket Mode!');
    console.log('No domain required - using WebSocket connection');
    
    // OpenHandsの接続確認
    const healthStatus = await openHandsClient.healthCheck();
    if (healthStatus) {
      console.log('✅ OpenHands connection verified');
    } else {
      console.log('⚠️  Warning: Could not connect to OpenHands');
    }
  } catch (error) {
    console.error('Failed to start the app:', error);
  }
})();