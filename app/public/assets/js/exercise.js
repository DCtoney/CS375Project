/* Exercise Builder front-end
   - Uses Axios for API calls
   - Adds gear filtering via checkboxes
   - Maintains a formattedPlanText variable
   - Exports the plan as a .txt file
*/

/* ========== Small utilities ========== */
function $(q) {
  return document.querySelector(q);
}
function cap(s) {
  s = String(s || "");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ========== Messaging helpers ========== */
function showMessage(text, type) {
  const box = $("#messages");
  if (!box) return;
  box.textContent = text || "";
}
function clearMessages() {
  const box = $("#messages");
  if (!box) return;
  box.textContent = "";
}

/* ========== Workout state and UI ========== */
const workoutPlan = {
  push: [],
  pull: [],
  legs: [],
  upper: [],
  lower: [],
  fullbody: [],
};
let currentDay = "push";

function updateWorkoutDisplay() {
  const list = workoutPlan[currentDay] || [];
  const container = $("#workoutList");
  if (!container) return;

  if (!list.length) {
    container.innerHTML = "<p>No exercises added yet.</p>";
    return;
  }

  container.innerHTML = list
    .map((ex, i) => {
      const name = ex.name || ex.exercise || "Exercise";
      const meta = [ex.type, ex.muscle, ex.equipment]
        .filter(Boolean)
        .join(" • ");
      return (
        "<div>" +
        "<strong>" +
        name +
        "</strong>" +
        (meta ? " — " + meta : "") +
        ' <button data-i="' +
        i +
        '" class="remove-btn">Remove</button>' +
        "</div>"
      );
    })
    .join("");

  container.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.i, 10);
      (workoutPlan[currentDay] || []).splice(idx, 1);
      updateWorkoutDisplay();
      rebuildFormattedPlanText();
    });
  });
}

function switchDay(day) {
  currentDay = day;
  const title = $("#dayTitle");
  if (title) title.textContent = cap(day) + (/(day)$/i.test(day) ? "" : " Day");
  updateWorkoutDisplay();
  rebuildFormattedPlanText();
}

function addToCurrentDay(
  name,
  type,
  muscle,
  equipment,
  difficulty,
  instructions
) {
  (workoutPlan[currentDay] || (workoutPlan[currentDay] = [])).push({
    name,
    type,
    muscle,
    equipment,
    difficulty,
    instructions,
  });
  updateWorkoutDisplay();
  rebuildFormattedPlanText();
}

/* ========== Gear filtering ========== */
const availableEquipment = new Set();
let selectedEquipment = new Set();

async function loadEquipmentList() {
  // Builds the equipment list by sampling existing endpoints so no server change is required.
  const endpoints = [
    "/api/exercises/search",
    "/api/exercises/type/strength",
    "/api/exercises/type/cardio",
    "/api/exercises/type/stretching",
  ];

  for (const url of endpoints) {
    try {
      const res = await axios.get(url);
      const items = Array.isArray(res.data) ? res.data : [];
      items.forEach((ex) => {
        if (ex && ex.equipment) availableEquipment.add(String(ex.equipment));
      });
    } catch (_) {
      // ignore and continue
    }
  }
}

