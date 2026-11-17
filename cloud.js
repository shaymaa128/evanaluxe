// EVANA LUXE — cloud layer (Firebase sign-in + Firestore + Cloudinary pictures).
// Loaded on demand by script.js, products.html and admin.html.
import { firebaseConfig, ADMIN_EMAIL } from "./firebase-config.js";

const V = "10.12.2";
export const configured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

let fb = null;       // firebase modules + instances
let readyPromise = null;

async function init() {
  if (!configured) return null;
  if (readyPromise) return readyPromise;
  readyPromise = (async () => {
    const base = `https://www.gstatic.com/firebasejs/${V}/`;
    const [app, auth, store] = await Promise.all([
      import(base + "firebase-app.js"),
      import(base + "firebase-auth.js"),
      import(base + "firebase-firestore.js")
    ]);
    const a = app.initializeApp(firebaseConfig);
    fb = { auth, store, authInst: auth.getAuth(a), db: store.getFirestore(a) };
    await new Promise((res) => {
      const off = auth.onAuthStateChanged(fb.authInst, () => { off(); res(); });
    });
    return fb;
  })();
  return readyPromise;
}

export async function ready() { return init(); }
export function currentUser() { return fb ? fb.authInst.currentUser : null; }
export function isAdminUser(u) {
  return !!(u && u.email && u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
}

export async function onUser(cb) {
  await init();
  return fb.auth.onAuthStateChanged(fb.authInst, cb);
}

export async function signIn() {
  await init();
  const provider = new fb.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    return (await fb.auth.signInWithPopup(fb.authInst, provider)).user;
  } catch (e) {
    if (e && (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment")) {
      await fb.auth.signInWithRedirect(fb.authInst, provider);
      return null;
    }
    throw e;
  }
}
export async function signOut() { await init(); return fb.auth.signOut(fb.authInst); }

/* ---- customer profile ---- */
export async function getProfile() {
  await init();
  const u = fb.authInst.currentUser;
  if (!u) return null;
  const snap = await fb.store.getDoc(fb.store.doc(fb.db, "users", u.uid));
  return snap.exists() ? snap.data() : null;
}
export async function saveProfile(p) {
  await init();
  const u = fb.authInst.currentUser;
  if (!u) throw new Error("Not signed in");
  await fb.store.setDoc(fb.store.doc(fb.db, "users", u.uid), {
    name: p.name, address: p.address, phone: p.phone,
    email: u.email || "", updatedAt: Date.now()
  }, { merge: true });
}

/* ---- products ---- */
export async function listProducts() {
  await init();
  const snap = await fb.store.getDocs(fb.store.collection(fb.db, "products"));
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }))
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
}
export async function saveProduct(id, data) {
  await init();
  const ref = id ? fb.store.doc(fb.db, "products", String(id))
                 : fb.store.doc(fb.store.collection(fb.db, "products"));
  await fb.store.setDoc(ref, data, { merge: true });
  return ref.id;
}
export async function deleteProduct(id) {
  await init();
  await fb.store.deleteDoc(fb.store.doc(fb.db, "products", String(id)));
}
export async function saveMany(items) {          // items: [{id, data}]
  await init();
  for (let i = 0; i < items.length; i += 400) {
    const batch = fb.store.writeBatch(fb.db);
    items.slice(i, i + 400).forEach((it) =>
      batch.set(fb.store.doc(fb.db, "products", String(it.id)), it.data, { merge: true }));
    await batch.commit();
  }
}
export async function deleteMany(ids) {
  await init();
  for (let i = 0; i < ids.length; i += 400) {
    const batch = fb.store.writeBatch(fb.db);
    ids.slice(i, i + 400).forEach((id) => batch.delete(fb.store.doc(fb.db, "products", String(id))));
    await batch.commit();
  }
}

/* ---- pictures: shrunk and stored inside the product itself (no extra service, free) ---- */
async function shrink(file, max, quality) {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  const x = c.getContext("2d");
  x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height);
  x.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", quality);
}
export async function uploadImage(file) {
  // keep each picture well under Firestore's 1 MB-per-product limit
  let url = "";
  for (const [max, q] of [[900, 0.8], [800, 0.7], [700, 0.6], [600, 0.5]]) {
    url = await shrink(file, max, q);
    if (url.length < 350000) return url;
  }
  if (url.length > 900000) throw new Error("Picture is too large, please choose a smaller one.");
  return url;
}

window.EvanaCloud = {
  configured, ready, currentUser, onUser, signIn, signOut, isAdminUser,
  getProfile, saveProfile, listProducts, saveProduct, deleteProduct,
  saveMany, deleteMany, uploadImage, ADMIN_EMAIL
};
window.dispatchEvent(new Event("evanacloud-ready"));
