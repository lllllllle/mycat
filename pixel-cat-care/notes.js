// 留言板功能
class NotesApp {
  constructor() {
    this.notes = this.loadNotes()
    this.init()
  }

  loadNotes() {
    const saved = localStorage.getItem("catCareNotes")
    return saved ? JSON.parse(saved) : []
  }

  saveNotes() {
    localStorage.setItem("catCareNotes", JSON.stringify(this.notes))
  }

  init() {
    this.renderNotes()
    this.bindEvents()
  }

  bindEvents() {
    // 返回按钮
    document.getElementById("back-btn").addEventListener("click", () => {
      this.setReturnFlag()
      window.location.href = "index.html"
    })

    // 添加便签
    document.getElementById("add-note-btn").addEventListener("click", () => {
      this.addNote()
    })

    // 回车添加
    document.getElementById("note-input").addEventListener("keypress", (e) => {
      if (e.key === "Enter" && e.ctrlKey) {
        this.addNote()
      }
    })
  }

  addNote() {
    const input = document.getElementById("note-input")
    const content = input.value.trim()

    if (!content) {
      alert("请输入留言内容！")
      return
    }

    const note = {
      id: Date.now(),
      content: content,
      createdAt: new Date().toISOString(),
    }

    this.notes.unshift(note)
    this.saveNotes()
    this.renderNotes()

    input.value = ""
  }

  deleteNote(id) {
    if (confirm("确定要删除这条留言吗？")) {
      this.notes = this.notes.filter((note) => note.id !== id)
      this.saveNotes()
      this.renderNotes()
    }
  }

  renderNotes() {
    const grid = document.getElementById("notes-grid")

    if (this.notes.length === 0) {
      grid.innerHTML =
        '<p style="color: white; text-align: center; grid-column: 1/-1;">还没有留言，快来添加第一条吧！</p>'
      return
    }

    // 随机颜色
    const colors = ["#fff9c4", "#ffccbc", "#c5e1a5", "#b3e5fc", "#f8bbd0", "#d1c4e9"]

    grid.innerHTML = this.notes
      .map((note, index) => {
        const color = colors[index % colors.length]
        const date = new Date(note.createdAt).toLocaleString("zh-CN")
        return `
        <div class="note-card" style="background: ${color}">
          <button class="note-delete" onclick="notesApp.deleteNote(${note.id})">×</button>
          <div class="note-content">${this.escapeHtml(note.content)}</div>
          <div style="font-size: 7px; color: #666; margin-top: 10px;">${date}</div>
        </div>
      `
      })
      .join("")
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  setReturnFlag() {
    const data = JSON.parse(localStorage.getItem("catCareData") || "{}")
    data.returnFrom = "notes"
    localStorage.setItem("catCareData", JSON.stringify(data))
  }
}

// 启动应用
let notesApp
document.addEventListener("DOMContentLoaded", () => {
  notesApp = new NotesApp()
})
