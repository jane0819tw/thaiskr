class Vec2 {
  constructor(x, y) {
    this.x = x || 0
    this.y = y || 0
  }
  add(v) {
    return new Vec2(this.x + v.x, this.y + v.y)
  }
  sub(v) {
    return new Vec2(this.x - v.x, this.y - v.y)
  }
  set(x, y) {
    this.x = x
    this.y = y
  }
  move(x, y) {
    this.x += x
    this.y += y
  }
  equal(v) {
    return this.x === v.x && this.y === v.y
  }

  mul(l) {
    return new Vec2(this.x * l, this.y * l)
  }
  clone() {
    return new Vec2(this.x, this.y)
  }
  toString() {
    return `${this.x},${this.y}`
  }
  get angle() {
    return Math.atan2(this.y / this.x)
  }
  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }
  get unit() {
    return this.mul(1 / this.length)
  }
  set length(l) {
    this.set(this.unit.mul(l).x, this.unit.mul(l).y)
  }
}

class MusicPlayer {
  constructor(args) {
    let def = {
      size: new Vec2(300, 200),
      ytList: null,
      ytListIndex: 0,
      isPlaying: false,
      imgNode: document.getElementById('image'),
      speed: 1
    }
    Object.assign(def, args)
    Object.assign(this, def)
    this.loadytList()
  }
  get nowPlayyt() {
    return this.ytList ? this.ytList[this.ytListIndex] : {}

  }
  updateImg() {
    this.imgNode.src = this.nowPlayyt.snippet.thumbnails.default.url
  }
  loadytList() {
    axios.get('https://www.googleapis.com/youtube/v3/playlistItems',
      {
        params: {
          part: 'snippet,contentDetails',
          playlistId: 'PLeQlgf5H84mfXRDGtaFiGOOef-szLM7Ov',
          maxResults: 50,
          key: 'AIzaSyA3-m2WTsZxIHPFocGMAb2vcvo5F63Wp8U'
        }
      }).then(res => {
        this.ytList = res.data.items
        console.log(this.nowPlayyt)

        this.draw()
      }).catch(e => console.log(e))
  }
  draw() {
    document.getElementById('description').innerHTML = `<pre>${this.nowPlayyt.snippet.description}</pre>`
    document.getElementById('playIcon').classList =
      this.isPlaying ? 'fas fa-pause-circle' : 'fas fa-play-circle'
    ctx.save()
    ctx.clearRect(0, 0, ww, wh)
    ctx.translate(ww / 2, wh / 2)

    this.drawJocker()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.strokeRect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y)
    this.drawRadioTop(new Vec2(this.size.x * 0.9, this.size.y * 0.9))
    this.drawRadioDown(new Vec2(this.size.x * 0.85, this.size.y * 0.25))

