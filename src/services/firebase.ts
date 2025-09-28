import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAU1RpKD3mzYpNAUl4No9MAmytLWVpODuc",
  authDomain: "scrumboard-fe24.firebaseapp.com",
  projectId: "scrumboard-fe24",
  storageBucket: "scrumboard-fe24.appspot.com",
  messagingSenderId: "194278134561",
  appId: "1:194278134561:web:09f4a87077e71c1636e460",
  measurementId: "G-JN5840LZYZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// -----------------------------
// Members
// -----------------------------
export async function addMember(name: string, role: string) {
  if (!name || !role) throw new Error("Invalid member data");
  return await addDoc(collection(db, "members"), { name, role });
}

export async function getMembers() {
  const snapshot = await getDocs(collection(db, "members"));
  return snapshot.docs.map((d) => ({
    id: d.id,
    name: d.data().name ?? "",
    role: d.data().role ?? "",
  }));
}

// -----------------------------
// Tasks
// -----------------------------
export async function addTask(title: string, description: string, category: string) {
  if (!title || !description || !category) throw new Error("Invalid task data");
  return await addDoc(collection(db, "tasks"), {
    title,
    description,
    category,
    status: "new",
    assigned: null,
    timestamp: serverTimestamp(),
  });
}

export async function getTasks() {
  const snapshot = await getDocs(collection(db, "tasks"));
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title ?? "",
      description: data.description ?? "",
      category: data.category ?? "",
      status: data.status ?? "new",
      assigned: data.assigned ?? null,
      timestamp: data.timestamp ?? new Date(),
    };
  });
}

export async function updateTask(id: string, data: Partial<any>) {
  await updateDoc(doc(db, "tasks", id), data);
}

export async function deleteTask(id: string) {
  await deleteDoc(doc(db, "tasks", id));
}
