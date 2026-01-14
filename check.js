const API_URL = "https://script.google.com/macros/s/AKfycbwOdpgYaBylHJmAZ_-83BliVTaD05ti4Xs16gR0LjhR-rFDSFp3gfWxGI6Teg0zbMkcog/exec";

const msg = document.getElementById("msg");

window.addEventListener("load", () => {
  const lastTicket = localStorage.getItem("ch_lastTicket");
  const sn = localStorage.getItem("ch_studentNumber");
  if (lastTicket) document.getElementById("ticket").value = lastTicket;
  if (sn) document.getElementById("studentNumber").value = sn;
});

document.getElementById("checkBtn").addEventListener("click", async () => {
  msg.innerHTML = "";

  const ticket = document.getElementById("ticket").value.trim();
  const studentNumber = document.getElementById("studentNumber").value.trim();

  if (!ticket || !studentNumber) {
    msg.innerHTML = `<div class="alert">Please enter ticket and student number.</div>`;
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "check", ticket, studentNumber })
    });

    const data = await res.json();
    if (!data.ok) throw new Error(data.message || "Not found");

    msg.innerHTML = `<div class="alert ok">
      Ticket: <b>${data.ticket}</b><br/>
      Status: <b>${data.status}</b><br/>
      ${data.officeNumber ? `Office Number: <b>${data.officeNumber}</b><br/>` : ""}
      Updated: <b>${data.updatedAt}</b><br/>
      ${data.instruction ? `<br/><b>${data.instruction}</b>` : ""}
    </div>`;
  } catch (e) {
    msg.innerHTML = `<div class="alert">${e.message}</div>`;
  }
});
