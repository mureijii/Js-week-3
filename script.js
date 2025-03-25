//  1. GLOBAL VARIABLES
const filmsList = document.getElementById("films");
const title = document.getElementById("title");
const runtime = document.getElementById("runtime");
const showtime = document.getElementById("showtime");
const poster = document.getElementById("poster");
const description = document.getElementById("description");
const buyTicketBtn = document.getElementById("buy-ticket");

const API_URL = "http://localhost:3000/films";

//  2. INITIALIZE APP ON PAGE LOAD
document.addEventListener("DOMContentLoaded", () => {
    fetchMovies();
});

//  3. FETCH MOVIES FROM SERVER
function fetchMovies() {
    fetch(API_URL)
        .then(res => res.json())
        .then(movies => {
            filmsList.innerHTML = ""; // Clear previous movies
            movies.forEach(movie => renderMovieListItem(movie));
            fetchMovieDetails(movies[0].id); // Load first movie by default
        })
        .catch(error => console.error("Error fetching movies:", error));
}

//  4. RENDER MOVIE LIST
function renderMovieListItem(movie) {
    const li = document.createElement("li");
    li.textContent = movie.title;
    li.classList.add("film", "item");
    li.addEventListener("click", () => fetchMovieDetails(movie.id));

    // Delete Button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteMovie(movie.id, li);
    });

    li.appendChild(deleteBtn);
    filmsList.appendChild(li);
}

//  5. FETCH MOVIE DETAILS
function fetchMovieDetails(movieId) {
    fetch(`${API_URL}/${movieId}`)
        .then(res => res.json())
        .then(movie => updateMovieDetails(movie))
        .catch(error => console.error("Error fetching movie details:", error));
}

//  6. UPDATE MOVIE DETAILS IN UI
function updateMovieDetails(movie) {
    title.textContent = movie.title;
    runtime.textContent = `${movie.runtime} mins`;
    showtime.textContent = movie.showtime;
    poster.src = movie.poster;
    description.textContent = movie.description;

    // Update ticket count
    const availableTickets = movie.capacity - movie.tickets_sold;
    buyTicketBtn.textContent = availableTickets > 0 ? "Buy Ticket" : "Sold Out";
    buyTicketBtn.disabled = availableTickets <= 0;

    // Attach event listener
    buyTicketBtn.onclick = () => buyTicket(movie);
}

//  7. HANDLE TICKET PURCHASE
function buyTicket(movie) {
    if (movie.tickets_sold >= movie.capacity) return;

    const updatedTicketsSold = movie.tickets_sold + 1;

    fetch(`${API_URL}/${movie.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickets_sold: updatedTicketsSold })
    })
    .then(res => res.json())
    .then(updatedMovie => {
        updateMovieDetails(updatedMovie);
    })
    .catch(error => console.error("Error updating tickets:", error));
}

//  8. DELETE MOVIE FROM SERVER & UI
function deleteMovie(movieId, listItem) {
    fetch(`${API_URL}/${movieId}`, { method: "DELETE" })
    .then(() => listItem.remove())
    .catch(error => console.error("Error deleting movie:", error));
}
