const { io } = require('socket.io-client');
const config = require('./config');

class OpenHandsSocketClient {
  constructor() {
    this.baseUrl = config.openhands.baseUrl;
    this.conversations = new Map(); // threadId -> { conversationId, socket, slackCallback }
    this.sockets = new Map(); // conversationId -> socket instance
  }

  async createConversation(threadId) {
    try {
      const axios = require('axios');
      const response = await axios.post(`${this.baseUrl}/api/conversations`, {
        model: config.openhands.model,
        base_url: config.openhands.baseUrlModel,
        api_key: config.openhands.apiKey,
        agent: config.openhands.agent,
        github_token: config.openhands.githubToken
      });
      
      const conversationId = response.data.conversation_id;
      this.conversations.set(threadId, { conversationId, socket: null });
      
      console.log(`✅ 会話作成成功: ${conversationId}`);
      return conversationId;
    } catch (error) {
      console.error('Failed to create conversation:', error.response?.data || error.message);
      throw error;
    }
  }

  async connectWebSocket(conversationId) {
    try {
      console.log(`🔗 WebSocket接続開始: ${conversationId}`);
      
      const socket = io(this.baseUrl, {
        transports: ['websocket'],
        query: {
          conversation_id: conversationId
        }
      });

      // 接続イベント
      socket.on('connect', () => {
        console.log(`✅ WebSocket接続成功: ${conversationId}`);
      });

      // 切断イベント
      socket.on('disconnect', () => {
        console.log(`🔌 WebSocket切断: ${conversationId}`);
      });

      // エラーイベント
      socket.on('error', (error) => {
        console.error(`❌ WebSocketエラー (${conversationId}):`, error);
      });

      // すべてのイベントをログ
      socket.onAny((eventName, ...args) => {
        console.log(`📡 Socket.IOイベント (${conversationId}) [${eventName}]:`, args);
      });

      // エージェント状態の監視
      socket.on('oh_agent_state', (data) => {
        console.log(`🤖 エージェント状態変更 (${conversationId}):`, data);
        if (data.state === 'AWAITING_USER_INPUT') {
          console.log(`✅ エージェント準備完了 (${conversationId}): ユーザー入力待機中`);
        }
      });

      // 包括的なイベント処理（配列・単体の両方に対応）
      socket.on('oh_event', async (eventData) => {
        console.log(`🔍 oh_eventデバッグ (${conversationId}):`, eventData);
        
        // 配列でない場合は配列に変換
        const events = Array.isArray(eventData) ? eventData : [eventData];
        
        for (let index = 0; index < events.length; index++) {
          const event = events[index];
          console.log(`🔍 イベント ${index}:`, event);
          
          // メッセージ応答の検出（複数パターン）
          if (event.message && event.action === 'message' && event.args?.content) {
            console.log(`📥 メッセージ応答受信 (${conversationId}): ${event.args.content}`);
            await this.forwardToSlack(conversationId, event.args.content);
          }
          
          // args.contentにメッセージがある場合
          else if (event.args && event.args.content && event.args.content.trim() && !event.observation?.includes('agent_state_changed')) {
            console.log(`📥 args.contentメッセージ受信 (${conversationId}): ${event.args.content}`);
            await this.forwardToSlack(conversationId, event.args.content);
          }
          
          // messageフィールドにメッセージがある場合
          else if (event.message && event.message.trim() && !event.observation?.includes('agent_state_changed')) {
            console.log(`📥 messageメッセージ受信 (${conversationId}): ${event.message}`);
            await this.forwardToSlack(conversationId, event.message);
          }
          
          // contentフィールドにメッセージがある場合
          else if (event.content && event.content.trim() && !event.observation?.includes('agent_state_changed')) {
            console.log(`📥 contentメッセージ受信 (${conversationId}): ${event.content}`);
            await this.forwardToSlack(conversationId, event.content);
          }
          
          // エージェントからのメッセージ（source: "agent", type: "message"）
          else if (event.source === 'agent' && event.type === 'message' && event.message && event.message.trim()) {
            console.log(`📥 エージェントメッセージ受信 (${conversationId}): ${event.message}`);
            await this.forwardToSlack(conversationId, event.message);
          }
          
          // ファイル操作結果
          else if (event.source === 'agent' && ['edit', 'write', 'read'].includes(event.action)) {
            console.log(`📁 ファイル操作結果 (${conversationId}): ${event.action}`);
            const summary = `📁 **${event.action}操作完了**: ${event.args?.path || ''}`;
            await this.forwardToSlack(conversationId, summary);
          }
          
          // コマンド実行結果
          else if (event.source === 'agent' && event.action === 'run') {
            console.log(`⚡ コマンド実行 (${conversationId}): ${event.args?.command}`);
            const output = event.observation || event.content || '';
            if (output.trim()) {
              await this.forwardToSlack(conversationId, `⚡ **実行結果**:\n\`\`\`\n${output.substring(0, 1000)}\n\`\`\``);
            }
          }
          
          // エラー通知
          else if (event.observation === 'ErrorObservation' || event.type === 'error') {
            console.log(`❌ エラー通知 (${conversationId}): ${event.message}`);
            await this.forwardToSlack(conversationId, `❌ **エラー**: ${event.message || event.content}`);
          }
        }
      });

      this.sockets.set(conversationId, socket);
      return socket;
    } catch (error) {
      console.error(`WebSocket接続失敗 (${conversationId}):`, error);
      throw error;
    }
  }