    ctx.restore()

  }
  drawRadioTop(sizeV) {
    ctx.strokeStyle = '#fff'
    ctx.fillStyle = '#fff'
    ctx.save()
    ctx.translate(0, -sizeV.y * 0.5)
    ctx.strokeRect(-sizeV.x / 2, 0, sizeV.x, sizeV.y)
    this.updateImg()
    ctx.drawImage(this.imgNode, -sizeV.x / 2 + 10, 0)
    ctx.beginPath()
    ctx.strokeRect(-sizeV.x / 2 + 10, 10, 120, 70)
    ctx.beginPath()
    ctx.moveTo(0, sizeV.y * 0.2)
    ctx.lineTo(sizeV.x / 2 - 10, sizeV.y * 0.2)
    ctx.stroke()
    ctx.fillText(this.nowPlayyt.snippet.title, 0, sizeV.y * 0.2 - 10)
    ctx.beginPath()
    ctx.moveTo(0, sizeV.y * 0.4)
    ctx.lineTo(sizeV.x / 2 - 10, sizeV.y * 0.4)
    ctx.stroke()
    ctx.fillText(this.nowPlayyt.contentDetails.videoPublishedAt, 0, sizeV.y * 0.4 - 10)
    ctx.restore()
  }
  drawRadioDown(sizeV) {
    ctx.strokeStyle = '#fff'
    ctx.fillStyle = '#fff'

    ctx.save()
    ctx.translate(0, 60)
    ctx.beginPath()
    ctx.strokeRect(-sizeV.x / 2, -sizeV.y / 2, sizeV.x, sizeV.y)
    ctx.font = '15px Arial'
    ctx.fillText('熱播泰歌', -25, 0)
    ctx.font = '10px Arial'
    ctx.fillText(`speed: ${this.speed}`, -15, 15)
    // draw circle
    this.drawButton(sizeV, -sizeV.x / 3)
    // draw right circle
    this.drawButton(sizeV, sizeV.x / 3)
    ctx.restore()
  }
  drawButton(sizeV, xMove) {
    ctx.save()
    ctx.translate(xMove, 0)
    ctx.beginPath()
    ctx.arc(0, 0, sizeV.y / 2, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, 0, sizeV.y / 3, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.beginPath()
    ctx.lineWidth = 3
    let count = 8
    ctx.rotate(this.rotateDeg)
    for (let i = 0; i < count; i++) {
      ctx.rotate(2 * Math.PI / count)
      ctx.moveTo(sizeV.y / 3, 0)
      ctx.lineTo(sizeV.y / 3 - 5, 0)
    }
    ctx.stroke()
    ctx.restore()
  }
  get rotateDeg() {
    return this.isPlaying ? times : 0

  }
  drawJocker() {
    let bigR = this.size.length / 2 + 50

    // gray panel
    ctx.beginPath()
    ctx.fillStyle = '#888'
    ctx.arc(0, 0, bigR, 0, 2 * Math.PI)
    ctx.fill()
    // white panel
    ctx.beginPath()
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.arc(0, 0, this.size.length / 2, 0, 2 * Math.PI)
    ctx.fill()
    // speed line
    ctx.save()
    ctx.beginPath()
    for (let r = this.size.length / 2; r < bigR; r += 10) {
      let move = this.isPlaying ? times * 2 / 100 * this.speed : 0
      ctx.rotate(Math.PI / 2 + move)
      for (let i = 0; i < 360; i++) {
        ctx.moveTo(r, 0)
        ctx.rotate(Math.PI * 2 / 360)
        if (i % 80 < 40) {
          ctx.lineTo(r, 0)
        }

      }
    }

    ctx.lineWidth = 1
    ctx.strokeStyle = '#fff'
    ctx.stroke()
    ctx.restore()
    // 變速器
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(bigR, 0)
    ctx.arc(0, 0, bigR, 0, 0.45 * Math.PI)
    ctx.closePath()
    ctx.fillStyle = 'rgba(221, 104, 15,0.55)'
    ctx.fill()
    // 刺刺的
    ctx.beginPath()
    // ctx.strokeStyle = '#fff'
    for (let i = 0; i < 200; i++) {
      ctx.rotate(Math.PI * 2 / 200)
      ctx.moveTo(bigR, 0)
      let len = this.isPlaying ? 20 * Math.abs(Math.sin(times * i)) : 0
      ctx.lineTo(bigR + len, 0)
      ctx.strokeStyle = `hsl(${parseInt(Math.random() * 360)}, 80%, 40%)`
      ctx.stroke()
    }
    ctx.stroke()

  }
}

function load() {
  loading()
  initCanvas()
  init()
  setTimeout(() => {
    draw()
    finishLoading()
  }, 1000)
  // update()
}

function init() {
  musicPlayer = new MusicPlayer()
  $('[data-toggle="popover"]').popover()
}
function draw() {
  musicPlayer.draw()
  if (musicPlayer.isPlaying) {
    setTimeout(() => {
      times++
      draw()
    }, 80)
  }

}

function initCanvas() {
  ww = canvas.width = 500
  wh = canvas.height = 500
}

function loading() {
  loadingPanel.style.display = "flex"
  mainPanel.style.display = "none"
  console.log('start loading...')
}
function finishLoading() {
  setTimeout(() => {
    loadingPanel.style.display = "none"
    mainPanel.style.display = "flex"
    console.log('finish loading! ')
  }, 800)

}

