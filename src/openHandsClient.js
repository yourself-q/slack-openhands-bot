const axios = require('axios');
const config = require('./config');

class OpenHandsClient {
  constructor() {
    this.baseUrl = config.openhands.baseUrl;
    this.conversations = new Map(); // スレッドID -> 会話ID のマッピング
  }

  async createConversation(threadId) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/conversations`, {
        model: config.openhands.model,
        base_url: config.openhands.baseUrlModel,
        api_key: config.openhands.apiKey,
        agent: config.openhands.agent,
        github_token: config.openhands.githubToken
      });
      
      const conversationId = response.data.conversation_id;
      this.conversations.set(threadId, conversationId);
      return conversationId;
    } catch (error) {
      console.error('Failed to create conversation:', error.response?.data || error.message);
      throw error;
    }
  }

  async getConversation(conversationId) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get conversation:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendMessage(threadId, message) {
    try {
      let conversationId = this.conversations.get(threadId);
      
      if (!conversationId) {
        conversationId = await this.createConversation(threadId);
      }

      // 正しいOpenHandsのURL形式
      const openHandsUrl = `${this.baseUrl}/conversations/${conversationId}`;
      
      // 現在のOpenHandsは主にWebSocketベースで動作するため、
      // REST APIでの直接的なメッセージ送信ではなく、
      // ユーザーにWebUIでの操作を案内する実用的なアプローチ
      
      return {
        message: `🤖 **OpenHands準備完了！**

📝 **質問**: "${message}"

🚀 **OpenHands**: ${openHandsUrl}

⚡ **簡単な手順**:
→ リンクをクリック → 質問をコピペ → 送信

🔧 **設定**: ${config.openhands.agent} | ${config.openhands.model}`,
        conversationId: conversationId,
        openHandsUrl: openHandsUrl
      };

    } catch (error) {
      console.error('Send message failed completely:', error.response?.data || error.message);
      throw error;
    }
  }

  async getModels() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/options/models`);
      return response.data;
    } catch (error) {
      console.error('Failed to get models:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAgents() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/options/agents`);
      return response.data;
    } catch (error) {
      console.error('Failed to get agents:', error.response?.data || error.message);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseUrl}/health`);
      return response.data;
    } catch (error) {
      console.error('OpenHands health check failed:', error.message);
      return false;
    }
  }

  getConversationId(threadId) {
    return this.conversations.get(threadId);
  }

  async getConversationStatus(threadId) {
    const conversationId = this.conversations.get(threadId);
    if (!conversationId) {
      return null;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/api/conversations`);
      const conversations = response.data;
      return conversations.find(conv => conv.conversation_id === conversationId);
    } catch (error) {
      console.error('Failed to get conversation status:', error.message);
      return null;
    }
  }

  getOpenHandsUrl(threadId) {
    const conversationId = this.conversations.get(threadId);
    return conversationId ? `${this.baseUrl}/conversations/${conversationId}` : this.baseUrl;
  }

  getAllConversations() {
    return Array.from(this.conversations.entries()).map(([threadId, conversationId]) => ({
      threadId,
      conversationId,
      url: `${this.baseUrl}/conversations/${conversationId}`
    }));
  }
}

module.exports = OpenHandsClient;