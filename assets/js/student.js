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
    if (!data.ok) throw new Error(data.message || "Submission failed");

    msg.innerHTML =
      `<div class="alert ok">Submitted successfully! Reference: ${data.ref}</div>`;

    document.getElementById("roomNumber").value = "";
    document.getElementById("issue").value = "";
    document.getElementById("cellphone").value = "";
  } catch (e) {
    msg.innerHTML = `<div class="alert">${e.message}</div>`;
  }
});
