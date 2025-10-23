// =============================
// ✅ LocalStorage 키 정의
// =============================
const CHECKLIST_KEY = "careerDashboard_checklist";
const REVIEW_KEY = "careerDashboard_review";
const EVENTS_KEY = "careerDashboard_events";
const GOALS_KEY = "careerDashboard_goals";

// =============================
// ✅ 초기 데이터
// =============================
let checklist = [
  { id: 1, text: "알고리즘 2문제 풀기", done: false },
  { id: 2, text: "기술 블로그 포스팅 1개", done: false },
  { id: 3, text: "'클린코드' 1챕터 읽기", done: false },
  { id: 4, text: "채용공고 5개 서칭", done: false }
];
let goals = ["대기업 입사", "AI 전문가 되기"];
let current = new Date();
let events = {};

// =============================
// ✅ LocalStorage 불러오기
// =============================
function loadData() {
  const savedChecklist = localStorage.getItem(CHECKLIST_KEY);
  if (savedChecklist) checklist = JSON.parse(savedChecklist);

  const savedReview = localStorage.getItem(REVIEW_KEY);
  if (savedReview) document.getElementById("reviewText").textContent = savedReview;

  const savedEvents = localStorage.getItem(EVENTS_KEY);
  if (savedEvents) events = JSON.parse(savedEvents);

  const savedGoals = localStorage.getItem(GOALS_KEY);
  if (savedGoals) goals = JSON.parse(savedGoals);
}

// =============================
// ✅ LocalStorage 저장
// =============================
function saveChecklist() {
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify(checklist));
}
function saveReview() {
  const text = document.getElementById("reviewInput").value.trim();
  if (!text) return;
  document.getElementById("reviewText").textContent = text;
  document.getElementById("reviewInput").style.display = "none";
  localStorage.setItem(REVIEW_KEY, text);
}
function editReview() {
  const input = document.getElementById("reviewInput");
  input.style.display = "block";
  input.value = document.getElementById("reviewText").textContent;
}
// [추가] 회고 삭제 함수
function deleteReview() {
  if (!confirm("회고를 삭제하시겠습니까?")) return;
  localStorage.removeItem(REVIEW_KEY);
  document.getElementById("reviewText").textContent = "";
  document.getElementById("reviewInput").value = "";
}

function saveEvents() {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}
function saveGoals() {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

// =============================
// ✅ 핵심 목표
// =============================
function renderGoals() {
  const goalsList = document.getElementById("goalsList");
  goalsList.innerHTML = "";
  goals.forEach(goal => {
    const li = document.createElement("li");
    li.textContent = goal;
    goalsList.appendChild(li);
  });
}
function handleGoalsEdit() {
  const editBtn = document.getElementById("editGoalsBtn");
  const goalsList = document.getElementById("goalsList");
  const goalsInput = document.getElementById("goalsInput");
  if (editBtn.textContent === "수정") {
    goalsInput.value = goals.join("\n");
    goalsList.classList.add("hidden");
    goalsInput.classList.remove("hidden");
    editBtn.textContent = "저장";
  } else {
    const newGoals = goalsInput.value.split("\n").filter(g => g.trim() !== "");
    goals = newGoals;
    saveGoals();
    renderGoals();
    goalsList.classList.remove("hidden");
    goalsInput.classList.add("hidden");
    editBtn.textContent = "수정";
  }
}

// =============================
// ✅ 체크리스트
// =============================
function renderChecklist() {
  const container = document.getElementById("checklist");
  container.innerHTML = "";
  checklist.forEach(item => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.done;
    checkbox.onchange = () => toggleTask(item.id);
    const span = document.createElement("span");
    span.textContent = item.text;
    if (item.done) span.classList.add("done");
    label.appendChild(checkbox);
    label.appendChild(span);
    container.appendChild(label);
  });
}
function toggleTask(id) {
  checklist = checklist.map(item =>
    item.id === id ? { ...item, done: !item.done } : item
  );
  renderChecklist();
  saveChecklist();
}
function addTask() {
  const input = document.getElementById("newTask");
  const text = input.value.trim();
  if (!text) return;
  const newItem = { id: Date.now(), text, done: false };
  checklist.push(newItem);
  input.value = "";
  renderChecklist();
  saveChecklist();
}

// =============================
// ✅ 이벤트
// =============================
function addEvent(dateKey) {
  const title = prompt("일정을 입력하세요 (예: 면접)");
  if (!title) return;
  const endDateInput = prompt("종료 날짜를 입력하세요 (예: 2025-09-25) / 단일 일정이면 그냥 Enter");
  if (!endDateInput) {
    if (!events[dateKey]) events[dateKey] = [];
    events[dateKey].push(title);
  } else {
    try {
      const start = new Date(dateKey);
      const end = new Date(endDateInput);
      if (start > end) {
        alert("종료 날짜는 시작 날짜보다 빠를 수 없습니다.");
        return;
      }
      let currentDay = new Date(start);
      while (currentDay <= end) {
        const key = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, "0")}-${String(currentDay.getDate()).padStart(2, "0")}`;
        if (!events[key]) events[key] = [];
        events[key].push(title);
        currentDay.setDate(currentDay.getDate() + 1);
      }
    } catch(e) {
      alert("유효한 날짜 형식이 아닙니다. (YYYY-MM-DD)");
      return;
    }
  }
  saveEvents();
  renderCalendar();
}
function deleteEvent(dateKey, eventTitle) {
  const eventArray = events[dateKey];
  if (!eventArray) return;
  const eventIndex = eventArray.indexOf(eventTitle);
  if (eventIndex > -1) {
    eventArray.splice(eventIndex, 1);
    if (events[dateKey].length === 0) delete events[dateKey];
  }
  saveEvents();
  renderCalendar();
}

// =============================
// ✅ 달력
// =============================
function renderCalendar() {
  const year = current.getFullYear();
  const month = current.getMonth();
  const monthNames = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
  document.querySelector(".month-nav h3").textContent = `${year}년 ${monthNames[month]}`;
  const grid = document.querySelector(".calendar .grid");
  grid.innerHTML = "";
  ["일","월","화","수","목","금","토"].forEach(day => {
    const div = document.createElement("div");
    div.className = "day-header";
    div.textContent = day;
    grid.appendChild(div);
  });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 0; i < firstDay; i++) {
    const cell = document.createElement("div");
    cell.className = "cell empty";
    grid.appendChild(cell);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    const dateNum = document.createElement('span');
    dateNum.textContent = d;
    cell.appendChild(dateNum);
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (events[dateKey]) {
      const ul = document.createElement("ul");
      events[dateKey].forEach(ev => {
        const li = document.createElement("li");
        li.textContent = ev;
        li.style.cursor = "pointer";
        li.onclick = function(e) {
          e.stopPropagation();
          if (confirm(`'${ev}' 일정을 삭제하시겠습니까?`)) {
            deleteEvent(dateKey, ev);
          }
        };
        ul.appendChild(li);
      });
      cell.appendChild(ul);
    }
    cell.onclick = () => addEvent(dateKey);
    grid.appendChild(cell);
  }
}
function prevMonth() {
  current.setMonth(current.getMonth() - 1);
  renderCalendar();
}
function nextMonth() {
  current.setMonth(current.getMonth() + 1);
  renderCalendar();
}

// =============================
// ✅ 초기 실행
// =============================
loadData();
renderChecklist();
renderCalendar();
renderGoals();
document.getElementById("prevBtn").onclick = prevMonth;
document.getElementById("nextBtn").onclick = nextMonth;
document.getElementById("editGoalsBtn").onclick = handleGoalsEdit;
