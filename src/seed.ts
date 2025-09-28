// src/seed.ts
import { addMember, addTask } from "./services/firebase.js";

async function seed() {
  try {
    console.log("Seeding members...");
    const members = [
      { name: "Alice", role: "frontend" },
      { name: "Bob", role: "backend" },
      { name: "Charlie", role: "ux" },
    ];

    for (const m of members) {
      await addMember(m.name, m.role);
    }
    console.log("Members seeded!");

    console.log("Seeding tasks...");
    const tasks = [
      { title: "Build Login Form", description: "Create login UI", category: "frontend" },
      { title: "Setup Database", description: "Install MongoDB", category: "backend" },
      { title: "Design Homepage", description: "Create homepage layout", category: "ux" },
      { title: "API Integration", description: "Connect login API", category: "backend" },
      { title: "Wireframe Login", description: "Draw login screen wireframes", category: "ux" },
      { title: "Setup CI/CD", description: "Configure pipelines", category: "frontend" },
    ];

    for (const t of tasks) {
      await addTask(t.title, t.description, t.category);
    }
    console.log("Tasks seeded!");
  } catch (err) {
    console.error("Seeding failed:", err);
  }
}

seed();
