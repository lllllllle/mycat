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
      // Add user message to history
      this.conversationHistory.push({
        role: "user",
        content: userMessage,
      })
  
      // Keep only last 10 messages to avoid token limit
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10)
      }
  
      const requestBody = {
        model: "lite", // Changed from "generalv3.5" to "lite"
        messages: [
          {
            role: "system",
            content:
              '你是一只可爱的小猫咪，你现在在和"老大"对话。你喜欢用"喵"结尾说话，性格活泼可爱，喜欢撒娇,还有些笨笨的。你会用简短、可爱的语言回答问题，偶尔会提到猫咪喜欢的事物（如蛋糕、玩具、晒太阳等）。用"窝"或"咪"替代"我","老大"或"泥"替代"你",用"水饺"替代"睡觉",用"素"代替"是".回答要简洁，不超过50字。',
          },
          ...this.conversationHistory,
        ],
        max_tokens: 4096, // Increased from 100 to 4096
        top_k: 4, // Added top_k parameter
        temperature: 0.5, // Changed from 0.8 to 0.5
        stream: true,
      }
  
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })
  
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }
  
      const data = await response.json()
      const botMessage = data.choices[0].message.content
  
      // Add bot response to history
      this.conversationHistory.push({
        role: "assistant",
        content: botMessage,
      })
  
      return botMessage
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
  
