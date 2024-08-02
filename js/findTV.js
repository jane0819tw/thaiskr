// use data from the moviedb
//(function () {
const key = '6c78209662b809b81596ac7af717a7f7'
const API_URL = 'https://api.themoviedb.org/'
const POSTER_URL = 'https://image.tmdb.org/t/p/w200/'
let def_args = {
  api_key: key,
  language: 'zh-tw',
  with_original_language: 'th',
  certification_country: 'th',
  include_adult: false,
  page: 1,
  sort_by: 'vote_average.desc'
}
const PAGINATION_LEN = 9

function closeCollapse(id) {
  console.log('close ' + id)
  document.getElementById(id).classList.remove('show')
}


let vm = new Vue({
  el: '#app',
  data: {
    programLatest: [],
    programList: [],
    title: 'test',
    latestIdList: [],
    castlist: [],
    isCastOpen: false,
    isDetailOpen: true,
    isFavOpen: false,
    detailProgram: null,
    pageTotal: 0,
    pageNow: 1,
    pagination_show: [],
    genres: [],
    selected_args: {},
    count: 0,
    favlist: []
  },
  created() {
    // 拿瀏覽器裡面的資料
    if (localStorage.getItem('tvshowList')) {
      this.favlist = JSON.parse(localStorage.getItem('tvshowList'))
    }
    let args = Object.assign(def_args)
    axios.get(`${API_URL}3/discover/tv`, {
      params: args
    }).then(res => {
      this.pageTotal = res.data.total_pages
      let list = res.data.results
      this.programList = list.filter(program => program.poster_path != null)
      this.latestIdList = list.filter(program => program.poster_path != null).map(program => program.id).slice(0, 8)
      this.pagination_show = Array.from({ length: PAGINATION_LEN }, (data, i) => i + 1)
      let _this = this
      this.latestIdList.forEach(function (id) {
        axios.get(`${API_URL}3/tv/${id}`, {
          params: {
            api_key: key,
            append_to_response: 'credits'
          }
        }).then(function (res) {
          _this.programLatest.push(res.data)
        }).catch(e => console.log(e))
      })


    }).catch(e => console.log(e))
    // load genres
    axios.get(`${API_URL}3/genre/tv/list`, {
      params: {
        api_key: key,
        language: 'zh-tw'
      }
    }).then(res => {
      this.genres = res.data.genres
      // genreAll = [...res.data.genres]
      // writeGenres(genreAll)
    }).catch(e => console.log(e))


  },
  methods: {
    bgCSS(path) {
      return {
        backgroundImage: `url(${POSTER_URL}${path})`,
        backgroundSize: 'cover'
      }
    },
    getProgramData(id, evt) {
      this.count++
      setTimeout(() => {
        // 打開詳細資料
        if (this.count === 1) {
          this.updateDetail(id)
        } else if (this.count === 2) {
          // 加到最愛
          let fav = this.programList.find(program => program.id === id)
          let favIndex = this.favlist.findIndex(fav => fav.id === id)
          // 看看有沒有被加入了
          if (favIndex === -1) {
            // 正常加入
            this.favlist.push(fav)
            TweenMax.from(`.smallPic${id}`, 1, {
              bottom: '50%',
              right: '50%',
              scaleX: 1,
              scaleY: 1,
              opacity: 0
            })
          } else {
            // 從最愛清單移除
            this.favlist.splice(favIndex, 1)
          }
        }
        this.count = 0
      }, 400)


    },
    updateDetail(id) {
      let _this = this
      TweenMax.from('#detailPanel', 0.5, {
        scaleX: 0.8,
        scaleY: 0.8
      })

      axios.get(`${API_URL}3/tv/${id}`, {
        params: {
          api_key: key,
          append_to_response: 'credits'
        }
      }).then(function (res) {
        _this.detailProgram = res.data
        _this.isDetailOpen = true
      }).catch(e => console.log(e))
    },
    updateCast(pid) {
      this.isCastOpen = true
      this.castlist = this.programLatest.find(program => program.id === pid).credits.cast
      TweenMax.from('#castPanel', 0.5, {
        scaleX: 0.8,
        scaleY: 0.8,
        ease: Elastic.easeOut
      })
    },
    wheel(evt) {
      // 利用jquery 取得元素寬度包含margin
      let width = $('.program').outerWidth(true)

      let totalWidth = width * this.latestIdList.length

      // evt.deltaY>0　往右
      width = evt.deltaY > 0 ? -width : width

      let left = parseInt(document.getElementById('showlist').style.left.replace('px'))

      if (((left + width) < 10 && (left + width) > -totalWidth) || !left) {
        TweenMax.to('#showlist', 0.5, {
          left: `+=${width}px`
        })
      } else {
        console.log(`not move ` + left)
      }

    },
    getPaginationShow() {
      // 如果總頁數還沒到PAGINATION_LEN
      if (this.pageTotal < PAGINATION_LEN) {
        this.pagination_show = Array.from({ length: this.pageTotal }, (data, i) => 1 + i)
        console.log(this.pagination_show)
        return
      }

      let start_page = this.pageNow - parseInt(PAGINATION_LEN / 2)
      // 至少要從多少開始
      let min_page = this.pageTotal - PAGINATION_LEN + 1
      if (start_page > min_page) {
        start_page = min_page
      }
      //需要切割的情況
      if (this.pageNow > PAGINATION_LEN / 2) {

        this.pagination_show = Array.from({ length: PAGINATION_LEN }, (data, i) => start_page + i)
      } else {
        this.pagination_show = Array.from({ length: PAGINATION_LEN }, (data, i) => i + 1)
      }
    },
    getPageData(page) {
      let args = {}
      Object.assign(args, def_args)
      Object.assign(args, this.selected_args)
      args.page = page
      axios.get(`${API_URL}3/discover/tv`, {
        params: args
      }).then(res => {
        this.pageTotal = res.data.total_pages
        this.programList = res.data.results.filter(program => program.poster_path != null)
        this.getPaginationShow()
      }).catch(e => console.log(e))
      this.pageNow = page
    },
    normalSearch() {
      this.selected_args = {}
      this.selected_args.sort_by = document.getElementById('sort_by').value
      this.selected_args.with_genres = Array.from(document.querySelectorAll('input[name="genre"]:checked'))
        .map(genre => genre.value).join('||')
      this.getPageData(1)
      document.getElementById('collapseNormal').classList.remove('show')
    },
    keywordSearch() {
      let keyword = document.getElementById('keywordInput').value.trim().toLowerCase()
      if (keyword) {
        axios.get(`${API_URL}3/search/keyword`, {
          params: {
            api_key: key,
            query: keyword
          }
        }).then(res => {
          this.selected_args = {}
          if (res.data.results.length) {
            this.selected_args.with_keywords = res.data.results.map(word => word.id).join('||')
            this.getPageData(1)
          } else {
            this.programList = []
            this.pageTotal = res.data.total_pages
            this.getPaginationShow()
          }
        }).catch(e => console.log(e))

      }
    },
    checkFav(id) {
      return this.favlist.findIndex(fav => fav.id === id) != -1
    }
  }, watch: {
    favlist() {
      localStorage.setItem('tvshowList', JSON.stringify(this.favlist))
    }
  }
})
// deal with loading
document.getElementById('giant').addEventListener('click', evt => {
  document.querySelector('#tvshow').classList.add('hideLoading')
  document.getElementById('giant').classList.add('showBeside')
})
console.log(vm)
//})()