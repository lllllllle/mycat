// 像素风猫咪绘制系统
// =============================
// 像素风猫咪绘制系统 v2
// =============================
class PixelCat {
  constructor(canvas, color = "black") {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")
    this.color = color
    this.pixelSize = Math.floor(canvas.width / 32) // 根据画布大小自适应像素块
    this.animationFrame = 0
    this.isBlinking = false
    this._stop = false
  }

  // 配色方案
  // ==============================
  // 获取配色方案（含暹罗脸部棕圈）
  // ==============================
  getColors() {
    const colorSchemes = {
      black: {
        primary: "#2c3e50",    // 主色 - 深灰黑
        secondary: "#34495e",  // 次色 - 深蓝灰
        accent: "#ecf0f1",     // 耳朵/嘴巴/胡须装饰
        nose: "#e74c3c",       // 鼻子
        eyes: "#f1c40f",       // 黄色眼睛
      },
      white: {
        primary: "#ecf0f1",    // 主色 - 白
        secondary: "#bdc3c7",  // 次色 - 浅灰
        accent: "#34495e",     // 装饰
        nose: "#ffb6c1",       // 粉色鼻
        eyes: "#3498db",       // 蓝色眼
      },
      siamese: {
        primary: "#f5f5dc",    // 米白身体
        secondary: "#8b5a2b",  // 棕色脸部圈
        accent: "#8b4513",     // 嘴部、胡须
        nose: "#d2691e",       // 棕红鼻
        eyes: "#4169e1",       // 蓝眼睛
      },
    }
    return colorSchemes[this.color] || colorSchemes.black
  }

  // ==============================
  // 绘制猫咪（新增暹罗棕圈逻辑）
  // ==============================
  draw() {
    this.clear()
    const colors = this.getColors()
    const cx = Math.floor(this.canvas.width / this.pixelSize / 2)
    const cy = Math.floor(this.canvas.height / this.pixelSize / 2)
    const isSiamese = this.color === "siamese"
  
    // 猫身体基础像素结构
    const pattern = [
      // 耳朵
      [
        [-4, -8], [-3, -8], [3, -8], [4, -8],
        [-4, -7], [-3, -7], [3, -7], [4, -7],
      ],
      // 头部与身体
      [
        [-5, -6], [-4, -6], [-3, -6], [-2, -6], [-1, -6], [0, -6],
        [1, -6], [2, -6], [3, -6], [4, -6], [5, -6],
      ],
      [
        [-5, -5], [-4, -5], [-3, -5], [-2, -5], [-1, -5], [0, -5],
        [1, -5], [2, -5], [3, -5], [4, -5], [5, -5],
      ],
      [
        [-5, -4], [-4, -4], [-3, -4], [-2, -4], [-1, -4], [0, -4],
        [1, -4], [2, -4], [3, -4], [4, -4], [5, -4],
      ],
      [
        [-5, -3], [-4, -3], [-3, -3], [-2, -3], [-1, -3], [0, -3],
        [1, -3], [2, -3], [3, -3], [4, -3], [5, -3],
      ],
      [
        [-4, -2], [-3, -2], [-2, -2], [-1, -2], [0, -2],
        [1, -2], [2, -2], [3, -2], [4, -2],
      ],
      [
        [-4, -1], [-3, -1], [-2, -1], [-1, -1], [0, -1],
        [1, -1], [2, -1], [3, -1], [4, -1],
      ],
      [
        [-4, 0], [-3, 0], [-2, 0], [-1, 0], [0, 0],
        [1, 0], [2, 0], [3, 0], [4, 0],
      ],
      [
        [-4, 1], [-3, 1], [-2, 1], [-1, 1], [0, 1],
        [1, 1], [2, 1], [3, 1], [4, 1],
      ],
      [
        [-4, 2], [-3, 2], [-2, 2], [-1, 2], [0, 2],
        [1, 2], [2, 2], [3, 2], [4, 2],
      ],
      // 腿
      [
        [-3, 3], [-2, 3], [2, 3], [3, 3],
      ],
      [
        [-3, 4], [-2, 4], [2, 4], [3, 4],
      ],
    ]
  
    // 绘制主体
    pattern.forEach((row) => {
      row.forEach(([x, y]) => {
        let fillColor = colors.primary
  
        // ✅ 暹罗脸部棕圈规则：
        // 1. 不覆盖耳朵（y < -7 保留米白）
        // 2. 在头部下方开始（y <= -4）
        // 3. 在最上方头部行 (-6) 留一行米白过渡
        if (isSiamese && y <= -2 && y > -6 && Math.abs(x) <= 3) {
          fillColor = colors.secondary
        }
  
        this.drawPixel(cx + x, cy + y, fillColor)
      })
    })
  
    // 耳朵内部（白色高光）
    this.drawPixel(cx - 3, cy - 7, colors.accent)
    this.drawPixel(cx + 3, cy - 7, colors.accent)
  
    // 眼睛（眨眼动画控制）
    if (!this.isBlinking) {
      this.drawPixel(cx - 2, cy - 4, colors.eyes)
      this.drawPixel(cx + 2, cy - 4, colors.eyes)
    } else {
      this.drawPixel(cx - 2, cy - 4, colors.primary)
      this.drawPixel(cx + 2, cy - 4, colors.primary)
    }
  
    // 鼻子
    this.drawPixel(cx, cy - 2, colors.nose)
  
    // 嘴巴
    this.drawPixel(cx - 1, cy - 1, colors.accent)
    this.drawPixel(cx + 1, cy - 1, colors.accent)
  
    // 胡须
    const whisker = colors.accent
    this.drawPixel(cx - 6, cy - 3, whisker)
    this.drawPixel(cx - 7, cy - 3, whisker)
    this.drawPixel(cx - 6, cy - 2, whisker)
    this.drawPixel(cx - 7, cy - 2, whisker)
    this.drawPixel(cx + 6, cy - 3, whisker)
    this.drawPixel(cx + 7, cy - 3, whisker)
    this.drawPixel(cx + 6, cy - 2, whisker)
    this.drawPixel(cx + 7, cy - 2, whisker)
  
    // 尾巴
    const tailPattern = [
      [5, 0], [6, 0], [7, 0],
      [6, -1], [7, -1],
      [7, -2], [8, -2],
    ]
    tailPattern.forEach(([x, y]) =>
      this.drawPixel(cx + x, cy + y, colors.secondary)
    )
  }

