const $form = document.querySelector("#search__form");
const $searchContents = document.querySelector(".search__contents");
let movieNames = new Array();
let openDate = new Array();

const $ani = document.querySelector(".search__contents .inner");
const $movieList = document.querySelector(".search__detail");

const $contentArrow = document.querySelector(".search__menu label");
$contentArrow.addEventListener("click", function () {
  $ani.style.animationName = "none";
});

const errLi = document.createElement("li");

$form.addEventListener("submit", function (e) {
  e.preventDefault();
  let $searchValue = document.getElementById("search__value").value;
  $searchValue = encodeURIComponent($searchValue);
  if($searchValue === ""){
    alert("검색어를 입력해 주세요!");
    return false;
  }
  $searchContents.style.display = "block";
  $contentArrow.style.display = "block";
  movieSearchFnc($searchValue).catch((err) => {
    errLi.classList.add("search__err");
    errLi.innerText = "검색 결과가 없습니다.";
    $movieList.appendChild(errLi);
  });
});

let searchMovieArray = new Array();
let errTag;
async function movieSearchFnc(movieName) {
  searchMovieArray = [];
  let moviePosterValue = {
    key: `?ServiceKey=RKHFT107IUJ283GC7UPM`,
    collection: `&collection=kmdb_new2`,
    title: `&title=${movieName}`,
    sort: `&sort=prodYear,1`,
  };
  let url = `http://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp${moviePosterValue.key}${moviePosterValue.collection}${moviePosterValue.title}${moviePosterValue.sort}`;
  let response = await fetch(url);
  let data = await response.json();
  while ($movieList.hasChildNodes()) {
    $movieList.removeChild($movieList.firstChild);
  } //이미 movieList가 있는경우 초기화(쌓이는거 방지)
  const dataResult = data.Data[0].Result;
  let searchMovieObj = {};
  for (let i = 0; i < dataResult.length; i++) {
    let posters = dataResult[i].posters;
    let mainPoster = posters.split("|")[0]; //여러개 이미지를 |를 기준으로 잘라서 첫번째 배열을 가져오기
    const openingDate = dataResult[i].repRlsDate;
    const directorNm = dataResult[i].directors.director[0].directorNm;
    const actor = dataResult[i].actors.actor;
    const runtime = dataResult[i].runtime;
    const genre = dataResult[i].genre.replace(/,/g, ", ");
    const rating = dataResult[i].rating;
    const nation = dataResult[i].nation.replace(/,/g, ", ");
    const plots = dataResult[i].plots.plot[0].plotText;
    const company = dataResult[i].company.replace(/,/g, ", ");
    let title = dataResult[i].title;
    title = title.replace(/\!HS|\!HE/g, "");
    // title = title.replace(/\!HE/g, "");
    title = title.replace(/^\s+|\s+$/g, "");
    title = title.replace(/ +/g, " ");
    if (
      title &&
      mainPoster &&
      openingDate &&
      directorNm &&
      actor &&
      runtime &&
      genre &&
      rating &&
      nation &&
      plots &&
      company
    ) {
      searchMovieObj = {
        title: title,
        poster: mainPoster,
        openingDate: openingDate,
        directorNm: directorNm,
        actor: actor,
        runtime: runtime,
        genre: genre,
        rating: rating,
        nation: nation,
        plots: plots,
        company: company,
      };
      searchMovieArray.push(searchMovieObj);
    }
  }
  createMovieTag();
  movieClick();
}
function ellipsis() {
  if (navigator.userAgent.match(/Trident\/7\./)) {
    var $ellipsis = document.querySelectorAll(".ellipsis");
    for (var i = 0; i < $ellipsis.length; i++) {
      new MultiClamp($ellipsis[i], {
        ellipsis: "...",
        clamp: 3,
      });
    }
  }
}
function createMovieTag() {
  if (searchMovieArray.length > 0) {
    for (let i = 0; i < searchMovieArray.length; i++) {
      const movieListLi = document.createElement("li");
      const posterTag = document.createElement("img");
      const titleTag = document.createElement("p");
      const titleStrongTag = document.createElement("strong");
      titleStrongTag.classList.add("detail__link");
      const plotTag = document.createElement("p");
      plotTag.classList.add("ellipsis");
      const ratingTag = document.createElement("p");
      const genreTag = document.createElement("p");
      const openingDateTag = document.createElement("p");
      const movieArt = document.createElement("div");
      movieArt.classList.add("movieArt");
      const moviePoster = document.createElement("div");
      posterTag.src = searchMovieArray[i].poster;
      titleStrongTag.innerText = searchMovieArray[i].title;
      openingDateTag.innerText = searchMovieArray[i].openingDate.slice(0, 4);
      genreTag.innerText = searchMovieArray[i].genre;
      ratingTag.innerText = searchMovieArray[i].rating;
      plotTag.innerText = searchMovieArray[i].plots;
      titleTag.appendChild(titleStrongTag);
      moviePoster.appendChild(posterTag);
      movieListLi.appendChild(moviePoster);
      movieArt.appendChild(titleTag);
      movieArt.appendChild(openingDateTag);
      movieArt.appendChild(genreTag);
      movieArt.appendChild(ratingTag);
      movieArt.appendChild(plotTag);
      movieListLi.appendChild(movieArt);
      $movieList.appendChild(movieListLi);
    }
    ellipsis();
  } else {
    errLi.classList.add("search__err");
    errLi.innerText = "검색 결과가 없습니다.";
    $movieList.appendChild(errLi);
  }
}

