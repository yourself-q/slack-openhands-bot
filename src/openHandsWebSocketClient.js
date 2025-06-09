const WebSocket = require('ws');
const EventEmitter = require('events');

class OpenHandsWebSocketClient extends EventEmitter {
  constructor(baseUrl = 'ws://localhost:3000') {
    super();
    this.baseUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    this.ws = null;
    this.conversations = new Map();
  }

  connect(conversationId) {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${this.baseUrl}/ws/${conversationId}`);
        
        this.ws.on('open', () => {
          console.log('WebSocket connected to OpenHands');
          resolve();
        });

        this.ws.on('message', (data) => {
          try {
            const message = JSON.parse(data);
            this.emit('message', message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        });

        this.ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        });

        this.ws.on('close', () => {
          console.log('WebSocket disconnected');
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'message',
        content: message
      }));
      return true;
    }
    return false;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

module.exports = OpenHandsWebSocketClient;