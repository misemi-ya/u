// login.html のインラインスクリプトの「後」に読み込む:
//   <script src="felica-client.js"></script>
// 同名の関数を上書きして、PHP API + 読み取りツール方式に切り替える。
const API_URL = "https://cf890473.cloudfree.jp/mmu-auth/api.php";  // ← api.php を置いたURLに変更
const READER_URL = "http://127.0.0.1:8765";
let adminToken = null;
let lastReading = null;

function showBox(el, kind, text) {
  const c = { info: ["#e0f2fe", "#0369a1"], ok: ["#dcfce7", "#15803d"], err: ["#fee2e2", "#b91c1c"] }[kind];
  el.style.display = "block"; el.style.background = c[0]; el.style.color = c[1]; el.textContent = text;
}

async function api(action, body) {
  const r = await fetch(`${API_URL}?a=${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const j = await r.json().catch(() => ({ error: "サーバーの応答が不正です" }));
  if (!r.ok) throw new Error(j.error || "エラーが発生しました");
  return j;
}

async function readCard() {
  const { challenge } = await api("challenge");
  let r;
  try {
    r = await fetch(`${READER_URL}/read?challenge=${challenge}`);
  } catch (e) {
    throw new Error("読み取りツールに接続できません。PCで reader.py を起動してください。");
  }
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || "読み取りに失敗しました");
  return { idm: j.idm, sig: j.sig, challenge };
}

async function signInWithFeliCa() {
  const box = document.getElementById("errorMessage");
  try {
    showBox(box, "info", "職員証をリーダーにタッチしてください…");
    const r = await api("login", await readCard());
    sessionStorage.setItem("felica_token", r.token);
    sessionStorage.setItem("felica_email", r.email);
    redirectUser();
  } catch (e) {
    showBox(box, "err", "FeliCa認証エラー: " + e.message);
  }
}

async function authAdmin() {
  try {
    const r = await api("admin_login", {
      id: document.getElementById("adminId").value.trim(),
      pw: document.getElementById("adminPw").value,
    });
    adminToken = r.token;
    document.getElementById("adminLoginForm").style.display = "none";
    document.getElementById("cardRegisterSection").style.display = "block";
    document.getElementById("adminModalDesc").textContent = "IDカードと大学メールアドレスの紐づけ登録を行います。";
  } catch (e) { alert(e.message); }
}

async function readPaSoRiCard() {
  const box = document.getElementById("adminResult");
  try {
    showBox(box, "info", "カードをリーダーにタッチしてください…");
    lastReading = await readCard();
    document.getElementById("targetIdm").value = lastReading.idm;
    showBox(box, "ok", "カードを読み取りました。");
  } catch (e) {
    lastReading = null;
    showBox(box, "err", "読み取りエラー: " + e.message);
  }
}

async function saveCardMapping() {
  const box = document.getElementById("adminResult");
  const email = document.getElementById("targetEmail").value.trim();
  if (!lastReading) { alert("先にカードを読み取ってください。"); return; }
  try {
    await api("register", { token: adminToken, email, ...lastReading });
    showBox(box, "ok", `連携を保存しました (${email})`);
    setTimeout(closeAdminModal, 1500);
  } catch (e) {
    showBox(box, "err", e.message);
  }
  lastReading = null;
  document.getElementById("targetIdm").value = "";
}

const _origResetAdminPanel = resetAdminPanel;
resetAdminPanel = function () { adminToken = null; lastReading = null; _origResetAdminPanel(); };
