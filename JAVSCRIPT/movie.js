const heroSection = document.querySelector(".hero-section");
const API_KEY = "6709b250";
const searchInput = document.getElementById("searchInput");
const moviesGrid = document.getElementById("moviesGrid");
const resultsSection = document.getElementById("resultsSection");
const resultsTitle = document.getElementById("resultsTitle");
const loadButton = document.getElementById("load-btn");
const hamburgerBtn = document.getElementById("hamburgerBtn");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const sidebarClose = document.getElementById("sidebarClose");
const wishlistCount = document.getElementById("wishlistCount");
const navWishlistCount = document.getElementById("navWishlistCount");
const wishlistSection = document.getElementById("wishlistSection");
const wishlistGrid = document.getElementById("wishlistGrid");
const emptyWishlist = document.getElementById("emptyWishlist");
const backBtn = document.getElementById("backBtn");
const wishlistBtn = document.getElementById("wishlistBtn");
const navWishlistBtn = document.getElementById("navWishlistBtn");
const searchError = document.getElementById("searchError");
const modalOverlay = document.getElementById("modalOverlay");
const movieModal = document.getElementById("movieModal");
const modalClose = document.getElementById("modalClose");
const modalContent = document.getElementById("modalContent");
const moodButtons = document.querySelectorAll(".mood-section button");
const aboutBtn = document.getElementById("aboutBtn");
const navAboutBtn = document.getElementById("navAboutBtn");
const aboutSection = document.getElementById("aboutSection");
const aboutBackBtn = document.getElementById("aboutBackBtn");
const darkModeBtn = document.getElementById("darkModeBtn");
const navDarkModeBtn = document.getElementById("navDarkModeBtn");
const toggleSwitch = document.querySelector(".toggle-switch");
const toast = document.getElementById("toast");
const homeBtn = document.getElementById("homeBtn");

const moodMap = {
    happy: "comedy",
    sad: "sad",
    action: "action",
    mindblowing: "sci-fi"
};

let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let currentPage = 1;
let totalResults = 0;
let currentQuery = "";
let searchTimeout;

// ─── THEME ───────────────────────────────────────────────
function toggleDarkMode() {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    toggleSwitch.classList.toggle("on", isLight);
    darkModeBtn.querySelector("i").className = isLight ? "fa-solid fa-sun" : "fa-solid fa-moon";
    navDarkModeBtn.querySelector("i").className = isLight ? "fa-solid fa-sun" : "fa-solid fa-moon";
    localStorage.setItem("theme", isLight ? "light" : "dark");
}
darkModeBtn.addEventListener("click", toggleDarkMode);
navDarkModeBtn.addEventListener("click", toggleDarkMode);

if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
    toggleSwitch.classList.add("on");
    darkModeBtn.querySelector("i").className = "fa-solid fa-sun";
    navDarkModeBtn.querySelector("i").className = "fa-solid fa-sun";
}

// ─── SIDEBAR ─────────────────────────────────────────────
hamburgerBtn.addEventListener("click", () => {
    sidebar.classList.add("active");
    sidebarOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
    updateWishlistCount();
});

function closeSidebar() {
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
    document.body.style.overflow = "";
}
sidebarClose.addEventListener("click", closeSidebar);
sidebarOverlay.addEventListener("click", closeSidebar);

// ─── WISHLIST COUNT ───────────────────────────────────────
function updateWishlistCount() {
    wishlistCount.textContent = wishlist.length;
    navWishlistCount.textContent = wishlist.length;
}
updateWishlistCount();

// ─── HOME ─────────────────────────────────────────────────
homeBtn.addEventListener("click", () => {
    closeSidebar();
    wishlistSection.classList.add("hidden");
    resultsSection.classList.add("hidden");
    aboutSection.classList.add("hidden");
    heroSection.classList.remove("hidden");
    heroSection.classList.remove("searching");
    searchInput.value = "";
    currentQuery = "";
    currentPage = 1;
    totalResults = 0;
    moviesGrid.innerHTML = "";
    loadButton.classList.add("hidden");
    searchError.classList.add("hidden");
    moodButtons.forEach(btn => btn.classList.remove("active"));
});

