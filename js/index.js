// 引入
import { quotesData } from '../module/quotesData.js'
import { lettersData } from '../module/lettersData.js'
import Vec2 from '../module/Vec2.js'
// -------------------------------------

class thaiLetter {
  constructor(args) {
    let def = {
      p: new Vec2(),
      v: new Vec2(1, 1),
      a: new Vec2(),
      letter: ''
    }
    Object.assign(def, args)
    Object.assign(this, def)
  }
  update() {
    this.p = this.p.add(this.v)
    this.v = this.v.add(this.a)
  }
  draw() {
    ctx.beginPath()
    ctx.save()
    ctx.translate(this.p.x, this.p.y)
    if (!this.hslValue) {
      this.hslValue = parseInt(Math.random() * 360)
      this.fontsize = Math.random() * 50 + 30
    }

    ctx.fillStyle = `hsl(${this.hslValue},80%,80%)`
    ctx.font = `${this.fontsize}px Ariel`
    ctx.fillText(this.letter, 0, 0)
    // ctx.arc(0, 0, 20, 0, 2 * Math.PI)
    ctx.fill()
    ctx.restore()
  }
}

const canvas = document.getElementById('mycanvas')
let ctx = canvas.getContext('2d')
let ww = canvas.width = window.innerWidth
let wh = canvas.height = window.innerHeight

const model = {
  quotesData: quotesData,
  letters: []
}

const view = {
  showQuote(quote) {
    document.querySelector('.quote').innerHTML = `
    <h1>泰句抽抽樂</h1>
    <p>${quote.thai}</p>
    <p>${quote.chi}</p>
    
    `
  },
  drawCanvas() {
    ctx.clearRect(0, 0, ww, wh)
    ctx.fillStyle = '#222'
    ctx.fillRect(0, 0, ww, wh)
    model.letters.forEach(letter => {
      letter.draw()
      // letter.update()
    })
  },
  drawName(letterData) {
    console.log(letterData)
    // ctx.clearRect(0, 0, ww, wh)
    let text = `你的泰字<br> ${letterData.typeName} <br>${letterData.vocabulary} <br>${letterData.mean}`
    document.querySelector('.result').innerHTML = text
    document.querySelector('.result').style.display = 'block'
  }
}

const controller = {
  clickTime: 0,
  drawTime: 0,
  nowPos: new Vec2(),
  drawMode: false,
  init() {
    this.addListener()
  },
  addListener() {
    // anusawari listener
    this.addAnusawariListener()
    this.addCanvasListener()
    this.addDrawListener()
  },
  addDrawListener() {
    document.getElementById('start').addEventListener('click', evt => {
      this.drawMode = true
      document.getElementById('start').style.display = 'none'
    })
  },
  addAnusawariListener() {
    document.querySelector('label').addEventListener('click', evt => {
      this.clickTime++
      console.log('click')
      document.querySelector('.sence').classList.toggle('checked')
      // get quote
      if (this.clickTime === 1) {
        let quote = this.getRandomItem(model.quotesData)
        view.showQuote(quote)
        document.querySelector('.quote').classList.add('show')
      }
    })
  },
  controlTime() {
    this.drawTime++
    if (this.drawTime < 5) {
      setTimeout(() => {
        this.controlTime()
      }, 1000)
    } else {
      // 怕滑鼠不動　判斷畫完
      this.drawFinish()
    }
  },
  getName() {
    let arr = []
    model.letters.forEach(thailetter => {
      let item = arr.find(item => item.textData === thailetter.letter)
      if (!item) {
        arr.push({ textData: thailetter.letter, count: 1 })
      } else {
        item.count++
      }
    })
    console.log(arr)
    let maxLetter = arr.sort((a, b) => b.count - a.count)[0]
    let letterData = lettersData.find(letter => letter.text === maxLetter.textData)
    view.drawName(letterData)

  },
  addNewLetter(x, y) {
    this.nowPos.set(x, y)

    model.letters.push(new thaiLetter({
      p: new Vec2(x, y),
      letter: this.getRandomItem(lettersData).text
    }))
  },
  moveOnCanvas(layerX, layerY) {
    let delLen = this.nowPos.sub(new Vec2(layerX, layerY)).length
    if (this.drawMode && delLen > 50 && this.drawTime != 5) {
      if (this.drawTime === 0) {
        this.controlTime()
      }
      this.addNewLetter(layerX, layerY)
      view.drawCanvas()
    }
  },
  addCanvasListener() {
    canvas.addEventListener('mousemove', evt => {
      this.moveOnCanvas(evt.layerX, evt.layerY)

    })

    canvas.addEventListener('touchmove', evt => {
      console.log('touchmove')
      this.moveOnCanvas(evt.targetTouches[0].clientX, evt.targetTouches[0].clientY)

      console.log(evt)
      // let delLen = this.nowPos.sub(new Vec2(evt.layerX, evt.layerY)).length

    })
  },
  drawFinish() {
    if (this.drawMode && this.drawTime === 5) {
      this.drawMode = false
      console.log('get name')
      this.getName()
    }
  },
  getRandomItem(arr) {
    let index = utilities.getRandom(arr.length)
    return arr[index]
  }

}
const utilities = {
  getRandom(len) {
    return parseInt(Math.random() * len)
  }
}

// --------------------------------------------------
controller.init()
// 要初始化
let s = skrollr.init()
console.log(s)

// if ('addEventListener' in element) {
//   var captureTemp = eventCapture(handler, capture) || {}
//   if (!captureTemp.passive)
//     captureTemp.passive = false
//   element.addEventListener(realEvent(handler.e), handler.proxy, captureTemp)
// }
// window.addEventListener("touchmove", evt => {
//   // evt.preventDefault()
//   console.log('touch')
// }, {
//   passive: true,
//   cancelable: false
// });

