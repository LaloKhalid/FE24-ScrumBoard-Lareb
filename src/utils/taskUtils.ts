import { Task } from "../models/Task"; // <- correct relative path from utils to models

// Filter tasks by member ID
export const filterTasksByMember = (tasks: Task[], memberId: string): Task[] =>
  tasks.filter((t) => t.assigned === memberId);

// Filter tasks by category
export const filterTasksByCategory = (tasks: Task[], category: string): Task[] =>
  tasks.filter((t) => t.category === category);

// Sort tasks by timestamp
export const sortTasksByTimestamp = (tasks: Task[], order: "asc" | "desc"): Task[] =>
  tasks.sort((a, b) => (order === "asc" ? a.timestamp.getTime() - b.timestamp.getTime() : b.timestamp.getTime() - a.timestamp.getTime()));

// Sort tasks by title
export const sortTasksByTitle = (tasks: Task[], order: "asc" | "desc"): Task[] =>
  tasks.sort((a, b) =>
    order === "asc"
      ? a.title.localeCompare(b.title)
      : b.title.localeCompare(a.title)
  );
