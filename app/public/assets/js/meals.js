document.getElementById("addMeal").addEventListener("click", () => {
    let meal = document.getElementById("meal").value;

    let url = new URL("/api/nutrition", window.location.origin);
    url.searchParams.append("query", meal);

    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error("Failed to fetch nutrition data");
        return response.json();
      })
      .then(result => {
        if (result.items && result.items.length > 0) {
            let item = result.items[0];
            document.getElementById("mealResult").innerHTML = 'Meal: ${item.name}, Calories: ${item.calories}'; 
        } else {
            document.getElementById("mealResult").textContent = "No nutrition data found for this meal.";
        }
      })
      .catch(error => {
        console.error(error);
        document.getElementById("mealResult").textContent = "Error fetching nutrition data. Please try again.";
      }
});