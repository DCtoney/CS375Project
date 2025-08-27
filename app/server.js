const path = require("path");
const pg = require("pg");
const express = require("express");
const axios = require("axios");
const env = require("../env.json");

const app = express();
const port = process.env.PORT || 3000;

const exerciseApiKey = env.exercise_api_key; 

const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.json()); 
app.use(express.static(path.join(__dirname,"public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

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

// GET for Nutrition Data
app.get("/api/nutrition", async (req, res) => {
  const meal = req.query.meal;

  if (!meal) {
    return res.status(400).json({ error: "Missing meal query" });
  }

  const url = `https://${env.nutrition_API_url}${meal}`;
  console.log("Requesting:", url);

  try {
    const response = await axios.get(url, {
      headers: {
        "x-api-key": env.nutrition_API_key,
        "Content-type": "application/json"
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error("AXIOS ERROR:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      return res.status(error.response.status).json({ error: error.response.data });
    } else if (error.request) {
      console.error("No response received from API:", error.request);
      return res.status(502).json({ error: "No response from nutrition API." });
    } else {
      console.error("Error setting up request:", error.message);
      return res.status(500).json({ error: "Internal server error." });
    }
  }
});

app.listen(port, () => {
  console.log(`Listening at: ${port}`);
});