function movieClick() {
  const $movieListLiIndex = $movieList.querySelectorAll("li .detail__link");
  if ($movieListLiIndex) {
    for (let i = 0; i < $movieListLiIndex.length; i++) {
      $movieListLiIndex[i].addEventListener("click", function () {
        $modal.classList.toggle("show");
        if ($modal.classList.contains("show")) {
          $body.style.overflow = "hidden";
        }
        const title = searchMovieArray[i].title;
        const poster = searchMovieArray[i].poster;
        const openingDate = searchMovieArray[i].openingDate;
        const directorNm = searchMovieArray[i].directorNm;
        const actor = searchMovieArray[i].actor;
        const runtime = searchMovieArray[i].runtime;
        const genre = searchMovieArray[i].genre;
        const rating = searchMovieArray[i].rating;
        const nation = searchMovieArray[i].nation;
        const plots = searchMovieArray[i].plots;
        const company = searchMovieArray[i].company;
        kmdbFn(
          title,
          poster,
          openingDate,
          directorNm,
          actor,
          runtime,
          genre,
          rating,
          nation,
          plots,
          company
        );
      });
    }
  }
}

const $body = document.querySelector("body");
const $xBtn = document.querySelector(".x__btn");

$body.addEventListener("click", (event) => {
  if (event.target === $modal || event.target === $xBtn) {
    $modal.classList.toggle("show");

    if (!$modal.classList.contains("show")) {
      $body.style.overflow = "auto";
    }
  }
});

const $modal = document.querySelector(".modal");
const $modalPosterImg = $modal.querySelector(".poster img");
const $modalMovieNameLi = $modal.querySelector(".movie__name strong");
const $modalOpeningDateLi = $modal.querySelector(".open__date");
const $modalDirectorNmLi = $modal.querySelector(".director__name");
const $modalActorNmLi = $modal.querySelector(".actor__name");
const $modalNationLi = $modal.querySelector(".nation");
const $modalGenreSpan = $modal.querySelector(".genre");
const $modalRatingSpan = $modal.querySelector(".rating");
const $modalRuntimeSpan = $modal.querySelector(".runtime");
const $modalCompanyLi = $modal.querySelector(".company");
const $modalPlotP = $modal.querySelector(".plot");

function kmdbFn(
  title,
  poster,
  openingDate,
  directorNm,
  actor,
  runtime,
  genre,
  rating,
  nation,
  plots,
  company
) {
  let actorTextnode = "배우 : ";
  $modalMovieNameLi.innerText = title;
  $modalPosterImg.src = poster;
  $modalOpeningDateLi.innerText = `개봉 : ${openingDate.replace(
    /(\d{4})(\d{2})(\d{2})/g,
    "$1. $2. $3"
  )}`;
  $modalDirectorNmLi.innerText = `감독 : ${directorNm}`;
  $modalActorNmLi.innerText = "";

  const actorText = actor.filter((value, index) => {
    return index < 4;
  });
  actorText.forEach((value) => {
    actorTextnode += `${value.actorNm}, `;
  });
  actorTextnode = actorTextnode.slice(0, -2);
  $modalActorNmLi.innerText = actorTextnode;
  $modalGenreSpan.innerText = genre;
  $modalRatingSpan.innerText = rating;
  $modalRuntimeSpan.innerText = `${runtime}분`;
  $modalNationLi.innerText = `국가 : ${nation}`;
  $modalCompanyLi.innerText = `제작사 : ${company}`;
  $modalPlotP.innerText = `${plots}`;
}
