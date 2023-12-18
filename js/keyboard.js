import { keyboardsData } from '../module/keyboardData.js'
console.clear();
// loading data from keyboardsData.js
const input = document.getElementById('input')
const enter = document.querySelector('.enter')
const showlist = document.querySelector('.showlist')
const soundLetter = document.querySelector('.soundLetter')
const test = document.getElementById('test')
const hint = document.querySelector('.close')
const descriptBtn = document.querySelector('.button')
const sponsorBtn = document.querySelector('.sponsorBtn')
const sponsorHintBtn = document.querySelector('.sponsorHint')

let loadingPanel = document.querySelector('.loadingPanel')
init()

function init() {
  loading()
  loadData()
  finishLoading()
}

function loading() {
  loadingPanel.style.display = "flex"

  console.log('start loading...')
}
function finishLoading() {
  setTimeout(() => {
    loadingPanel.style.display = "none"
    console.log('finish loading!! ')
  }, 1000)

}
function loadData() {
  // write letters on keyboards
  keyboardsData.forEach(kb => {
    let kBoard = document.querySelector(`.kb${kb.id}`)
    kBoard.querySelector('.eng').innerText = kb.eng
    kBoard.querySelector('.chi').innerText = kb.chi
    kBoard.querySelector('.tMain').innerText = kb.tMain.text
    kBoard.querySelector('.tShift').innerText = kb.tShift.text
    // 例外的情況
    if (kb.id === 23 || 24 || 25) {
      kBoard.querySelector('.chi').innerText = kb.bigEng
    }
  })
}

function isThaiLetter(letter) {
  return keyboardsData.some(kb => kb.tShift.text === letter || kb.tMain.text === letter)
}

function toThaiLetters(key) {
  let thaiword = ''
  $('.kb').css('background-color', '#222')
  keyboardsData.forEach(kb => {
    if (key === kb.eng) {
      thaiword = kb.tMain.text
      document.querySelector(`.kb${kb.id}`).style.backgroundColor = '#e05d45'
    } else if (key === kb.bigEng) {
      thaiword = kb.tShift.text
      document.querySelector(`.kb${kb.id}`).style.backgroundColor = '#e05d45'
    }
  })
  return thaiword
}

function getSoundData(thaiLetter) {
  let soundData = null
  keyboardsData.forEach(kb => {
    if (kb.tShift.text === thaiLetter) {
      soundData = kb.tShift
      soundData.id = kb.id
    } else if (kb.tMain.text === thaiLetter) {
      soundData = kb.tMain
      soundData.id = kb.id
    }
  })
  return soundData
}

function pronounce(soundData) {
  test.currentTime = soundData.start
  test.play()
}
function updateShowlist(mArr) {
  showlist.innerHTML = ''
  mArr.forEach(letter => showlist.innerHTML += `<span>${letter}</span>`)
}

function playLetter(mArr, nowIndex) {
  $('.showlist span').removeClass('chCor')
  console.log(`play ${mArr[nowIndex]}`)
  let soundData = getSoundData(mArr[nowIndex])
  if (soundData.dur != 0) {
    pronounce(soundData)
    soundLetter.innerHTML = `
    <span class="mr-1">${soundData.sound}</span><br>
    <span class="mr-1">${soundData.vocabulary}</span>
    <span class="mr-1">${soundData.mean}</span>`
    // soundLetter.innerHTML = `${soundData.sound}<br>${soundData.vocabulary}<br>${soundData.mean}`
    document.querySelector(`.kb${soundData.id}`).style.backgroundColor = '#f9c500'
    $('.showlist span').eq(nowIndex).addClass('chCor')
  }
  // 判斷條件
  nowIndex++
  setTimeout(() => {
    if (nowIndex < mArr.length) {
      playLetter(mArr, nowIndex)
    } else {
      test.pause()
      enter.classList.remove('rotate')
    }
    document.querySelector(`.kb${soundData.id}`).style.backgroundColor = '#222'
  }, soundData.dur || 0)
}

// keyup 的 key value 有大小寫之分
input.addEventListener('keyup', () => {
  let messageArr = input.value.split('')
  // 輸入一個都要去檢查整串字串
  let letter = messageArr.slice(-1)[0]
  // 預防backspace或是整個選起來清除的時候
  if (!isThaiLetter(letter)) {
    // 把最後一個移除
    messageArr.pop()
    messageArr.push(toThaiLetters(letter))
    // 更新回去
    input.value = messageArr.join('')
  }
})

enter.addEventListener('click', () => {
  let messageArr = input.value.split('')
  updateShowlist(messageArr)
  $('.kb').css('background-color', '#222')
  enter.classList.add('rotate')
  playLetter(messageArr, 0)

})

descriptBtn.addEventListener('click', () => {
  hint.classList.toggle('open')
});

sponsorBtn.addEventListener('mouseover', () => {
  sponsorHintBtn.style.opacity = 1;
});

sponsorBtn.addEventListener('mouseout', () => {
  sponsorHintBtn.style.opacity = 0;
});