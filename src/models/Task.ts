import { Timestamp } from "firebase/firestore";

export class Task {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "new" | "in-progress" | "done";
  assigned: string | null;
  timestamp: Date;

  constructor(
    id: string,
    title: string,
    description: string,
    category: string,
    status: "new" | "in-progress" | "done",
    assigned: string | null,
    timestamp: Timestamp | Date
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.category = category;
    this.status = status;
    this.assigned = assigned;

    // Normalize timestamp
    this.timestamp = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  }
}
