import { provinceData } from '../module/provinceData.js'
// use map from here: https://mapsvg.com/maps/thailand
console.clear()
// key 1 6649d789fe36b35de8542c528c9da79c
// key 2 bc31e2eb38bd3a0d57ecb9464386a974

let pathList = document.querySelectorAll('path')
let forcast = document.querySelector('.forcast')
let capital_path = null

const app = document.querySelector('#app')
const loadingPanel = document.querySelector('.loadingPanel')
const provinceList = document.querySelector('#provinceList')

const API_URL = 'https://api.openweathermap.org/data/2.5/'

const part_route = {
  Isan: 'hsla(204, 91%, 70%,0.8)',
  West: 'hsla(221, 84%, 80%,0.8)',
  East: 'hsla(334, 86%, 80%,0.8)',
  Center: 'hsla(85, 56%, 80%,0.8)',
  South: 'hsla(36, 98%, 80%,0.8)',
  North: 'hsla(358, 72%, 80%,0.8)',
}
let provinceNames = []

const weatherType = [
  {
    id: [500, 501, 502, 503, 504],
    sun: true, winds: true, light: false, rains: true
  },
  {
    id: [300, 301, 302, 310, 311, 312, 313, 314, 321, 520, 521, 522, 531],
    sun: false, winds: true, light: false, rains: true
  },
  {
    id: [800],
    sun: true, winds: false, light: false, rains: false
  },
  {
    id: [801],
    sun: true, winds: true, light: false, rains: false
  },
  {
    id: [802, 803, 804],
    sun: false, winds: true, light: false, rains: false
  },
]

// load data
function init() {
  loadingPath()
  loadKeyword(provinceData)
  loading()
  // get capital data
  getCapitalPath('Bangkok', 'TH-10')
  // 完成載入
  finishLoading()
}
// loading function
function loading() {
  loadingPanel.style.display = "flex"
  app.style.display = "none"
  console.log('start loading...')

}
function finishLoading() {
  setTimeout(() => {
    loadingPanel.style.display = "none"
    app.style.display = "flex"
    console.log('finish loading! ')
  }, 800)

}
function getCapitalPath(pName, tag) {
  let data = JSON.parse(localStorage.getItem('myCapital'))
  // 清除紅色 第二次重新整理頁面的時候
  let useName, useTag
  // 瀏覽器有紀錄
  if (data) {
    if (capital_path) {
      // 不是第一次刷新了
      capital_path.classList.remove('fillCapital')
      useName = pName
      useTag = tag
    } else {
      useName = data.name
      useTag = data.tag
    }
  } else {
    useName = pName
    useTag = tag
  }

  //設定新地點
  let newCapital = { name: useName, tag: useTag }
  localStorage.setItem('myCapital', JSON.stringify(newCapital))
  capital_path = document.getElementById(useTag)
  capital_path.classList.add('fillCapital')
  // capital_path.style.fill = '#f24'
  updateForcast(useName)
}

function loadKeyword(data) {
  provinceNames = data.map(province => ({ name: province.thai_name, tag: province.tag, labelName: province.eng_name }))
    .concat(data.map(province => ({ name: province.eng_name, tag: province.tag, labelName: province.eng_name })))
    .concat(data.map(province => ({ name: province.chi_name, tag: province.tag, labelName: province.eng_name })))

  provinceNames.forEach(province => provinceList.innerHTML += `<option>${province.name}</option>`)
}

function getUrl(type, pName) {
  return `${API_URL}${type}?q=${pName},th&appid=6649d789fe36b35de8542c528c9da79c&lang=zh_tw`
}

function updateForcast(pName) {
  let result = provinceData.find(province => province.eng_name === pName)
  if (result && result.cityId === undefined) {
    // 1. get current data
    axios.get(getUrl('weather', pName)).then(res => {
      console.log(res.data)
      result.cityId = res.data.id
      result.temp_min = parseInt(res.data.main.temp_min - 273.5)
      result.temp_max = parseInt(res.data.main.temp_max - 273.5)
      result.weather = res.data.weather[0].description
      result.weather_id = res.data.weather[0].id

    })
      .catch(e => console.log(e))
      .then(() => {
        // 2. get forecast five data
        axios.get(getUrl('forecast', pName)).then(res => {
          // get 5 day id array to store in result
          result.forecastIdArr = res.data.list
            .filter((data, i) => (i + 3) % 8 === 0)
            .map(data => data.weather[0].id)
          console.log(result)
          // 更新資料
          writeForcast(result)
          updateWeatherPics()

        }).catch(e => console.log(e))
      })
  } else {
    writeForcast(result)
    updateWeatherPics()
  }
}

