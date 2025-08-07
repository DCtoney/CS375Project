// Global variables
let workoutPlan = {
  push: [],
  pull: [],
  legs: [],
  upper: [],
  lower: [],
  fullbody: [],
};
let currentDay = "push";

// DOM elements
const searchBtn = document.getElementById("searchBtn");
const searchResults = document.getElementById("searchResults");
const dayTabs = document.querySelectorAll(".day-tab");
const dayTitle = document.getElementById("dayTitle");
const workoutList = document.getElementById("workoutList");

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  setupEventListeners();
  updateWorkoutDisplay();
  // Load some default exercises on page load
  searchExercises();
});

// Set up all event listeners
function setupEventListeners() {
  // Search functionality
  searchBtn.addEventListener("click", searchExercises);

  document
    .getElementById("searchQuery")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        searchExercises();
      }
    });

  // Day tab switching
  dayTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      switchDay(this.dataset.day);
    });
  });

  // Real-time search when filters change
  document
    .getElementById("filterType")
    .addEventListener("change", searchExercises);
  document
    .getElementById("filterMuscle")
    .addEventListener("change", searchExercises);
  document
    .getElementById("filterDifficulty")
    .addEventListener("change", searchExercises);
}

// Search exercises using API Ninjas
async function searchExercises() {
  const name = document.getElementById("searchQuery").value;
  const type = document.getElementById("filterType").value;
  const muscle = document.getElementById("filterMuscle").value;
  const difficulty = document.getElementById("filterDifficulty").value;

  const searchParams = new URLSearchParams();
  if (name) searchParams.append("name", name);
  if (type) searchParams.append("type", type);
  if (muscle) searchParams.append("muscle", muscle);
  if (difficulty) searchParams.append("difficulty", difficulty);

  try {
    showMessage("Searching exercises...", "info");

    const response = await fetch(`/api/exercises/search?${searchParams}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const exercises = await response.json();
    displayExercises(exercises);
  } catch (error) {
    console.error("Error searching exercises:", error);
    showMessage("Error searching exercises. Please try again.", "error");
  }
}

// Display exercises in the search results
function displayExercises(exercises) {
  // Clear any existing messages
  clearMessages();

  if (exercises.length === 0) {
    searchResults.innerHTML =
      "<p>No exercises found. Try adjusting your search criteria.</p>";
    return;
  }

  searchResults.innerHTML =
    "<h3>Search Results:</h3>" +
    exercises
      .map(
        (exercise, index) => `
        <div style="border: 1px solid #ccc; padding: 15px; margin: 10px 0;">
            <h4>${exercise.name}</h4>
            <p><strong>Type:</strong> ${exercise.type}</p>
            <p><strong>Muscle:</strong> ${exercise.muscle}</p>
            <p><strong>Equipment:</strong> ${exercise.equipment}</p>
            <p><strong>Difficulty:</strong> ${exercise.difficulty}</p>
            <p><strong>Instructions:</strong> ${exercise.instructions}</p>
            <button onclick="addToCurrentDay('${exercise.name}', '${
          exercise.type
        }', '${exercise.muscle}', '${exercise.equipment}', '${
          exercise.difficulty
        }', '${exercise.instructions.replace(/'/g, "\\'")}')">
                Add to ${
                  currentDay.charAt(0).toUpperCase() + currentDay.slice(1)
                } Day
            </button>
        </div>
    `
      )
      .join("");
}

// Switch between different workout days
function switchDay(day) {
  currentDay = day;

  // Update active tab
  dayTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.day === day);
  });

  // Update day title
  dayTitle.textContent = day.charAt(0).toUpperCase() + day.slice(1) + " Day";

  // Update workout display
  updateWorkoutDisplay();

  // Update add buttons in search results
  updateAddButtons();
}

// Update the add buttons in search results
function updateAddButtons() {
  const addButtons = document.querySelectorAll(
    'button[onclick^="addToCurrentDay"]'
  );
  addButtons.forEach((button) => {
    const dayName = currentDay.charAt(0).toUpperCase() + currentDay.slice(1);
    const onclickValue = button.getAttribute("onclick");
    button.textContent = `Add to ${dayName} Day`;
  });
}

// Add exercise to current day
function addToCurrentDay(
  name,
  type,
  muscle,
  equipment,
  difficulty,
  instructions
) {
  const exercise = {
    name: name,
    type: type,
    muscle: muscle,
    equipment: equipment,
    difficulty: difficulty,
    instructions: instructions,
  };

  // Check if exercise is already in the day
  const existingExercise = workoutPlan[currentDay].find(
    (ex) => ex.name === name
  );
  if (existingExercise) {
    showMessage("Exercise already added to this day!", "error");
    return;
  }

  workoutPlan[currentDay].push(exercise);
  updateWorkoutDisplay();
  showMessage(`${name} added to ${currentDay} day!`, "success");
}

// Update the workout plan display
function updateWorkoutDisplay() {
  const currentWorkouts = workoutPlan[currentDay];

  if (currentWorkouts.length === 0) {
    workoutList.innerHTML =
      "<p>No exercises added yet. Search for exercises above and add them to this day.</p>";
    return;
  }

  workoutList.innerHTML = currentWorkouts
    .map(
      (exercise, index) => `
        <div style="border: 1px solid #ddd; padding: 10px; margin: 5px 0; background: #f9f9f9;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${exercise.name}</strong> 
                    <span style="color: #666;">(${exercise.muscle} - ${exercise.type})</span>
                </div>
                <button onclick="removeFromDay(${index})" style="background: red; color: white; border: none; padding: 5px 10px;">Remove</button>
            </div>
            <p><strong>Equipment:</strong> ${exercise.equipment}</p>
            <p><strong>Difficulty:</strong> ${exercise.difficulty}</p>
            <details>
                <summary>Instructions</summary>
                <p>${exercise.instructions}</p>
            </details>
        </div>
    `
    )
    .join("");
}

// Remove exercise from current day
function removeFromDay(index) {
  const removedExercise = workoutPlan[currentDay][index];
  workoutPlan[currentDay].splice(index, 1);
  updateWorkoutDisplay();
  showMessage(
    `${removedExercise.name} removed from ${currentDay} day`,
    "success"
  );
}

// Show success/error messages
function showMessage(message, type) {
  // Remove existing messages
  clearMessages();

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;

  // Style the message
  messageDiv.style.padding = "10px";
  messageDiv.style.margin = "10px 0";
  messageDiv.style.borderRadius = "5px";
  messageDiv.style.textAlign = "center";

  if (type === "success") {
    messageDiv.style.background = "#d4edda";
    messageDiv.style.color = "#155724";
    messageDiv.style.border = "1px solid #c3e6cb";
  } else if (type === "error") {
    messageDiv.style.background = "#f8d7da";
    messageDiv.style.color = "#721c24";
    messageDiv.style.border = "1px solid #f5c6cb";
  } else if (type === "info") {
    messageDiv.style.background = "#d1ecf1";
    messageDiv.style.color = "#0c5460";
    messageDiv.style.border = "1px solid #bee5eb";
  }

  // Add to page
  searchResults.parentNode.insertBefore(messageDiv, searchResults);

  // Auto-remove message after 3 seconds (except for info messages during search)
  if (type !== "info") {
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 3000);
  }
}

// Clear all messages
function clearMessages() {
  const messages = document.querySelectorAll(".message");
  messages.forEach((msg) => msg.remove());
}

// Export workout plan (bonus feature)
function exportWorkoutPlan() {
  const plan = {
    workoutPlan: workoutPlan,
    createdAt: new Date().toISOString(),
  };

  const dataStr = JSON.stringify(plan, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(dataBlob);
  link.download = "workout-plan.json";
  link.click();
}
