const BASE_URL = "https://movie-list.alphacamp.io/";
const INDEX_URL = BASE_URL + "api/v1/movies/";
const POSTER_URL = BASE_URL + "posters/";
const MOVIES_PER_PAGE = 12;

let mode = "";
const movies = [];
let filteredMovies = [];
let nowPage = "1";

const changeMode = document.querySelector("#change-mode");
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");

//APIを叩いて、データを求める
// 各映画のオブジェクトをmovies配列にpushする
// movies配列を引数として代入して、renderMovieListを呼び出す
axios.get(INDEX_URL).then(function(response) {
  movies.push(...response.data.results);
  renderMovieList(getMoviesByPage(1));
  renderPaginator(movies.length);
});

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  console.log(list);
  const movie = movies.find(movie => movie.id === id);
  if (list.some(movie => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }
  list.push(movie);
  console.log(list);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

//dataPanel.addEventListener
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

// changeMode.addEventListener
changeMode.addEventListener("click", event => {
  if (event.target.matches("#card-mode")) {
    renderMovieList(getMoviesByPage(nowPage));
    mode = "cardModes";
  } else if (event.target.matches("#list-mode")) {
    renderMovieTextList(getMoviesByPage(nowPage));
    mode = "listMode";
  }
});

// paginator.addEventListener
paginator.addEventListener("click", function onPaginatorClick(event) {
  if (event.target.tagName !== "A") return;
  const page = Number(event.target.dataset.page);

  nowPage = page;
  if (mode === "listMode") {
    renderMovieTextList(getMoviesByPage(page));
  } else {
    renderMovieList(getMoviesByPage(page));
  }
});

//searchForm.addEventListener
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }
  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage(1));
});

//getMoviesByPage(page)
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIdex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIdex, startIdex + MOVIES_PER_PAGE);
}

// 変え替えの必要なところを変数として宣言し、
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then(function(response) {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `
      <img src="${POSTER_URL + data.image}"
alt="movie-poster" class="img-fluid">
      `;
  });
}

// rawHTMLを宣言、forEachでmovies配列の各オブジェクトをitemで一個一個取り出して、レンダリングを行う
function renderMovieList(data) {
  let rawHTML = "";

  data.forEach(item => {
    rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${
                item.id
              }">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
}

// renderMovieTextList
function renderMovieTextList(data) {
  let rawHTML = "";

  rawHTML += `
  <div class="container mt-3 mb-3">
      <ul class="list-group">
  `;
  data.forEach(item => {
    rawHTML += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          ${item.title}
        <div>
            <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal"
              data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </li>
    `;
  });

  rawHTML += `
        </ul>
          </div>
  `;
  dataPanel.innerHTML = rawHTML;
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}