  // Slackに応答を転送
  async forwardToSlack(conversationId, message) {
    console.log(`🔍 forwardToSlack呼び出し: conversationId=${conversationId}`);
    console.log(`🔍 現在の会話一覧:`, Array.from(this.conversations.entries()));
    
    // conversation IDから対応するスレッドIDとSlackコールバックを見つける
    for (const [threadId, data] of this.conversations) {
      console.log(`🔍 チェック中: threadId=${threadId}, data.conversationId=${data.conversationId}, callback=${!!data.slackCallback}`);
      
      if (data.conversationId === conversationId) {
        if (data.slackCallback && typeof data.slackCallback === 'function') {
          console.log(`📤 Slackに転送実行 (${threadId}): ${message}`);
          try {
            await data.slackCallback(message, threadId);
            console.log(`✅ Slack転送成功`);
          } catch (error) {
            console.error(`❌ Slack転送エラー:`, error);
          }
        } else {
          console.log(`⚠️ Slackコールバックがありません (${threadId}), callback type: ${typeof data.slackCallback}`);
        }
        break;
      }
    }
    
    if (!Array.from(this.conversations.values()).some(data => data.conversationId === conversationId)) {
      console.log(`❌ 対応する会話が見つかりません: ${conversationId}`);
    }
  }

