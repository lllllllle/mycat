// 计划表功能
class TasksApp {
  constructor() {
    this.tasks = this.loadTasks()
    this.init()
  }

  loadTasks() {
    const saved = localStorage.getItem("catCareTasks")
    return saved ? JSON.parse(saved) : []
  }

  saveTasks() {
    localStorage.setItem("catCareTasks", JSON.stringify(this.tasks))
  }

  init() {
    this.renderTasks()
    this.bindEvents()
  }

  bindEvents() {
    // 返回按钮
    document.getElementById("back-btn").addEventListener("click", () => {
      this.setReturnFlag()
      window.location.href = "index.html"
    })

    // 添加任务
    document.getElementById("add-task-btn").addEventListener("click", () => {
      this.addTask()
    })

    // 回车添加
    document.getElementById("task-input").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.addTask()
      }
    })
  }

  addTask() {
    const input = document.getElementById("task-input")
    const prioritySelect = document.getElementById("priority-select")
    const text = input.value.trim()
    const priority = prioritySelect.value

    if (!text) {
      alert("请输入任务内容！")
      return
    }

    const task = {
      id: Date.now(),
      text: text,
      priority: priority,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    this.tasks.push(task)
    this.saveTasks()
    this.renderTasks()

    input.value = ""
  }

  toggleTask(id) {
    const task = this.tasks.find((t) => t.id === id)
    if (task) {
      task.completed = !task.completed
      this.saveTasks()
      this.renderTasks()
    }
  }

  deleteTask(id) {
    if (confirm("确定要删除这个任务吗？")) {
      this.tasks = this.tasks.filter((task) => task.id !== id)
      this.saveTasks()
      this.renderTasks()
    }
  }

  renderTasks() {
    const list = document.getElementById("tasks-list")

    if (this.tasks.length === 0) {
      list.innerHTML = '<p style="color: #999; text-align: center;">还没有任务，添加一个开始吧！</p>'
      return
    }

    // 按优先级和完成状态排序
    const sortedTasks = [...this.tasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

    const priorityText = {
      high: "紧急",
      medium: "重要",
      low: "普通",
    }

    list.innerHTML = sortedTasks
      .map(
        (task) => `
      <div class="task-item ${task.completed ? "completed" : ""}">
        <input 
          type="checkbox" 
          class="task-checkbox" 
          ${task.completed ? "checked" : ""}
          onchange="tasksApp.toggleTask(${task.id})"
        >
        <span class="task-priority ${task.priority}">${priorityText[task.priority]}</span>
        <span class="task-text">${this.escapeHtml(task.text)}</span>
        <button class="task-delete" onclick="tasksApp.deleteTask(${task.id})">×</button>
      </div>
    `,
      )
      .join("")
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  setReturnFlag() {
    const data = JSON.parse(localStorage.getItem("catCareData") || "{}")
    data.returnFrom = "tasks"
    localStorage.setItem("catCareData", JSON.stringify(data))
  }
}

// 启动应用
let tasksApp
document.addEventListener("DOMContentLoaded", () => {
  tasksApp = new TasksApp()
})
