# THAISKR 
[web link](https://jane0819tw.github.io/thaiskr/)
a project that is about my website.
## how to use 
this website contains these functions pages: 

Users can click the building to get a quote, and the door will open. 
In this part, user can click the button and move the mouse, the thai letters will appear by random,as a result, the sreen will compute the letter which appear most times during the time and show.

* [findMovie](#findMovieDrama)
1. User can find the thai movies and add into the favorite pages.
2. click picture to open the detail panel.
3. Click heart to add into favorite page.
* [findTV](#findMovieDrama)
1. User can find the thai dramas and add into the favorite .
2. Click once to open the detail panel,click twice to add into the favorite collection.
3. Users need to toggle the collect button on right bottom. 

* [keyboard](#keyboard)
1. Only support in destop device. 
2. Keydown the keyboard and the result and sound will be triggered.

* [letterGame](#letterGame)
1. Only support in destop device. 
2. select different type of thai letter to practice.
3. Clcik start to start the game. 
4. Click the words in one side, and click another word that is true in another side. 
5. It have five levels to play. 

* [newspaper](#newspaper)
1. slide the nespaper from right-bottom side to left-top side. 
2. Choose newspaper topic to show below.
3. Focus the topic that as the website load, it will show the topic articles that you set. 
* [weather](#weather)
1. Click the pencil to change the red city, there are two ways to change the red city: 
1-1. pin icon: the pointer will become cross, and click the city. 
1-2. text icon: you can search by city name, in <code>chinese</code>、<code>english</code>、<code>thai</code>。
2. click the pencil to finish edit. 

* [btsRoute](#btsRoute)
1. Users can select in <code>chinese</code>、<code>english</code>、<code>thai</code>,to show the BTS name. 
2. Click the bts station, and it will be append on the right panel to show your trip schedule.
3. Click <code>+</code>to add a day.
4. The <code>yellow pencil</code> means the day that when you  click bts station, it will be added into,you can change it by click pencil on another day.  
5. it will calculate the price that you will buy a one day ticket or not.  
6. you can delete the day by click <code>-</code>。
7. edit the trip name. 
8. click save button to store now schedule. 
* [youtube player](#player)
1. click the play button to play song.
2. click the prev button and next button to change the song now playing.
3. Right side will show the song information.
4. move mouse on the cd will change the speed that play song. 

## data api 
* movies and dramas [TMDB](https://www.themoviedb.org/?language=zh-TW)
* news [the news api](https://newsapi.org/)
* thai letters files [omniglot](https://www.omniglot.com/writing/thai.htm)
* thai songs [youtube api](https://developers.google.com/youtube/v3)
* weather data[openweather](https://openweathermap.org/api)
* GIS map data [bangkokgis](http://www.bangkokgis.com/modules.php?m=download_shapefile)
## main skills
* use <code>bootstrap</code> for page design.
* use <code>axios</code> to load api data.
* use <code>d3</code> to show map data. 
* use <code>Vue</code> in some pages. 
* use <code>TweenMax</code> to do some animation. 
## pages skills
### index
#### 1. thailand landmark
* use ::before,::after
the first part I use many css ::before and ::after to write a landmark--anusawari in thailand bangkok.when you click the landmark, you will get a thai quote in my object-format database.
#### 2. website functions description
* use skrollr (Note: [how to use skrollr in html](https://hackmd.io/daCJMcqZRnm6pbVyXv_4xg?view))
the second main part is my website functions description, I use <code>skrollr</code> to do the animation.

#### 3. random thai letters
* make a user interact. 
I import the thai letters data and  a class called <code>Vec2()</code> featured at deal with point.And I use module to do this. 
(Note: [how to use module in js file](https://hackmd.io/vGUYwSp9RsW8GvIPqZUaBA?view))

### findMovieDrama
* use TMDB
findMoive and findTV page use the same api from TMDB.
* support search 
support normal seach and keywords search. 
* support add favorite
use <code>localStorage</code> to store what the users choose. 
(Note: [how to use localStorage](https://hackmd.io/QMX4yniKQhWjkUAuOmERUg))

* practice Vue
I try to use <code>Vue</code> in findTV page. 
* wheel listener
Use wheel listener to slide the panel. 
* use TweenMax to make animation. 
### keyboard
This page is difficult in data format processing.I make a data file that is suit for my functions. 

### letterGame
* Use same data with keyboard page.
* Use <code>canvas</code>to do the drawing panel. 
### newspaper
* use data from the news api. 
* practice Vue
I try to use <code>Vue</code> in this page. 
* slide newspaper
slide it with <code>rotate3d</code> 、<code>transform-origin</code> style attr.

### weather
* use data from open weather api.
* practice Vue
I try to use <code>Vue</code> in this page.

### btsRoute
* practice Vue
I try to use <code>Vue</code> in this page.

* use shp file data from bangkokgis. 
(article: [how to deal with data from thailand](https://medium.com/%E5%B0%8F%E9%83%AD-%E0%B9%80%E0%B8%88%E0%B8%99/d3-js-%E9%85%8D%E5%90%88qgis%E8%99%95%E7%90%86%E6%B3%B0%E5%9C%8B%E8%B3%87%E6%96%99%E7%95%AB%E5%87%BA%E9%BB%9E%E5%BA%A7%E6%A8%99-99c8d909043))

### player
this page use youtube api. 


