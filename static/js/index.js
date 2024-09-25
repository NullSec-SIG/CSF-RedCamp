const urlParams = new URLSearchParams(window.location.search);
const error = urlParams.get('error');
if (error) {
    document.write('<p style="color: red;">' + error + '</p>');
}
