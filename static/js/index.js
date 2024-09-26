const urlParams = new URLSearchParams(window.location.search);
const error = urlParams.get("error");
if (error) {
  document.write('<p style="color: red;">' + error + "</p>");
}

//Handle password visibility toggling

let togglePassword = document.querySelector(".toggle-password");
function handleTogglePassword() {
  let passwordField = document.querySelector(".password-field");
  let passwordFieldType = passwordField.getAttribute("type");

  if (passwordFieldType === "password") {
    console.log(1);
    passwordField.setAttribute("type", "text");
    this.textContent = "Hide";
  } else {
    console.log(2);
    passwordField.setAttribute("type", "password");
    this.textContent = "Show";
  }
}

togglePassword.addEventListener("click", handleTogglePassword);
