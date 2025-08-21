export function downloadHealthLog() {
    // Load meals (from meals.js)
    let allDayData = JSON.parse(localStorage.getItem("allDayData")) || [];

    if (allDayData.length === 0) {
        alert("No day data to download.");
        return;
    }

    // Load user profile (from calorie.js)
    let profileData = JSON.parse(localStorage.getItem("userProfile")) || {
        age: null,
        gender: null,
        height: null,
        weight: null,
        activity: null,
        dailyCalories: null
    };

    // Load workout plan (from exercise.js)
    let workouts = JSON.parse(localStorage.getItem("workoutPlan")) || {};

    // Build the full export object
    let exportData = {
        user: profileData,
        history: allDayData,
        workouts: workouts
    };

    // Download JSON
    let blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.href = url;
    link.download = "health_log_" + new Date().toISOString().split("T")[0] + ".json";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