function renderEquipmentFilter() {
  const host = $("#equipmentFilter");
  if (!host) return;

  if (availableEquipment.size === 0) {
    host.innerHTML = "<p>No equipment options available</p>";
    return;
  }

  const list = Array.from(availableEquipment).sort();
  host.innerHTML = list
    .map((eq) => {
      const checked = selectedEquipment.has(eq) ? "checked" : "";
      const pretty =
        eq.charAt(0).toUpperCase() + eq.slice(1).replace(/_/g, " ");
      return (
        "<label>" +
        '<input type="checkbox" value="' +
        eq +
        '" ' +
        checked +
        " onchange=\"toggleEquipment('" +
        eq.replace(/'/g, "\\'") +
        "')\">" +
        " " +
        pretty +
        "</label><br>"
      );
    })
    .join("");

  const allBtn = $("#equipAllBtn");
  const noneBtn = $("#equipNoneBtn");
  if (allBtn) {
    allBtn.onclick = () => {
      selectedEquipment = new Set(availableEquipment);
      renderEquipmentFilter();
      searchExercises();
    };
  }
  if (noneBtn) {
    noneBtn.onclick = () => {
      clearEquipmentFilter();
    };
  }
}

function toggleEquipment(eq) {
  if (selectedEquipment.has(eq)) selectedEquipment.delete(eq);
  else selectedEquipment.add(eq);
  searchExercises();
}

function clearEquipmentFilter() {
  selectedEquipment.clear();
  const cbs = document.querySelectorAll(
    '#equipmentFilter input[type="checkbox"]'
  );
  cbs.forEach((cb) => (cb.checked = false));
  searchExercises();
}

function filterBySelectedEquipment(exercises) {
  if (selectedEquipment.size === 0) return exercises;
  return exercises.filter(
    (ex) => ex.equipment && selectedEquipment.has(String(ex.equipment))
  );
}

/* ========== Live text buffer for TXT export ========== */
let formattedPlanText = "";

const DAY_ORDER = ["push", "pull", "legs", "upper", "lower", "fullbody"];
const DAY_LABEL = {
  push: "Push Day",
  pull: "Pull Day",
  legs: "Legs Day",
  upper: "Upper Body",
  lower: "Lower Body",
  fullbody: "Full Body",
};

function rebuildFormattedPlanText() {
  const lines = [];
  lines.push("Workout Plan");
  lines.push("============");
  lines.push("");

  DAY_ORDER.forEach((key) => {
    const list = workoutPlan[key] || [];
    lines.push(DAY_LABEL[key] || key);
    lines.push("------------");
    if (list.length === 0) {
      lines.push("  (no exercises)");
      lines.push("");
      return;
    }
    list.forEach((ex, i) => {
      const name = ex.name || ex.exercise || "Exercise";
      const meta = [
        ex.type ? "Type: " + ex.type : "",
        ex.muscle ? "Muscle: " + ex.muscle : "",
        ex.equipment ? "Equipment: " + ex.equipment : "",
        ex.difficulty ? "Difficulty: " + ex.difficulty : "",
      ]
        .filter(Boolean)
        .join(" | ");

      lines.push(i + 1 + ". " + name);
      if (meta) lines.push("   " + meta);
      if (ex.instructions) {
        const inst = String(ex.instructions)
          .replace(/\r?\n/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        if (inst) lines.push("   Instructions: " + inst);
      }
      lines.push("");
    });
  });

  formattedPlanText = lines.join("\n");
}

/* ========== TXT export ========== */
function downloadTextFile(filename, text) {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// --- PDF export (uses the same text formatting but removes instruction lines) ---
function exportPlanTXT() {
  if (!formattedPlanText || !formattedPlanText.trim()) {
    alert("Your plan is empty. Add exercises first.");
    return;
  }

  // Remove lines that begin with "Instructions:" (preserve all other formatting)
  const textForPdf = formattedPlanText
    .split("\n")
    .filter((line) => !/^\s*Instructions:/i.test(line))
    .join("\n");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "letter" }); // 612 x 792 pt

  const marginLeft = 48;
  const marginTop  = 56;
  const usableWidth = 612 - marginLeft * 2; // ~516pt
  const lineHeight = 16;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Workout Plan", marginLeft, marginTop);

  // Body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const lines = doc.splitTextToSize(textForPdf, usableWidth);
  let y = marginTop + 22;

  for (const line of lines) {
    if (y > 792 - marginTop) {
      doc.addPage();
      y = marginTop;
    }
    doc.text(line, marginLeft, y);
    y += lineHeight;
  }

  const filename = "workout-plan-" + new Date().toISOString().slice(0, 10) + ".pdf";
  doc.save(filename);
}


/* ========== Search using your server API (Axios) ========== */
async function searchExercises() {
  const name = $("#searchQuery") ? $("#searchQuery").value : "";
  const type = $("#filterType") ? $("#filterType").value : "";
  const muscle = $("#filterMuscle") ? $("#filterMuscle").value : "";
  const difficulty = $("#filterDifficulty") ? $("#filterDifficulty").value : "";

  const params = {};
  if (name) params.name = name;
  if (type) params.type = type;
  if (muscle) params.muscle = muscle;
  if (difficulty) params.difficulty = difficulty;

  try {
    showMessage("Searching exercises...", "info");
    const { data } = await axios.get("/api/exercises/search", { params });
    let exercises = Array.isArray(data) ? data : [];
    exercises = filterBySelectedEquipment(exercises);
    displayExercises(exercises);
  } catch (err) {
    console.error("Error searching exercises:", err);
    showMessage("Error searching exercises. Please try again.", "error");
  }
}

/* ========== Render search results ========== */
function displayExercises(exercises) {
  clearMessages();
  const searchResults = $("#searchResults");
  if (!searchResults) return;

  if (!exercises.length) {
    searchResults.innerHTML =
      "<p>No exercises found. Try adjusting your search criteria or gear filter.</p>";
    return;
  }

  searchResults.innerHTML =
    "<h3>Search Results:</h3>" +
    exercises
      .map((ex) => {
        const n = ex.name || "Exercise";
        const t = ex.type || "";
        const m = ex.muscle || "";
        const e = ex.equipment || "";
        const d = ex.difficulty || "";
        const instr = (ex.instructions || "").replace(/'/g, "\\'");
        const buttonLabel = "Add to Day";
        return (
          "<div style='border:1px solid #ccc; padding:10px; margin:8px 0;'>" +
          "<h4>" +
          n +
          "</h4>" +
          "<p><strong>Type:</strong> " +
          t +
          "</p>" +
          "<p><strong>Muscle:</strong> " +
          m +
          "</p>" +
          "<p><strong>Equipment:</strong> " +
          e +
          "</p>" +
          "<p><strong>Difficulty:</strong> " +
          d +
          "</p>" +
          "<p><strong>Instructions:</strong> " +
          (ex.instructions || "") +
          "</p>" +
          "<button onclick=\"addToCurrentDay('" +
          n.replace(/'/g, "\\'") +
          "', '" +
          t.replace(/'/g, "\\'") +
          "', '" +
          m.replace(/'/g, "\\'") +
          "', '" +
          String(e).replace(/'/g, "\\'") +
          "', '" +
          d.replace(/'/g, "\\'") +
          "', '" +
          instr +
          "')\">" +
          buttonLabel +
          "</button>" +
          "</div>"
        );
      })
      .join("");
}

document.getElementById("downloadDayExercise").addEventListener("click", () => {
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
});

/* ========== Event wiring and bootstrap ========== */
document.addEventListener("DOMContentLoaded", async function () {
  const searchBtn = $("#searchBtn");
  if (searchBtn) searchBtn.addEventListener("click", searchExercises);

  const searchQuery = $("#searchQuery");
  if (searchQuery) {
    searchQuery.addEventListener("keypress", function (e) {
      if (e.key === "Enter") searchExercises();
    });
  }

  const dayTabs = document.querySelectorAll(".day-tab");
  dayTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      switchDay(this.dataset.day);
    });
  });

  const typeSel = $("#filterType");
  const muscleSel = $("#filterMuscle");
  const diffSel = $("#filterDifficulty");
  if (typeSel) typeSel.addEventListener("change", searchExercises);
  if (muscleSel) muscleSel.addEventListener("change", searchExercises);
  if (diffSel) diffSel.addEventListener("change", searchExercises);

  const exportBtn = $("#exportTxtBtn");
  if (exportBtn) exportBtn.addEventListener("click", exportPlanTXT);

  updateWorkoutDisplay();

  await loadEquipmentList();
  selectedEquipment = new Set(availableEquipment);
  renderEquipmentFilter();

  searchExercises();
  rebuildFormattedPlanText();
});
