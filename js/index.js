if (window.location.protocol === "https:") {
  window.location.href = window.location.href.replace("https:", "http:");
} //학원페이지가 https 일 경우 kmdb api요청 안되서 http로 변환
// const instance = new Notice();

// instance.showLoading({
//   type: 'line',
//   title: '영화 정보를 불러오는 중입니다.',
//   fontSize: 20,
// });

let day = new Date();

let year = day.getFullYear();
let month = ("0" + (day.getMonth() + 1)).slice(-2); // 1자리수 일때를 대비해서 0을 붙인 뒤 뒤에서 2글자만 추출
let date = ("0" + (day.getDate() - 1)).slice(-2); // 박스 오피스는 어제 날짜로 반영이 되서 1일을 뺐음

const $dateSpan = document.querySelector(".date");
$dateSpan.innerText = `${year}. ${month}. ${date}`;

const $iframe = document.getElementById("iframe");
let movieDetailArray = [];
let movieDetailObject = {};
/// 일별 박스 오피스 //
// const $slide = document.querySelector(".swiper-wrapper");
let yesterday = `&targetDt=${year}${month}${date}`;

async function boxofficeFnc() {
  const boxOfficeKey = `?key=99e85df0a1949ff62718d3cd83fa4bb1`;
  const moveLankingUrl = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json${boxOfficeKey}${yesterday}`; //수정필요
  const response = await fetch(moveLankingUrl);
  const data = await response.json();
  let openDays = [];
  let movieIncodingName = [];
  let movieList = data.boxOfficeResult.dailyBoxOfficeList;
  movieList.forEach((value) => {
    movieDetailObject = {
      movieName: value.movieNm,
      movieAudiAcc: value.audiAcc,
    };
    movieDetailArray.push(movieDetailObject);
    movieIncodingName.push(encodeURIComponent(value.movieNm)); //ie에서 한글 인식 안되서 인코딩해서 영화 이름값 넘김;
    openDays.push(value.openDt.replace(/-/gi, "")); //년도를 yyyy-mm-dd를 yyyymmdd로 변환시키기
  })

  return [movieIncodingName, openDays];
}

async function moviePosterFnc(movieName, movieOpenDate) {
  for (let i = 0; i < movieName.length; i++) {

    const moviePosterValue = {
      key: `?ServiceKey=RKHFT107IUJ283GC7UPM`,
      collection: `&collection=kmdb_new2`,
      title: `&title=${movieName[i]}`,
      openDay: `&releaseDts=${movieOpenDate[i]}`,
      sort: `&sort=prodYear,1`,
    };
    // if (movieName[i].indexOf("!") !== -1)
    //   moviePosterValue.title = `&query=${movieName[i].replace(/!/g, "")}`;
    // kmdb에서 제목에 ! 있으면 제대로 찾질 못함
    const url = `http://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp${moviePosterValue.key}${moviePosterValue.collection}${moviePosterValue.title}${moviePosterValue.openDay}${moviePosterValue.sort}`;
    try{
      const response = await fetch(url);
      const data = await response.json();
      const dataResult = data.Data[0].Result[0];
      let posters = dataResult.posters;
      let mainPoster = posters.split("|")[0]; //여러개 이미지를 |를 기준으로 잘라서 첫번째 배열을 가져오기
      movieDetailArray[i].poster = mainPoster;
      movieDetailArray[i].openingDate = dataResult.repRlsDate;
      movieDetailArray[i].directorNm =
        dataResult.directors.director[0].directorNm;
      movieDetailArray[i].actor = dataResult.actors.actor;
      movieDetailArray[i].runtime = dataResult.runtime;
      movieDetailArray[i].genre = dataResult.genre;
      movieDetailArray[i].rating = dataResult.rating;
      movieDetailArray[i].nation = dataResult.nation;
      movieDetailArray[i].plots = dataResult.plots.plot[0].plotText;
      movieDetailArray[i].company = dataResult.company;
    }catch(e){
      movieDetailArray[i].poster = "none.png";
      movieDetailArray[i].openingDate = "no data";
      movieDetailArray[i].plots = "죄송합니다. API에서 정보를 찾을 수 없습니다.";
    }
  }
}

async function kakaoMovieVideoFnc(movieName) {
  const incodingMovie = encodeURIComponent("영화 예고편");
  for (let i = 0; i < movieName.length; i++) {
    const kakaoVedio = `https://dapi.kakao.com/v2/search/vclip.json?query=${movieName[i]} ${incodingMovie}`;
    const response = await fetch(kakaoVedio, {
      headers: {
        Authorization: `KakaoAK 433521c4090e21edd9510cfadfaef92a`,
      },
    });
    const data = await response.json();
    console.log(data);
    for (let j = 0; j < data.documents.length; j++) {
      const kakaoMovie = `http://tv.kakao.com/v/`;
      if (data.documents[j].url.indexOf(kakaoMovie) !== -1) {
        let movieValue = data.documents[j].url.split(
          `http://tv.kakao.com/v/`
        )[1];
        movieDetailArray[i].iframeSrc = movieValue;
        break;
      }
    }
  }
}