// ─── SEARCH ───────────────────────────────────────────────
searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();
    if (query.length < 2) {
        resultsSection.classList.add("hidden");
        heroSection.classList.remove("searching");
        searchError.classList.add("hidden");
        moodButtons.forEach(btn => btn.classList.remove("active"));
        clearTimeout(searchTimeout);
        return;
    }
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentPage = 1;
        heroSection.classList.add("searching");
        resultsSection.style.marginTop = "0"; // fixed: never use offsetHeight
        searchMovies(query);
    }, 400);
});

async function searchMovies(query, append = false) {
    if (!append) {
        searchError.classList.add("hidden");
        loadButton.classList.add("hidden");
        moviesGrid.innerHTML = `
            <div style="min-height:300px; display:flex; align-items:center;
                justify-content:center; color:var(--text-muted);
                font-size:0.85rem; grid-column:1/-1;">
                🎬 Searching...
            </div>`;
        resultsSection.classList.remove("hidden");
    }

    try {
        const response = await fetch(
            `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&page=${currentPage}&apikey=${API_KEY}`
        );

        // catch non-ok HTTP responses (e.g. 401, 429, 503)
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        if (data.Response === "True") {
            totalResults = parseInt(data.totalResults);
            currentQuery = query;
            resultsTitle.textContent = `Results for "${query}"`;
            displayMovies(data.Search, append);

            const moviesShowing = moviesGrid.querySelectorAll(".movie-card").length;
            loadButton.classList.toggle("hidden", moviesShowing >= totalResults);

        } else {
            // API returned false — no results or bad request
            resultsTitle.textContent = `No results found for "${query}"`;
            moviesGrid.innerHTML = "";
            loadButton.classList.add("hidden");
        }

    } catch (error) {
        // network failure, rate limit, or HTTP error
        moviesGrid.innerHTML = "";
        loadButton.classList.add("hidden");
        searchError.classList.remove("hidden");
        resultsTitle.textContent = "";
    }
}

// ─── LOAD MORE ────────────────────────────────────────────
loadButton.addEventListener("click", () => {
    const moviesShowing = moviesGrid.querySelectorAll(".movie-card").length;
    if (moviesShowing < totalResults) {
        currentPage++;
        searchMovies(currentQuery, true);
    } else {
        showToast("No more movies to load");
    }
});

// ─── MOOD BUTTONS ─────────────────────────────────────────
moodButtons.forEach(button => {
    button.addEventListener("click", () => {
        const isAlreadyActive = button.classList.contains("active");
        moodButtons.forEach(btn => btn.classList.remove("active"));

        if (isAlreadyActive) {
            searchInput.value = "";
            currentQuery = "";
            currentPage = 1;
            totalResults = 0;
            moviesGrid.innerHTML = "";
            resultsSection.classList.add("hidden");
            heroSection.classList.remove("searching");
            loadButton.classList.add("hidden");
            searchError.classList.add("hidden");
            return;
        }

        button.classList.add("active");
        const mood = button.dataset.mood;
        const query = moodMap[mood];

        currentPage = 1;
        totalResults = 0;
        currentQuery = query;

        heroSection.classList.add("searching");
        resultsSection.style.marginTop = "0"; // fixed: no offsetHeight
        resultsSection.classList.remove("hidden");
        resultsTitle.textContent = `Showing ${mood} movies`;
        loadButton.classList.add("hidden");
        searchError.classList.add("hidden");
        searchInput.value = query;
        searchMovies(query);
    });
});

