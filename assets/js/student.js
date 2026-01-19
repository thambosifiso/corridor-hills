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
const pdfBtn = document.getElementById("pdfBtn");
let lastReceipt = null;

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "./index.html";
});

document.getElementById("submitBtn").addEventListener("click", async () => {
  msg.innerHTML = "";
  pdfBtn.style.display = "none";
  lastReceipt = null;

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const roomNumber = document.getElementById("roomNumber").value.trim();
  const issue = document.getElementById("issue").value.trim();
  const cellphone = document.getElementById("cellphone").value.trim();

  if (!firstName || !lastName || !roomNumber || !issue || !cellphone) {
    msg.innerHTML = `<div class="alert">Please fill in all fields.</div>`;
    return;
  }

  try {
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
        cellphone
      })
    });

    const data = await res.json();

    if (!data.ok) {
      if (data.duplicate) {
        msg.innerHTML = `<div class="alert">
          Duplicate detected (within 12 hours). Existing Ticket: <b>${data.ticket}</b><br/>
          Status: <b>${data.status}</b>
          ${data.officeNumber ? `<br/>Office Number: <b>${data.officeNumber}</b>` : ""}
        </div>`;
        return;
      }
      throw new Error(data.message || "Submission failed");
    }

    localStorage.setItem("ch_lastTicket", data.ticket || "");

    msg.innerHTML = `<div class="alert ok">
      Submitted successfully!<br/>
      Ticket: <b>${data.ticket}</b> (Status: <b>${data.status}</b>)
    </div>`;

    // Build receipt for PDF
    lastReceipt = {
      date: new Date().toLocaleString(),
      ticket: data.ticket,
      status: data.status,
      studentNumber,
      firstName,
      lastName,
      roomNumber,
      cellphone,
      issue,
      officeHours: "8am to 4pm"
    };

    // Show PDF button
    pdfBtn.style.display = "inline-flex";
    pdfBtn.onclick = () => downloadReceiptPDF(lastReceipt);

    // ✅ Auto-download PDF immediately (optional)
    downloadReceiptPDF(lastReceipt);

    // Clear fields
    document.getElementById("roomNumber").value = "";
    document.getElementById("issue").value = "";
    document.getElementById("cellphone").value = "";
  } catch (e) {
    msg.innerHTML = `<div class="alert">${e.message}</div>`;
  }
});

function downloadReceiptPDF(r) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("PDF library not loaded. Check your student.html script include.");
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
