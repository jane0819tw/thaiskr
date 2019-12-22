// shp2geojson  https://mapshaper.org/
// shp data https://data.gov.tw/dataset/7442
// 教學文章 https://letswrite.tw/d3-vue-taiwan-map/
// d3 map 教學 https://github.com/d3/d3/wiki/%E5%9C%B0%E7%90%86%E8%B7%AF%E5%BE%84
// shp 轉檔 https://kuro.tw/posts/2015/05/05/note-shapefile-to-geojson/
const width = '600'
const height = '600'

const svg = d3.select('#svg')
  .attr('width', width)
  .attr('height', height)
  .attr('viewBox', `0 0 ${width} ${height}`)

let projection = d3.geo.mercator() // 利用麥卡托投影mercator()，
  .translate([width / 2, height / 2]) // translate把中心偏移量調整回來，
  .center([100.56, 13.73]) // center以該經緯度作為中心點(可以參考geojson裡面的座標值)，
  .scale(212700) // scale要自己去調整，我使用的是捷運站資料，所以放大的倍數很大。

let path = d3.geo.path().projection(projection)

const languageNode = document.getElementById('language')

const routeMap = {
  W: [1],
  S: [1, 2, 3, 5, 6, 7, 8],
  E: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  N: [1, 2, 3, 4, 5, 7, 8]
}
const priceMap = {
  1: 16,
  2: 23,
  3: 26,
  4: 30,
  5: 33,
  6: 37,
  7: 40,
  8: 44
}
// travel class ---------------------------------------------
class Travel {
  constructor() {
    this.language = 'bts_station_name_eng_name'
    this.pointsData = null
    this.schedules = []
    this.nowScheduleIndex = 0
    this.nowTrip = { start: null, end: null, price: 0, isHide: false }
    this.init()
  }
  init() {
    this.drawLine()
    this.drawPoints()
    this.addListener()
    this.checkSchedules()
    setTimeout(() => {
      this.writeSecdules()
    }, 500)

  }
  checkSchedules() {
    let historyData = JSON.parse(localStorage.getItem('schedules'))
    console.log(historyData)
    if (historyData) {

      this.schedules = historyData
    } else {
      this.schedules.push([])
    }

  }
  addListener() {
    this.addScheduleListener()
    this.addAppendListener()
    this.addInputListener()
    this.addSaveListener()
  }
  addSaveListener() {
    document.getElementById('saveSchedule').addEventListener('click', () => {
      localStorage.setItem('schedules', JSON.stringify(this.schedules))
      setTimeout(() => {
        $('#myModal').modal('hide')
      }, 1000)

    })
  }
  addScheduleListener() {
    document.getElementById('schedule').addEventListener('click', evt => {
      if (evt.target.tagName === 'I') {
        // 刪除trip
        if (evt.target.classList.contains('delete')) {
          let tripId = evt.target.dataset.id
          let scheduleIndex = evt.target.parentElement.dataset.index
          this.deleteTrip(scheduleIndex, tripId)
        }
        // 刪除schedule
        if (evt.target.classList.contains('minus')) {
          let scheduleIndex = evt.target.dataset.index
          this.deleteSechedule(scheduleIndex)
        }
        // 目前正在編輯的
        if (evt.target.classList.contains('edit')) {
          this.nowScheduleIndex = +evt.target.dataset.index
        }
        this.writeSecdules()
      }
      if (evt.target.classList.contains('day')) {
        let scheduleIndex = evt.target.dataset.index
        this.toggleSchedule(scheduleIndex)
      }
    })
  }
  toggleSchedule(scheduleIndex) {
    this.schedules[scheduleIndex].forEach(trip => trip.isHide = !trip.isHide)
    this.writeSecdules()
  }
  addAppendListener() {
    document.getElementById('addSchedule').addEventListener('click', evt => {
      this.schedules.push([])
      this.nowScheduleIndex = this.schedules.length - 1
      this.writeSecdules()
    })
  }
  addInputListener() {
    document.getElementById('infoPanel').addEventListener('input', evt => {
      let scheduleIndex = evt.target.parentElement.dataset.index
      let tripIndex = evt.target.dataset.id
      this.schedules[scheduleIndex][tripIndex].name = evt.target.value

    })
  }
  deleteTrip(scheduleIndex, tripId) {
    this.schedules[scheduleIndex].splice(tripId, 1)
  }
  deleteSechedule(scheduleIndex) {
    this.schedules.splice(scheduleIndex, 1)
    if (this.schedules.length === 0) {
      this.schedules.push([])
    }
    this.nowScheduleIndex = this.schedules.length - 1
  }
  addTrip() {
    this.schedules[this.nowScheduleIndex].push(this.nowTrip)
    // this.schedules[this.schedules.length - 1] = this.nowSchedule
    this.nowTrip = { start: null, end: null, price: 0, isHide: false }
  }

