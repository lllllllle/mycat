// 主应用逻辑
class CatCareApp {
  constructor() {
    this.cat = null
    this.data = this.loadData()
    this.init()
  }

  // 加载数据
  loadData() {
    const defaultData = {
      catName: "",
      catColor: "black",
      stats: {
        hunger: 100,
        thirst: 100,
        clean: 100,
        mood: 100,
        intimacy: 100,
      },
      firstVisit: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      visitDays: new Set([new Date().toDateString()]),
      lastNameChange: null,
      lastColorChange: null,
      interactionLog: [],
      returnFrom: null,
    }

    const saved = localStorage.getItem("catCareData")
    if (saved) {
      const parsed = JSON.parse(saved)
      // 转换 visitDays 从数组回 Set
      parsed.visitDays = new Set(parsed.visitDays || [])
      return parsed
    }
    return defaultData
  }

  // 保存数据
  saveData() {
    const toSave = {
      ...this.data,
      visitDays: Array.from(this.data.visitDays),
    }
    localStorage.setItem("catCareData", JSON.stringify(toSave))
  }

  // 初始化
  init() {
    // 检查是否首次访问
    if (!this.data.catName) {
      this.showInitScreen()
    } else {
      this.showMainScreen()
    }
  }

  // 显示初始化界面
  showInitScreen() {
    const initScreen = document.getElementById("init-screen")
    const mainScreen = document.getElementById("main-screen")
    initScreen.classList.remove("hidden")
    mainScreen.classList.add("hidden")

    // 初始化预览猫咪
    const previewCanvas = document.getElementById("preview-canvas")
    this.previewCat = new PixelCat(previewCanvas, "black")
    this.previewCat.draw()

    // 花色选择
    const colorBtns = document.querySelectorAll(".color-btn")
    colorBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        colorBtns.forEach((b) => b.classList.remove("active"))
        btn.classList.add("active")
        const color = btn.dataset.color
        this.previewCat.changeColor(color)
      })
    })

    // 开始按钮
    document.getElementById("start-btn").addEventListener("click", () => {
      const nameInput = document.getElementById("cat-name-input")
      const name = nameInput.value.trim()

      if (!name) {
        alert("请给猫咪起个名字吧！")
        return
      }

      const activeColorBtn = document.querySelector(".color-btn.active")
      const color = activeColorBtn.dataset.color

      this.data.catName = name
      this.data.catColor = color
      this.data.firstVisit = new Date().toISOString()
      this.data.lastVisit = new Date().toISOString()
      this.data.visitDays = new Set([new Date().toDateString()])
      this.saveData()

      this.showMainScreen()
    })
  }

  // 显示主界面
  showMainScreen() {
    const initScreen = document.getElementById("init-screen")
    const mainScreen = document.getElementById("main-screen")
    initScreen.classList.add("hidden")
    mainScreen.classList.remove("hidden")

    // 更新访问信息
    this.updateVisitInfo()

    // 初始化猫咪
    const catCanvas = document.getElementById("cat-canvas")
    this.cat = new PixelCat(catCanvas, this.data.catColor)
    this.cat.draw()
    this.cat.animate()

    // 显示猫咪名字
    document.getElementById("cat-name-display").textContent = this.data.catName

    // 显示猫咪对话
    this.showCatSpeech()

    // 更新状态显示
    this.updateStats()

    // 绑定事件
    this.bindEvents()

    // 显示互动记录
    this.updateInteractionLog()

    // 开始状态衰减
    this.startStatDecay()
  }

  // 更新访问信息
  updateVisitInfo() {
    const now = new Date()
    const lastVisit = new Date(this.data.lastVisit)
    const today = now.toDateString()

    // 更新累计访问天数
    this.data.visitDays.add(today)

    // 计算上次访问时间
    const timeDiff = now - lastVisit
    const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60))
    const daysDiff = Math.floor(hoursDiff / 24)

    let lastVisitText = "刚刚"
    if (daysDiff > 0) {
      lastVisitText = `${daysDiff}天前`
    } else if (hoursDiff > 0) {
      lastVisitText = `${hoursDiff}小时前`
    } else {
      const minutesDiff = Math.floor(timeDiff / (1000 * 60))
      if (minutesDiff > 0) {
        lastVisitText = `${minutesDiff}分钟前`
      }
    }

    // 更新显示
    document.getElementById("current-date").textContent = now.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    })
    document.getElementById("total-days").textContent = `累计访问: ${this.data.visitDays.size}天`
    document.getElementById("last-visit").textContent = `上次访问: ${lastVisitText}`

    // 更新最后访问时间
    this.data.lastVisit = now.toISOString()
    this.saveData()
  }

  // 显示猫咪对话
  showCatSpeech() {
    const speechElement = document.getElementById("cat-speech")
    const now = new Date()
    const lastVisit = new Date(this.data.lastVisit)
    const hoursDiff = Math.floor((now - lastVisit) / (1000 * 60 * 60))

    let speeches = []

    // 根据返回来源说话
    if (this.data.returnFrom) {
      const returnSpeeches = {
        notes: ["老大有没有偷偷说小猫坏话喵！", "窝也想偷偷看老大写了什么喵", "（踮脚）看不到……"],
        tasks: ["老大是不是又赶ddl了喵", "老大今天记得给小猫铁了吗", "老大今天记得背单词了吗"],
        diary: ["唔……老大今天开心吗", "又过了开心的一天喵！", "咪要偷偷在日记里写，老大欺负窝……"],
      }
      speeches = returnSpeeches[this.data.returnFrom] || []
      this.data.returnFrom = null
      this.saveData()
    } else if (hoursDiff > 24) {
      speeches = [
        `咪已经，等了老大${Math.floor(hoursDiff / 24)}天了！`,
        "咪还以为老大不要笨笨猫了……",
        "咪就这样，等待……",
      ]
    } else if (24 >= hoursDiff > 12) {
      speeches = ["老大回来了喵！", "好无聊——来陪窝玩——", "等的好困……要水饺……"]
    } else if (12 >= hoursDiff > 6) {
      speeches = ["巴巴拉巴巴！小咪之家，喜欢您来！", "咪，刚好醒来！", "老大，来陪窝玩喵！"]
    } else if (6 >= hoursDiff > 1) {
      speeches = ["老大来是想欣赏豆泥吗", "呼——呼——（水饺中）", "陪窝玩！"]
    } else {
      speeches = ["老大来了喵！", "陪窝玩！", "（哼歌）", "咪咪喵喵，喵喵咪咪~"]
    }

    const randomSpeech = speeches[Math.floor(Math.random() * speeches.length)]
    speechElement.textContent = randomSpeech
  }

  // 更新状态显示
  updateStats() {
    const statNames = {
      hunger: "饥饿值",
      thirst: "口渴值",
      clean: "清洁度",
      mood: "心情值",
      intimacy: "亲密度",
    }

    const stats = Object.keys(this.data.stats)
    stats.forEach((stat) => {
      const value = Math.max(0, Math.min(100, this.data.stats[stat]))
      const name = statNames[stat]
      const valueEl = document.getElementById(`${stat}-value`)
      valueEl.textContent = `${name}: ${Math.round(value)}`
      const bar = document.getElementById(`${stat}-bar`)
      bar.style.width = `${value}%`

      if (value < 30) {
        bar.style.background = "linear-gradient(90deg, #e74c3c, #c0392b)"
      } else if (value < 60) {
        bar.style.background = "linear-gradient(90deg, #f39c12, #e67e22)"
      } else {
        bar.style.background = "linear-gradient(90deg, #4caf50, #8bc34a)"
      }
    })
  }


  // 绑定事件
  bindEvents() {
    // 点击猫咪说话
    document.getElementById("cat-canvas").addEventListener("click", () => {
      const speeches = [
        "喵～",
        "不要，摸头喵……",
        "（躲过）",
        "今天，头发很好摸喵！",
        "头油油的……",
        "陪窝玩！",
        "窝饿了...",
        "好开心！",
        "老大，要干正事喵！",
      ]
      const randomSpeech = speeches[Math.floor(Math.random() * speeches.length)]
      document.getElementById("cat-speech").textContent = randomSpeech

      // 增加亲密度
      this.data.stats.intimacy = Math.min(100, this.data.stats.intimacy + 1)
      this.updateStats()
      this.saveData()
    })

    // 互动按钮
    document.querySelectorAll(".action-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action
        this.performAction(action)
      })
    })

    // 设置按钮
    document.getElementById("settings-btn").addEventListener("click", () => {
      this.showSettings()
    })

    // 导航按钮
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const page = btn.dataset.page
        window.location.href = `${page}.html`
      })
    })
  }

  // 执行互动
  performAction(action) {
    const actions = {
      "feed-fish": {
        name: "喂了蛋糕",
        effects: { hunger: 15, thirst: -5, mood: 10, intimacy: 5 },
        speech: ["（嚼嚼）", "窝喜欢吃小蛋糕！", "窝明天还要吃！"],
      },
      "feed-food": {
        name: "喂了猫粮",
        effects: { hunger: 20, thirst: -10, mood: 5, intimacy: 3 },
        speech: ["咪要吃蛋糕……咪不要吃这个……", "窝吃饱了！", "明天吃什么呢（思考）"],
      },
      "feed-can": {
        name: "喂了罐头",
        effects: { hunger: 30, thirst: 5, mood: 15, intimacy: 10 },
        speech: ["窝喜欢吃罐罐！", "太好吃了！", "你对我真好！"],
      },
      water: {
        name: "加了水",
        effects: { thirst: 30, clean: 5, mood: 5, intimacy: 3 },
        speech: ["咪，讨厌喝水……", "窝要喝小饮料！", "（咕嘟咕嘟）"],
      },
      bath: {
        name: "洗了澡",
        effects: { clean: 40, mood: -10, thirst: 10, intimacy: 5 },
        speech: ["窝不要洗澡！", "脑袋湿漉漉...", "吹干，头发蓬蓬的……"],
      },
      play: {
        name: "逗猫玩",
        effects: { mood: 20, hunger: -10, thirst: -10, intimacy: 15 },
        speech: ["窝喜欢和老大玩！", "窝还要玩！", "（露肚皮）"],
      },
    }

    const actionData = actions[action]
    if (!actionData) return

    // 应用效果
    Object.keys(actionData.effects).forEach((stat) => {
      this.data.stats[stat] = Math.max(0, Math.min(100, this.data.stats[stat] + actionData.effects[stat]))
    })

    // 显示对话
    const randomSpeech = actionData.speech[Math.floor(Math.random() * actionData.speech.length)]
    document.getElementById("cat-speech").textContent = randomSpeech

    // 记录互动
    const now = new Date()

    // 生成数值变化说明
    const changeText = Object.entries(actionData.effects)
      .map(([k, v]) => {
        const map = {
          hunger: "饥饿",
          thirst: "口渴",
          clean: "清洁",
          mood: "心情",
          intimacy: "亲密度",
        }
        const sign = v >= 0 ? "+" : ""
        return `${map[k]} ${sign}${v}`
      })
      .join("，")

    this.data.interactionLog.unshift({
      action: `${actionData.name}（${changeText}）`,
      time: now.toLocaleString("zh-CN"),
      timestamp: now.toISOString(),
    })

    // 只保留最近20条记录
    if (this.data.interactionLog.length > 20) {
      this.data.interactionLog = this.data.interactionLog.slice(0, 20)
    }

    this.updateStats()
    this.updateInteractionLog()
    this.saveData()
  }

  // 更新互动记录
  updateInteractionLog() {
    const logContent = document.getElementById("log-content")
    if (this.data.interactionLog.length === 0) {
      logContent.innerHTML = '<p style="color: #999; text-align: center;">还没有互动记录</p>'
      return
    }

    logContent.innerHTML = this.data.interactionLog
      .map(
        (log) => `
      <div class="log-entry">
        <strong>${log.action}</strong> - ${log.time}
      </div>
    `,
      )
      .join("")
  }

  // 状态衰减
  startStatDecay() {
    setInterval(() => {
      // 每分钟衰减一次
      this.data.stats.hunger = Math.max(0, this.data.stats.hunger - 0.5)
      this.data.stats.thirst = Math.max(0, this.data.stats.thirst - 0.7)
      this.data.stats.clean = Math.max(0, this.data.stats.clean - 0.3)

      // 根据其他状态影响心情
      const avgStat = (this.data.stats.hunger + this.data.stats.thirst + this.data.stats.clean) / 3
      if (avgStat < 50) {
        this.data.stats.mood = Math.max(0, this.data.stats.mood - 0.5)
      } else {
        this.data.stats.mood = Math.min(100, this.data.stats.mood + 0.1)
      }

      this.updateStats()
      this.saveData()
    }, 60000) // 每分钟
  }

  // 显示设置
  showSettings() {
    const modal = document.getElementById("settings-modal")
    modal.classList.remove("hidden")

    const renameInput = document.getElementById("rename-input")
    renameInput.value = this.data.catName

    // 检查是否可以改名
    const canRename = this.canChangeName()
    const renameHint = document.getElementById("rename-hint")
    if (!canRename) {
      const nextChange = new Date(this.data.lastNameChange)
      nextChange.setDate(nextChange.getDate() + 7)
      renameHint.textContent = `下次可改名时间: ${nextChange.toLocaleDateString("zh-CN")}`
      renameHint.style.color = "#e74c3c"
    } else {
      renameHint.textContent = "可以改名"
      renameHint.style.color = "#27ae60"
    }

    // 检查是否可以换花色
    const canChangeColor = this.canChangeColor()
    const colorHint = document.getElementById("color-hint")
    if (!canChangeColor) {
      const nextChange = new Date(this.data.lastColorChange)
      nextChange.setDate(nextChange.getDate() + 7)
      colorHint.textContent = `下次可换花色时间: ${nextChange.toLocaleDateString("zh-CN")}`
      colorHint.style.color = "#e74c3c"
    } else {
      colorHint.textContent = "可以换花色"
      colorHint.style.color = "#27ae60"
    }

    // 设置当前花色
    const colorBtns = document.querySelectorAll("#settings-modal .color-btn")
    colorBtns.forEach((btn) => {
      btn.classList.remove("active")
      if (btn.dataset.color === this.data.catColor) {
        btn.classList.add("active")
      }

      btn.addEventListener("click", () => {
        if (canChangeColor) {
          colorBtns.forEach((b) => b.classList.remove("active"))
          btn.classList.add("active")
        }
      })
    })

    // 保存设置
    document.getElementById("save-settings-btn").onclick = () => {
      const newName = renameInput.value.trim()
      if (newName && canRename && newName !== this.data.catName) {
        this.data.catName = newName
        this.data.lastNameChange = new Date().toISOString()
        document.getElementById("cat-name-display").textContent = newName
      }

      const activeColorBtn = document.querySelector("#settings-modal .color-btn.active")
      const newColor = activeColorBtn.dataset.color
      if (canChangeColor && newColor !== this.data.catColor) {
        this.data.catColor = newColor
        this.data.lastColorChange = new Date().toISOString()
        this.cat.changeColor(newColor)
      }

      this.saveData()
      modal.classList.add("hidden")
    }

    // 关闭设置
    document.getElementById("close-settings-btn").onclick = () => {
      modal.classList.add("hidden")
    }
  }

  // 检查是否可以改名
  canChangeName() {
    if (!this.data.lastNameChange) return true
    const lastChange = new Date(this.data.lastNameChange)
    const now = new Date()
    const daysDiff = (now - lastChange) / (1000 * 60 * 60 * 24)
    return daysDiff >= 7
  }

  // 检查是否可以换花色
  canChangeColor() {
    if (!this.data.lastColorChange) return true
    const lastChange = new Date(this.data.lastColorChange)
    const now = new Date()
    const daysDiff = (now - lastChange) / (1000 * 60 * 60 * 24)
    return daysDiff >= 7
  }
}

// 启动应用
document.addEventListener("DOMContentLoaded", () => {
  new CatCareApp()
})


