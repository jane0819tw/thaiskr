const BASE_URL = 'https://newsapi.org/v2/top-headlines'
const API_KEY = '4790727deeac4b1a80c7742a02da6eb6'

let vm = new Vue({
  el: '#app',
  data: {
    newsData: [],
    selectionData: [],
    posDown: { x: null, y: null },
    posUp: { x: null, y: null },
    phoneType: false,
    selItems: [
      { name: '一般', value: 'general', isChecked: true },
      { name: '商業', value: 'business', isChecked: false },
      { name: '健康', value: 'health', isChecked: false },
      { name: '娛樂', value: 'entertainment', isChecked: false },
      { name: '科學', value: 'science', isChecked: false },
      { name: '體育', value: 'sports', isChecked: false },
      { name: '科技', value: 'technology', isChecked: false }],
    focusTopic: JSON.parse(localStorage.getItem('focusTopic')) || { name: '一般', value: 'general', isChecked: true }
  },

  computed: {
    delLen() {
      return Math.sqrt(Math.pow((this.posDown.x - this.posUp.x), 2) + Math.pow((this.posDown.y - this.posUp.y), 2))
    }
  },
  methods: {
    loadData(dataToWrite, item) {
      if (item) {
        this.selItems.forEach(thing => thing.isChecked = false)
        item.isChecked = true
      }
      this.$nextTick(() => {
        let sel = document.querySelector('label.active input').value
        console.log(sel)
        axios.get(BASE_URL, {
          params: {
            apiKey: API_KEY,
            country: 'th',
            category: sel
          }
        }).then(res => {
          console.log(res)
          if (dataToWrite === 'newsData') {
            this[dataToWrite] = [...res.data.articles.reverse()]
          } else {
            this[dataToWrite] = [...res.data.articles]
          }
          console.log(res.data.articles)
        }).catch(e => console.log(e))


        // this.newsData = [...res.data.articles]

      })

    },
    loadEvent() {
      document.querySelectorAll('.news').forEach(piece => {
        piece.addEventListener('mousedown', evt => {
          evt.preventDefault()
          this.posDown = { x: evt.x, y: evt.y }
          piece.style.cursor = 'grabbing'
        })
      })

      document.querySelectorAll('.news').forEach(piece => {
        piece.addEventListener('mouseup', evt => {
          evt.preventDefault()
          this.posUp = { x: evt.x, y: evt.y }
          piece.style.cursor = 'grab'
          console.log(this.delLen)
          if (this.delLen > 50) {
            this.dealAction(piece)
          }
        })
      })

      window.addEventListener('resize', () => {
        this.phoneType = window.innerWidth > 576 ? false : true
      });
    },
    dealAction(piece) {
      if (this.posDown.y > this.posUp.y && this.posDown.x > this.posUp.x) {
        // 由下往上翻
        this.openDirection(piece)
      } else if (this.posDown.y < this.posUp.y && this.posDown.x < this.posUp.x) {
        // 由上往下翻回來
        this.closeDirection(piece)
      }
    },
    openDirection(piece) {
      if (piece.previousElementSibling) {
        // 由下往上翻
        piece.classList.add('openLeft')
      }

    },
    closeDirection(piece) {
      // 翻回來
      if (piece.nextElementSibling) {
        piece.nextElementSibling.classList.remove('openLeft')
      }
    },
    bgCSS(url) {
      return {
        backgroundImage: `url(${url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    },
    showDate(date) {
      let d = new Date(date)
      return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
    },
    setTopic() {
      this.focusTopic = this.selItems.find(item => item.isChecked)
      localStorage.setItem('focusTopic', JSON.stringify(this.focusTopic))
      this.loadData('newsData')
      setTimeout(() => {
        $('#exampleModal').modal('hide')
      }, 1500)

    }
  },
  mounted() {

    this.loadData('newsData')
    this.loadData('selectionData', this.selItems[0])
    setTimeout(() => {
      this.loadEvent()
    }, 1000)
  }
})
console.log(document.querySelectorAll('.news'))



