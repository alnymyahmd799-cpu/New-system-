/* eslint-disable import/no-unresolved */
import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, onValue, ref, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { distributionPath, firebaseConfig } from "./firebase-config.js";

let database;
let dataRef;

function connectDatabase() {
  if (database) return database;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  database = getDatabase(app);
  dataRef = ref(database, distributionPath);
  return database;
}

export function startFirebase({ fallback, onData, onStatus }) {
  try {
    connectDatabase();
    onStatus("connecting");
    const timeout = window.setTimeout(() => onStatus("timeout"), 10000);
    const unsubscribe = onValue(dataRef, async (snapshot) => {
      window.clearTimeout(timeout);
      try {
        if (snapshot.exists()) onData(snapshot.val());
        else await set(dataRef, fallback());
        onStatus("synced");
      } catch (error) {
        onStatus(error?.code === "PERMISSION_DENIED" ? "denied" : "offline");
      }
    }, (error) => {
      window.clearTimeout(timeout);
      onStatus(error?.code === "PERMISSION_DENIED" ? "denied" : "offline");
    });
    return () => { window.clearTimeout(timeout); unsubscribe(); };
  } catch {
    onStatus("offline");
    return () => {};
  }
}

export async function saveCloudData(data) {
  if (!database || !dataRef) throw new Error("Firebase غير متصل");
  await set(dataRef, data);
}
