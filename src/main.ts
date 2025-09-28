import "./styles.css"; // for styling
import { Member } from "./models/Member";
import { Task } from "./models/Task";
import {
  addMember,
  getMembers,
  addTask,
  getTasks,
  updateTask,
  deleteTask,
} from "./services/firebase"; 

import {
  filterTasksByMember,
  filterTasksByCategory,
  sortTasksByTimestamp,
  sortTasksByTitle,
} from "./utils/taskUtils";

// -----------------------------
// State
// -----------------------------
let members: Member[] = [];
let tasks: Task[] = [];

// -----------------------------
// DOM References
// -----------------------------
const memberForm = document.getElementById("member-form") as HTMLFormElement;
const memberNameInput = document.getElementById("member-name") as HTMLInputElement;
const memberRoleInput = document.getElementById("member-role") as HTMLInputElement;
const membersList = document.getElementById("members-list") as HTMLElement;

const taskForm = document.getElementById("task-form") as HTMLFormElement;
const taskTitleInput = document.getElementById("task-title") as HTMLInputElement;
const taskDescInput = document.getElementById("task-desc") as HTMLInputElement;
const taskCategoryInput = document.getElementById("task-category") as HTMLSelectElement;

const newCol = document.getElementById("new-tasks") as HTMLElement;
const inProgressCol = document.getElementById("in-progress") as HTMLElement;
const doneCol = document.getElementById("done") as HTMLElement;

const filterMemberSelect = document.getElementById("filter-member") as HTMLSelectElement;
const filterCategorySelect = document.getElementById("filter-category") as HTMLSelectElement;
const filterAssignedCheckbox = document.getElementById("filter-assigned-only") as HTMLInputElement;
const sortOptionSelect = document.getElementById("sort-option") as HTMLSelectElement;
const applyFiltersBtn = document.getElementById("apply-filters") as HTMLButtonElement;
const clearFiltersBtn = document.getElementById("clear-filters") as HTMLButtonElement;

// -----------------------------
// Helpers
// -----------------------------
function isRoleAllowedForCategory(role: string, category: string): boolean {
  const r = role.trim().toLowerCase();
  const c = category.trim().toLowerCase();

  if (c.includes("backend")) return r.includes("backend");
  if (c.includes("frontend")) return r.includes("frontend");
  if (c.includes("ux") || c.includes("ui")) return r.includes("ux") || r.includes("designer");

  return true;
}

// -----------------------------
// Render Functions
// -----------------------------
function renderMembers() {
  if (!membersList) return;
  membersList.innerHTML = "";
  members.forEach((m) => {
    const li = document.createElement("li");
    li.textContent = `${m.name} (${m.role})`;
    membersList.appendChild(li);
  });
}

function renderTasks(tasksToRender: Task[] = tasks) {
  newCol.innerHTML = "<h2>New</h2>";
  inProgressCol.innerHTML = "<h2>In Progress</h2>";
  doneCol.innerHTML = "<h2>Done</h2>";

  tasksToRender.forEach((t) => {
    const card = document.createElement("div");
    card.className = "task-card";
    card.setAttribute("data-category", t.category.toLowerCase());

    const assignOptions = members
      .filter((m) => isRoleAllowedForCategory(m.role, t.category))
      .map(
        (m) =>
          `<option value="${m.id}" ${m.id === t.assigned ? "selected" : ""}>${m.name}</option>`
      )
      .join("");

    const doneDisabled = t.assigned ? "" : "disabled";

    card.innerHTML = `
      <h3>${t.title}</h3>
      <p>${t.description}</p>
      <p><strong>Category:</strong> ${t.category}</p>
      <p><strong>Status:</strong> ${t.status}</p>
      <p><strong>Created:</strong> ${t.timestamp.toLocaleString()}</p>
      <label>Assign:
        <select class="assign-select" data-id="${t.id}">
          <option value="">Unassigned</option>
          ${assignOptions}
        </select>
      </label>
      <button class="done-btn" data-id="${t.id}" ${doneDisabled}>Mark Done</button>
      <button class="delete-btn" data-id="${t.id}">Delete</button>
    `;

    if (t.status === "new") newCol.appendChild(card);
    else if (t.status === "in-progress") inProgressCol.appendChild(card);
    else if (t.status === "done") doneCol.appendChild(card);
  });

  document.querySelectorAll(".assign-select").forEach((select) =>
    select.addEventListener("change", async (e) => {
      const sel = e.target as HTMLSelectElement;
      const taskId = sel.dataset.id!;
      const memberId = sel.value || null;
      const member = members.find((m) => m.id === memberId);

      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      if (memberId && member && !isRoleAllowedForCategory(member.role, task.category)) {
        alert(`${member.name} (${member.role}) cannot be assigned to ${task.category} tasks.`);
        sel.value = task.assigned ?? "";
        return;
      }

      await updateTask(taskId, { assigned: memberId, status: memberId ? "in-progress" : "new" });
      await loadData();
    })
  );

  document.querySelectorAll(".done-btn").forEach((btn) =>
    btn.addEventListener("click", async (e) => {
      const id = (e.target as HTMLButtonElement).dataset.id!;
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      if (!task.assigned) {
        alert("Assign the task before marking done.");
        return;
      }
      await updateTask(id, { status: "done" });
      await loadData();
    })
  );

  document.querySelectorAll(".delete-btn").forEach((btn) =>
    btn.addEventListener("click", async (e) => {
      const id = (e.target as HTMLButtonElement).dataset.id!;
      await deleteTask(id);
      await loadData();
    })
  );
}

