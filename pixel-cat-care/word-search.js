class WordSearchGame {
    constructor() {
      this.gridSize = 10
      this.grid = []
      this.words = []
      this.foundWords = new Set()
      this.isSelecting = false
      this.selectedCells = []
      this.startTime = null
      this.timerInterval = null
      this.gameStarted = false
  
      this.wordBank = [
        "cat",
        "dog",
        "fish",
        "bird",
        "mouse",
        "love",
        "play",
        "food",
        "water",
        "sleep",
        "happy",
        "cute",
        "soft",
        "warm",
        "cozy",
        "purr",
        "meow",
        "paw",
        "tail",
        "fur",
        "milk",
        "toy",
        "ball",
        "yarn",
        "box",
        "bed",
        "home",
        "friend",
        "pet",
        "care",
        "jump",
        "run",
        "walk",
        "sit",
        "rest",
        "eat",
        "drink",
        "clean",
        "wash",
        "groom",
        "sun",
        "moon",
        "star",
        "sky",
        "tree",
        "grass",
        "flower",
        "leaf",
        "wind",
        "rain",
        "book",
        "pen",
        "desk",
        "chair",
        "lamp",
        "door",
        "window",
        "wall",
        "floor",
        "roof",
        "red",
        "blue",
        "pink",
        "green",
        "yellow",
        "white",
        "black",
        "gray",
        "brown",
        "orange",
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
        "nine",
        "ten",
        "day",
        "night",
        "time",
        "hour",
        "week",
        "year",
        "today",
        "now",
        "soon",
        "late",
        "good",
        "nice",
        "kind",
        "sweet",
        "cool",
        "fun",
        "joy",
        "smile",
        "laugh",
        "dream",
      ]
  
      this.colors = [
        "#ffb3d9",
        "#b3d9ff",
        "#d4b5e8",
        "#ffd9b3",
        "#b3ffb3",
        "#ffccff",
        "#ccffff",
        "#ffffcc",
        "#ffcccc",
        "#ccffcc",
      ]
  
      this.setupEventListeners()
    }
  
    setupEventListeners() {
      document.getElementById("start-word-game-btn").addEventListener("click", () => {
        this.startGame()
      })
  
      document.getElementById("reset-word-game-btn").addEventListener("click", () => {
        this.resetGame()
      })
    }
  
    startGame() {
      this.gameStarted = true
      this.initGame()
      this.startTimer()
    }
  
    resetGame() {
      this.gameStarted = false
      this.stopTimer()
      this.foundWords.clear()
      document.getElementById("letter-grid").innerHTML = ""
      document.getElementById("word-list").innerHTML = ""
      document.getElementById("timer").textContent = "00:00"
    }
  
    initGame() {
      // Select random words
      this.words = this.selectRandomWords(5 + Math.floor(Math.random() * 6)) // 5-10 words
  
      // Create empty grid
      this.grid = Array(this.gridSize)
        .fill(null)
        .map(() =>
          Array(this.gridSize)
            .fill(null)
            .map(() => ({
              letter: "",
              isWord: false,
              wordIndex: -1,
            })),
        )
  
      // Place words in grid
      this.placeWords()
  
      // Fill empty cells with random letters
      this.fillEmptyCells()
  
      // Render grid and word list
      this.renderGrid()
      this.renderWordList()
    }
  
    selectRandomWords(count) {
      const shuffled = [...this.wordBank].sort(() => Math.random() - 0.5)
      return shuffled.slice(0, count)
    }
  
    placeWords() {
      for (let i = 0; i < this.words.length; i++) {
        const word = this.words[i]
        let placed = false
        let attempts = 0
  
        while (!placed && attempts < 100) {
          const horizontal = Math.random() < 0.5
          const row = Math.floor(Math.random() * this.gridSize)
          const col = Math.floor(Math.random() * this.gridSize)
  
          if (this.canPlaceWord(word, row, col, horizontal)) {
            this.placeWord(word, row, col, horizontal, i)
            placed = true
          }
  
          attempts++
        }
      }
    }
  
    canPlaceWord(word, row, col, horizontal) {
      if (horizontal) {
        if (col + word.length > this.gridSize) return false
        for (let i = 0; i < word.length; i++) {
          const cell = this.grid[row][col + i]
          if (cell.letter !== "" && cell.letter !== word[i]) return false
        }
      } else {
        if (row + word.length > this.gridSize) return false
        for (let i = 0; i < word.length; i++) {
          const cell = this.grid[row + i][col]
          if (cell.letter !== "" && cell.letter !== word[i]) return false
        }
      }
      return true
    }
  
    placeWord(word, row, col, horizontal, wordIndex) {
      if (horizontal) {
        for (let i = 0; i < word.length; i++) {
          this.grid[row][col + i] = {
            letter: word[i],
            isWord: true,
            wordIndex: wordIndex,
          }
        }
      } else {
        for (let i = 0; i < word.length; i++) {
          this.grid[row + i][col] = {
            letter: word[i],
            isWord: true,
            wordIndex: wordIndex,
          }
        }
      }
    }
  
    fillEmptyCells() {
      const letters = "abcdefghijklmnopqrstuvwxyz"
      for (let row = 0; row < this.gridSize; row++) {
        for (let col = 0; col < this.gridSize; col++) {
          if (this.grid[row][col].letter === "") {
            this.grid[row][col].letter = letters[Math.floor(Math.random() * letters.length)]
          }
        }
      }
    }
  
    renderGrid() {
      const gridElement = document.getElementById("letter-grid")
      gridElement.innerHTML = ""
  
      for (let row = 0; row < this.gridSize; row++) {
        for (let col = 0; col < this.gridSize; col++) {
          const cell = document.createElement("div")
          cell.className = "letter-cell"
          cell.textContent = this.grid[row][col].letter.toUpperCase()
          cell.dataset.row = row
          cell.dataset.col = col
  
          cell.addEventListener("mousedown", (e) => this.startSelection(e))
          cell.addEventListener("mouseenter", (e) => this.continueSelection(e))
          cell.addEventListener("mouseup", () => this.endSelection())
  
          gridElement.appendChild(cell)
        }
      }
  
      document.addEventListener("mouseup", () => this.endSelection())
    }
  
    renderWordList() {
      const listElement = document.getElementById("word-list")
      listElement.innerHTML = ""
  
      this.words.forEach((word, index) => {
        const wordItem = document.createElement("div")
        wordItem.className = "word-item"
        wordItem.textContent = word.toUpperCase()
        wordItem.dataset.index = index
  
        if (this.foundWords.has(word)) {
          wordItem.classList.add("found")
          wordItem.style.backgroundColor = this.colors[index % this.colors.length]
        }
  
        listElement.appendChild(wordItem)
      })
    }
  
    startSelection(e) {
      if (!this.gameStarted) return
      this.isSelecting = true
      this.selectedCells = []
      this.addCellToSelection(e.target)
    }
  
    continueSelection(e) {
      if (!this.isSelecting) return
      this.addCellToSelection(e.target)
    }
  
    addCellToSelection(cell) {
      if (!cell.classList.contains("letter-cell")) return
  
      const row = Number.parseInt(cell.dataset.row)
      const col = Number.parseInt(cell.dataset.col)
  
      // Check if selection is valid (horizontal or vertical)
      if (this.selectedCells.length > 0) {
        const first = this.selectedCells[0]
        const isHorizontal = first.row === row
        const isVertical = first.col === col
  
        if (!isHorizontal && !isVertical) return
  
        // Check if cell is adjacent
        const last = this.selectedCells[this.selectedCells.length - 1]
        const isAdjacent = Math.abs(last.row - row) + Math.abs(last.col - col) === 1
  
        if (!isAdjacent) return
      }
  
      // Check if already selected
      const alreadySelected = this.selectedCells.some((c) => c.row === row && c.col === col)
      if (alreadySelected) return
  
      this.selectedCells.push({ row, col, element: cell })
      cell.classList.add("selected")
    }
  
    endSelection() {
      if (!this.isSelecting) return
      this.isSelecting = false
  
      // Check if selected cells form a word
      const selectedWord = this.selectedCells.map((c) => this.grid[c.row][c.col].letter).join("")
  
      if (this.words.includes(selectedWord) && !this.foundWords.has(selectedWord)) {
        // Found a word!
        this.foundWords.add(selectedWord)
        const wordIndex = this.words.indexOf(selectedWord)
        const color = this.colors[wordIndex % this.colors.length]
  
        // Highlight found word
        this.selectedCells.forEach((c) => {
          c.element.classList.add("found")
          c.element.style.backgroundColor = color
        })
  
        // Update word list
        this.renderWordList()
  
        // Check if all words found
        if (this.foundWords.size === this.words.length) {
          this.stopTimer()
          setTimeout(() => {
            alert("🎉 恭喜！你找到了所有单词！")
          }, 300)
        }
      } else {
        // Clear selection
        this.selectedCells.forEach((c) => {
          c.element.classList.remove("selected")
        })
      }
  
      this.selectedCells = []
    }
  
    startTimer() {
      this.startTime = Date.now()
      this.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
        const minutes = Math.floor(elapsed / 60)
          .toString()
          .padStart(2, "0")
        const seconds = (elapsed % 60).toString().padStart(2, "0")
        document.getElementById("timer").textContent = `${minutes}:${seconds}`
      }, 1000)
    }
  
    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    }
  }
  
  // Initialize game when page loads
  window.addEventListener("DOMContentLoaded", () => {
    new WordSearchGame()
  })
  