const getCookies = (cookieStr) =>
  cookieStr
    .split(";")
    .map((str) => str.trim().split(/=(.+)/))
    .reduce((acc, curr) => {
      acc[curr[0]] = curr[1] ? decodeURIComponent(curr[1].replace(/^"|"$/g, "")) : "";
      return acc;
    }, {});

function randomize(collection) {
  var randomNumber = Math.floor(Math.random() * collection.length);
  return collection[randomNumber];
}

function confetti() {
  $(".confetti").remove();
  var $confettiItems = $('<div class="confetti"></div>'),
    colors = ["#3b5692", "#f9c70b", "#00abed", "#ea6747"],
    height = 6.6,
    width = 6.6;

  var scale, $confettiItem;

  for (var i = 0; i < 100; i++) {
    scale = Math.random() * 1.75 + 1;
    $confettiItem = $(
      "<svg class='confetti-item' width='" +
        width * scale +
        "' height='" +
        height * scale +
        "' viewbox='0 0 " +
        width +
        " " +
        height +
        "'>\n  <use transform='rotate(" +
        Math.random() * 360 +
        ", " +
        width / 2 +
        ", " +
        height / 2 +
        ")' xlink:href='#svg-confetti' />\n</svg>"
    );
    $confettiItem.css({
      animation:
        Math.random() +
        2 +
        "s " +
        Math.random() * 2 +
        "s confetti-fall ease-in both",
      color: randomize(colors),
      left: Math.random() * 100 + "vw",
    });
    $confettiItems.append($confettiItem);
  }
  $("body").append($confettiItems);
}

const cookies = getCookies(document.cookie);
var amount = parseInt(cookies.balance);
var lastLogin = cookies.last_login;

if (document.cookie.includes("john_tan") && amount > 1_337_000) {
  confetti();
  const congratsElement = document.getElementById("congrats-message");
  congratsElement.textContent =
    "Congratulations! You have successfully hacked NPBank!";

  var congratsModal = new bootstrap.Modal(
    document.getElementById("congratsModal")
  );
  congratsModal.show();
}

function getBalance() {
  var balance = parseInt(getCookies(document.cookie).balance);
  document.getElementById("balance").innerHTML = `$${balance.toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

function getLastLogin() {
  document.getElementById("last-login").innerHTML = `${lastLogin}`;
}

function displayErrorMessage() {
  const urlParams = new URLSearchParams(window.location.search);
  const errorMessage = urlParams.get("error");

  if (errorMessage) {
    const errorElement = document.getElementById("error-message");
    errorElement.textContent = decodeURIComponent(errorMessage);
    const errorToast = new bootstrap.Toast(
      document.getElementById("errorToast")
    );
    errorToast.show();
  }
}

function displaySuccessMessage() {
  const urlParams = new URLSearchParams(window.location.search);
  const successMessage = urlParams.get("success");
  if (successMessage) {
    const successElement = document.getElementById("success-message");
    successElement.textContent = decodeURIComponent(successMessage);
    const successToast = new bootstrap.Toast(
      document.getElementById("successToast")
    );
    successToast.show();
  }
}

function displayUsername() {
  const username = getCookies(document.cookie)
    .login.split(":")[0]
    .replace('"', "");
  const usernameElement = document.getElementById("welcome-message");
  usernameElement.textContent = `Welcome, ${username}!`;
}

function logout() {
  document.cookie.split(";").forEach(function (c) {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
  window.location.href = "/";
}

document.getElementById("logout-button").addEventListener("click", logout);

window.onload = () => {
  // confetti();
  displayErrorMessage();
  displaySuccessMessage();
  getBalance();
  getLastLogin();
  displayUsername();
};
