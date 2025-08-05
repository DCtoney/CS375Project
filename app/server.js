const pg = require("pg");
const express = require("express");
const env = require("../env.json");
const axios = require("axios");

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
