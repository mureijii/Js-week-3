document.addEventListener("DOMContentLoaded", () => {
    const filmsList = document.getElementById("films");
    const movieDetails = document.getElementById("movie-details");
    const buyTicketBtn = document.getElementById("buy-ticket");
    let selectedMovie;

    // Fetch and display all movies
    fetch("http://localhost:3000/films")
        .then(response => response.json())
        .then(movies => {
            filmsList.innerHTML = ""; // Clear existing list
            movies.forEach(movie => renderMovieListItem(movie));
            displayMovieDetails(movies[0]);
        });

    function renderMovieListItem(movie) {
        const li = document.createElement("li");
        li.className = "film item";
        li.textContent = movie.title;
        li.dataset.id = movie.id;
        li.addEventListener("click", () => displayMovieDetails(movie));

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteMovie(movie.id, li);
        });

        li.appendChild(deleteBtn);
        filmsList.appendChild(li);
    }

    function displayMovieDetails(movie) {
        selectedMovie = movie;
        document.getElementById("poster").src = movie.poster;
        document.getElementById("title").textContent = movie.title;
        document.getElementById("runtime").textContent = `${movie.runtime} mins`;
        document.getElementById("showtime").textContent = movie.showtime;
        updateTicketCount(movie);
    }

    function updateTicketCount(movie) {
        const availableTickets = movie.capacity - movie.tickets_sold;
        const ticketDisplay = document.getElementById("ticket-num");
        ticketDisplay.textContent = availableTickets;
        buyTicketBtn.textContent = availableTickets > 0 ? "Buy Ticket" : "Sold Out";
        buyTicketBtn.disabled = availableTickets === 0;
    }

    buyTicketBtn.addEventListener("click", () => {
        if (!selectedMovie) return;
        const availableTickets = selectedMovie.capacity - selectedMovie.tickets_sold;
        if (availableTickets > 0) {
            selectedMovie.tickets_sold++;
            updateTicketCount(selectedMovie);
            updateMovieTickets(selectedMovie.id, selectedMovie.tickets_sold);
        }
    });

    function updateMovieTickets(movieId, ticketsSold) {
        fetch(`http://localhost:3000/films/${movieId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tickets_sold: ticketsSold })
        });

        fetch("http://localhost:3000/tickets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ film_id: movieId, number_of_tickets: 1 })
        });
    }

    function deleteMovie(movieId, listItem) {
        fetch(`http://localhost:3000/films/${movieId}`, { method: "DELETE" })
            .then(() => listItem.remove());
    }
});