function writeForcast(args) {
  forcast.querySelector('#name').innerHTML =
    `${args.eng_name} <span class="mr-3"> ${args.thai_name}</span><span>${args.chi_name}</span>`
  forcast.querySelector('#temp').innerHTML = `${args.temp_min}~${args.temp_max}`
  forcast.querySelector('#weather').innerText = args.weather
  let date = new Date()
  forcast.querySelector('#date').innerText = `${date.getMonth() + 1}/${date.getDate()}`
  forcast.querySelector('.forcast-pic').dataset.type = args.weather_id
  forcast.querySelectorAll('.day').forEach((day, i) => {
    day.dataset.type = args.forecastIdArr[i]
  })

}
function updateWeatherPic(node) {
  let forcastPic = forcast.querySelector('.' + node)

  let typeId = parseInt(forcastPic.dataset.type)
  let target = weatherType.find(weather => weather.id.find(weatherId => weatherId === typeId))

  if (!target) {
    console.log(`please add weather id ${typeId}`)
  }
  // none all el in pic
  Object.entries(target).forEach(([key, value]) => {
    if (forcastPic.querySelector('.' + key)) {
      forcastPic.querySelector('.' + key).style.display = 'none'
    }
  })
  // block the condition
  Object.entries(target).filter(([key, value]) => value === true)
    .forEach(([key, value]) => {
      forcastPic.querySelector('.' + key).style.display = 'block'
    })
}
function updateWeatherPics() {
  updateWeatherPic('forcast-pic')
  let numDay = forcast.querySelectorAll('.day').length
  for (let i = 0; i < numDay; i++) {
    updateWeatherPic(`day:nth-child(${i + 1})`)
  }
}

function loadingPath() {
  pathList.forEach(path => {
    let pName = path.getAttribute("title")
    let result = provinceData.find(province => province.eng_name === pName)
    result.tag = path.getAttribute("id")
    path.style.stroke = part_route[result.part]

    path.addEventListener('click', evt => {
      // edit mode
      if (path.style.cursor === 'crosshair') {
        getCapitalPath(pName, result.tag)
      } else {
        // normal mode
        updateForcast(pName)
        // remove active
        pathList.forEach(path => path.classList.remove('active'))
        evt.target.classList.add('active')
      }

    })
  })
}

function toggleEdit() {
  editMap.style.display = editMap.style.display === 'block' ? 'none' : 'block'
  editText.style.display = editText.style.display === 'block' ? 'none' : 'block'
}

init()
const svg = document.querySelector('svg')
const openMapBtn = document.getElementById('openMapBtn')
const edit = document.querySelector('#edit')
const setCityBtn = document.getElementById('setCityBtn')
const provinceInput = document.getElementById('provinceInput')

// icon 
const editIcon = document.getElementById('editIcon')
const editMap = document.getElementById('editMap')
const editText = document.getElementById('editText')
const mint = document.getElementById('mint')

openMapBtn.addEventListener('click', () => {
  svg.style.display = svg.style.display === 'block' ? 'none' : 'block'
  edit.style.display = edit.style.display === 'block' ? 'none' : 'block'
})

edit.addEventListener('click', (evt) => {
  if (evt.target.id === 'editIcon') {
    pathList.forEach(path => path.style.cursor = 'initial')
    toggleEdit()
  }
  if (evt.target.id === 'editText') {
    pathList.forEach(path => path.style.cursor = 'initial')
  }

  if (evt.target.id === 'editMap') {
    pathList.forEach(path => path.style.cursor = 'crosshair')
  }
})

setCityBtn.addEventListener('click', () => {
  mint.innerText = '輸入關鍵字搜尋城市'
  let name = provinceInput.value
  let result = provinceNames.find(n => n.name === name)
  console.log(result)
  if (!result) {
    mint.innerText = '城市不存在!請重新輸入: '
  } else {
    console.log('get city')
    getCapitalPath(result.labelName, result.tag)
    toggleEdit()
    setTimeout(() => {
      $('#searchModal').modal('hide')
    }, 500)
  }


})




