document.getElementById("calculate").addEventListener("click", () => {
    let age = parseInt(document.getElementById("age").value, 10);
    let gender = document.getElementById("gender").value;
    let height = parseFloat(document.getElementById("height").value); // in cm
    let weight = parseFloat(document.getElementById("weight").value); // in kg
    let activity = document.getElementById("activity").value;

    if (isNaN(age) || isNaN(height) || isNaN(weight)) {
        document.getElementById("result").innerHTML = "Please enter valid numbers.";
        return;
    }

    // Step 1: Calculate BMR
    let bmr;
    if (gender === "female") {
        bmr = 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age);
    } else {
        bmr = 66.47 + (13.75 * weight) + (5.003 * height) - (6.755 * age);
    }

    // Step 2: Calculate AMR
    let amr;
    switch (activity) {
        case "level_1":
            amr = bmr * 1.2;
            break;
        case "level_2":
            amr= bmr * 1.375;
            break;
        case "level_3":
            amr = bmr * 1.55;
            break;
        case "level_4":
            amr = bmr * 1.725;
            break;
        case "level_5":
            amr = bmr * 1.9;
            break;
        default:
            amr = bmr * 1.2;
    }

    let userProfile = {
        age, gender, height, weight, activity, amr
    };

    document.getElementById("result").innerHTML = 
        `Your daily calorie needs are approximately ${amr.toFixed(2)} calories.`;
        
    localStorage.setItem("userProfile", JSON.stringify(userProfile));
    localStorage.setItem("dailyCalries", Math.round(amr));
});