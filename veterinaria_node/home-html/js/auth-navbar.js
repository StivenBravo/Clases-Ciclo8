// auth-navbar.js - Manejo de sesión en navbar

document.addEventListener('DOMContentLoaded', function () {
    const user = sessionStorage.getItem('user') || localStorage.getItem('user');

    if (user) {
        const userData = JSON.parse(user);
        updateNavbarWithUser(userData);
    }
});

function updateNavbarWithUser(userData) {
    const authMenuItem = document.getElementById('authMenuItem');
    const authLink = document.getElementById('authLink');

    if (!authMenuItem || !authLink) return;

    // Cambiar el enlace a mostrar nombre
    const nombreMostrar = userData.nombre_completo || userData.username;
    authLink.innerHTML = `<i class="fas fa-user-circle"></i> ${nombreMostrar}`;
    authLink.href = '#';
    authLink.style.cursor = 'pointer';
    authLink.style.fontWeight = 'bold';

    // Agregar botón de cerrar sesión
    const logoutItem = document.createElement('li');
    logoutItem.className = 'nav-item';
    logoutItem.innerHTML = '<a class="nav-link" href="#" id="logoutBtn" style="color: #ff4444; font-weight: bold;"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a>';
    authMenuItem.after(logoutItem);

    // Evento de cerrar sesión
    document.getElementById('logoutBtn').addEventListener('click', function (e) {
        e.preventDefault();
        if (confirm('¿Deseas cerrar sesión?')) {
            sessionStorage.removeItem('user');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
    });

    // Redirigir al panel si es admin al hacer clic en el nombre
    authLink.addEventListener('click', function (e) {
        e.preventDefault();
        if (userData.rol === 'admin') {
            window.location.href = '/panel';
        } else {
            // Mostrar menú de opciones para usuario normal si es necesario
            alert(`Bienvenido, ${nombreMostrar}`);
        }
    });
}

function logout() {
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
    window.location.href = '/';
}
