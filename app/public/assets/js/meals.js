let axios = require("axios");
let apiFile = require("../env.json");
let apiKey = apiFile["nutrition_API_key"];
let baseURL = apiFile["nutrition_API_url"];

document.getElementById("addMeal").addEventListener("click", () => {
    let meal = document.getElementById("meal").value;

    let options = {
        method: 'GET',
        url: `https://${baseURL}${meal}`,
        headers: {
            'x-api-key': apiKey
        }
    };
    axios.request(options).then(function (response) {
        let result = response.data;
        if (result.items && result.items.length > 0) {
            let item = result.items[0];
            document.getElementById("mealResult").innerHTML = `Meal: ${item.name}, Calories: ${item.calories}`;
        } else {
            document.getElementById("mealResult").innerHTML = "No meal found.";
        }
    }).catch(function (error) {
        console.error(error);
        document.getElementById("mealResult").innerHTML = "Error fetching meal data. Please try again.";
    });
});