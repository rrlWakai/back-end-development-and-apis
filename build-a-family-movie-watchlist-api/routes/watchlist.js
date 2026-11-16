
import express from "express";

import {
  getWatchlist,
  addMovie,
  updateMovie,
  deleteMovie
} from "../utils/db.js";

import { authorizeModification } from "../middleware/authorize.js";

const router = express.Router();

// Convert Express route parameter to numeric database ID
function getNumericUserId(req) {
  const userId = Number(req.params.userId);

  return Number.isInteger(userId) && userId > 0
    ? userId
    : null;
}

// GET: Retrieve a user's watchlist
router.get("/:userId", (req, res) => {
  const userId = getNumericUserId(req);

  if (userId === null) {
    return res.status(404).json({
      error: "User not found"
    });
  }

  const watchlist = getWatchlist(userId);

  if (watchlist === null) {
    return res.status(404).json({
      error: "User not found"
    });
  }

  return res.status(200).json(watchlist);
});

// POST: Add a movie to a user's watchlist
router.post("/:userId/movies", authorizeModification, (req, res) => {
  const userId = getNumericUserId(req);

  if (userId === null) {
    return res.status(404).json({
      error: "User not found"
    });
  }

  const { title, genre } = req.body;

  if (!title || !genre) {
    return res.status(400).json({
      error: "Title and genre are required"
    });
  }

  const movie = addMovie(userId, {
    title,
    genre
  });

  if (!movie) {
    return res.status(404).json({
      error: "User not found"
    });
  }

  return res.status(201).json(movie);
});

// PUT: Update a movie
router.put(
  "/:userId/movies/:movieId",
  authorizeModification,
  (req, res) => {
    const userId = getNumericUserId(req);
    const movieId = Number(req.params.movieId);

    if (userId === null || !Number.isInteger(movieId) || movieId <= 0) {
      return res.status(404).json({
        error: "User or movie not found"
      });
    }

    const updatedMovie = updateMovie(
      userId,
      movieId,
      req.body
    );

    if (!updatedMovie) {
      return res.status(404).json({
        error: "Movie or user not found"
      });
    }

    return res.status(200).json(updatedMovie);
  }
);

// DELETE: Remove a movie
router.delete(
  "/:userId/movies/:movieId",
  authorizeModification,
  (req, res) => {
    const userId = getNumericUserId(req);
    const movieId = Number(req.params.movieId);

    if (userId === null || !Number.isInteger(movieId) || movieId <= 0) {
      return res.status(404).json({
        error: "User or movie not found"
      });
    }

    const deleted = deleteMovie(userId, movieId);

    if (!deleted) {
      return res.status(404).json({
        error: "Movie or user not found"
      });
    }

    return res.status(200).json({
      message: "Movie deleted successfully"
    });
  }
);

export default router;
