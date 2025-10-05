class CatChat {
    constructor() {
      this.messagesContainer = document.getElementById("chat-messages")
      this.inputElement = document.getElementById("chat-input")
      this.sendButton = document.getElementById("send-btn")
  
      this.apiUrl = "https://chatserver-te21.onrender.com/api/chat"

      this.apiKey = "wOXvhtYLiFuxezWqdRlR:bUGDDsaBJqsVYhFOSibD"
      this.appId = "84c87cc1"
  
      this.conversationHistory = []
  
      this.setupEventListeners()
    }
  
    setupEventListeners() {
      this.sendButton.addEventListener("click", () => this.sendMessage())
  
      this.inputElement.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.sendMessage()
        }
      })
    }
  
    async sendMessage() {
      const message = this.inputElement.value.trim()
      if (!message) return
  
      // Add user message to chat
      this.addMessage(message, "user")
      this.inputElement.value = ""
  
      // Show typing indicator
      const typingId = this.showTypingIndicator()
  
      try {
        // Call API
        const response = await this.callChatAPI(message)
  
        // Remove typing indicator
        this.removeTypingIndicator(typingId)
  
        // Add bot response
        this.addMessage(response, "bot")
      } catch (error) {
        console.error("Chat API error:", error)
        this.removeTypingIndicator(typingId)
        this.addMessage("喵~ 抱歉，我现在有点累了，稍后再聊好吗？", "bot")
      }
    }
  
    async callChatAPI(userMessage) {
      // 添加用户消息到本地历史
      this.conversationHistory.push({
        role: "user",
        content: userMessage,
      });
    
      // 保留最近 10 条消息
      const messagesToSend = this.conversationHistory.slice(-10);
    
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: messagesToSend }),
      });
    
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
    
      const data = await response.json();
      const botMessage = data.choices[0].message.content;
    
      // 添加 AI 回复到本地历史
      this.conversationHistory.push({
        role: "assistant",
        content: botMessage,
      });
    
      return botMessage;
    }

  
    addMessage(text, sender) {
      const messageDiv = document.createElement("div")
      messageDiv.className = `chat-message ${sender}`
  
      const avatar = document.createElement("div")
      avatar.className = "message-avatar"
      avatar.textContent = sender === "bot" ? "🐱" : "👤"
  
      const content = document.createElement("div")
      content.className = "message-content"
  
      const textDiv = document.createElement("div")
      textDiv.className = "message-text"
      textDiv.textContent = text
  
      content.appendChild(textDiv)
      messageDiv.appendChild(avatar)
      messageDiv.appendChild(content)
  
      this.messagesContainer.appendChild(messageDiv)
      this.scrollToBottom()
    }
  
    showTypingIndicator() {
      const typingDiv = document.createElement("div")
      typingDiv.className = "chat-message bot typing-indicator"
      typingDiv.id = "typing-" + Date.now()
  
      const avatar = document.createElement("div")
      avatar.className = "message-avatar"
      avatar.textContent = "🐱"
  
      const content = document.createElement("div")
      content.className = "message-content"
  
      const dots = document.createElement("div")
      dots.className = "typing-dots"
      dots.innerHTML = "<span></span><span></span><span></span>"
  
      content.appendChild(dots)
      typingDiv.appendChild(avatar)
      typingDiv.appendChild(content)
  
      this.messagesContainer.appendChild(typingDiv)
      this.scrollToBottom()
  
      return typingDiv.id
    }
  
    removeTypingIndicator(id) {
      const indicator = document.getElementById(id)
      if (indicator) {
        indicator.remove()
      }
    }
  
    scrollToBottom() {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight
    }
  }
  
  // Initialize chat when page loads
  window.addEventListener("DOMContentLoaded", () => {
    new CatChat()
  })
  