// ─── DISPLAY MOVIES ───────────────────────────────────────
function displayMovies(movies, append = false) {
    const newCardsHTML = movies.map(movie => {
        const isWishlisted = wishlist.find(m => m.imdbID === movie.imdbID);
        const poster = movie.Poster !== "N/A" ? movie.Poster : "IMAGES/Urgency_fallback.png";
        return `
            <div class="movie-card">
                <img src="${poster}" alt="${movie.Title}" onerror="this.src='IMAGES/Urgency_fallback.png'">
                <button class="wishlist-btn ${isWishlisted ? "wishlisted" : ""}"
                    data-id="${movie.imdbID}"
                    data-title="${movie.Title}"
                    data-year="${movie.Year}"
                    data-poster="${movie.Poster}">
                    <i class="fa-${isWishlisted ? "solid" : "regular"} fa-heart"></i>
                </button>
                <div class="movie-card-info">
                    <h3>${movie.Title}</h3>
                    <p>${movie.Year}</p>
                </div>
            </div>`;
    }).join("");

    if (append) {
        moviesGrid.insertAdjacentHTML("beforeend", newCardsHTML);
    } else {
        moviesGrid.innerHTML = newCardsHTML;
    }

    // attach events only to new cards
    const allCards = moviesGrid.querySelectorAll(".movie-card");
    const allBtns = moviesGrid.querySelectorAll(".wishlist-btn");
    const newCards = append ? Array.from(allCards).slice(-movies.length) : Array.from(allCards);
    const newBtns = append ? Array.from(allBtns).slice(-movies.length) : Array.from(allBtns);

    newBtns.forEach(btn => {
        btn.addEventListener("click", e => {
            e.stopPropagation();
            toggleWishlist(btn);
        });
    });

    newCards.forEach(card => {
        card.addEventListener("click", () => {
            const btn = card.querySelector(".wishlist-btn");
            openModal(btn.dataset.id);
        });
    });
}

// ─── WISHLIST ────────────────────────────────────────────
function toggleWishlist(btn) {
    const id = btn.dataset.id;
    const movie = {
        imdbID: id,
        Title: btn.dataset.title,
        Year: btn.dataset.year,
        Poster: btn.dataset.poster
    };
    const exists = wishlist.find(m => m.imdbID === id);
    if (exists) {
        wishlist = wishlist.filter(m => m.imdbID !== id);
        btn.innerHTML = `<i class="fa-regular fa-heart"></i>`;
        btn.classList.remove("wishlisted");
        showToast("❌ Removed from wishlist");
    } else {
        wishlist.push(movie);
        btn.innerHTML = `<i class="fa-solid fa-heart"></i>`;
        btn.classList.add("wishlisted");
        showToast("❤️ Added to wishlist");
    }
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    updateWishlistCount();
}

function showWishlist() {
    closeSidebar();
    heroSection.classList.add("hidden");
    resultsSection.classList.add("hidden");
    aboutSection.classList.add("hidden");
    wishlistSection.classList.remove("hidden");

    if (wishlist.length === 0) {
        wishlistGrid.innerHTML = "";
        emptyWishlist.classList.remove("hidden");
        return;
    }

    emptyWishlist.classList.add("hidden");
    wishlistGrid.innerHTML = wishlist.map(movie => {
        const poster = movie.Poster !== "N/A" ? movie.Poster : "IMAGES/Urgency_fallback.png";
        return `
            <div class="movie-card">
                <img src="${poster}" alt="${movie.Title}" onerror="this.src='IMAGES/Urgency_fallback.png'">
                <button class="wishlist-btn wishlisted" data-id="${movie.imdbID}"
                    data-title="${movie.Title}" data-year="${movie.Year}" data-poster="${movie.Poster}">
                    <i class="fa-solid fa-heart"></i>
                </button>
                <div class="movie-card-info">
                    <h3>${movie.Title}</h3>
                    <p>${movie.Year}</p>
                </div>
            </div>`;
    }).join("");

    wishlistGrid.querySelectorAll(".wishlist-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            e.stopPropagation();
            const id = btn.dataset.id;
            wishlist = wishlist.filter(m => m.imdbID !== id);
            localStorage.setItem("wishlist", JSON.stringify(wishlist));
            updateWishlistCount();
            showToast("❌ Removed from wishlist");
            showWishlist();
        });
    });

    wishlistGrid.querySelectorAll(".movie-card").forEach(card => {
        card.addEventListener("click", () => {
            openModal(card.querySelector(".wishlist-btn").dataset.id);
        });
    });
}

wishlistBtn.addEventListener("click", showWishlist);
navWishlistBtn.addEventListener("click", showWishlist);

backBtn.addEventListener("click", () => {
    wishlistSection.classList.add("hidden");
    aboutSection.classList.add("hidden");
    heroSection.classList.remove("hidden");
    if (currentQuery.length >= 2) {
        searchInput.value = currentQuery;
        resultsSection.classList.remove("hidden");
    }
});

// ─── ABOUT ───────────────────────────────────────────────
function showAbout() {
    closeSidebar();
    heroSection.classList.add("hidden");
    resultsSection.classList.add("hidden");
    wishlistSection.classList.add("hidden");
    aboutSection.classList.remove("hidden");
}
aboutBtn.addEventListener("click", showAbout);
navAboutBtn.addEventListener("click", showAbout);

