// public/login.js

// Espera a que todo el contenido del DOM (estructura HTML) esté completamente cargado y parseado
// antes de ejecutar el código JavaScript. Esto asegura que todos los elementos HTML
// a los que se hace referencia estén disponibles.
document.addEventListener('DOMContentLoaded', () => {
    // --- SELECTORES DOM ---
    // Obtiene referencias a los elementos HTML del formulario de login y otros controles
    // para poder interactuar con ellos (leer valores, añadir event listeners, etc.).
    const loginForm = document.querySelector('.login-form'); // El formulario de inicio de sesión.
    const emailInput = document.getElementById('email'); // Campo de entrada para el correo electrónico.
    const passwordInput = document.getElementById('password'); // Campo de entrada para la contraseña.
    const guestLoginBtn = document.getElementById('guestLoginBtn'); // Botón para iniciar sesión como invitado.
    const createAccountLink = document.getElementById('createAccountLink'); // Enlace para ir a la página de registro.
    const darkModeToggle = document.getElementById('darkModeToggle'); // Botón para cambiar entre modo claro y oscuro.
    const messageContainer = document.getElementById('messageContainer'); // Contenedor para mostrar mensajes de error o éxito.

    // --- CLAVES LOCALSTORAGE ---
    // Define constantes para las claves que se usarán en localStorage.
    // Esto ayuda a evitar errores de tipeo y facilita la gestión de los datos guardados en el navegador.
    const LS_THEME = 'diarioQuestTheme'; // Clave para guardar la preferencia de tema (claro/oscuro).
    const LS_CURRENT_USER = 'currentUser'; // Clave para guardar la información del usuario que ha iniciado sesión.
    const LS_ALL_USERS = 'diarioQuestAllUsers'; // Clave para simular una lista de usuarios registrados (para este ejemplo frontend).

    // --- MODO OSCURO ---
    // Función para aplicar el tema (claro u oscuro) al cuerpo del documento y actualizar el ícono del botón.
    const applyDarkMode = (isDark) => {
        const theme = isDark ? 'dark' : 'light'; // Determina el nombre del tema.
        if (isDark) {
            document.body.classList.add('dark'); // Añade la clase 'dark' al body para aplicar estilos oscuros.
            if (darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // Cambia el ícono a un sol.
        } else {
            document.body.classList.remove('dark'); // Quita la clase 'dark' del body para aplicar estilos claros.
            if (darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>'; // Cambia el ícono a una luna.
        }
        localStorage.setItem(LS_THEME, theme); // Guarda la preferencia de tema en localStorage.
    };

    // Al cargar la página, comprueba si hay un tema guardado en localStorage y lo aplica.
    const initialTheme = localStorage.getItem(LS_THEME) === 'dark';
    applyDarkMode(initialTheme); // Aplica el tema inicial.

    // Si existe el botón de cambio de tema, le añade un event listener.
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            // Alterna la clase 'dark' en el body y obtiene el nuevo estado.
            const isDarkNow = document.body.classList.toggle('dark');
            applyDarkMode(isDarkNow); // Aplica el nuevo tema y guarda la preferencia.
        });
    }

    // --- MOSTRAR MENSAJES ---
    // Función para mostrar mensajes (de error o éxito) al usuario en el `messageContainer`.
    function showMessage(text, type = 'error') {
        if (messageContainer) {
            messageContainer.textContent = text; // Establece el texto del mensaje.
            // Cambia el color del texto según el tipo de mensaje.
            messageContainer.style.color = type === 'error' ? '#ff6b6b' : '#5cb85c'; // Rojo para error, Verde para éxito.

            if (type === 'error') {
                // Si es un error, añade una animación de "sacudida" al contenedor padre del mensaje
                // para llamar la atención del usuario.
                // Asume que `messageContainer.parentElement` es el div que tiene la clase `login-container` o similar.
                if (messageContainer.parentElement) { // Verifica que el elemento padre exista.
                    messageContainer.parentElement.classList.add('shake-animation');
                    // Quita la clase de animación después de 500ms para que pueda volver a ejecutarse.
                    setTimeout(() => {
                        if (messageContainer.parentElement) {
                            messageContainer.parentElement.classList.remove('shake-animation');
                        }
                    }, 500);
                }
            }
            // Oculta el mensaje después de 3 segundos.
            setTimeout(() => {
                messageContainer.textContent = '';
            }, 3000);
        }
    }
    // Nota: La animación 'shake-animation' debe estar definida en el archivo CSS (login.css).
    // Ejemplo de CSS para la animación:
    /*
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    .shake-animation {
        animation: shake 0.5s ease-in-out;
    }
    */


    // --- MANEJO DEL FORMULARIO DE LOGIN ---
    // Si el formulario de login existe en la página, le añade un event listener para el evento 'submit'.
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Evita que la página se recargue al enviar el formulario.

            // Obtiene los valores de los campos de email y contraseña,
            // eliminando espacios en blanco al inicio/final y convirtiendo el email a minúsculas.
            const email = emailInput.value.trim().toLowerCase();
            const password = passwordInput.value;

            // Validación básica: comprueba que ambos campos tengan valor.
            if (!email || !password) {
                showMessage('Por favor, ingresa tu correo y contraseña.', 'error');
                return; // Detiene la ejecución si faltan datos.
            }

            // SIMULACIÓN DE LOGIN CON LISTA DE USUARIOS DESDE LOCALSTORAGE:
            // Carga la lista de todos los usuarios guardados en localStorage.
            // Si no hay usuarios, `allUsers` será un array vacío.
            const allUsers = JSON.parse(localStorage.getItem(LS_ALL_USERS)) || [];
            // Busca un usuario en la lista cuyo email coincida con el ingresado.
            const foundUser = allUsers.find(user => user.email === email);

            if (foundUser) {
                // Si se encuentra un usuario con ese email:
                // ¡IMPORTANTE! En una aplicación real, NUNCA se debe guardar ni comparar
                // contraseñas en texto plano como se hace aquí.
                // Se debería usar un sistema de hashing seguro en el backend.
                // Esta comparación directa es SOLO PARA SIMULACIÓN en este entorno frontend.
                if (foundUser.password === password) { // ¡SOLO PARA SIMULACIÓN!
                    // Si la contraseña (simulada) coincide:
                    // Guarda la información del usuario encontrado como el 'currentUser' en localStorage.
                    localStorage.setItem(LS_CURRENT_USER, JSON.stringify(foundUser));
                    showMessage('¡Inicio de sesión exitoso! Redirigiendo...', 'success');

                    // Lógica para limpiar datos de invitado si el usuario que inicia sesión no es el invitado.
                    // Esto es útil si un usuario invitado usó la app y luego un usuario registrado inicia sesión.
                    if (foundUser.id !== 'guest_user') {
                        // Aquí se podría implementar una lógica más específica para limpiar
                        // datos asociados al 'guest_user' si fuera necesario.
                        // Por ejemplo, si las entradas del diario o metas del invitado
                        // no deben persistir o mezclarse.
                    }

                    // Redirige al usuario a la página de perfil (o la página principal de la app)
                    // después de un breve retraso para que pueda ver el mensaje de éxito.
                    setTimeout(() => {
                        window.location.href = 'perfil.html'; // O a 'index.html', 'diario.html', etc.
                    }, 1500);
                } else {
                    // Si la contraseña no coincide.
                    showMessage('Contraseña incorrecta.', 'error');
                }
            } else {
                // Si no se encuentra ningún usuario con ese email.
                showMessage('Usuario no encontrado. Por favor, regístrate.', 'error');
            }
        });
    }

    // --- LOGIN COMO INVITADO ---
    // Si el botón de login como invitado existe, le añade un event listener.
    if (guestLoginBtn) {
        guestLoginBtn.addEventListener('click', () => {
            // Crea un objeto de usuario para el invitado.
            const guestUser = {
                id: 'guest_user', // Un ID fijo para identificar al usuario invitado.
                name: 'Invitado',
                email: 'invitado@diario.quest', // Un email ficticio para el invitado.
                isGuest: true, // Una bandera para identificar que es una sesión de invitado.
                joinDate: new Date().toISOString() // Fecha de "unión" del invitado.
                // No se guarda contraseña para el invitado.
            };
            // Guarda el objeto del usuario invitado como 'currentUser' en localStorage.
            localStorage.setItem(LS_CURRENT_USER, JSON.stringify(guestUser));
            showMessage('Continuando como invitado...', 'success');

            // NOTA SOBRE DATOS DE INVITADO:
            // Cuando el usuario es 'guest_user', otras partes de la aplicación (metas.js, profile.js, diario.js)
            // deberían usar 'guest_user' como parte de las claves de localStorage para los datos específicos
            // de este invitado (ej: 'diarioQuestUserXP_guest_user', 'diarioQuestJournalEntries_guest_user').
            // Esto permite que los datos del invitado se mantengan separados de los de usuarios registrados.
            // La lógica para construir estas claves dinámicamente (usando `activeUser.id`)
            // ya está presente o debería estarlo en los otros scripts.

            // Redirige al invitado a la página principal (o a la de metas, por ejemplo)
            // después de un breve retraso.
            setTimeout(() => {
                window.location.href = 'index.html'; // O a 'metas.html', 'diario.html', etc.
            }, 1500);
        });
    }

    // --- ENLACE CREAR CUENTA ---
    // Si el enlace para crear una cuenta existe, le añade un event listener.
    if (createAccountLink) {
        createAccountLink.addEventListener('click', (e) => {
            e.preventDefault(); // Evita el comportamiento por defecto del enlace (navegar).
            // Redirige al usuario a la página de registro.
            window.location.href = 'register.html';
        });
    }
}); // Fin del event listener 'DOMContentLoaded'