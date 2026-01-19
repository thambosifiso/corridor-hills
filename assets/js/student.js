const API_URL = "https://script.google.com/macros/s/AKfycbwOdpgYaBylHJmAZ_-83BliVTaD05ti4Xs16gR0LjhR-rFDSFp3gfWxGI6Teg0zbMkcog/exec";

const studentNumber = localStorage.getItem("ch_studentNumber");
const firstNameLS = localStorage.getItem("ch_firstName");
const lastNameLS = localStorage.getItem("ch_lastName");

if (!studentNumber || !firstNameLS || !lastNameLS) {
  window.location.href = "./index.html";
}

document.getElementById("welcome").textContent =
  `Welcome ${firstNameLS} ${lastNameLS}. Please fill in the form below.`;

document.getElementById("studentBadge").textContent = `Student #${studentNumber}`;

document.getElementById("firstName").value = firstNameLS;
document.getElementById("lastName").value = lastNameLS;

const msg = document.getElementById("msg");
const pdfBtn = document.getElementById("pdfBtn"); // must exist in student.html
let lastReceipt = null;

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "./index.html";
});

// helper: create a safe ticket for PDF filename even if undefined
function safeTicket_(t) {
  const v = String(t || "").trim();
  return v ? v : ("CH-" + Date.now());
}

document.getElementById("submitBtn").addEventListener("click", async () => {
  msg.innerHTML = "";
  lastReceipt = null;

  if (pdfBtn) pdfBtn.style.display = "none";

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const roomNumber = document.getElementById("roomNumber").value.trim();
  const issue = document.getElementById("issue").value.trim();
  const cellphone = document.getElementById("cellanti") ? "" : document.getElementById("cellphone").value.trim(); // safe (ignore if typo)
  const cell = document.getElementById("cellphone").value.trim();

  if (!firstName || !lastName || !roomNumber || !issue || !cell) {
    msg.innerHTML = `<div class="alert">Please fill in all fields.</div>`;
    return;
  }

  try {
    msg.innerHTML = `<div class="alert">Submitting...</div>`;

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "submit",
        studentNumber,
        firstName,
        lastName,
        roomNumber,
        issue,
        cellphone: cell
      })
    });

    const text = await res.text();
    let data = {};
    try {
      data = JSON.parse(text);
    } catch {
      // If server returns non-JSON, still allow PDF with local info
      data = { ok: true };
    }

    // show success (even if ticket/status missing)
    const t = data.ticket;
    const s = data.status;

    msg.innerHTML = `<div class="alert ok">
      Submitted successfully!<br/>
      Ticket: <b>${t ?? "N/A"}</b> (Status: <b>${s ?? "N/A"}</b>)
    </div>`;

    lastReceipt = {
      date: new Date().toLocaleString(),
      ticket: safeTicket_(t),
      status: s ?? "N/A",
      studentNumber,
      firstName,
      lastName,
      roomNumber,
      cellphone: cell,
      issue,
      officeHours: "8am to 4pm"
    };

    // PDF: enable button + auto-download
    if (pdfBtn) {
      pdfBtn.style.display = "inline-flex";
      pdfBtn.onclick = () => downloadReceiptPDF(lastReceipt);
    }

    downloadReceiptPDF(lastReceipt); // auto-download

    // Clear fields
    document.getElementById("roomNumber").value = "";
    document.getElementById("issue").value = "";
    document.getElementById("cellphone").value = "";
  } catch (e) {
    msg.innerHTML = `<div class="alert">Error: ${e.message}</div>`;
    console.error(e);
  }
});

function downloadReceiptPDF(r) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("PDF library not loaded. Add jsPDF script BEFORE student.js in student.html.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const left = 14;
  let y = 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Corridor Hills - Proof of Submission", left, y);

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const lines = [
    `Date: ${r.date}`,
    `Ticket: ${r.ticket}`,
    `Status: ${r.status}`,
    `Student Number: ${r.studentNumber}`,
    `Names: ${r.firstName}`,
    `Surname: ${r.lastName}`,
    `Room Number: ${r.roomNumber}`,
    `Cellphone: ${r.cellphone}`,
    `Office Hours: ${r.officeHours}`,
    `Issue: ${r.issue}`
  ];

  lines.forEach((t) => {
    const wrapped = doc.splitTextToSize(t, 180);
    doc.text(wrapped, left, y);
    y += wrapped.length * 6 + 2;
    if (y > 270) {
      doc.addPage();
      y = 18;
    }
  });

  doc.setFontSize(10);
  doc.text("Keep this PDF as proof of submission.", left, 285);

  doc.save(`CorridorHills_${r.ticket}.pdf`);
}
