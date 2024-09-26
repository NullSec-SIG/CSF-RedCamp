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
    passwordField.setAttribute("type", "text");
    this.textContent = "Hide";
  } else {
    passwordField.setAttribute("type", "password");
    this.textContent = "Show";
  }
}

togglePassword.addEventListener("click", handleTogglePassword);