  // 绘制单个像素
  drawPixel(x, y, color) {
    this.ctx.fillStyle = color
    this.ctx.fillRect(
      x * this.pixelSize,
      y * this.pixelSize,
      this.pixelSize,
      this.pixelSize
    )
  }

  // 清空画布
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }



  // 工具函数：整数范围
  range(start, end) {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  // 颜色混合（用于尾巴渐变）
  mixColor(color1, color2, weight = 0.5) {
    const hex = (c) => c.replace("#", "")
    const c1 = hex(color1)
    const c2 = hex(color2)
    const rgb = [0, 2, 4].map((i) =>
      Math.round(
        parseInt(c1.substring(i, i + 2), 16) * (1 - weight) +
          parseInt(c2.substring(i, i + 2), 16) * weight
      )
    )
    return `rgb(${rgb.join(",")})`
  }

  // 眨眼动画
  startBlinking() {
    this.isBlinking = true
    this.draw()
    setTimeout(() => {
      this.isBlinking = false
      this.draw()
    }, 150)
  }

  // 变更花色
  changeColor(newColor) {
    this.color = newColor
    this.draw()
  }

  // 动画循环
  animate() {
    if (this._stop) return
    if (Math.random() < 0.008) this.startBlinking()
    this.animationFrame++
    requestAnimationFrame(() => this.animate())
  }

  // 停止动画（防内存泄漏）
  stop() {
    this._stop = true
  }
}

// 导出供模块系统或浏览器使用
if (typeof module !== "undefined" && module.exports) {
  module.exports = PixelCat
} else {
  window.PixelCat = PixelCat
}


// 导出供其他文件使用
if (typeof module !== "undefined" && module.exports) {
  module.exports = PixelCat
}
