const pg = require("pg");
const express = require("express");
const app = express();

// For Node.js versions that don't have fetch built-in, uncomment the line below:
// const fetch = require('node-fetch');

const port = 3000;
const hostname = "localhost";

const env = require("../env.json");

const nutritionKey = env.nutrition_api_key;
const calorieKey = env.calories_API_key;
const exerciseApiKey = env.exercise_api_key; // Add this to your env.json

// Password for adding workouts (you can change this)
const ADMIN_PASSWORD = "fitness2025";

const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.static("public"));
app.use(express.json()); // To parse JSON bodies

// API Routes for exercises using API Ninjas

// Search exercises from API Ninjas
app.get("/api/exercises/search", async (req, res) => {
  try {
    const { name, type, muscle, difficulty } = req.query;

    // Build API Ninjas query parameters
    const params = new URLSearchParams();
    if (name) params.append("name", name);
    if (type) params.append("type", type);
    if (muscle) params.append("muscle", muscle);
    if (difficulty) params.append("difficulty", difficulty);

    const apiUrl = `https://api.api-ninjas.com/v1/exercises?${params}`;

    const response = await fetch(apiUrl, {
      headers: {
        "X-Api-Key": exerciseApiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`API Ninjas error: ${response.status}`);
    }

    const exercises = await response.json();
    res.json(exercises);
  } catch (err) {
    console.error("Error fetching exercises:", err);
    res.status(500).json({ error: "Error fetching exercises from API" });
  }
});

// Get exercises by muscle group
app.get("/api/exercises/muscle/:muscle", async (req, res) => {
  try {
    const muscle = req.params.muscle;
    const apiUrl = `https://api.api-ninjas.com/v1/exercises?muscle=${muscle}`;

    const response = await fetch(apiUrl, {
      headers: {
        "X-Api-Key": exerciseApiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`API Ninjas error: ${response.status}`);
    }

    const exercises = await response.json();
    res.json(exercises);
  } catch (err) {
    console.error("Error fetching exercises:", err);
    res.status(500).json({ error: "Error fetching exercises from API" });
  }
});

// Get exercises by type
app.get("/api/exercises/type/:type", async (req, res) => {
  try {
    const type = req.params.type;
    const apiUrl = `https://api.api-ninjas.com/v1/exercises?type=${type}`;

    const response = await fetch(apiUrl, {
      headers: {
        "X-Api-Key": exerciseApiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`API Ninjas error: ${response.status}`);
    }

    const exercises = await response.json();
    res.json(exercises);
  } catch (err) {
    console.error("Error fetching exercises:", err);
    res.status(500).json({ error: "Error fetching exercises from API" });
  }
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
