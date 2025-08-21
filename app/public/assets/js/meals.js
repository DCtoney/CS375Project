import { downloadHealthLog } from "./Utils";

document.addEventListener("DOMContentLoaded", () => {
    let mealList = document.getElementById("mealList");
    let mealInput = document.getElementById("meal");
    let mealHistory = document.getElementById("mealHistory");

    let currentDayMeals = [];
    let allDayData = [];

    let totalCalories = 0;
    let calorieDisplay = document.getElementById("dailyTotal");
    document.body.insertBefore(calorieDisplay, document.querySelector("table"));

    function updateCalorieDisplay() {
        let target = parseInt(localStorage.getItem("dailyCalries")) || 2000;
        let dif = totalCalories - target;

        let calorieClass = "calorie-under";

        if (Math.abs(diff) <= 50) {
            calorieClass = "calorie-good";
        } else if (diff > 50 && diff <= 100) {
            calorieClass = "calorie-warning";
        } else if (diff > 100 && diff <= 150) {
            calorieClass = "calorie-over";
        } else if (diff > 150) {
            calorieClass = "calorie-high";
        }

        totalCaloriesElement.classList.add(calorieClass);
        totalCaloriesElement.textContent = `Total Calories: ${totalCalories.toFixed(1)} / ${targetCalories}`;
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

            currentDayMeals.push({
                name: item.name,
                calories: item.calories,
                serving_size_g: item.serving_size_g,
                fat_total_g: item.fat_total_g,
                fat_saturated_g: item.fat_saturated_g,
                protein_g: item.protein_g,
                sodium_mg: item.sodium_mg,
                potassium_mg: item.potassium_mg,
                cholesterol_mg: item.cholesterol_mg,
                carbohydrates_total_g: item.carbohydrates_total_g,
                fiber_g: item.fiber_g,
                sugar_g: item.sugar_g
            });
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

        let target = parseInt(localStorage.getItem("dailyCalries")) || 2000;
        allDayData.push({
            date: new Date().toLocaleDateString(),
            totalCalories: totalCalories,
            calorieTarget: target,
            meals: currentDayMeals
        });

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
        currentDayMeals = [];
        updateCalorieDisplay();
    });

    document.getElementById("downloadDay").addEventListener("click", downloadHealthLog);

    updateCalorieDisplay();

    // Auto-load user profile from localStorage (if exists)
    function loadUserProfile() {
        const profile = JSON.parse(localStorage.getItem("userProfile"));
        if (profile && profile.dailyCalories) {
            localStorage.setItem("dailyCalries", profile.dailyCalories);
        }
    }

    loadUserProfile();

    document.getElementById("importJson").addEventListener("click", () => {
        document.getElementById("importFile").click();
    });

    document.getElementById("importFile").addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const imported = JSON.parse(text);

            if (imported.user) {
                localStorage.setItem("userProfile", JSON.stringify(imported.user));
                if (imported.user.dailyCalories) {
                    localStorage.setItem("dailyCalries", imported.user.dailyCalories);
                }
            }

            // Replace meal history
            if (Array.isArray(imported.history)) {
                allDayData = imported.history;

                // Clear and repopulate meal history section
                mealHistory.innerHTML = "";
                imported.history.forEach(day => {
                    const table = document.createElement("table");
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
                    </thead>`;

                    const body = document.createElement("tbody");
                    day.meals.forEach(meal => {
                        const row = document.createElement("tr");
                        row.innerHTML = `
                        <td>${meal.name}</td>
                        <td>${meal.calories}</td>
                        <td>${meal.serving_size_g}</td>
                        <td>${meal.fat_total_g}</td>
                        <td>${meal.fat_saturated_g}</td>
                        <td>${meal.protein_g}</td>
                        <td>${meal.sodium_mg}</td>
                        <td>${meal.potassium_mg}</td>
                        <td>${meal.cholesterol_mg}</td>
                        <td>${meal.carbohydrates_total_g}</td>
                        <td>${meal.fiber_g}</td>
                        <td>${meal.sugar_g}</td>
                        `;
                        body.appendChild(row);
                    });

                    table.appendChild(body);

                    const dayLabel = document.createElement("h3");
                    dayLabel.textContent = `Meals on ${day.date} (Total Calories: ${day.totalCalories})`;

                    const historySection = document.createElement("div");
                    historySection.appendChild(dayLabel);
                    historySection.appendChild(table);

                    mealHistory.appendChild(historySection);
                });
            }

            if (imported.workouts) {
                localStorage.setItem("workoutPlan", JSON.stringify(imported.workouts));
                window.workoutPlan = imported.workouts;
            }

            updateCalorieDisplay();
            alert("Data imported successfully!");
        } catch (err) {
            console.error("Import failed:", err);
            alert("Invalid JSON file.");
        }

        e.target.value = "";
    });
});
