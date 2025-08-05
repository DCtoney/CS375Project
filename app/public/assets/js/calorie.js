document.getElementById("calculate").addEventListener("click", () => {
  const age = document.getElementById("age").value;
  const gender = document.getElementById("gender").value;
  const height = document.getElementById("height").value;
  const weight = document.getElementById("weight").value;
  const activity = document.getElementById("activity").value;

  const url = new URL("/api/calories", window.location.origin);
  url.searchParams.append("age", age);
  url.searchParams.append("gender", gender);
  url.searchParams.append("height", height);
  url.searchParams.append("weight", weight);
  url.searchParams.append("activitylevel", activity);

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error("Failed to fetch calorie data");
      return response.json();
    })
    .then(data => {
      document.getElementById("result").textContent =
        `Your daily calorie needs are approximately ${data.data.calorie} calories.`;
    })
    .catch(error => {
      console.error(error);
      document.getElementById("result").textContent =
        "Error calculating calories. Please try again.";
    });
});