  price(arr) {
    // 都是延伸線
    if (this.isExtend(arr[0]) && this.isExtend(arr[1])) return 15
    // 一條延伸線
    let extendStationIndex = arr.findIndex(station => this.isExtend(station))
    if (extendStationIndex != -1) {
      let price = this.dispatchOneExtend(extendStationIndex, arr)
      return price
    } else {
      // 沒有延伸線
      let price = this.dispatchNoExtend(arr)
      return price
    }
  }
  dispatchNoExtend(arr) {
    let passNum
    if (this.isSameDir(arr)) {
      passNum = Math.abs(this.findPassDirNum(arr[0]) - this.findPassDirNum(arr[1]))
    } else {
      // 把siam暫不要列入計算
      passNum = arr.filter(s => s != '0').reduce((total, station) => total + this.findPassDirNum(station), 0)
    }
    return priceMap[passNum > 8 ? 8 : passNum]
  }

  dispatchOneExtend(extendStationIndex, arr) {
    let normalIndex = extendStationIndex === 0 ? 1 : 0
    if (this.isSameDir(arr)) {
      // 扣掉延伸線 臨界值
      let passNum = Math.abs(this.findPassDirNum(arr[normalIndex]) - 10)
      return priceMap[passNum > 8 ? 8 : passNum] + 15
    } else {
      // 包含了siam的情況
      let siam = arr.find(station => station === '0') ? 15 : 0
      return priceMap['8'] + siam
    }
  }
  findPassDirNum(station) {
    let stationDir = station.slice(0, 1)
    let stationNum = station.slice(1)
    let passNum = routeMap[stationDir].findIndex(dirStion => dirStion === +stationNum) + 1
    return passNum
  }
  isSameDir(arr) {
    let dirs = arr.map(station => station.split('')[0])
    return dirs[0] === dirs[1]
  }
  isExtend(station) {
    return ['E10', 'E11', 'E12', 'E13', 'E14'].find(s => s === station)
  }
  decideAddStation(station) {
    // 加入起點
    if (!this.nowTrip.start) {
      this.addStart(station)
    } else {
      // 加入終點
      if (this.checkAddStation(station)) {
        this.addEnd(station)
      }
    }
  }
  addStart(station) {
    this.nowTrip.start = station
  }
  addEnd(station) {

    this.nowTrip.end = station
    this.addTrip()

    this.writeSecdules()
    console.log('add end')
  }
  // 不要加到同一個
  checkAddStation(station) {
    return !(this.nowTrip.start === station)
  }
  findName(stationTag) {
    console.log(this.pointsData)
    return this.pointsData.find(point => point.properties.no === stationTag).properties[this.language]
  }
  writeSecdules() {
    console.log('sehedules')
    let html_content = ''
    this.schedules.forEach((sche, i) => {
      console.log(sche)
      html_content += `
      <div class="m-3 sche">
        <div class="action justify-content-between">
          <h3 data-index="${i}" class="day">第${i + 1}天</h3>
          <i data-index="${i}" class="${this.nowScheduleIndex === i ? 'nowSche' : ''} edit fas fa-edit"></i>
            
          <i data-index="${i}" class="minus fas fa-minus-circle"></i>

        </div>
        <ul class="list-group" style="display: ${this.writeDisplay(sche)}">
          ${this.writeSecdule(sche, i)}
        </ul>
        ${this.writeSmallTotal(sche)}
        
      </div>
      `
    })
    html_content += this.writeTotal()
    document.getElementById('schedule').innerHTML = html_content

  }
  writeDisplay(sche) {
    if (sche[0]) {
      console.log(sche[0])
      return sche[0].isHide ? 'none' : 'block'
    } else {
      return 'block'
    }
  }
  writeSmallTotal(schedule) {
    let price = this.getDayPrice(schedule)
    return `
    <div class="p-2 result"  style="display:${this.writeDisplay(schedule)}">
    ${this.writeMes(price)}
      
      
      <span class="smallTotal">小計: $ ${price}元</span>
    </div>
      
      `
  }
  writeMes(price) {
    return `
    <span class="message">
      ${price > 120 ? '一日通票比較便宜喔' : '去櫃檯買票即可。'}
    </span>
    ${price > 120 ? `
    <button class="btn btn-sm btn-warning">
      <a href="http://tinyurl.com/ryxawjt" target="_blank">票券</a>
    </button>
    ` : ''}
    `
  }
  // 
  writeTotal() {
    return `
    <div class="totalInfo px-3">
      <p class="total">總計: $ ${this.getTotalPrice()}元</p>
      <button class="mr-3 btn btn-sm btn-danger">
        <a href="http://tinyurl.com/wxhk97y" target="_blank">兔子卡</a>
      </button>
      
    </div>
  `
  }
  getTotalPrice() {
    return this.schedules.reduce((total, schedule) => total + this.getDayPrice(schedule), 0)
  }
  getDayPrice(schedule) {
    console.log(schedule)
    return schedule.reduce((total, trip) => total + trip.price, 0)
  }
  writeSecdule(nowSchedule, scheduleIndex) {
    let html_content = ''

    nowSchedule.forEach((trip, index) => {
      console.log(trip.start)
      trip.price = this.price([trip.start, trip.end])
      html_content += `
      <li class="m-0 py-1 px-4 row trip list-group-item" data-index=${scheduleIndex}>
        <input data-id="${index}" class="pr-0 col-2 station" value="${trip.name ? trip.name : `第${index + 1}站`}" type="text" />
        <span class="start">${trip.start}  ${this.findName(trip.start)}</span>
        <i class="fas fa-arrow-alt-circle-right"></i>
        <span class="end">${trip.end}  ${this.findName(trip.end)}</span>
        <i class="delete fas fa-trash-alt ml-2" data-id=${index}></i>
        <span class="price">$ ${trip.price}</span>
        
      </li>`

    })
    // // <span class="col-2 station">第${index + 1}站</span>
    return html_content
  }
  drawLine() {
    // draw line
    // 畫線段
    let urlLine = '../geoData/transBTSline.geojson'
    d3.json(urlLine, (error, res) => {
      if (error) throw error
      console.log(res)
      svg.selectAll('path').data(res.features).enter().append('path')
        .attr({
          "d": path,
          'stroke': d => d.properties.lineName === 'sukhumvit' ? "#6AB039" : '#17622A',
          'stroke-width': '10px',
          'fill': 'none'
        })
    })
  }
  drawPoints() {
    // 讓d3抓GeoJSON檔，並寫入path的路徑  bts_station 
    var url = '../geoData/joinTransBTS.geojson'; // GeoJSON的檔案路徑
    d3.json(url, (error, geometry) => {
      if (error) throw error;
      this.pointsData = geometry.features
      //插入分组元素
      var location = svg.selectAll(".location")
        .data(geometry.features)
        .enter()
        .append("g")
        .attr("class", "location")
        .attr("id", d => d.properties.no)
        .attr("transform", function (d) {
          //计算标注点的位置
          var coor = projection([d.geometry.coordinates[0], d.geometry.coordinates[1]]);
          return "translate(" + coor[0] + "," + coor[1] + ")";
        });

      location.append("circle")
        .attr({
          r: 8,
          fill: '#fff',
          'stroke-width': '5px',
          stroke: d => d.properties.bts_station_name_line === 'sukhumvit' ? "#6AB039" : '#17622A',
          class: 'location'
        })
        .style({
          cursor: 'pointer',
        })
        .on('mouseover', function (d, i) { // 這裡如果改成箭頭函數報錯
          d3.select(this).attr('fill', "orange")
          d3.select(this.nextElementSibling).attr('fill', "orange")
        })
        .on('mouseout', function (d, i) { // 這裡如果改成箭頭函數報錯
          d3.select(this).attr('fill', "#fff")
          d3.select(this.nextElementSibling).attr('fill', "#fff")
        })
        .on('click', function (d, i) { // 這裡如果改成箭頭函數報錯
          console.log(this.parentElement.id)
          travel.decideAddStation(this.parentElement.id)
        })


      // languageNode.value
      location.append('text').text(d => d.properties[this.language].replace('สถานี', ''))
        .attr({
          // x: (d, i) => parseInt(d.properties.no.split('').slice(1).join('')) % 2 === 1 ? 15 : 0,
          x: d => d.properties.bts_station_name_line === 'sukhumvit' ? 15 : -10,
          y: d => d.properties.bts_station_name_line === 'sukhumvit' ? -5 : 20,
          fill: '#fff',
          class: 'station_name'
        }).style({
          'font-size': '10px'
        })
        .on('mouseover', function (d, i) { // 這裡如果改成箭頭函數報錯
          d3.select(this).attr('fill', "orange")
          d3.select(this.previousElementSibling).attr('fill', "orange")
        })
        .on('mouseout', function (d, i) { // 這裡如果改成箭頭函數報錯
          d3.select(this).attr('fill', "#fff")
          d3.select(this.previousElementSibling).attr('fill', "#fff")
        })

      location.append('text').text(d => d.properties.no)
        .attr({
          x: -5,
          y: 3
        })
        .style({ 'font-size': '8px', 'pointer-events': 'none' })

    })
  }
}

let travel = new Travel()

languageNode.addEventListener('change', () => {
  travel.language = languageNode.value
  d3.selectAll('.station_name').text(d => d.properties[travel.language])
})















