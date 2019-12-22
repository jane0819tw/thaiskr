// Immediately Invoked Functions Expressions 立即調用函式表達式 讓函式被宣告後自動執行
(function () {

  const key = '6c78209662b809b81596ac7af717a7f7'
  // img link
  const BASE_URL = 'https://api.themoviedb.org/'
  const POSTER_URL = 'https://image.tmdb.org/t/p/w200/'
  const MOVIE_URL = BASE_URL + '3/movie/'
  const FIND_URL = 'https://api.themoviedb.org/3/discover/movie'
  const YOUTUBE = 'https://www.youtube.com/'

  //NODE TO USE ---------------------------------------------------------
  const dataPanel = document.getElementById('data-panel')
  const pagination = document.querySelector('.pagination')
  const normalSearch = document.getElementById('normalSearch')
  const textSearch = document.getElementById('textSearch')
  const genresList = document.getElementById('genresList')
  const castBtn = document.getElementById('castBtn')
  let loadingPanel = document.querySelector('.loadingPanel')

  const searchNodes = {
    sort_by: document.querySelector('#sortby'),
    keywordInput: document.querySelector('#keywordInput')
  }
  const modalNodes = {
    image: document.getElementById('image'),
    release_date: document.getElementById('release_date'),
    content: document.getElementById('content'),
    genres: document.getElementById('genres'),
    popularity: document.getElementById('popularity'),
    title: document.getElementById('detailModalLabel'),
    castList: document.getElementById('castList')
  }

  const PAGINATION_PAGE = 5
  const HAIF_PAGINATION = parseInt(PAGINATION_PAGE / 2)
  const TODAY = new Date()
  let TOTAL_PAGE = 0
  let pageNow = 1
  let movie_data = []
  let favorite_data
  let genreAll = []

  let def_args = {
    api_key: key,
    language: 'zh-tw',
    with_original_language: 'th',
    certification_country: 'th',
    include_adult: false,
    page: 1
  }



  function init() {
    getAPIData(pageNow, {})
    favorite_data = JSON.parse(localStorage.getItem('favorite_movies')) || []

  }
  function loading() {
    loadingPanel.style.display = "flex"
    dataPanel.style.display = "none"
    pagination.style.display = "none"
    console.log('start loading...')
  }
  function finishLoading() {
    setTimeout(() => {
      loadingPanel.style.display = "none"
      dataPanel.style.display = "flex"
      pagination.style.display = "flex"
      console.log('finish loading! ')
    }, 800)

  }
  function getAPIData(pageNow, args) {
    let nargs = {}
    // 先把預設的複製過來
    let defArgs = {}
    Object.assign(defArgs, def_args)
    // ----
    Object.assign(defArgs, args)
    Object.assign(nargs, defArgs)
    loading()
    axios.get(FIND_URL, {
      // 可以直接傳入一個物件代表所有的參數
      params: nargs
    }).then(res => {
      movie_data = [...res.data.results]
      TOTAL_PAGE = res.data.total_pages
      writeResult(movie_data)
      updatePagination(pageNow)
      // 第一次找的話 要蒐集所有的類型種類
      if (!genreAll.length) {
        getAllGenres()
      }
    }).catch(e => console.log(e))
      .then(() => {
        finishLoading()
      })
  }

  function getAllGenres() {
    axios.get(`${BASE_URL}3/genre/movie/list`, {
      params: {
        api_key: key,
        language: 'zh-tw'
      }
    }).then(res => {
      genreAll = [...res.data.genres]
      writeGenres(genreAll)
    }).catch(e => console.log(e))
  }

  function writeGenres(genreAll) {
    genreAll.forEach(genre => {
      genresList.innerHTML +=
        `<li class="col-4 text-center"><input name="genre" type="checkbox" value=${genre.id}>${genre.name}</li>`
    })
  }

  function updatePagination(pageNow) {
    pagination.innerHTML = ''
    // 目前第一頁就不要加
    pagination.innerHTML += pageNow === 1 ? '' : `
      <li class="page-item">
        <a data-id=1 class="page-link" href="#">第一頁</a>
      </li>
      <li class="page-item">
        <a data-id=${pageNow - 1} class="page-link" href="#">Previous</a>
      </li>`

    let minPage = (pageNow + HAIF_PAGINATION) > TOTAL_PAGE ? (TOTAL_PAGE - PAGINATION_PAGE + 1) : (pageNow - HAIF_PAGINATION)
    let maxPage = (pageNow + HAIF_PAGINATION) < PAGINATION_PAGE ? PAGINATION_PAGE : (pageNow + HAIF_PAGINATION)
    for (let i = 1; i <= TOTAL_PAGE; i++) {
      if ((i >= minPage) && (i <= maxPage)) {
        pagination.innerHTML += `<li class="page-item ${i === pageNow ? 'active' : ''}"><a data-id=${i} class="page-link" href="#">${i}</a></li>`
      }
    }

    // 目前最後一頁就不要加
    pagination.innerHTML += pageNow === TOTAL_PAGE ? '' : `
      <li class="page-item">
        <a data-id=${pageNow + 1} class="page-link" href="#">Next</a>
      </li>
      <li class="page-item">
        <a data-id=${TOTAL_PAGE} class="page-link" href="#">最後一頁</a>
      </li>`
  }

  function writeResult(movie_data) {
    dataPanel.innerHTML = ''
    movie_data.forEach(movie => {
      let date = new Date(movie.release_date)
      // 是否在我的最愛裡面
      let isLike = favorite_data.findIndex(fmovie => fmovie.id === movie.id) === -1 ? false : true
      if (movie.poster_path) {
        dataPanel.innerHTML += `<div data-id=${movie.id} class="movie-box col-es-12 col-sm-6 col-md-4 col-lg-3">
        <img src=${POSTER_URL}${movie.poster_path} alt="" class="img-fluid">
        <div data-id=${movie.id} class="darken">
          ${movie.title === movie.original_title ? '' : movie.title}<br>
          ${movie.original_title}
        </div>
        ${(Date.parse(date) > Date.parse(TODAY)) ? `<div class="comingMovie">即將上映</div>` : ``}
        <i class="fas fa-heart ${isLike ? 'like' : 'no'}"></i>
      </div>`
      }
    })
  }

  function getMovieDetail(id) {
    // get video  https://api.themoviedb.org/3/movie/297762/videos?api_key=###
    loading()
    let videoSource = []
    axios.get(`${MOVIE_URL}${id}/videos`, {
      params: {
        api_key: key
      }
    }).then(res => {
      // 找到一個youtube來源
      videoSource = res.data.results.filter(source => source.site === 'YouTube')
      if (videoSource.length > 3) {
        videoSource = videoSource.slice(0, 3)
      }
    }).catch(e => console.log(e))
      .then(() => {
        axios.get(`${MOVIE_URL}${id}`, {
          params: {
            api_key: key,
            language: 'zh-tw',
            append_to_response: 'credits'
          }
        }).then(res => {
          // get movie detail
          modalNodes.image.style.backgroundImage = `url(${POSTER_URL + res.data.poster_path})`
          // modalNodes.image.src = POSTER_URL + res.data.poster_path
          modalNodes.release_date.innerText = res.data.release_date
          modalNodes.popularity.innerText = res.data.vote_average
          modalNodes.title.innerText = res.data.title
          modalNodes.content.innerHTML = ''
          if (res.data.overview) {
            modalNodes.content.innerHTML += `<p id="overview">${res.data.overview}</p>`
            videoSource.forEach((source, index) => {
              modalNodes.content.innerHTML += `<button class="btn btn-outline-dark mr-2"><a class="text-white decoration-none" href=${YOUTUBE}watch?v=${source.key} target="_blank">預告片${index + 1}</a></button>`
            })
          } else {
            if (videoSource[0]) {
              modalNodes.content.innerHTML += `<iframe width="100%" height="70%" src=${YOUTUBE}embed/${videoSource[0].key}></iframe > `
            } else {
              modalNodes.content.innerHTML = '無相關內容介紹。'
            }
          }
          // get cast list
          getCastList(res.data.credits.cast)
          // genres
          modalNodes.genres.innerHTML = ''
          res.data.genres.forEach(genre => {
            modalNodes.genres.innerHTML += `<div class="bg-secondary genre mr-1 mb-1" > ${genre.name}</div> `
          })
          // make sure it is in normal page
          modalNodes.castList.classList.add('d-none')
          modalNodes.content.classList.remove('d-none')
          castBtn.innerText = '卡司'
        }).catch(e => console.log(e))
          .then(() => {
            finishLoading()
          })
      })
  }

  function getCastList(castlist) {
    modalNodes.castList.innerHTML = ''
    let showCasts = castlist.length > 6 ? castlist.slice(0, 6) : castlist
    showCasts.forEach(cast => {
      modalNodes.castList.innerHTML += `
              <div class="cast cast col-4 d-flex flex-column align-items-center">
                <div class="image" style="background-image:url(
                  ${cast.profile_path ? `https://image.tmdb.org/t/p/w200/${cast.profile_path}` : ''});border:${cast.profile_path ? `none` : `1px dashed #000`}">
                </div>
                <p class="mb-1 mt-0">${cast.character}</p>
                <p class="name m-1">${cast.name}</p>
              </div>`
    })
  }

  // listen to dataPanel
  dataPanel.addEventListener('click', evt => {
    // click drken

    if (evt.target.matches('.darken')) {
      setTimeout(() => {
        $('#detailModal').modal('show')
      }, 850)
      let id = evt.target.dataset.id
      getMovieDetail(id)
    }

    // click heart
    if (evt.target.tagName === 'I') {
      evt.target.classList.toggle('like')
      // 找到選擇電影的id
      let id = parseInt(evt.target.parentElement.dataset.id)
      // 再movie data裡面找到那個電影
      let target = movie_data.find(movie => parseInt(movie.id) === id)
      // 再favorite_data裡面找到第幾個
      let favoriteIndex = favorite_data.findIndex(fmovie => fmovie.id === target.id)

      if (favoriteIndex != -1) {
        // 從我的最愛移除
        favorite_data.splice(favoriteIndex, 1)
      } else {
        favorite_data.push(target)
      }
      localStorage.setItem('favorite_movies', JSON.stringify(favorite_data))
    }
  })

  // listen to pagination
  pagination.addEventListener('click', evt => {
    if (evt.target.tagName === 'A') {
      let page = parseInt(evt.target.dataset.id)
      if (page !== pageNow) {
        pageNow = page
        getAPIData(pageNow, { page: pageNow })
      }
    }
  })

  // search - normal
  normalSearch.addEventListener('click', () => {
    let new_arg = {}
    let selOption = searchNodes.sort_by.querySelector('option:checked')
    let selGenres = []
    genresList.querySelectorAll('input[name="genre"]:checked').forEach(sel => selGenres.push(sel.value))
    let queryText = selGenres.reduce((total, id) => total + id + '|', '')
    console.log(queryText)
    new_arg.with_genres = queryText

    if (selOption.dataset.value) {
      new_arg.sort_by = selOption.dataset.value
    }
    pageNow = 1

    getAPIData(pageNow, new_arg)
  })

  // search - more
  textSearch.addEventListener('click', () => {
    let keyword = searchNodes.keywordInput.value.trim().toLowerCase()
    if (keyword) {
      let result = null
      axios.get(`${BASE_URL}3/search/keyword`,
        {
          params: {
            api_key: key,
            query: keyword
          }
        }).then(res => {
          // 如果有關鍵字
          if (res.data.results.length) {
            console.log(res.data.results)
            result = res.data.results.find(key => key.name === keyword) || res.data.results[0]
          }
        }).catch(e => console.log(e))
        .then(() => {
          if (result) {
            console.log(result.name)
            pageNow = 1
            getAPIData(pageNow, { with_keywords: result.id })
          }
        })
    }
  })

  // cast or normal
  castBtn.addEventListener('click', () => {
    modalNodes.castList.classList.toggle('d-none')
    modalNodes.content.classList.toggle('d-none')
    castBtn.innerText = castBtn.innerText === '卡司' ? '資訊' : '卡司'
  })

  window.addEventListener('load', () => {
    init()
  })
})()