function populateMemberFilter() {
  filterMemberSelect.innerHTML = '<option value="">All Members</option>';
  members.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = `${m.name} (${m.role})`;
    filterMemberSelect.appendChild(opt);
  });
}

// -----------------------------
// Filtering & Sorting
// -----------------------------
function applyFiltersAndSort(): Task[] {
  let result = [...tasks];

  if (filterAssignedCheckbox.checked) {
    result = result.filter((t) => t.assigned && t.status !== "done");
  }

  if (filterMemberSelect.value) {
    result = filterTasksByMember(result, filterMemberSelect.value);
  }

  if (filterCategorySelect.value) {
    result = filterTasksByCategory(result, filterCategorySelect.value);
  }

  const s = sortOptionSelect.value;
  if (s.startsWith("timestamp")) {
    result = sortTasksByTimestamp(result, s.endsWith("asc") ? "asc" : "desc");
  } else if (s.startsWith("title")) {
    result = sortTasksByTitle(result, s.endsWith("asc") ? "asc" : "desc");
  }

  return result;
}

// -----------------------------
// Event Listeners
// -----------------------------
memberForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = memberNameInput.value.trim();
  const role = memberRoleInput.value.trim();
  if (name && role) {
    const docRef = await addMember(name, role);
    members.push(new Member(docRef.id, name, role));
    renderMembers();
    populateMemberFilter();
    memberForm.reset();
  }
});

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = taskTitleInput.value.trim();
  const desc = taskDescInput.value.trim();
  const category = taskCategoryInput.value;
  if (title && desc && category) {
    await addTask(title, desc, category);
    await loadData();
    taskForm.reset();
  }
});

applyFiltersBtn.addEventListener("click", (e) => {
  e.preventDefault();
  renderTasks(applyFiltersAndSort());
});

clearFiltersBtn.addEventListener("click", (e) => {
  e.preventDefault();
  filterMemberSelect.value = "";
  filterCategorySelect.value = "";
  filterAssignedCheckbox.checked = false;
  sortOptionSelect.value = "";
  renderTasks();
});

[filterMemberSelect, filterCategorySelect, filterAssignedCheckbox, sortOptionSelect].forEach(
  (el) => el.addEventListener("change", () => renderTasks(applyFiltersAndSort()))
);

// -----------------------------
// Load Data
// -----------------------------
async function loadData() {
  const memberDocs = await getMembers();
  members = memberDocs.map((m) => new Member(m.id, m.name, m.role));
  renderMembers();
  populateMemberFilter();

  const taskDocs = await getTasks();
  tasks = taskDocs.map(
    (t) =>
      new Task(
        t.id,
        t.title,
        t.description,
        t.category,
        t.status,
        t.assigned,
        t.timestamp.toDate ? t.timestamp.toDate() : new Date(t.timestamp)
      )
  );
  renderTasks();
}

// -----------------------------
// Init
// -----------------------------
loadData();
