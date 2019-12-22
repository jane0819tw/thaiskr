(function () {
  const sourceData = [
    { title: '影視來源', link: 'https://www.themoviedb.org/?language=zh-TW', linkName: 'TMDB' },
    { title: '新聞來源', link: 'https://newsapi.org/', linkName: 'the news api' },
    { title: '泰文字母音檔', link: 'https://www.omniglot.com/writing/thai.htm', linkName: 'omniglot' },
    { title: '泰國歌曲', link: 'https://developers.google.com/youtube/v3', linkName: 'youtube api' },
    { title: '天氣資料', link: 'https://openweathermap.org/api', linkName: 'openweather' },
    { title: '地圖GIS資料', link: 'http://www.bangkokgis.com/modules.php?m=download_shapefile', linkName: 'bangkokgis' }]
  const sourceList = document.getElementById('sourceList')
  function writeSources() {
    let html_content = ''
    sourceData.forEach(source => html_content += `
      <li class="source list-group-item">
        <i class="fas fa-hand-point-right"></i>
        <span class="title">${source.title}</span>
        <a href="${source.link}" target="_blank"><i>${source.linkName}</i></a>
      </li>
    `)
    console
    sourceList.innerHTML = html_content
  }
  writeSources()

}())