const $posterImg = document.querySelectorAll(".swiper-slide img");
const $posterLi = document.querySelectorAll(".swiper-slide");
const $sec02 = document.querySelector(".sec02");
const $movieNameLi = $sec02.querySelector(".movie__name strong");
const $openingDateLi = $sec02.querySelector(".open__date");
const $rankingLi = $sec02.querySelector(".ranking");
const $directorNmLi = $sec02.querySelector(".director__name");
const $actorNmLi = $sec02.querySelector(".actor__name");
const $genreLi = $sec02.querySelector(".genre");
const $nationSpan = $sec02.querySelector(".nation");
const $ratingSpan = $sec02.querySelector(".rating");
const $runtimeSpan = $sec02.querySelector(".runtime");
const $countTag = $sec02.querySelector(".counting");
const $companyLi = $sec02.querySelector(".company");
const $plotP = $sec02.querySelector(".plot");

function scrollCount(obj, start, end, duration) {
  let countScrollState = true;
  let windowY =
    document.documentElement.clientHeight -
    $countTag.getBoundingClientRect().top;
  animateValue(obj, start, end, duration);
  countScrollState = false;
  document.addEventListener("scroll", function () {
    windowY =
      document.documentElement.clientHeight -
      $countTag.getBoundingClientRect().top;
    if (windowY > 0 && countScrollState) {
      animateValue(obj, start, end, duration);
      countScrollState = false;
    } else if (windowY < 0) {
      countScrollState = true;
    }
  });
}

function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const comma = Math.floor(progress * (end - start) + start);
    obj.innerText = `누적 관객수 ${comma
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}명`;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

function detailTagFnc(movieLength) {
  const $movieNoDataHide = document.querySelectorAll(".sec02 .inner .detail li:not(.movie__name, .no__data)");
  const $movieNoData = document.querySelector(".sec02 .inner .plot");
  if(movieDetailArray[movieLength].openingDate === "no data"){
    $movieNameLi.innerText = movieDetailArray[movieLength].movieName;
    $plotP.innerText = movieDetailArray[movieLength].plots;
    $movieNoDataHide.forEach((value) => {
      value.classList.add("hide");
    });
    $movieNoData.classList.add("no__data");
  }else{
    if($movieNoData.classList.contains("no__data")){
      $movieNoDataHide.forEach((value) => {
        value.classList.remove("hide");
      });
      $movieNoData.classList.remove("no__data");
    }
    let actorTextnode = "배우 : ";
    $movieNameLi.innerText = movieDetailArray[movieLength].movieName;
    $openingDateLi.innerText = movieDetailArray[movieLength].openingDate.replace(
      /(\d{4})(\d{2})(\d{2})/g,
      "$1. $2. $3"
    );
    scrollCount($countTag, 0, movieDetailArray[movieLength].movieAudiAcc, 1500);
    $companyLi.innerText = `제작사 : ${movieDetailArray[
      movieLength
    ].company.replace(/,/g, ", ")}`;
    $rankingLi.innerText = `박스오피스 ${movieLength + 1}위 `;
    $directorNmLi.innerText = `감독 : ${movieDetailArray[movieLength].directorNm}`;
    $actorNmLi.innerText = `출연 : `;
  
    $genreLi.innerText = movieDetailArray[movieLength].genre.replace(/,/g, ", ");
    $nationSpan.innerText = movieDetailArray[movieLength].nation.replace(
      /,/g,
      ", "
    );
    $plotP.innerText = movieDetailArray[movieLength].plots;
    switch (movieDetailArray[movieLength].rating) {
      case "18세관람가(청소년관람불가)":
        $ratingSpan.innerText = "18세 이상";
        break;
      case "15세관람가":
        $ratingSpan.innerText = "15세 이상";
        break;
      case "12세관람가":
        $ratingSpan.innerText = "12세 이상";
        break;
      default:
        $ratingSpan.innerText = movieDetailArray[movieLength].rating;
    }
    $runtimeSpan.innerText = movieDetailArray[movieLength].runtime + "분";
  
  
  
    const actorText = movieDetailArray[movieLength].actor.filter((value, index) => {
      return index < 4; // 배우 5명만 출력
    });
    actorText.forEach((value) => {
      actorTextnode += `${value.actorNm}, `;
    });
    actorTextnode = actorTextnode.slice(0, -2);
    $actorNmLi.innerText = actorTextnode;  
  }
}