aboutBackBtn.addEventListener("click", () => {
    aboutSection.classList.add("hidden");
    heroSection.classList.remove("hidden");
    if (currentQuery.length >= 2) {
        searchInput.value = currentQuery;
        resultsSection.classList.remove("hidden");
    }
});

// ─── MODAL ───────────────────────────────────────────────
async function openModal(imdbID) {
    modalContent.innerHTML = `<div class="modal-loading">🎬 Loading...</div>`;
    modalOverlay.classList.add("active");
    movieModal.classList.add("active");
    document.body.style.overflow = "hidden";

    try {
        const response = await fetch(
            `https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}`
        );
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const movie = await response.json();

        if (movie.Response === "False") throw new Error("Movie not found");

        const isWishlisted = wishlist.find(m => m.imdbID === imdbID);
        const poster = movie.Poster !== "N/A" ? movie.Poster : "IMAGES/Urgency_fallback.png";

        modalContent.innerHTML = `
            <div class="modal-movie-top">
                <img class="modal-poster" src="${poster}" alt="${movie.Title}"
                    onerror="this.src='IMAGES/Urgency_fallback.png'">
                <div class="modal-movie-info">
                    <h2>${movie.Title}</h2>
                    <div class="modal-meta">
                        <span class="modal-tag">${movie.Year}</span>
                        <span class="modal-tag">${movie.Rated !== "N/A" ? movie.Rated : "Unrated"}</span>
                        <span class="modal-tag">${movie.Runtime !== "N/A" ? movie.Runtime : "N/A"}</span>
                    </div>
                    <div class="modal-rating">⭐ ${movie.imdbRating !== "N/A" ? movie.imdbRating + "/10" : "No rating"}</div>
                </div>
            </div>
            <p class="modal-plot">${movie.Plot !== "N/A" ? movie.Plot : "No plot available."}</p>
            <div class="modal-details">
                <div class="modal-detail-row">
                    <span>Director</span>
                    <span>${movie.Director !== "N/A" ? movie.Director : "Unknown"}</span>
                </div>
                <div class="modal-detail-row">
                    <span>Cast</span>
                    <span>${movie.Actors !== "N/A" ? movie.Actors : "Unknown"}</span>
                </div>
                <div class="modal-detail-row">
                    <span>Genre</span>
                    <span>${movie.Genre !== "N/A" ? movie.Genre : "Unknown"}</span>
                </div>
                <div class="modal-detail-row">
                    <span>Language</span>
                    <span>${movie.Language !== "N/A" ? movie.Language : "Unknown"}</span>
                </div>
            </div>
            <button class="modal-wishlist-btn ${isWishlisted ? "wishlisted" : ""}"
                id="modalWishlistBtn"
                data-id="${movie.imdbID}"
                data-title="${movie.Title}"
                data-year="${movie.Year}"
                data-poster="${movie.Poster}">
                <i class="fa-${isWishlisted ? "solid" : "regular"} fa-heart"></i>
                ${isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            </button>`;

        document.getElementById("modalWishlistBtn").addEventListener("click", e => {
            e.stopPropagation();
            const btn = document.getElementById("modalWishlistBtn");
            toggleWishlist(btn);
            const nowWishlisted = wishlist.find(m => m.imdbID === imdbID);
            btn.className = `modal-wishlist-btn ${nowWishlisted ? "wishlisted" : ""}`;
            btn.innerHTML = `
                <i class="fa-${nowWishlisted ? "solid" : "regular"} fa-heart"></i>
                ${nowWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}`;
        });

    } catch (error) {
        modalContent.innerHTML = `<div class="modal-loading">❌ Failed to load movie details. Check your connection.</div>`;
    }
}

function closeModal() {
    modalOverlay.classList.remove("active");
    movieModal.classList.remove("active");
    document.body.style.overflow = "";
    document.body.style.position = "";
}
modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", closeModal);

// ─── TOAST ───────────────────────────────────────────────
function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}

// ─── SERVICE WORKER ──────────────────────────────────────
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .then(() => console.log("FlickFind SW registered"))
            .catch(err => console.log("SW error:", err));
    });
}