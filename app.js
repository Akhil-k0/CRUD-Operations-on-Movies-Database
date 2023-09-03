const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
app.use(express.json());

const dbPath = "moviesData.db"; // Change this to your database path

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.error(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// API 1: Get all movie names
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name AS movieName
    FROM movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray);
});

// API 2: Create a new movie
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;

  const insertMovieQuery = `
    INSERT INTO movie (director_id, movie_name, lead_actor)
    VALUES (${directorId}, '${movieName}', '${leadActor}');`;

  try {
    await db.run(insertMovieQuery);
    response.send("Movie Successfully Added");
  } catch (e) {
    console.error(`Error adding movie: ${e.message}`);
    response.status(500).send("Internal Server Error");
  }
});

// API 3: Get a movie by ID
app.get("/movies/:movieId/", async (request, response) => {
  const movieId = request.params.movieId;

  const getMovieQuery = `
    SELECT movie_id AS movieId, director_id AS directorId, movie_name AS movieName, lead_actor AS leadActor
    FROM movie
    WHERE movie_id = ${movieId};`;

  try {
    const movie = await db.get(getMovieQuery);

    if (movie) {
      response.send(movie);
    } else {
      response.status(404).send("Movie not found");
    }
  } catch (e) {
    console.error(`Error fetching movie: ${e.message}`);
    response.status(500).send("Internal Server Error");
  }
});

// API 4: Update a movie by ID
app.put("/movies/:movieId/", async (request, response) => {
  const movieId = request.params.movieId;
  const { directorId, movieName, leadActor } = request.body;

  const updateMovieQuery = `
    UPDATE movie
    SET director_id = ${directorId}, movie_name = '${movieName}', lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;

  try {
    await db.run(updateMovieQuery);
    response.send("Movie Details Updated");
  } catch (e) {
    console.error(`Error updating movie: ${e.message}`);
    response.status(500).send("Internal Server Error");
  }
});

// API 5: Delete a movie by ID
app.delete("/movies/:movieId/", async (request, response) => {
  const movieId = request.params.movieId;

  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};`;

  try {
    await db.run(deleteMovieQuery);
    response.send("Movie Removed");
  } catch (e) {
    console.error(`Error deleting movie: ${e.message}`);
    response.status(500).send("Internal Server Error");
  }
});

// API 6: Get all directors
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT director_id AS directorId, director_name AS directorName
    FROM director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(directorsArray);
});

// API 7: Get all movies directed by a specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const directorId = request.params.directorId;

  const getMoviesByDirectorQuery = `
    SELECT movie_name AS movieName
    FROM movie
    WHERE director_id = ${directorId};`;

  const moviesArray = await db.all(getMoviesByDirectorQuery);
  response.send(moviesArray);
});

module.exports = app;
