document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addMeal").addEventListener("click", () => {
    const meal = document.getElementById("meal").value;

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
      })
      .catch(error => {
        console.error(error);
        const mealList = document.getElementById("mealList");
        mealList.innerHTML = "<tr><td colspan='12'>Error fetching nutrition data.</td></tr>";
      });
  });
});
