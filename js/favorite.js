// Immediately Invoked Functions Expressions 立即調用函式表達式 讓函式被宣告後自動執行
(function () {

  const key = '6c78209662b809b81596ac7af717a7f7'
  // img link
  const BASE_URL = 'https://api.themoviedb.org/'
  const POSTER_URL = 'https://image.tmdb.org/t/p/w200/'
  const MOVIE_URL = BASE_URL + '3/movie/'
  const YOUTUBE = 'https://www.youtube.com/'

  //NODE TO USE ---------------------------------------------------------
  const favoritePanel = document.getElementById('favorite-panel')
  const castBtn = document.getElementById('castBtn')
  let loadingPanel = document.querySelector('.loadingPanel')

  const modalNodes = {
    image: document.getElementById('image'),
    release_date: document.getElementById('release_date'),
    content: document.getElementById('content'),
    genres: document.getElementById('genres'),
    popularity: document.getElementById('popularity'),
    title: document.getElementById('detailModalLabel'),
    castList: document.getElementById('castList')
  }

  const TODAY = new Date()
  let favorite_data = []
  let genreAll = []



  function init() {
    favorite_data = JSON.parse(localStorage.getItem('favorite_movies'))
    writeResult(favorite_data)
  }
  function loading() {
    loadingPanel.style.display = "flex"
    favoritePanel.style.display = "none"
    console.log('start loading...')
  }
  function finishLoading() {
    setTimeout(() => {
      loadingPanel.style.display = "none"
      favoritePanel.style.display = "flex"
      console.log('finish loading! ')
    }, 800)
  }

  function writeResult(movie_data) {
    loading()
    favoritePanel.innerHTML = ''
    movie_data.forEach(movie => {
      console.log(movie)
      let date = new Date(movie.release_date)
      if (movie.poster_path) {
        favoritePanel.innerHTML += `<div data-id=${movie.id} class="movie-box col-es-12 col-sm-6 col-md-4 col-lg-3">
        <img src=${POSTER_URL}${movie.poster_path} alt="" class="img-fluid">
        <div data-id=${movie.id} class="darken">
          ${movie.title === movie.original_title ? '' : movie.title}<br>
          ${movie.original_title}
        </div>
        ${(Date.parse(date) > Date.parse(TODAY)) ? `<div class="comingMovie">即將上映</div>` : ``}
        <i class="fas fa-minus-circle"></i>
      </div>`

      }
    })
    finishLoading()
  }

  function getMovieDetail(id) {
    let videoSource = []
    loading()
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
          console.log(res)
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
          modalNodes.castList.innerHTML = ''
          let showCasts = res.data.credits.cast.length > 6 ? res.data.credits.cast.slice(0, 6) : res.data.credits.cast
          showCasts.forEach(cast => {
            console.log(cast.profile_path)
            modalNodes.castList.innerHTML += `
              <div class="cast cast col-4 d-flex flex-column align-items-center">
                <div class="image" style="background-image:url(
                  ${cast.profile_path ? `https://image.tmdb.org/t/p/w200/${cast.profile_path}` : ''});border:${cast.profile_path ? `none` : `1px dashed #000`}">
                </div>
                <p class="mb-1 mt-0">${cast.character}</p>
                <p class="name m-1">${cast.name}</p>
              </div>`
          })
          // genres
          modalNodes.genres.innerHTML = ''
          res.data.genres.forEach(genre => {
            modalNodes.genres.innerHTML += `<div class="bg-secondary genre mr-1 mb-1" > ${genre.name}</div> `
          })
          // make sure it is in normal page
          modalNodes.castList.classList.add('d-none')
          modalNodes.content.classList.remove('d-none')
          castBtn.innerText = '卡司'
        }).catch(e => console.log(e)).then(() => {
          finishLoading()
        })
      })
  }
  // listen to dataPanel
  favoritePanel.addEventListener('click', evt => {
    if (evt.target.matches('.darken')) {
      setTimeout(() => {
        $('#detailModal').modal('show')
      }, 850)
      let id = evt.target.dataset.id
      getMovieDetail(id)


    }
    // click delete
    if (evt.target.tagName === 'I') {
      let id = parseInt(evt.target.parentElement.dataset.id)
      // 從畫面移除
      evt.target.parentElement.remove()
      let targetindex = favorite_data.findIndex(movie => movie.id === id)
      // 從陣列移除
      favorite_data.splice(targetindex, 1)
      // 更新loclStorage裡面的資料
      localStorage.setItem('favorite_movies', JSON.stringify(favorite_data))
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

