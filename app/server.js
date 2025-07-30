const pg = require("pg");
const express = require("express");
const app = express();

const port = 3000;
const hostname = "localhost";

const env = require("../env.json");

const nutritionKey = env.nutrition_api_key;
const calorieKey = env.calories_API_key;

const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.static("public"));

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
