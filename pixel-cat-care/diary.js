// 日记本功能
class DiaryApp {
  constructor() {
    this.diaries = this.loadDiaries()
    this.currentMood = null
    this.init()
  }

  loadDiaries() {
    const saved = localStorage.getItem("catCareDiaries")
    return saved ? JSON.parse(saved) : []
  }

  saveDiaries() {
    localStorage.setItem("catCareDiaries", JSON.stringify(this.diaries))
  }

  init() {
    // 设置默认日期为今天
    const today = new Date().toISOString().split("T")[0]
    document.getElementById("diary-date").value = today

    this.renderDiaries()
    this.bindEvents()
  }

  bindEvents() {
    // 返回按钮
    document.getElementById("back-btn").addEventListener("click", () => {
      this.setReturnFlag()
      window.location.href = "index.html"
    })

    // 心情选择
    document.querySelectorAll(".mood-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".mood-btn").forEach((b) => b.classList.remove("active"))
        btn.classList.add("active")
        this.currentMood = btn.dataset.mood
      })
    })

    // 保存日记
    document.getElementById("save-diary-btn").addEventListener("click", () => {
      this.saveDiary()
    })

    // 日期改变时加载对应日记
    document.getElementById("diary-date").addEventListener("change", (e) => {
      this.loadDiaryForDate(e.target.value)
    })
  }

  saveDiary() {
    const dateInput = document.getElementById("diary-date")
    const contentInput = document.getElementById("diary-content")
    const date = dateInput.value
    const content = contentInput.value.trim()

    if (!date) {
      alert("请选择日期！")
      return
    }

    if (!this.currentMood) {
      alert("请选择今天的心情！")
      return
    }

    if (!content) {
      alert("请输入日记内容！")
      return
    }

    // 检查是否已存在该日期的日记
    const existingIndex = this.diaries.findIndex((d) => d.date === date)

    const diary = {
      date: date,
      mood: this.currentMood,
      content: content,
      updatedAt: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      // 更新现有日记
      if (confirm("该日期已有日记，是否覆盖？")) {
        this.diaries[existingIndex] = diary
      } else {
        return
      }
    } else {
      // 添加新日记
      this.diaries.push(diary)
    }

    // 按日期排序（最新的在前）
    this.diaries.sort((a, b) => new Date(b.date) - new Date(a.date))

    this.saveDiaries()
    this.renderDiaries()

    alert("日记保存成功！")
  }

  loadDiaryForDate(date) {
    const diary = this.diaries.find((d) => d.date === date)

    if (diary) {
      // 加载现有日记
      document.getElementById("diary-content").value = diary.content

      // 设置心情
      document.querySelectorAll(".mood-btn").forEach((btn) => {
        btn.classList.remove("active")
        if (btn.dataset.mood === diary.mood) {
          btn.classList.add("active")
        }
      })
      this.currentMood = diary.mood
    } else {
      // 清空编辑器
      document.getElementById("diary-content").value = ""
      document.querySelectorAll(".mood-btn").forEach((btn) => btn.classList.remove("active"))
      this.currentMood = null
    }
  }

  renderDiaries() {
    const entries = document.getElementById("diary-entries")

    if (this.diaries.length === 0) {
      entries.innerHTML = '<p style="color: #999; text-align: center;">还没有日记，开始记录吧！</p>'
      return
    }

    const moodEmojis = {
      happy: "😊",
      sad: "😢",
      excited: "🤩",
      tired: "😴",
      angry: "😠",
      calm: "😌",
    }

    entries.innerHTML = this.diaries
      .map((diary) => {
        const date = new Date(diary.date).toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
        const preview = diary.content.substring(0, 50) + (diary.content.length > 50 ? "..." : "")

        return `
        <div class="diary-entry" onclick="diaryApp.viewDiary('${diary.date}')">
          <div class="diary-entry-header">
            <span class="diary-entry-date">${date}</span>
            <span class="diary-entry-mood">${moodEmojis[diary.mood]}</span>
          </div>
          <div class="diary-entry-preview">${this.escapeHtml(preview)}</div>
        </div>
      `
      })
      .join("")
  }

  viewDiary(date) {
    document.getElementById("diary-date").value = date
    this.loadDiaryForDate(date)

    // 滚动到编辑器
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  setReturnFlag() {
    const data = JSON.parse(localStorage.getItem("catCareData") || "{}")
    data.returnFrom = "diary"
    localStorage.setItem("catCareData", JSON.stringify(data))
  }
}

// 启动应用
let diaryApp
document.addEventListener("DOMContentLoaded", () => {
  diaryApp = new DiaryApp()
})
