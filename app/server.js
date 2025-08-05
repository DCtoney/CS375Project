const pg = require("pg");
const express = require("express");
const fetch = require("node-fetch");
const env = require("./env.json");
const app = express();

const port = 3000;
const hostname = "localhost";

const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.json());
app.use(express.static("public"));

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});

// GET for Nutrition Data
app.get("/api/nutrition", async (req, res) => {
  const meal = req.query.meal;
  if (!meal) {
    return res.status(400).json({ error: "Missing meal query" });
  }

  const url = `https://${env.nutrition_API_url}${encodeURIComponent(meal)}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": env.nutrition_API_key
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Nutrition API error:", errorText);
      return res.status(response.status).send("Failed to fetch nutrition data.");
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
