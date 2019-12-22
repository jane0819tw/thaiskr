import { lettersData } from '../module/lettersData.js'
import Vec2 from '../module/Vec2.js'

class Item {
  constructor(args) {
    let def = {
      // 放引入的資料
      letterData: null,
      size: new Vec2(140, 40),
      answer: '',
      question: '',
      numberQ: 0,
      numberA: 0,
      isPaired: false,
      isSounding: false
    }
    Object.assign(def, args)
    Object.assign(this, def)
  }
  get posSound() {
    return this.posQ.sub(new Vec2(100, 0))
  }
  get posQ() {
    let x = ww / 5
    let y = (this.numberQ + 1) * wh / 6
    return new Vec2(x, y)
  }
  get posA() {
    let x = ww - ww / 5
    let y = (this.numberA + 1) * wh / 6
    return new Vec2(x, y)
  }
  generateContent(propQ, propA) {
    this.question = this.letterData[propQ]
    this.answer = this.letterData[propA]
  }
  drawQorA(posItem, fillColor, topic) {
    ctx.save()
    ctx.translate(posItem.x, posItem.y)
    ctx.beginPath()
    ctx.fillStyle = fillColor // 
    ctx.lineWidth = 3
    ctx.rect(- this.size.x / 2, - this.size.y / 2, this.size.x, this.size.y)
    ctx.fill()
    if (this.isPaired) {
      this.drawStrokePaired()
    }
    this.drawQAText(topic)
    ctx.restore()
  }
  drawQAText(topic) {
    ctx.font = '19px Arial'
    ctx.fillStyle = '#000'
    ctx.fillText(topic, - this.size.x / 3, 0)
  }
  drawSound() {
    ctx.save()
    // 本體
    ctx.translate(this.posSound.x, this.posSound.y)
    ctx.beginPath()
    ctx.fillStyle = this.isSounding ? '#f24' : '#333'
    ctx.arc(0, 0, this.size.y / 2, 0, 2 * Math.PI)
    ctx.fill()
    ctx.beginPath()
    ctx.fillStyle = '#eee'
    ctx.arc(0, this.size.y * 0.25, 3, 0, 2 * Math.PI)
    ctx.fill()
    // 聲音線條
    ctx.beginPath()
    ctx.strokeStyle = '#ddd'
    ctx.lineWidth = 3
    ctx.arc(0, 0, this.size.y / 4, -1 * Math.PI, 0 * Math.PI)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, 10, this.size.y / 4, -0.7 * Math.PI, -0.3 * Math.PI)
    ctx.stroke()
    ctx.restore()
  }
  drawStrokePaired() {
    ctx.shadowBlur = 10
    ctx.shadowColor = 'yellow'
    ctx.fill()
    ctx.shadowBlur = 0
  }

  isRange(posmouse, posItem) {
    // check question
    console.log(posmouse, posItem)
    let xRange = (posmouse.x > posItem.x - this.size.x / 2) && (posmouse.x < posItem.x + this.size.x / 2)
    let yRange = (posmouse.y > posItem.y - this.size.y / 2) && (posmouse.y < posItem.y + this.size.y / 2)
    return xRange && yRange
  }
  isSoundRange(posmouse) {
    let xRange = (posmouse.x > this.posSound.x - this.size.y / 2) && (posmouse.x < this.posSound.x + this.size.y / 2)
    let yRange = (posmouse.y > this.posSound.y - this.size.y / 2) && (posmouse.y < this.posSound.y + this.size.y / 2)
    return xRange && yRange
  }

}
class Line {
  constructor(args) {
    let def = {
      startPos: new Vec2(),
      endPos: new Vec2(),
      isLined: false
    }
    Object.assign(def, args)
    Object.assign(this, def)
  }
  draw() {
    ctx.beginPath()
    ctx.fillStyle = '#2a3c3d'
    ctx.fill()
    ctx.moveTo(this.startPos.x, this.startPos.y)
    ctx.lineTo(this.endPos.x, this.endPos.y)
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(this.startPos.x, this.startPos.y, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(this.endPos.x, this.endPos.y, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }
  update() {
    if (!this.isLined) {
      this.endPos = game.posmousemove.clone()
    }
  }
}
class Game {
  constructor() {

    this.qaNum = 5
    this.posmouse = null
    this.posmousemove = null
    this.target = null
    this.totalLevel = 5
    this.nowLevel = 1

    this.init()
  }
  get clickQ() {
    return this.items.find(item => item.isRange(this.posmouse, item.posQ))

  }
  get clickA() {
    return this.items.find(item => item.isRange(this.posmouse, item.posA))
  }
  get clickSound() {
    return this.items.find(item => item.isSoundRange(this.posmouse))
  }
  isFinish() {
    return this.lines.filter(line => line.isLined).length === this.qaNum
  }

  init() {
    this.lines = []
    this.items = []
    this.status = 'start'
    this.clickTimes = 0
    this.getSeletion()
    this.generateItems()
  }
  getSeletion() {
    // 對應畫面節點取得props type
    this.questionProp = topic1.value
    this.ansProp = topic2.value
    this.type = typeName.value
    this.message = `連連看 ${this.type} 第${this.nowLevel}關`
  }
  getSelData() {
    console.log(this.questionProp)
    let filterData = this.type ? lettersData.filter(letter => letter.typeName === this.type) : lettersData
    console.log(filterData)
    let testData = utility.getRandomArray(filterData.length).map(index => filterData[index])
    return testData

  }
  generateItems() {
    let testData = this.getSelData()
    console.log(testData)
    for (let i = 0; i < this.qaNum; i++) {
      this.items.push(new Item({ numberQ: i, letterData: testData[i] }))
    }
    // 指定題目和答案
    this.items.forEach(item => item.generateContent(this.questionProp, this.ansProp))

    // 產生答案順序
    let randomArr = utility.getRandomArray(this.qaNum)
    this.items.forEach((item, i) => item.numberA = randomArr[i])
  }

  generateTarget() {
    this.target = this.items.find(item => item.isRange(this.posmouse, item.posQ) || item.isRange(this.posmouse, item.posA))
  }
  drawQAs() {
    this.items.forEach((item, i) => {
      item.drawQorA(item.posQ, '#B7C9DB', item.question)
      item.drawQorA(item.posA, '#E8D6CB', item.answer)
      item.drawSound()
    })
  }
  drawInfo() {
    ctx.save()
    ctx.fillStyle = '#fff'
    ctx.font = '15px Ariel'
    ctx.fillText(`${this.message}`, ww / 2 - 25, 25)
    ctx.fillText(`${this.type} LEVEL ${this.nowLevel}/${this.totalLevel}`, ww / 2, 50)
    ctx.restore()
  }
  draw() {
    ctx.clearRect(0, 0, ww, wh)
    // 63240b
    ctx.fillStyle = '#6b494b'

    ctx.fillRect(0, 0, ww, wh)
    this.drawQAs()
    this.drawInfo()
    this.lines.forEach(line => line.draw())
  }
  checkPair(item) {
    return item === this.target
  }
  pairedSuccess() {
    this.lines.find(line => !line.isLined).isLined = true
    this.message = '不錯喔!猜到的吧~'
  }
  pairedFailed() {
    let lineIndex = this.lines.findIndex(line => !line.isLined)
    this.lines.splice(lineIndex, 1)
    this.message = '連錯了啦~'
  }
  pairAction(clickItem) {
    if (clickItem && !clickItem.isPaired) {
      this.clickTimes = 0
      let pairResult = this.checkPair(clickItem)
      this.items.find(item => item === clickItem).isPaired = pairResult

      if (pairResult) {
        this.pairedSuccess()
        console.log(`pair ${pairResult}`)
        if (this.isFinish()) {
          console.log('go to next level')
          this.status = 'waiting'
          setTimeout(() => {
            if (this.nowLevel === this.totalLevel) {
              console.log('you win the game!')
              this.message = `恭喜你闖關${this.type}成功!使用上方選擇複習其他字母吧`
            } else {
              this.nowLevel++
              this.init()
            }

          }, 1000)
        }

      } else {
        this.pairedFailed()
        console.log(`pair ${pairResult}`)
      }

    }
  }
  secondTimeClickAction() {
    switch (this.status) {
      case 'waitA':
        this.pairAction(this.clickA)
        break
      case 'waitQ':
        this.pairAction(this.clickQ)
        break
    }
  }

  firstTimeClickAction() {
    this.generateTarget()
    this.message = '要連去哪呢'
    this.clickTimes++
    if (this.clickQ) {
      console.log('click Q!')
      this.status = 'waitA'
    } else {
      console.log('click A!')
      this.status = 'waitQ'
    }
  }
  playSound() {
    console.log(this.clickSound)
    let target = this.items.find(item => item === this.clickSound)
    target.isSounding = true
    audio.currentTime = this.clickSound.letterData.start
    audio.play()
    setTimeout(() => {
      audio.pause()
      target.isSounding = false
    }, this.clickSound.letterData.dur)
  }
  isSound() {
    return this.items.find(item => item.isSounding === true)
  }

}

// -------------------------------------------
const utility = {
  getRandomArray(length) {
    let arr = Array.from({ length: length }, (item, i) => i)
    for (let i = arr.length - 1; i > 0; i--) {
      let randomIndex = parseInt(Math.random() * (i - 1))
        ;[arr[randomIndex], arr[i]] = [arr[i], arr[randomIndex]]
    }
    return arr
  }
}
// -------------------------------------------
const canvas = document.getElementById('mycanvas')
const ctx = canvas.getContext('2d')
const topic1 = document.getElementById('topic1')
const topic2 = document.getElementById('topic2')
const typeName = document.getElementById('typeName')
const audio = document.getElementById('audio')
let loadingPanel = document.querySelector('.loadingPanel')
let ww, wh
let game

load()
function load() {
  initCanvas()
  init()
  draw()
  update()

}
function initCanvas() {
  ww = canvas.width = 700
  wh = canvas.height = 400
}

function init() {
  game = new Game()
  console.log(game)
}

function update() {
  game.lines.forEach(line => line.update())
  setTimeout(() => {
    update()
  }, 40)
}
function draw() {
  game.draw()

  setTimeout(() => {
    draw()
  }, 40)

}

canvas.addEventListener('mousedown', evt => {
  // 取得元素裡面的位置
  game.posmouse = new Vec2(evt.layerX, evt.layerY)
  if (game.status != 'waiting') {
    // 檢查有沒有點到
    if (game.clickA || game.clickQ) {
      // 第一次典籍紀錄狀態
      if (game.clickTimes == 0) {
        console.log('click it one!')
        game.firstTimeClickAction()
        // 開始拖曳
        game.lines.push(new Line({
          startPos: new Vec2(evt.layerX, evt.layerY),
          endPos: new Vec2(game.posmousemove.x, game.posmousemove.y)
        }))
        console.log('push')
      } else if (game.clickTimes == 1) {
        game.secondTimeClickAction()
      }
    }
  }
  // 處理聲音: 點即到聲音而且目前沒有東西在播放
  if (game.clickSound && !game.isSound()) {
    // console.log()
    game.playSound()

  }

})


canvas.addEventListener('mousemove', evt => {
  // 取得元素裡面的位置
  game.posmousemove = new Vec2(evt.layerX, evt.layerY)

})

document.getElementById('startBtn').addEventListener('click', evt => {
  if (topic1.value != topic2.value) {
    game.nowLevel = 1
    game.init()
  } else {
    alert('請選擇不同選項~')
  }
})

window.addEventListener('DOMContentLoaded', () => {
  console.log('hello')
  loadingPanel.style.display = "flex"
  setTimeout(() => {
    loadingPanel.style.display = "none"
    console.log('finish loading! ')
    $('#myModal').modal('show')
  }, 1000)
})