function showWarning() {
    document.getElementById('warningPopup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

function closeWarning() {
    document.getElementById('warningPopup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

window.onload = function() {
    const loginSpan = document.getElementById('login');
    const userEmail = localStorage.getItem('userEmail');
    const eventLink = document.getElementById('eventLink');

    if (userEmail) {
        // User is logged in
        loginSpan.innerHTML = `
            <span>Hi! ${userEmail}</span>
            <button onclick="logout()">Logout</button>
        `;
        eventLink.classList.remove('disabled-link'); // Enable the link
    } else {
        // User is not logged in
        loginSpan.innerHTML = `
            <a href="log_in.html"><button>Login</button></a>
            <a href="sign_up.html"><button>Sign up</button></a>
        `;
        eventLink.classList.add('disabled-link'); // Disable the link
    }
};