import axios from "axios";
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const API_KEY = '54968565-2cd96adb4d5f069c81d213fb9';
const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const loader = document.querySelector('.loader');

let query = "";
let page = 1;
let totalHits = 0;
const perPage = 40;

const lightbox = new SimpleLightbox('.gallery a');

form.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearch(event) {
    event.preventDefault();
    
    query = event.currentTarget.elements.searchQuery.value.trim();
    if (query === "") {
        iziToast.warning({title:"Warning", message: "Please enter a search term!" });
        return;
    }

    page = 1;
    gallery.innerHTML = "";
    hideLoadMoreBtn();
    
    await fetchAndRender();
}

async function onLoadMore() {
    page += 1;
    hideLoadMoreBtn(); 
    await fetchAndRender();
    smoothScroll();
}

async function fetchAndRender() {
    showLoader(); 
    
    try {
        const data = await fetchImages(query, page);
        totalHits = data.totalHits;

        if (data.hits.length === 0) {
            iziToast.error({ message: "Sorry, there are no images matching your search query." });
            return;
        }

        renderGallery(data.hits);
        checkLoadMoreStatus();
        
    } catch (error) {
        iziToast.error({ message: "Sorry, there was an error fetching the images." });
        console.error("Error info:", error);
    } finally {
        hideLoader();
    }
}

async function fetchImages(q, p) {
    const response = await axios.get("https://pixabay.com/api/", {
        params: {
            key: API_KEY,
            q: q,
            image_type: "photo",
            orientation: "horizontal",
            safesearch: "true",
            page: p,
            per_page: perPage,
        }
    });
    return response.data;
}

function renderGallery(images) {
    const markup = images.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
        return `
        <li class="gallery-item">
            <a class="gallery-link" href="${largeImageURL}">
                <img class="gallery-image" src="${webformatURL}" alt="${tags}" />
            </a>
            <div class="info">
                <p class="info-item"><b>Likes</b>${likes}</p>
                <p class="info-item"><b>Views</b>${views}</p>
                <p class="info-item"><b>Comments</b>${comments}</p>
                <p class="info-item"><b>Downloads</b>${downloads}</p>
            </div>
        </li>`;
    }).join("");

    gallery.insertAdjacentHTML("beforeend", markup);
    lightbox.refresh();
}

function checkLoadMoreStatus() {
    const totalLoaded = page * perPage;
    if (totalLoaded >= totalHits) {
        hideLoadMoreBtn();
        if (totalHits > 0) {
            iziToast.info({ message: "We're sorry, but you've reached the end of search results." });
        }
    } else {
        showLoadMoreBtn();
    }
}

function smoothScroll() {
    const card = document.querySelector(".gallery-item");
    if (card) {
        const { height: cardHeight } = card.getBoundingClientRect();
        window.scrollBy({
            top: cardHeight * 2,
            behavior: "smooth",
        });
    }
}

function showLoader() { 
    if (loader) loader.classList.remove('hidden'); 
}
function hideLoader() { 
    if (loader) loader.classList.add('hidden'); 
}
function showLoadMoreBtn() { 
    if (loadMoreBtn) loadMoreBtn.classList.remove('hidden'); 
}
function hideLoadMoreBtn() { 
    if (loadMoreBtn) loadMoreBtn.classList.add('hidden'); 
}