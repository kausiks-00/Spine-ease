const programs = [
  {
    id: 1,
    title: "Офисная разминка за 3 минуты",
    duration: "3 мин • Базовый",
    isPremium: false,
    exercises: [
      { name: "Сведение лопаток", desc: "Сядь ровно, отведи плечи назад и сведи лопатки на 5 секунд, затем расслабь.", time: 30 },
      { name: "Наклоны головы к плечу", desc: "Плавно потяни правое ухо к правому плечу без поднятия плеч, затем смени сторону.", time: 40 },
      { name: "Кошка-корова сидя", desc: "На вдохе прогнись в грудном отделе вперед, на выдохе округли спину.", time: 40 }
    ]
  },
  {
    id: 2,
    title: "Снятие зажимов в шее",
    duration: "5 мин • Легкий",
    isPremium: false,
    exercises: [
      { name: "Двойной подбородок", desc: "Мягко задвинь подбородок назад, вытягивая макушку вверх.", time: 30 },
      { name: "Полукруги головой", desc: "Медленно перекатывай подбородок от одного плеча к другому по груди.", time: 45 }
    ]
  },
  {
    id: 3,
    title: "Глубокая декомпрессия поясницы",
    duration: "10 мин • Реабилитация",
    isPremium: true,
    exercises: [
      { name: "Поза ребенка", desc: "Опустись тазом на пятки, вытяни руки вперед и расслабь поясницу.", time: 60 },
      { name: "Скручивания лежа", desc: "Лежа на спине, плавно опусти согнутые колени в сторону, плечи прижаты к полу.", time: 60 }
    ]
  },
  {
    id: 4,
    title: "Королевская осанка перед сном",
    duration: "12 мин • Вечерний",
    isPremium: true,
    exercises: [
      { name: "Раскрытие грудного отдела", desc: "Ляг спиной на свернутое полотенце вдоль позвоночника и раскинь руки в стороны.", time: 90 },
      { name: "Ангел у стены", desc: "Прижмись затылком и поясницей к стене, плавно поднимай и опускай руки.", time: 60 }
    ]
  }
];

let state = JSON.parse(localStorage.getItem("spineEaseState")) || {
  isPremium: false,
  workouts: 0,
  minutes: 0,
  streak: 1
};

let currentProgram = null;
let currentExIndex = 0;
let timeLeft = 0;
let timerInterval = null;

function saveState() {
  localStorage.setItem("spineEaseState", JSON.stringify(state));
  renderUI();
}

function renderUI() {
  document.getElementById("workoutsCount").textContent = state.workouts;
  document.getElementById("minutesCount").textContent = state.minutes;
  document.getElementById("streakCount").textContent = state.streak;

  const badge = document.getElementById("premiumBadge");
  if (state.isPremium) {
    badge.textContent = "👑 PREMIUM";
    badge.className = "badge pro";
  }

  const list = document.getElementById("programsList");
  list.innerHTML = "";

  programs.forEach((prog) => {
    const locked = prog.isPremium && !state.isPremium;
    const card = document.createElement("div");
    card.className = `program-card ${locked ? "locked" : ""}`;
    card.innerHTML = `
      <div class="program-top">
        <span class="program-title">${locked ? "🔒 " : ""}${prog.title}</span>
        <span class="tag ${prog.isPremium ? "pro" : "free"}">${prog.isPremium ? "PRO" : "FREE"}</span>
      </div>
      <div class="program-meta">${prog.duration} • ${prog.exercises.length} упр.</div>
    `;
    card.onclick = () => locked ? openPaywall() : startWorkout(prog);
    list.appendChild(card);
  });
}

function startWorkout(program) {
  currentProgram = program;
  currentExIndex = 0;
  document.getElementById("homeView").classList.add("hidden");
  document.getElementById("workoutView").classList.remove("hidden");
  document.getElementById("workoutTitle").textContent = program.title;
  loadExercise();
}

function loadExercise() {
  clearInterval(timerInterval);
  timerInterval = null;
  document.getElementById("timerToggleBtn").textContent = "Старт";

  const ex = currentProgram.exercises[currentExIndex];
  timeLeft = ex.time;
  document.getElementById("exerciseStep").textContent = `Упражнение ${currentExIndex + 1} из ${currentProgram.exercises.length}`;
  document.getElementById("exerciseName").textContent = ex.name;
  document.getElementById("exerciseDesc").textContent = ex.desc;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  document.getElementById("timerDisplay").textContent = `${mins}:${secs}`;
}

function toggleTimer() {
  const btn = document.getElementById("timerToggleBtn");
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    btn.textContent = "Продолжить";
  } else {
    btn.textContent = "Пауза";
    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        nextExercise();
      }
    }, 1000);
  }
}

function nextExercise() {
  if (currentExIndex + 1 < currentProgram.exercises.length) {
    currentExIndex++;
    loadExercise();
  } else {
    state.workouts += 1;
    state.minutes += parseInt(currentProgram.duration) || 5;
    saveState();
    alert("Отличная работа! Тренировка завершена.");
    exitWorkout();
  }
}

function exitWorkout() {
  clearInterval(timerInterval);
  timerInterval = null;
  document.getElementById("workoutView").classList.add("hidden");
  document.getElementById("homeView").classList.remove("hidden");
}

function openPaywall() {
  document.getElementById("paywallModal").classList.remove("hidden");
}

function closePaywall() {
  document.getElementById("paywallModal").classList.add("hidden");
}

function selectPlan(el) {
  document.querySelectorAll(".plan").forEach(p => p.classList.remove("selected"));
  el.classList.add("selected");
}

function activatePremium() {
  state.isPremium = true;
  saveState();
  closePaywall();
  alert("Поздравляем! Доступ ко всем PRO-программам открыт.");
}

renderUI();
