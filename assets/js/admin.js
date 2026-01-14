const API_URL = "https://script.google.com/macros/s/AKfycbwOdpgYaBylHJmAZ_-83BliVTaD05ti4Xs16gR0LjhR-rFDSFp3gfWxGI6Teg0zbMkcog/exec";
const SHEET_URL = "https://docs.google.com/spreadsheets/d/11cbT3xxmpIu9LAeKSbrAsscO7vKuUYm3n3X-NINxG90/edit?gid=0#gid=0";

const msg = document.getElementById("msg");
const table = document.getElementById("table");
const tbody = document.getElementById("tbody");

function getPassword() {
  return document.getElementById("adminPassword").value.trim();
}

document.getElementById("openSheetBtn").addEventListener("click", () => {
  window.open(SHEET_URL, "_blank");
});

document.getElementById("loadBtn").addEventListener("click", loadSubmissions);

async function loadSubmissions() {
  msg.innerHTML = "";
  tbody.innerHTML = "";
  table.style.display = "none";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "list", adminPassword: getPassword() })
    });

    const data = await res.json();
    if (!data.ok) throw new Error(data.message || "Wrong password");

    table.style.display = "table";

    data.rows.forEach(r => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${esc(r.date)}</td>
        <td><b>${esc(r.ticket)}</b><br/><span style="opacity:.7">${esc(r.studentNumber)}</span></td>
        <td>${esc(r.firstName)}</td>
        <td>${esc(r.lastName)}</td>
        <td>${esc(r.roomNumber)}</td>
        <td>${esc(r.issue)}</td>
        <td>${esc(r.cellphone)}</td>
        <td>
          ${statusSelectHtml(r.ticket, r.status)}
          ${r.officeNumber ? `<div style="margin-top:6px;opacity:.75">Office: <b>${esc(r.officeNumber)}</b></div>` : ""}
        </td>
        <td>
          <button class="btn primary" data-action="update" data-ticket="${escAttr(r.ticket)}">Update</button>
          <button class="btn" data-action="delete" data-ticket="${escAttr(r.ticket)}">Delete</button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    tbody.querySelectorAll("button[data-action='update']").forEach(btn => {
      btn.addEventListener("click", async () => {
        const ticket = btn.getAttribute("data-ticket");
        const select = tbody.querySelector(`select[data-ticket="${cssEscape(ticket)}"]`);
        const status = select.value;
        await updateStatus(ticket, status);
      });
    });

    tbody.querySelectorAll("button[data-action='delete']").forEach(btn => {
      btn.addEventListener("click", async () => {
        const ticket = btn.getAttribute("data-ticket");
        const ok = confirm(`Delete ticket ${ticket}? This cannot be undone.`);
        if (ok) await deleteTicket(ticket);
      });
    });

  } catch (e) {
    msg.innerHTML = `<div class="alert">${e.message}</div>`;
  }
}

function statusSelectHtml(ticket, current) {
  const options = ["submitted","verified","pending","visit_office","completed"];
  return `
    <select data-ticket="${escAttr(ticket)}"
      style="width:100%;padding:10px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.25);color:rgba(255,255,255,.92)">
      ${options.map(s => `<option value="${s}" ${s === current ? "selected" : ""}>${s}</option>`).join("")}
    </select>
  `;
}

async function updateStatus(ticket, status) {
  msg.innerHTML = "";
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "updateStatus", adminPassword: getPassword(), ticket, status })
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message || "Update failed");
    msg.innerHTML = `<div class="alert ok">Updated ${ticket} → ${status}</div>`;
    await loadSubmissions();
  } catch (e) {
    msg.innerHTML = `<div class="alert">${e.message}</div>`;
  }
}

async function deleteTicket(ticket) {
  msg.innerHTML = "";
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "delete", adminPassword: getPassword(), ticket })
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message || "Delete failed");
    msg.innerHTML = `<div class="alert ok">Deleted ${ticket}</div>`;
    await loadSubmissions();
  } catch (e) {
    msg.innerHTML = `<div class="alert">${e.message}</div>`;
  }
}

function escAttr(v){ return String(v ?? "").replaceAll('"', "&quot;"); }
function esc(v){
  return String(v ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function cssEscape(s){ return (window.CSS && CSS.escape) ? CSS.escape(s) : s.replace(/"/g, '\\"'); }
