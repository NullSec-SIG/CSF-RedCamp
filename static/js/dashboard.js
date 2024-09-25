function congrats() {
    var amount = document.getElementById("amount").value;
    amount = parseInt(amount);

    if (document.cookie.includes("george_lim") && amount > 1_337_000) {
        alert("Congratulations! You've successfully hacked NPBank!");
    }
}

function getBalance() {
    var balance = parseInt(getCookies(document.cookie).balance);
    document.getElementById('balance').innerHTML = `Your balance is: ${balance}`;
}

const getCookies = (cookieStr) =>
    cookieStr.split(";")
        .map(str => str.trim().split(/=(.+)/))
        .reduce((acc, curr) => {
            acc[curr[0]] = curr[1];
            return acc;
        }, {})

function displayErrorMessage() {
    const urlParams = new URLSearchParams(window.location.search);
    const errorMessage = urlParams.get('error');
    if (errorMessage) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = decodeURIComponent(errorMessage);
        errorElement.style.display = 'block';
    }
}

window.onload = () => {
    displayErrorMessage();
    getBalance();
}