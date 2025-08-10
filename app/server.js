const pg = require("pg");
const express = require("express");
const axios = require("axios");
const app = express();

const port = 3000;
const hostname = "localhost";

const env = require("../env.json");

const nutritionKey = env.nutrition_api_key; // (unused here)
const calorieKey = env.calories_API_key; // (unused here)
const exerciseApiKey = env.exercise_api_key; // used below

// Password for adding workouts (you can change this)
const ADMIN_PASSWORD = "fitness2025";

const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.static("public"));
app.use(express.json()); // To parse JSON bodies

// ——— API Routes for exercises using API Ninjas (axios version) ———

// Search exercises from API Ninjas
app.get("/api/exercises/search", async (req, res) => {
  try {
    const { name, type, muscle, difficulty } = req.query;

    // Build query parameters
    const params = new URLSearchParams();
    if (name) params.append("name", name);
    if (type) params.append("type", type);
    if (muscle) params.append("muscle", muscle);
    if (difficulty) params.append("difficulty", difficulty);

    const apiUrl = `https://api.api-ninjas.com/v1/exercises?${params.toString()}`;

    const response = await axios.get(apiUrl, {
      headers: { "X-Api-Key": exerciseApiKey },
      // timeout: 10000, // optional: add a timeout if you want
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching exercises:", error.message);
    if (error.response) {
      res.status(error.response.status).json({ error: error.response.data });
    } else if (error.request) {
      res.status(502).json({ error: "No response from API Ninjas." });
    } else {
      res.status(500).json({ error: "Internal server error." });
    }
  }
});

// Get exercises by muscle group
app.get("/api/exercises/muscle/:muscle", async (req, res) => {
  try {
    const muscle = encodeURIComponent(req.params.muscle);
    const apiUrl = `https://api.api-ninjas.com/v1/exercises?muscle=${muscle}`;

    const response = await axios.get(apiUrl, {
      headers: { "X-Api-Key": exerciseApiKey },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching exercises:", error.message);
    if (error.response) {
      res.status(error.response.status).json({ error: error.response.data });
    } else if (error.request) {
      res.status(502).json({ error: "No response from API Ninjas." });
    } else {
      res.status(500).json({ error: "Internal server error." });
    }
  }
});

// Get exercises by type
app.get("/api/exercises/type/:type", async (req, res) => {
  try {
    const type = encodeURIComponent(req.params.type);
    const apiUrl = `https://api.api-ninjas.com/v1/exercises?type=${type}`;

    const response = await axios.get(apiUrl, {
      headers: { "X-Api-Key": exerciseApiKey },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching exercises:", error.message);
    if (error.response) {
      res.status(error.response.status).json({ error: error.response.data });
    } else if (error.request) {
      res.status(502).json({ error: "No response from API Ninjas." });
    } else {
      res.status(500).json({ error: "Internal server error." });
    }
  }
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
