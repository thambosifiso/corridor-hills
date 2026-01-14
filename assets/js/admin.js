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

document.getElementById("loadBtn").addEventListener("click", async () => {
  msg.innerHTML = "";
  tbody.innerHTML = "";
  table.style.display = "none";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "list",
        adminPassword: getPassword()
      })
    });

    const data = await res.json();
    if (!data.ok) throw new Error(data.message || "Wrong password");

    table.style.display = "table";

    data.rows.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${esc(r.date)}</td>
        <td>${esc(r.studentNumber)}</td>
        <td>${esc(r.firstName)}</td>
        <td>${esc(r.lastName)}</td>
        <td>${esc(r.roomNumber)}</td>
        <td>${esc(r.issue)}</td>
        <td>${esc(r.cellphone)}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (e) {
    msg.innerHTML = `<div class="alert">${e.message}</div>`;
  }
});

function esc(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
