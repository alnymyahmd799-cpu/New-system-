/* eslint-disable import/no-unresolved */
import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, onValue, ref, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { distributionPath, firebaseConfig } from "./firebase-config.js";
import { normalizeFirebaseData, serializeFirebaseData } from "./firebase-transform.js";

let database;
let dataRef;
let latestRemote;

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
        const remote = snapshot.val() || {};
        latestRemote = remote;
        if (snapshot.exists()) {
          onData(normalizeFirebaseData(remote));
        } else {
          await saveCloudData(fallback());
          onData(fallback());
        }
        onStatus("synced");
      } catch (error) {
        onStatus(String(error?.code || "").toLowerCase().includes("permission") ? "denied" : "offline");
      }
    }, (error) => {
      window.clearTimeout(timeout);
      onStatus(String(error?.code || "").toLowerCase().includes("permission") ? "denied" : "offline");
    });
    return () => { window.clearTimeout(timeout); unsubscribe(); };
  } catch {
    onStatus("offline");
    return () => {};
  }
}

export async function saveCloudData(data) {
  connectDatabase();
  const payload = serializeFirebaseData(data);
  await Promise.all(Object.entries(payload).map(([key, value]) => set(ref(database, key), value)));
  latestRemote = { ...latestRemote, ...payload };
}

export function getLatestRemoteData() {
  return latestRemote;
}
