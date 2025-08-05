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

        let color = "black";
        if (dif >= 150) color = "red";
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

    document.getElementById("downloadDay").addEventListener("click", () => {
        if (allDayData.length === 0) {
            alert("No day data to download.");
            return;
        }

        let profileData = JSON.parse(localStorage.getItem("userProfile")) || {
            age: null,
            gender: null,
            height: null,
            weight: null,
            activity: null,
            dailyCalories: null
        };

        let exportData = {
            user: profileData,
            history: allDayData
        };

        let blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        let url = URL.createObjectURL(blob);
        let link = document.createElement("a");
        link.href = url;

        let filename = "meal_log_" + new Date().toISOString().split("T")[0] + ".json";
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    updateCalorieDisplay();
});
