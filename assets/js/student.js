const API_URL = "https://script.google.com/macros/s/AKfycbwOdpgYaBylHJmAZ_-83BliVTaD05ti4Xs16gR0LjhR-rFDSFp3gfWxGI6Teg0zbMkcog/exec";

const studentNumber = localStorage.getItem("ch_studentNumber");
const firstNameLS = localStorage.getItem("ch_firstName");
const lastNameLS = localStorage.getItem("ch_lastName");

if (!studentNumber || !firstNameLS || !lastNameLS) {
  window.location.href = "./index.html";
}

document.getElementById("welcome").textContent =
  `Welcome ${firstNameLS} ${lastNameLS}. Please fill in the form below.`;

document.getElementById("studentBadge").textContent =
  `Student #${studentNumber}`;

document.getElementById("firstName").value = firstNameLS;
document.getElementById("lastName").value = lastNameLS;

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "./index.html";
});

document.getElementById("submitBtn").addEventListener("click", async () => {
  const msg = document.getElementById("msg");
  msg.innerHTML = "";

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

    // Duplicate block
    if (!data.ok) {
      if (data.duplicate) {
        msg.innerHTML = `<div class="alert">
          Duplicate detected (within 12 hours). Existing Ticket: <b>${data.ticket}</b><br/>
          Status: <b>${data.status}</b>
          ${data.officeNumber ? `<br/>Office Number: <b>${data.officeNumber}</b>` : ""}
        </div>`;
        // If you WANT to allow PDF proof even for duplicates, tell me and I'll enable redirect to receipt.html here.
        return;
      }
      throw new Error(data.message || "Submission failed");
    }

    // Save last ticket for check page
    localStorage.setItem("ch_lastTicket", data.ticket || "");

    // ✅ Save receipt data for receipt.html (Print / Save as PDF)
    const receipt = {
      date: new Date().toLocaleString(),
      ticket: data.ticket,
      status: data.status,
      studentNumber,
      firstName,
      lastName,
      roomNumber,
      cellphone,
      issue
    };

    localStorage.setItem("ch_receipt", JSON.stringify(receipt));

    // ✅ Redirect to receipt page for printing / saving PDF
    window.location.href = "./receipt.html";
  } catch (e) {
    msg.innerHTML = `<div class="alert">${e.message}</div>`;
  }
});
