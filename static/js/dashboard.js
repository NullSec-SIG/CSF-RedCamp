function congrats() {
  var amount = document.getElementById("amount").value;
  amount = parseInt(amount);

  if (document.cookie.includes("george_lim") && amount > 1_337_000) {
    alert("Congratulations! You've successfully hacked NPBank!");
  }
}

function getBalance() {
  var balance = parseInt(getCookies(document.cookie).balance);
  document.getElementById(
    "balance"
  ).innerHTML = `Balance: $${balance.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const getCookies = (cookieStr) =>
  cookieStr
    .split(";")
    .map((str) => str.trim().split(/=(.+)/))
    .reduce((acc, curr) => {
      acc[curr[0]] = curr[1];
      return acc;
    }, {});

function displayErrorMessage() {
  const urlParams = new URLSearchParams(window.location.search);
  const errorMessage = urlParams.get("error");
  if (errorMessage) {
    const errorElement = document.getElementById("error-message");
    errorElement.textContent = decodeURIComponent(errorMessage);
    errorElement.style.display = "block";
  }
}

function displaySuccessMessage() {
  const urlParams = new URLSearchParams(window.location.search);
  const successMessage = urlParams.get("success");
  if (successMessage) {
    const successElement = document.getElementById("success-message");
    successElement.textContent = decodeURIComponent(successMessage);
    successElement.style.display = "block";
  }
}

window.onload = () => {
  displayErrorMessage();
  displaySuccessMessage();
  getBalance();
};
