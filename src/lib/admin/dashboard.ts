import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import {
  COLLECTIONS,
  DOCS,
  type Activity,
  type ContactMessage,
} from "@/lib/firebase/collections";

export type DashboardStats = {
  blogs: number;
  newsletterIssues: number;
  services: number;
  messages: number;
  unreadMessages: number;
  settingsReady: boolean;
  latestBlog: { id: string; title: string; updatedAt?: unknown } | null;
  latestMessage: ContactMessage | null;
  activities: Activity[];
};

async function safeCount(path: string) {
  try {
    const snap = await getCountFromServer(collection(getFirebaseDb(), path));
    return snap.data().count;
  } catch {
    return 0;
  }
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const db = getFirebaseDb();

  const [blogs, newsletterIssues, services, messages] = await Promise.all([
    safeCount(COLLECTIONS.blogs),
    safeCount(COLLECTIONS.newsletterIssues),
    safeCount(COLLECTIONS.services),
    safeCount(COLLECTIONS.messages),
  ]);

  let unreadMessages = 0;
  try {
    const unreadSnap = await getCountFromServer(
      query(collection(db, COLLECTIONS.messages), where("status", "==", "unread")),
    );
    unreadMessages = unreadSnap.data().count;
  } catch {
    unreadMessages = 0;
  }

  let settingsReady = false;
  try {
    const settingsSnap = await getDoc(doc(db, COLLECTIONS.settings, DOCS.settingsSite));
    settingsReady = settingsSnap.exists();
  } catch {
    settingsReady = false;
  }

  let latestBlog: DashboardStats["latestBlog"] = null;
  try {
    const blogSnap = await getDocs(
      query(collection(db, COLLECTIONS.blogs), orderBy("updatedAt", "desc"), limit(1)),
    );
    const first = blogSnap.docs[0];
    if (first) {
      const data = first.data();
      latestBlog = {
        id: first.id,
        title: String(data.title ?? "Untitled"),
        updatedAt: data.updatedAt,
      };
    }
  } catch {
    latestBlog = null;
  }

  let latestMessage: ContactMessage | null = null;
  try {
    const msgSnap = await getDocs(
      query(collection(db, COLLECTIONS.messages), orderBy("createdAt", "desc"), limit(1)),
    );
    const first = msgSnap.docs[0];
    if (first) {
      latestMessage = { id: first.id, ...(first.data() as Omit<ContactMessage, "id">) };
    }
  } catch {
    latestMessage = null;
  }

  let activities: Activity[] = [];
  try {
    const actSnap = await getDocs(
      query(collection(db, COLLECTIONS.activities), orderBy("createdAt", "desc"), limit(8)),
    );
    activities = actSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Activity, "id">) }));
  } catch {
    activities = [];
  }

  return {
    blogs,
    newsletterIssues,
    services,
    messages,
    unreadMessages,
    settingsReady,
    latestBlog,
    latestMessage,
    activities,
  };
}