function posterTag() {
  for (let i = 0; i < $posterLi.length; i++) {
    $posterImg[i].src = movieDetailArray[i].poster;
    $posterImg[i].alt = movieDetailArray[i].movieName;
  }
}
let clickIndex = 0;
let swiperAcitve;
let createBtn = document.createElement("button");
let $detailBtn;
let loopActiveIndex;

function swiper() {
  const swiper = new Swiper(".swiper", {
    effect: "coverflow",
    slidesPerView: "auto",
    grabCursor: true,
    centeredSlides: true,
    loop: true,
    coverflowEffect: {
      rotate: 20,
      stretch: 0,
      depth: 200,
      modifier: 1,
      slideShadows: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    on: {
      activeIndexChange: function () {
        clickIndex = this.realIndex;
        const $swiperLi = document.querySelectorAll(".swiper-slide");
        let loopActiveIndex = this.activeIndex;
        swiperAcitve = $swiperLi[loopActiveIndex];
        createBtn.classList.add("detail_btn");
        createBtn.innerText = "상세보기";
        swiperAcitve.appendChild(createBtn);
        $detailBtn = document.querySelector(".detail_btn");
      },
    },
  });
}
function posterSrcNoData(data){
  if(data){
    $iframe.style.display = "block";
    if($iframeDiv.classList.contains("none__data")){
      $iframeDiv.classList.remove("none__data");
    }
  }else{
    $iframe.style.display = "none";
    $iframeDiv.classList.add("none__data");
  }
}
function posterClick() {
  posterSrcNoData(movieDetailArray[0].iframeSrc);
  $iframe.src = `https://play-tv.kakao.com/embed/player/cliplink/${movieDetailArray[0].iframeSrc}?mute=1&fs=0&modestbranding=1`;
  detailTagFnc(0);
  $detailBtn.addEventListener("click", function () {
    posterSrcNoData(movieDetailArray[clickIndex].iframeSrc);
    $iframe.src = `https://play-tv.kakao.com/embed/player/cliplink/${movieDetailArray[clickIndex].iframeSrc}?mute=1&fs=0&modestbranding=1`;
    detailTagFnc(clickIndex);
    scrollCount($countTag, 0, movieDetailArray[clickIndex].movieAudiAcc, 1500);
  });
}

function loadingRemoveTag() {
  const $loading = document.querySelector(".loading__group");
  $loading.parentNode.removeChild($loading);
  const $sec01 = document.querySelector(".sec01");
  $sec01.style.display = "block";
  const $etc = document.querySelector(".sec02 .etc");
  $etc.classList.add("line");
}

function reflectEffect() {
  var bodyTag = document.body;
  var bodyBackColor = document.defaultView
    .getComputedStyle(bodyTag)
    .getPropertyValue("background-color");
  var bodyRGB = bodyBackColor.substring(
    bodyBackColor.indexOf("(") + 1,
    bodyBackColor.indexOf(")")
  );
  for (let i = 0; i < movieDetailArray.length; i++) {
    var gradient = `linear-gradient(to top, rgba(${bodyRGB}, 0.6) 10%, rgba(${bodyRGB}, 0.8) 25%, rgb(${bodyRGB}) 30%)`;
    document.styleSheets[0].insertRule(
      `.poster${i}::after{background-image:${gradient}, url('${movieDetailArray[i].poster}');}`,
      0
    );
  }
}
const $iframeDiv = document.querySelector(".iframe");
(function resizeFcn() {
  window.addEventListener("resize", function () {
    if (this.innerWidth < "1024") {
      $iframeDiv.style.height = $iframeDiv.clientWidth * 0.5625 + "px";
    } else {
      $iframeDiv.style.height = "auto";
    }
  });
})();

if (matchMedia("screen and (max-width: 760px)").matches) {
  // 1024px 이상에서 사용할 JavaScript
  $iframeDiv.style.height = $iframeDiv.clientWidth * 0.5625 + "px";
} else if (matchMedia("screen and (max-width: 1024px)").matches) {
  // 1024px 미만에서 사용할 JavaScript
  $iframeDiv.style.height = $iframeDiv.clientWidth * 0.5625 + "px";
}

async function apiStart() {
  const boxOfficeRankingResult = await boxofficeFnc();
  const kmdbPosterResult = moviePosterFnc(
    boxOfficeRankingResult[0],
    boxOfficeRankingResult[1]
  );
  const kakaoMovieResult = kakaoMovieVideoFnc(boxOfficeRankingResult[0]);

  await kmdbPosterResult; // 속도향상을 위한 코드 (1번째 데이터를 가지고 2, 3번 동시에 받아올 수 있음)
  await kakaoMovieResult;
  // instance.hideLoading();
  loadingRemoveTag();
  posterTag();
  swiper();
  posterClick();
  reflectEffect();
  // console.log(movieDetailArray);
}
apiStart();
