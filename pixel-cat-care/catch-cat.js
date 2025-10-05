class CatchCatGame {
    constructor() {
      this.canvas = document.getElementById("game-canvas")
      this.ctx = this.canvas.getContext("2d")
      this.gridSize = 11 // 11x11 grid
      this.cellSize = 50
      this.hexRadius = 22
  
      this.grid = []
      this.catPosition = null
      this.gameStarted = false
      this.gameOver = false
      this.fenceCount = 0
      this.catMoves = 0
  
      this.initGrid()
      this.setupEventListeners()
      this.draw()
    }
  
    initGrid() {
      // Initialize grid with empty cells
      this.grid = []
      for (let row = 0; row < this.gridSize; row++) {
        this.grid[row] = []
        for (let col = 0; col < this.gridSize; col++) {
          this.grid[row][col] = {
            row,
            col,
            isFence: false,
            isCat: false,
            isEdge: row === 0 || row === this.gridSize - 1 || col === 0 || col === this.gridSize - 1,
          }
        }
      }
  
      // Place cat in center
      const centerRow = Math.floor(this.gridSize / 2)
      const centerCol = Math.floor(this.gridSize / 2)
      this.catPosition = { row: centerRow, col: centerCol }
      this.grid[centerRow][centerCol].isCat = true
  
      // Add some random initial fences
      this.addRandomFences(8)
    }
  
    addRandomFences(count) {
      let added = 0
      while (added < count) {
        const row = Math.floor(Math.random() * this.gridSize)
        const col = Math.floor(Math.random() * this.gridSize)
        const cell = this.grid[row][col]
  
        if (!cell.isFence && !cell.isCat && !cell.isEdge) {
          cell.isFence = true
          added++
        }
      }
    }
  
    setupEventListeners() {
      this.canvas.addEventListener("click", (e) => this.handleClick(e))
  
      document.getElementById("start-game-btn").addEventListener("click", () => {
        this.startGame()
      })
  
      document.getElementById("reset-game-btn").addEventListener("click", () => {
        this.resetGame()
      })
    }
  
    startGame() {
      this.gameStarted = true
      this.gameOver = false
      this.updateStatus("游戏进行中...")
    }
  
    resetGame() {
      this.gameStarted = false
      this.gameOver = false
      this.fenceCount = 0
      this.catMoves = 0
      this.initGrid()
      this.draw()
      this.updateStatus("点击开始游戏")
      this.updateStats()
    }
  
    handleClick(e) {
      if (!this.gameStarted || this.gameOver) return
  
      const rect = this.canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
  
      const col = Math.floor(x / this.cellSize)
      const row = Math.floor(y / this.cellSize)
  
      if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
        const cell = this.grid[row][col]
  
        if (!cell.isFence && !cell.isCat && !cell.isEdge) {
          // Place fence
          cell.isFence = true
          this.fenceCount++
  
          // Move cat
          this.moveCat()
  
          // Check game state
          this.checkGameState()
  
          this.draw()
          this.updateStats()
        }
      }
    }
  
    moveCat() {
      const currentPos = this.catPosition
      const neighbors = this.getNeighbors(currentPos.row, currentPos.col)
  
      // Filter out fences and find valid moves
      const validMoves = neighbors.filter((n) => !this.grid[n.row][n.col].isFence)
  
      if (validMoves.length === 0) {
        // Cat is trapped!
        this.gameOver = true
        this.updateStatus("🎉 胜利！你成功抓住了小猫！")
        return
      }
  
      // Find shortest path to edge using BFS
      const targetMove = this.findBestMove(validMoves)
  
      // Move cat
      this.grid[currentPos.row][currentPos.col].isCat = false
      this.catPosition = targetMove
      this.grid[targetMove.row][targetMove.col].isCat = true
      this.catMoves++
    }
  
    findBestMove(validMoves) {
      // Simple strategy: move towards nearest edge
      let bestMove = validMoves[0]
      let minDistToEdge = this.distanceToEdge(bestMove.row, bestMove.col)
  
      for (const move of validMoves) {
        const dist = this.distanceToEdge(move.row, move.col)
        if (dist < minDistToEdge) {
          minDistToEdge = dist
          bestMove = move
        }
      }
  
      return bestMove
    }
  
    distanceToEdge(row, col) {
      return Math.min(row, col, this.gridSize - 1 - row, this.gridSize - 1 - col)
    }
  
    getNeighbors(row, col) {
      const neighbors = []
      const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1], // up, down, left, right
      ]
  
      for (const [dr, dc] of directions) {
        const newRow = row + dr
        const newCol = col + dc
  
        if (newRow >= 0 && newRow < this.gridSize && newCol >= 0 && newCol < this.gridSize) {
          neighbors.push({ row: newRow, col: newCol })
        }
      }
  
      return neighbors
    }
  
    checkGameState() {
      const catPos = this.catPosition
  
      // Check if cat reached edge
      if (this.grid[catPos.row][catPos.col].isEdge) {
        this.gameOver = true
        this.updateStatus("😿 失败！小猫逃走了！")
      }
    }
  
    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  
      // Draw grid
      for (let row = 0; row < this.gridSize; row++) {
        for (let col = 0; col < this.gridSize; col++) {
          const cell = this.grid[row][col]
          const x = col * this.cellSize
          const y = row * this.cellSize
  
          // Draw cell background
          if (cell.isFence) {
            this.ctx.fillStyle = "#ff69b4"
          } else if (cell.isEdge) {
            this.ctx.fillStyle = "#ffb3d9"
          } else {
            this.ctx.fillStyle = "#ffffff"
          }
  
          this.ctx.fillRect(x, y, this.cellSize, this.cellSize)
  
          // Draw cell border
          this.ctx.strokeStyle = "#d4b5e8"
          this.ctx.lineWidth = 2
          this.ctx.strokeRect(x, y, this.cellSize, this.cellSize)
  
          // Draw cat
          if (cell.isCat) {
            this.ctx.font = "32px Arial"
            this.ctx.textAlign = "center"
            this.ctx.textBaseline = "middle"
            this.ctx.fillText("🐱", x + this.cellSize / 2, y + this.cellSize / 2)
          }
        }
      }
    }
  
    updateStatus(text) {
      document.getElementById("game-status-text").textContent = text
    }
  
    updateStats() {
      document.getElementById("fence-count").textContent = this.fenceCount
      document.getElementById("cat-moves").textContent = this.catMoves
    }
  }
  
  // Initialize game when page loads
  window.addEventListener("DOMContentLoaded", () => {
    new CatchCatGame()
  })
  