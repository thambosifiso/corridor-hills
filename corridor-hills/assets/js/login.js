document.getElementById("loginBtn").addEventListener("click", () => {
  const studentNumber = document.getElementById("studentNumber").value.trim();
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const msg = document.getElementById("msg");
  msg.innerHTML = "";

  if (!studentNumber || !firstName || !lastName) {
    msg.innerHTML = `<div class="alert">Please fill in Student Number, Names and Surname.</div>`;
    return;
  }

  localStorage.setItem("ch_studentNumber", studentNumber);
  localStorage.setItem("ch_firstName", firstName);
  localStorage.setItem("ch_lastName", lastName);

  window.location.href = "./student.html";
});