  async sendMessage(threadId, message, slackCallback = null) {
    try {
      let conversationData = this.conversations.get(threadId);
      
      if (!conversationData) {
        const conversationId = await this.createConversation(threadId);
        conversationData = { conversationId, socket: null, slackCallback: slackCallback };
        this.conversations.set(threadId, conversationData);
      } else {
        // Slackコールバックを更新
        conversationData.slackCallback = slackCallback;
      }

      const { conversationId } = conversationData;
      let socket = conversationData.socket;

      // WebSocket接続がない場合は作成
      if (!socket || !socket.connected) {
        socket = await this.connectWebSocket(conversationId);
        conversationData.socket = socket;
        
        // 接続完了を待つ
        await new Promise((resolve, reject) => {
          if (socket.connected) {
            resolve();
          } else {
            socket.on('connect', resolve);
            socket.on('error', reject);
            
            // タイムアウト
            setTimeout(() => reject(new Error('接続タイムアウト')), 5000);
          }
        });
      }

      console.log(`⏳ awaiting_user_input状態を待機中... (${conversationId})`);
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('エージェント準備タイムアウト（2分）'));
        }, 120000); // 2分

        let messageSent = false;

        // oh_eventでawaiting_user_input状態を検知
        const checkAgentState = (...args) => {
          console.log(`🔍 checkAgentState呼び出し (${conversationId}), messageSent=${messageSent}`);
          console.log(`🔍 受信した引数:`, args);
          
          // 引数の構造を柔軟に処理
          let eventData = args[0];
          
          // 配列でない場合は配列にする
          if (!Array.isArray(eventData)) {
            eventData = [eventData];
          }
          
          if (eventData && eventData.length > 0) {
            const event = eventData[0];
            console.log(`🔍 イベント詳細:`, event);
            
            if (event && event.extras && event.extras.agent_state) {
              console.log(`🤖 エージェント状態: ${event.extras.agent_state}`);
              
              if (event.extras.agent_state === 'awaiting_user_input' && !messageSent) {
                console.log(`✅ awaiting_user_input状態検知! (${conversationId})`);
                console.log(`⏰ 5秒待機してから送信...`);
                
                messageSent = true; // すぐにフラグを立てて重複防止
                clearTimeout(timeout);
                
                // 5秒待機してから送信
                setTimeout(() => {
                  console.log(`📤 メッセージ送信 (${conversationId}): "${message}"`);
                  
                  socket.emit('oh_user_action', {
                    action: 'message',
                    args: {
                      content: message
                    }
                  });

                  console.log(`✅ メッセージ送信完了! OpenHandsで処理中...`);

                  // 最初のメッセージかどうかを判定
                  const isFirstMessage = !conversationData.hasStarted;
                  conversationData.hasStarted = true;
                  
                  const responseMessage = isFirstMessage 
                    ? `🤖 **OpenHands Processing Started!**\n\n💬 **Question**: "${message}"\n\n🚀 **View on OpenHands**: ${this.baseUrl}/conversations/${conversationId}\n\n✨ **Status**: Message sent successfully, waiting for response`
                    : `📤 **Message Sent**: "${message}"`;

                  resolve({
                    message: responseMessage,
                    conversationId: conversationId,
                    openHandsUrl: `${this.baseUrl}/conversations/${conversationId}`,
                    status: 'sent'
                  });
                }, 5000); // 5秒待機
              } else {
                console.log(`🔍 条件不一致: state=${event.extras?.agent_state}, messageSent=${messageSent}`);
              }
            } else {
              console.log(`🔍 extras.agent_stateなし`, event);
            }
          } else {
            console.log(`🔍 イベントデータなし`);
          }
        };

        socket.on('oh_event', checkAgentState);

        // クリーンアップ
        const originalResolve = resolve;
        resolve = (...args) => {
          socket.off('oh_event', checkAgentState);
          originalResolve(...args);
        };

        const originalReject = reject;
        reject = (...args) => {
          socket.off('oh_event', checkAgentState);
          originalReject(...args);
        };
      });

    } catch (error) {
      console.error('Send message failed:', error);
      
      // フォールバック: WebUIへのリンクを提供
      const conversationData = this.conversations.get(threadId);
      const conversationId = conversationData?.conversationId;
      
      if (conversationId) {
        return {
          message: `🤖 **OpenHands準備完了** (WebSocket接続中...)\n\n📝 **質問**: "${message}"\n🚀 **OpenHands**: ${this.baseUrl}/conversations/${conversationId}\n\n⚡ リンクをクリックして質問をコピペしてください`,
          conversationId: conversationId,
          openHandsUrl: `${this.baseUrl}/conversations/${conversationId}`
        };
      }
      
      throw error;
    }
  }

  // スレッド内での直接メッセージ送信（既にユーザー待機状態なら5秒待って送信）
  async sendDirectMessage(threadId, message, slackCallback = null) {
    try {
      const conversationData = this.conversations.get(threadId);
      
      if (!conversationData || !conversationData.socket || !conversationData.socket.connected) {
        throw new Error('会話が見つからないか、接続が切れています');
      }

      // Slackコールバックを更新
      conversationData.slackCallback = slackCallback;

      console.log(`🔍 スレッド内送信: 現在の状態確認中 (${conversationData.conversationId})`);
      
      // 現在の状態を確認するため、イベントを監視
      let isWaitingForUser = false;
      let messageSent = false;
      
      const checkCurrentState = (eventData) => {
        if (Array.isArray(eventData) && eventData.length > 0) {
          const event = eventData[0];
          if (event.extras && event.extras.agent_state === 'awaiting_user_input' && !messageSent) {
            isWaitingForUser = true;
            console.log(`✅ 既にawaiting_user_input状態検知! 5秒待機後送信 (${conversationData.conversationId})`);
            
            setTimeout(() => {
              if (!messageSent) {
                messageSent = true;
                console.log(`📤 5秒待機後送信 (${conversationData.conversationId}): "${message}"`);
                
                conversationData.socket.emit('oh_user_action', {
                  action: 'message',
                  args: {
                    content: message
                  }
                });

                // 送信通知はしない（応答のみSlackに送信）
                
                // イベントリスナーを削除
                conversationData.socket.off('oh_event', checkCurrentState);
              }
            }, 5000); // 5秒待機
          }
        }
      };

      // イベントリスナーを追加
      conversationData.socket.on('oh_event', checkCurrentState);
      
      // 1秒後に状態が分からない場合は即座に送信
      setTimeout(() => {
        if (!isWaitingForUser && !messageSent) {
          messageSent = true;
          console.log(`📤 状態不明のため即座送信 (${conversationData.conversationId}): "${message}"`);
          
          conversationData.socket.emit('oh_user_action', {
            action: 'message',
            args: {
              content: message
            }
          });

          // 送信通知はしない（応答のみSlackに送信）
          
          // イベントリスナーを削除
          conversationData.socket.off('oh_event', checkCurrentState);
        }
      }, 1000); // 1秒後にフォールバック

    } catch (error) {
      console.error('Direct message failed:', error);
      
      if (slackCallback) {
        slackCallback(`❌ **送信失敗**: ${error.message}`, threadId);
      }
    }
  }

  async healthCheck() {
    try {
      const axios = require('axios');
      const response = await axios.get(`${this.baseUrl}/health`);
      return response.data;
    } catch (error) {
      console.error('OpenHands health check failed:', error.message);
      return false;
    }
  }

  getConversationId(threadId) {
    return this.conversations.get(threadId)?.conversationId;
  }

  getOpenHandsUrl(threadId) {
    const conversationId = this.getConversationId(threadId);
    return conversationId ? `${this.baseUrl}/conversations/${conversationId}` : this.baseUrl;
  }

  async getModels() {
    try {
      const axios = require('axios');
      const response = await axios.get(`${this.baseUrl}/api/options/models`);
      return response.data;
    } catch (error) {
      console.error('Failed to get models:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAgents() {
    try {
      const axios = require('axios');
      const response = await axios.get(`${this.baseUrl}/api/options/agents`);
      return response.data;
    } catch (error) {
      console.error('Failed to get agents:', error.response?.data || error.message);
      throw error;
    }
  }

  getAllConversations() {
    return Array.from(this.conversations.entries()).map(([threadId, data]) => ({
      threadId,
      conversationId: data.conversationId,
      url: `${this.baseUrl}/conversations/${data.conversationId}`,
      connected: data.socket?.connected || false
    }));
  }

  // クリーンアップ
  disconnect(threadId) {
    const conversationData = this.conversations.get(threadId);
    if (conversationData?.socket) {
      conversationData.socket.disconnect();
    }
    this.conversations.delete(threadId);
  }

  disconnectAll() {
    for (const [threadId] of this.conversations) {
      this.disconnect(threadId);
    }
  }
}

module.exports = OpenHandsSocketClient;