const canvas = document.getElementById('mycanvas')
const ctx = canvas.getContext('2d')
let ww, wh
let musicPlayer
let times = 0
let loadingPanel = document.querySelector('.loadingPanel')
let mainPanel = document.querySelector('#mainPanel')

load()

// file reference: 
// https://developers.google.com/youtube/iframe_api_reference?source=post_page-----91ddc01da779----------------------
let player

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// api 載入後執行這個　創造一個iframe
function onYouTubeIframeAPIReady() {
  setTimeout(() => {
    player = new YT.Player('player', {
      fitToBackground: true,
      height: '0',
      width: '0',
      videoId: musicPlayer.nowPlayyt.contentDetails.videoId,
      playerVars: { //自訂參數
        'controls': 1, //控制列，0:隱藏，1:顯示(默認)
        //'fs': 0, //全屏按鈕，0:隱藏，1:顯示(默認)
        //'iv_load_policy': 3, //影片註釋，1:顯示(默認)，3:不顯示
        //'rel': 0, //顯示相關視頻，0:不顯示，1:顯示(默認)
        //'modestbranding': 0, //YouTube標籤，0:顯示(默認)，1:不顯示    
        //'playsinline': 1 //在iOS的播放器中全屏播放，0:全屏(默認)，1:內嵌
      },
      events: {
        // 當video player ready的時候載入
        // 'onReady': onPlayerReady,
        // 當狀態改變的時候載入
        // 'onStateChange': onPlayerStateChange
      }
    })
    console.log(player)
  }, 1000)
}


document.querySelector('.btns').addEventListener('click', evt => {
  if (evt.target.tagName === 'I') {
    switch (evt.target.parentElement.id) {
      case 'prevBtn':
        console.log('prevBtn')
        if (musicPlayer.ytListIndex - 1 >= 0) {
          musicPlayer.isPlaying = true
          musicPlayer.ytListIndex--
          player.loadVideoById(musicPlayer.nowPlayyt.contentDetails.videoId)
        }
        return
      case 'playBtn':
        console.log('playBtn')
        if (musicPlayer.isPlaying) {
          musicPlayer.isPlaying = false
          player.pauseVideo()
        } else {
          musicPlayer.isPlaying = true
          player.playVideo()

        }
        draw()
        return

      case 'nextBtn':
        console.log('nextBtn')
        if (musicPlayer.ytListIndex + 1 < musicPlayer.ytList.length) {
          musicPlayer.ytListIndex++
          player.loadVideoById(musicPlayer.nowPlayyt.contentDetails.videoId)
          musicPlayer.isPlaying = true
        }
        return
    }
  }
})

let mousePosDown = new Vec2(0, 0)
let mousePosUp = new Vec2(0, 0)
canvas.addEventListener('mousedown', evt => {
  mousePosDown.set(evt.x, evt.y)
})

canvas.addEventListener('mouseup', evt => {
  mousePosUp.set(evt.x, evt.y)
  if (mousePosDown.x > mousePosUp.x + 5 && mousePosDown.y < mousePosUp.y - 5) {
    console.log('move quickly')
    console.log(musicPlayer.speed)
    switch (musicPlayer.speed) {
      case 1:
        musicPlayer.speed = 2
        break
      case 0.5:
        musicPlayer.speed = 1
        break
    }
    console.log(musicPlayer.speed)
    player.setPlaybackRate(musicPlayer.speed)

  } else if (mousePosUp.x > mousePosDown.x + 5 && mousePosUp.y < mousePosDown.y - 5) {
    console.log('move slowly')
    console.log(musicPlayer.speed)
    switch (musicPlayer.speed) {
      case 2:
        musicPlayer.speed = 1
        break
      case 1:
        musicPlayer.speed = 0.5
        break
    }
    console.log(musicPlayer.speed)
    player.setPlaybackRate(musicPlayer.speed)
  }

})
