/**
 * public/Jsprincipal.js — cargado desde index.html
 * Maneja la lógica de la interfaz de usuario:
 * - Inicio de sesión y modo invitado (guardando en localStorage).
 * - Saludo personalizado.
 * - Modo oscuro (guardando preferencia en localStorage).
 * - Interacción con la API para obtener y crear usuarios/metas.
 */
document.addEventListener('DOMContentLoaded', () => {
  // ────────────────────────────────────────────────────────────────────────────
  // Gestión del modo oscuro (dark mode)
  // ────────────────────────────────────────────────────────────────────────────
  const darkModeToggle = document.getElementById('darkModeToggle');
  const currentTheme = localStorage.getItem('theme');

  if (currentTheme === 'dark') {
    document.body.classList.add('dark');
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
      localStorage.setItem('theme', theme);
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Manejo del formulario de inicio de sesión
  // ────────────────────────────────────────────────────────────────────────────
  const loginForm = document.querySelector('.login-form'); // Asumiendo que tienes un form con esta clase
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const emailInput = loginForm.querySelector('#email'); // Asumiendo un input con id="email"
      if (emailInput) {
        localStorage.setItem('username', emailInput.value);
        // Redirigir o actualizar UI según sea necesario, por ejemplo:
        // window.location.href = 'index.html'; // O la página principal de la app
        updateGreeting(); // Actualiza el saludo inmediatamente
        console.log('Usuario guardado:', emailInput.value);
      }
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Manejo del botón de acceso como invitado
  // ────────────────────────────────────────────────────────────────────────────
  const guestBtn = document.getElementById('guestBtn');
  if (guestBtn) {
    guestBtn.addEventListener('click', () => {
      localStorage.setItem('username', 'Invitado');
      // window.location.href = 'index.html'; // O la página principal de la app
      updateGreeting(); // Actualiza el saludo inmediatamente
      console.log('Acceso como Invitado');
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Muestra un saludo personalizado
  // ────────────────────────────────────────────────────────────────────────────
  function updateGreeting() {
    const greetingEl = document.getElementById('greeting');
    if (greetingEl) {
      const user = localStorage.getItem('username');
      if (user) {
        greetingEl.textContent = `Bienvenido, ${user}`;
      } else {
        greetingEl.textContent = 'Bienvenido'; // Saludo por defecto
      }
    }
  }
  updateGreeting(); // Llama a la función al cargar la página

  // ────────────────────────────────────────────────────────────────────────────
  // Interacción con la API para usuarios/metas
  // ────────────────────────────────────────────────────────────────────────────

  // Obtener usuarios/metas del servidor al cargar
  fetch('/api/users')
    .then(res => res.json())
    .then(data => {
      console.log('Usuarios:', data); // Mantenemos el log por si acaso
      const lista = document.getElementById('listaUsuarios');
      if (lista) { // Verificar que el elemento exista
        data.forEach(user => {
          const li = document.createElement('li');
          li.textContent = `ID: ${user.id} — Nombre: ${user.name}`;
          lista.appendChild(li);
        });
      }
    })
    .catch(console.error);

  // Crear un nuevo usuario/meta al pulsar un botón
  document.getElementById('crearUsuarioBtn')?.addEventListener('click', () => {
    const nombre = prompt('Nombre del nuevo usuario:');
    if (!nombre) return;
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nombre })
    })
    .then(res => res.json()) // Asume que el servidor responde con el objeto creado
    .then(nuevo => {
      console.log('Creado:', nuevo);
      // Opcional: Volver a cargar la lista de usuarios para ver el nuevo
      // fetch('/api/users').then(res => res.json()).then(data => console.log('Usuarios actualizados:', data));
    })
    .catch(console.error);
  });
});
