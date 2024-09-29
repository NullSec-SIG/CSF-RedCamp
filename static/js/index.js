const urlParams = new URLSearchParams(window.location.search);
const error = urlParams.get("error");
if (error) {
    const errorMessageDiv = document.getElementById('error-message');
    errorMessageDiv.textContent = error; 
}

//Handle password visibility toggling

function togglePassword() {
  const passwordInput = document.getElementById('password');
  const toggleIcon = document.getElementById('toggle-icon');

  if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleIcon.classList.remove('fa-eye');
      toggleIcon.classList.add('fa-eye-slash');
  } else {
      passwordInput.type = 'password';
      toggleIcon.classList.remove('fa-eye-slash');
      toggleIcon.classList.add('fa-eye');
  }
}
