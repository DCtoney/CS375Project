document.addEventListener("DOMContentLoaded", () => {
    let mealList = document.getElementById("mealList");
    let mealInput = document.getElementById("meal");
    let mealHistory = document.getElementById("mealHistory");

    let totalCalories = 0;
    let calorieDisplay = document.getElementById("dailyTotal");
    document.body.insertBefore(calorieDisplay, document.querySelector("table"));

    function updateCalorieDisplay() {
        let target = parseInt(localStorage.getItem("dailyCalries")) || 2000;
        let dif = totalCalories - target;

        let color = black;
        if (diff >= 150) color = "red";
        else if (dif >= 100) color = "orange";
        else if (dif >= 50) color = "yellow";
        else if (dif >= 0) color = "green";

        calorieDisplay.textContent = `Total Calories: ${totalCalories} / Target: ${target}`;
        calorieDisplay.style.color = color;
    };

    document.getElementById("addMeal").addEventListener("click", () => {
        const meal = mealInput.value.trim();

        const url = new URL("/api/nutrition", window.location.origin);
        url.searchParams.append("meal", meal);

        fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch nutrition data");
            return response.json();
        })
        .then(result => {
            const mealList = document.getElementById("mealList");

            if (!result.items || result.items.length === 0) {
            mealList.innerHTML = "<tr><td colspan='12'>No nutrition data found for this meal.</td></tr>";
            return;
            }

            const item = result.items[0]; // Get first match

            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.calories}</td>
            <td>${item.serving_size_g}</td>
            <td>${item.fat_total_g}</td>
            <td>${item.fat_saturated_g}</td>
            <td>${item.protein_g}</td>
            <td>${item.sodium_mg}</td>
            <td>${item.potassium_mg}</td>
            <td>${item.cholesterol_mg}</td>
            <td>${item.carbohydrates_total_g}</td>
            <td>${item.fiber_g}</td>
            <td>${item.sugar_g}</td>
            `;

            mealList.appendChild(row);

            totalCalories += Math.round(item.calories);
            updateCalorieDisplay();
        })
        .catch(error => {
            console.error(error);
            const mealList = document.getElementById("mealList");
            mealList.innerHTML = "<tr><td colspan='12'>Error fetching nutrition data.</td></tr>";
        });
    });

    document.getElementById("endDay").addEventListener("click", () => {
        let table = document.createElement("table");
        table.innerHTML = `
        <thead>
            <tr>
            <th>Name</th>
            <th>Calories</th>
            <th>Serving Size (g)</th>
            <th>Total Fat (g)</th>
            <th>Saturated Fat (g)</th>
            <th>Protein (g)</th>
            <th>Sodium (mg)</th>
            <th>Potassium (mg)</th>
            <th>Cholesterol (mg)</th>
            <th>Total Carbohydrates (g)</th>
            <th>Fiber (g)</th>
            <th>Sugar (g)</th>
            </tr>
        </thead>
        `;

        const copiedBody = mealList.cloneNode(true);
        table.appendChild(copiedBody);

        const dayLabel = document.createElement("h3");
        const date = new Date().toLocaleDateString();
        dayLabel.textContent = `Meals on ${date}`;

        const historySection = document.createElement("div");
        historySection.appendChild(dayLabel);
        historySection.appendChild(table);

        mealHistory.appendChild(historySection);

        mealList.innerHTML = "";
        totalCalories = 0;
        updateCalorieDisplay();
    });

    updateCalorieDisplay
});
