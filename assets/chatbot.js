/**
 * TNR Business Solutions - Custom Chatbot Widget
 * Professional chatbot similar to contractor websites
 */

class TNRChatbot {
  constructor(config = {}) {
    this.isOpen = false;
    this.messages = [];
    this.config = {
      position: config.position || 'bottom-right',
      primaryColor: config.primaryColor || '#D4AF37', // TNR Gold
      secondaryColor: config.secondaryColor || '#1a365d', // TNR Navy
      greeting: config.greeting || "Hi! 👋 I'm here to help with your digital marketing and insurance needs. What can I help you with today?",
      ...config
    };
    
    this.init();
  }

  init() {
    this.createWidget();
    this.loadGreeting();
    this.setupEventListeners();
  }

  createWidget() {
    // Create container
    const container = document.createElement('div');
    container.id = 'tnr-chatbot-container';
    container.className = `tnr-chatbot-container tnr-chatbot-${this.config.position}`;
    
    // Create button
    const button = document.createElement('button');
    button.id = 'tnr-chatbot-button';
    button.className = 'tnr-chatbot-button';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span class="tnr-chatbot-badge">1</span>
    `;
    button.addEventListener('click', () => this.toggle());

    // Create chat window
    const chatWindow = document.createElement('div');
    chatWindow.id = 'tnr-chatbot-window';
    chatWindow.className = 'tnr-chatbot-window';
    chatWindow.innerHTML = `
      <div class="tnr-chatbot-header">
        <div class="tnr-chatbot-header-info">
          <div class="tnr-chatbot-avatar">TNR</div>
          <div>
            <div class="tnr-chatbot-name">TNR Business Solutions</div>
            <div class="tnr-chatbot-status">Online • Usually replies instantly</div>
          </div>
        </div>
        <button class="tnr-chatbot-close" id="tnr-chatbot-close">×</button>
      </div>
      <div class="tnr-chatbot-messages" id="tnr-chatbot-messages"></div>
      <div class="tnr-chatbot-input-container">
        <input 
          type="text" 
          id="tnr-chatbot-input" 
          class="tnr-chatbot-input" 
          placeholder="Type your message..."
          autocomplete="off"
        />
        <button class="tnr-chatbot-send" id="tnr-chatbot-send">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    `;

    container.appendChild(button);
    container.appendChild(chatWindow);
    document.body.appendChild(container);

    // Add styles
    this.injectStyles();
  }

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .tnr-chatbot-container {
        position: fixed;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      }
      
      .tnr-chatbot-bottom-right {
        bottom: 20px;
        right: 20px;
      }
      
      .tnr-chatbot-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${this.config.primaryColor};
        border: none;
        color: white;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        position: relative;
      }
      
      .tnr-chatbot-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }
      
      .tnr-chatbot-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #e53e3e;
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        border: 2px solid white;
      }
      
      .tnr-chatbot-window {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 380px;
        max-width: calc(100vw - 40px);
        height: 600px;
        max-height: calc(100vh - 100px);
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        display: none;
        flex-direction: column;
        overflow: hidden;
      }
      
      .tnr-chatbot-window.open {
        display: flex;
        animation: slideUp 0.3s ease;
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .tnr-chatbot-header {
        background: ${this.config.secondaryColor};
        color: white;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .tnr-chatbot-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .tnr-chatbot-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${this.config.primaryColor};
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
      }
      
      .tnr-chatbot-name {
        font-weight: 600;
        font-size: 16px;
      }
      
      .tnr-chatbot-status {
        font-size: 12px;
        opacity: 0.9;
      }
      
      .tnr-chatbot-close {
        background: none;
        border: none;
        color: white;
        font-size: 28px;
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background 0.2s;
      }
      
      .tnr-chatbot-close:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .tnr-chatbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #f7fafc;
      }
      
      .tnr-chatbot-message {
        display: flex;
        gap: 8px;
        animation: fadeIn 0.3s ease;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .tnr-chatbot-message.user {
        flex-direction: row-reverse;
      }
      
      .tnr-chatbot-message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
      }
      
      .tnr-chatbot-message.bot .tnr-chatbot-message-avatar {
        background: ${this.config.secondaryColor};
        color: white;
      }
      
      .tnr-chatbot-message.user .tnr-chatbot-message-avatar {
        background: ${this.config.primaryColor};
        color: white;
      }
      
      .tnr-chatbot-message-content {
        max-width: 75%;
        padding: 12px 16px;
        border-radius: 12px;
        line-height: 1.5;
        font-size: 14px;
      }
      
      .tnr-chatbot-message.bot .tnr-chatbot-message-content {
        background: white;
        color: #2d3748;
        border: 1px solid #e2e8f0;
      }
      
      .tnr-chatbot-message.user .tnr-chatbot-message-content {
        background: ${this.config.primaryColor};
        color: white;
      }
      
      .tnr-chatbot-quick-replies {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
      }
      
      .tnr-chatbot-quick-reply {
        background: white;
        border: 1px solid #e2e8f0;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .tnr-chatbot-quick-reply:hover {
        background: ${this.config.primaryColor};
        color: white;
        border-color: ${this.config.primaryColor};
      }
      
      .tnr-chatbot-input-container {
        display: flex;
        padding: 16px;
        background: white;
        border-top: 1px solid #e2e8f0;
        gap: 8px;
      }
      
      .tnr-chatbot-input {
        flex: 1;
        border: 1px solid #e2e8f0;
        border-radius: 24px;
        padding: 12px 16px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
      }
      
      .tnr-chatbot-input:focus {
        border-color: ${this.config.primaryColor};
      }
      
      .tnr-chatbot-send {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: ${this.config.primaryColor};
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      
      .tnr-chatbot-send:hover {
        transform: scale(1.05);
      }
      
      .tnr-chatbot-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      @media (max-width: 480px) {
        .tnr-chatbot-window {
          width: calc(100vw - 20px);
          height: calc(100vh - 100px);
          bottom: 80px;
          right: 10px;
          left: 10px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  setupEventListeners() {
    const closeBtn = document.getElementById('tnr-chatbot-close');
    const sendBtn = document.getElementById('tnr-chatbot-send');
    const input = document.getElementById('tnr-chatbot-input');

    closeBtn.addEventListener('click', () => this.toggle());
    
    sendBtn.addEventListener('click', () => this.sendMessage());
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    const window = document.getElementById('tnr-chatbot-window');
    const button = document.getElementById('tnr-chatbot-button');
    const badge = button.querySelector('.tnr-chatbot-badge');
    
    if (this.isOpen) {
      window.classList.add('open');
      badge.style.display = 'none';
      document.getElementById('tnr-chatbot-input').focus();
    } else {
      window.classList.remove('open');
    }
  }

  loadGreeting() {
    this.addMessage('bot', this.config.greeting, [
      'Get a Quote',
      'Learn About Services',
      'Contact Us'
    ]);
  }

  addMessage(sender, text, quickReplies = []) {
    const messagesContainer = document.getElementById('tnr-chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `tnr-chatbot-message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'tnr-chatbot-message-avatar';
    avatar.textContent = sender === 'bot' ? 'TNR' : 'You';
    
    const content = document.createElement('div');
    content.className = 'tnr-chatbot-message-content';
    content.textContent = text;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    if (quickReplies.length > 0 && sender === 'bot') {
      const quickRepliesDiv = document.createElement('div');
      quickRepliesDiv.className = 'tnr-chatbot-quick-replies';
      quickReplies.forEach(reply => {
        const btn = document.createElement('button');
        btn.className = 'tnr-chatbot-quick-reply';
        btn.textContent = reply;
        btn.addEventListener('click', () => {
          this.handleQuickReply(reply);
        });
        quickRepliesDiv.appendChild(btn);
      });
      content.appendChild(quickRepliesDiv);
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    this.messages.push({ sender, text });
  }

  handleQuickReply(reply) {
    this.addMessage('user', reply);
    setTimeout(() => this.processMessage(reply), 500);
  }

  sendMessage() {
    const input = document.getElementById('tnr-chatbot-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    input.value = '';
    this.addMessage('user', message);
    
    setTimeout(() => this.processMessage(message), 500);
  }

  processMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    // Intent detection and responses
    if (lowerMessage.includes('quote') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      this.addMessage('bot', "I'd be happy to help you get a quote! 🎯\n\nWe offer free consultations for both digital marketing and insurance services. Would you like a quote for:\n\n• Digital Marketing Services\n• Insurance Coverage\n• Both", [
        'Digital Marketing Quote',
        'Insurance Quote',
        'Both Services'
      ]);
    } else if (lowerMessage.includes('service') || lowerMessage.includes('what do you') || lowerMessage.includes('offer')) {
      this.addMessage('bot', "We offer comprehensive digital marketing and insurance services! 📊\n\n**Digital Marketing:**\n• Web Design & Development\n• SEO Services\n• Social Media Management\n• Content Creation\n• Paid Advertising\n• Email Marketing\n\n**Insurance Services:**\n• Auto Insurance\n• Home Insurance\n• Business Insurance\n• Life Insurance\n\nWhat interests you most?", [
        'Web Design',
        'SEO Services',
        'Insurance'
      ]);
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('call')) {
      this.addMessage('bot', "You can reach us at:\n\n📞 Phone: (412) 499-2987\n📧 Email: roy.turner@tnrbusinesssolutions.com\n📍 Address: 418 Concord Avenue, Greensburg, PA 15601\n\nWould you like me to help you schedule a consultation?", [
        'Schedule Consultation',
        'Get Directions',
        'Send Email'
      ]);
    } else if (lowerMessage.includes('greensburg') || lowerMessage.includes('location') || lowerMessage.includes('where')) {
      this.addMessage('bot', "We're located in Greensburg, PA and serve all of Westmoreland County! 🏠\n\nOur office is at:\n418 Concord Avenue\nGreensburg, PA 15601\n\nWe work with businesses throughout Western Pennsylvania. Are you looking for local services?", [
        'Yes, I\'m Local',
        'Learn More',
        'Get Directions'
      ]);
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      this.addMessage('bot', "Hello! 👋 Thanks for reaching out to TNR Business Solutions. How can I help you today?", [
        'Get a Quote',
        'Learn About Services',
        'Contact Us'
      ]);
    } else {
      // Default response with lead capture
      this.addMessage('bot', "That's a great question! 💡\n\nTo give you the best answer, could you provide a bit more detail? Or I can connect you with one of our experts who can help.\n\nWould you like to:\n• Get a free consultation\n• Receive more information\n• Speak with someone directly", [
        'Free Consultation',
        'More Information',
        'Speak to Someone'
      ]);
    }
  }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.tnrChatbot = new TNRChatbot({
      position: 'bottom-right',
      greeting: "Hi! 👋 I'm here to help with your digital marketing and insurance needs. What can I help you with today?"
    });
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TNRChatbot;
}

