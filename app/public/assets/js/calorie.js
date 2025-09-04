document.addEventListener("DOMContentLoaded", () => {
    let profile = JSON.parse(localStorage.getItem("userProfile"));
    let isImperial = false;

    let heightInput = document.getElementById("height");
    let weightInput = document.getElementById("weight");
    let heightLabel = document.getElementById("heightLabel");
    let weightLabel = document.getElementById("weightLabel");
    let unitToggle = document.getElementById("unitToggle"); 

    unitToggle.addEventListener("click", (e) => {
        e.preventDefault(); 

        let height = parseFloat(heightInput.value);
        let weight = parseFloat(weightInput.value);

        isImperial = !isImperial;

        if (isImperial) {   
            heightLabel.textContent = 'Height (inches):';
            weightLabel.textContent = 'Weight (lbs):';
            unitToggle.textContent = 'Switch to Metric';

            if (!isNaN(height)) {
                heightInput.value = Math.round(height / 2.54);
            }
            if (!isNaN(weight)) {
                weightInput.value = Math.round(weight * 2.205);
            }
        } else {
            heightLabel.textContent = 'Height (cm):';
            weightLabel.textContent = 'Weight (kg):';
            unitToggle.textContent = 'Switch to Imperial';

            if (!isNaN(height)) {
                heightInput.value = Math.round(height * 2.54);
            }
            if (!isNaN(weight)) {
                weightInput.value = Math.round(weight / 2.205);
            }
        }
    });

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

        if (isImperial) {
            height = height * 2.54; 
            weight = weight * 0.453592; 
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

    if (profile) {
        document.getElementById("age").value = profile.age;
        document.getElementById("gender").value = profile.gender;
        document.getElementById("activity").value = profile.activity;

        isImperial = profile.isImperial || false;
        if (isImperial) {
            heightLabel.textContent = 'Height (inches):';
            weightLabel.textContent = 'Weight (lbs):';
            unitToggle.textContent = 'Switch to Metric';

            heightInput.value = (profile.height / 2.54).toFixed(1);
            weightInput.value = (profile.weight / 0.453592).toFixed(1);
        } else {
            heightLabel.textContent = 'Height (cm):';
            weightLabel.textContent = 'Weight (kg):';
            unitToggle.textContent = 'Switch to Imperial';

            heightInput.value = profile.height;
            weightInput.value = profile.weight;
        }

        document.getElementById("result").innerHTML = 
        `Your daily calorie needs are approximately ${profile.amr.toFixed(2)} calories.`;
    }
});
