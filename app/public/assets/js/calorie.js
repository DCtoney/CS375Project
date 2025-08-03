let axios = require("axios");
let apiFile = require("../env.json");
let apiKey = apiFile["calories_API_key"];
let baseURL = apiFile["calories_API_url"];

document.getElementById("calculate").addEventListener("click", () => {
    let age = document.getElementById("age").value;
    let gender = document.getElementById("gender").value;
    let height = document.getElementById("height").value;
    let weight = document.getElementById("weight").value;  
    let activity = document.getElementById("activity").value 

    let options = {
        method: 'GET',
        url: `https://${baseURL}/calories`,
        params: {
            age: age,
            gender: gender,
            height: height,
            weight: weight,
            activity: activity
        },
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': baseURL
        }
    };
    axios.request(options).then(function (response) {
        let result = response.data;
        document.getElementById("result").innerHTML = `Your daily calorie needs are approximately ${result.calories} calories.`;
    }).catch(function (error) {
        console.error(error);
        document.getElementById("result").innerHTML = "Error calculating calories. Please try again.";
    });
});