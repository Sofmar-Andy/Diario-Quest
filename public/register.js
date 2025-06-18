// public/register.js

// Espera a que todo el contenido del DOM (estructura HTML) esté completamente cargado y parseado
// antes de ejecutar el código JavaScript. Esto asegura que todos los elementos HTML
// a los que se hace referencia estén disponibles.
document.addEventListener('DOMContentLoaded', () => {
    // --- SELECTORES DOM ---
    // Obtiene referencias a los elementos HTML del formulario de registro y otros controles
    // para poder interactuar con ellos (leer valores, añadir event listeners, etc.).
    const registerForm = document.getElementById('registerForm'); // El formulario de registro.
    const usernameInput = document.getElementById('username'); // Campo de entrada para el nombre de usuario.
    const emailInput = document.getElementById('email'); // Campo de entrada para el correo electrónico.
    const passwordInput = document.getElementById('password'); // Campo de entrada para la contraseña.
    const confirmPasswordInput = document.getElementById('confirmPassword'); // Campo para confirmar la contraseña.
    const darkModeToggle = document.getElementById('darkModeToggle'); // Botón para cambiar entre modo claro y oscuro.
    const messageContainer = document.getElementById('messageContainer'); // Contenedor para mostrar mensajes de error o éxito.

    // --- CLAVES LOCALSTORAGE ---
    // Define constantes para las claves que se usarán en localStorage.
    // Esto ayuda a evitar errores de tipeo y facilita la gestión de los datos guardados en el navegador.
    const LS_THEME = 'diarioQuestTheme'; // Clave para guardar la preferencia de tema (claro/oscuro).
    const LS_CURRENT_USER = 'currentUser'; // Clave para guardar la información del usuario que ha iniciado sesión.
    const LS_ALL_USERS = 'diarioQuestAllUsers'; // Clave para simular una lista de todos los usuarios registrados.

    // --- MODO OSCURO (similar a login.js) ---
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

    // --- MOSTRAR MENSAJES (similar a login.js) ---
    // Función para mostrar mensajes (de error o éxito) al usuario en el `messageContainer`.
    function showMessage(text, type = 'error') {
        if (messageContainer) {
            messageContainer.textContent = text; // Establece el texto del mensaje.
            // Cambia el color del texto según el tipo de mensaje.
            messageContainer.style.color = type === 'error' ? '#ff6b6b' : '#5cb85c'; // Rojo para error, Verde para éxito.

            // Si es un error y el contenedor de mensajes tiene un elemento padre,
            // añade una animación de "sacudida" para llamar la atención.
            if (type === 'error' && messageContainer.parentElement) {
                messageContainer.parentElement.classList.add('shake-animation');
                // Quita la clase de animación después de 500ms para que pueda volver a ejecutarse.
                setTimeout(() => {
                    // Comprueba de nuevo si el elemento padre existe antes de quitar la clase.
                    if (messageContainer.parentElement) {
                        messageContainer.parentElement.classList.remove('shake-animation');
                    }
                }, 500);
            }
            // Oculta el mensaje después de 3 segundos.
            setTimeout(() => {
                messageContainer.textContent = '';
            }, 3000);
        }
    }
    // Nota: La animación 'shake-animation' debe estar definida en el archivo CSS (login.css o uno global).
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

    // --- MANEJO DEL FORMULARIO DE REGISTRO ---
    // Si el formulario de registro existe en la página, le añade un event listener para el evento 'submit'.
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Evita que la página se recargue al enviar el formulario.

            // Obtiene los valores de los campos del formulario,
            // eliminando espacios en blanco al inicio/final y convirtiendo el email a minúsculas.
            const username = usernameInput.value.trim();
            const email = emailInput.value.trim().toLowerCase();
            const password = passwordInput.value; // No se hace trim() a la contraseña por si el usuario quiere espacios.
            const confirmPassword = confirmPasswordInput.value;

            // --- VALIDACIONES ---
            // Verifica que todos los campos estén completos.
            if (!username || !email || !password || !confirmPassword) {
                showMessage('Todos los campos son obligatorios.', 'error');
                return; // Detiene la ejecución si faltan datos.
            }
            // Verifica la longitud mínima de la contraseña.
            if (password.length < 6) {
                showMessage('La contraseña debe tener al menos 6 caracteres.', 'error');
                return;
            }
            // Verifica que las contraseñas coincidan.
            if (password !== confirmPassword) {
                showMessage('Las contraseñas no coinciden.', 'error');
                return;
            }
            // Validación simple de formato de email.
            // Para una validación más robusta, se podría usar una expresión regular.
            if (!email.includes('@') || !email.includes('.')) {
                showMessage('Por favor, ingresa un correo electrónico válido.', 'error');
                return;
            }

            // Cargar usuarios existentes desde localStorage.
            // Si no hay usuarios guardados, `allUsers` será un array vacío.
            const allUsers = JSON.parse(localStorage.getItem(LS_ALL_USERS)) || [];

            // Verificar si el email ya está registrado.
            // El método `some()` comprueba si al menos un elemento en el array cumple la condición.
            if (allUsers.some(user => user.email === email)) {
                showMessage('Este correo electrónico ya está registrado. Intenta iniciar sesión.', 'error');
                return;
            }
            // Verificar si el nombre de usuario ya está en uso (opcional, pero buena práctica).
            // Se compara en minúsculas para evitar duplicados por diferencias de mayúsculas/minúsculas.
            if (allUsers.some(user => user.name.toLowerCase() === username.toLowerCase())) {
                showMessage('Este nombre de usuario ya está en uso. Por favor, elige otro.', 'error');
                return;
            }


            // Crear el objeto para el nuevo usuario.
            const newUser = {
                id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // Genera un ID único.
                name: username,
                email: email,
                password: password, // ¡IMPORTANTE! En una aplicación real, NUNCA se debe guardar la contraseña en texto plano.
                                    // Se debe usar un sistema de hashing seguro en el backend.
                                    // Esto es SOLO PARA SIMULACIÓN en este entorno frontend.
                joinDate: new Date().toISOString(), // Guarda la fecha de registro en formato ISO.
                // Se podrían inicializar otras propiedades aquí si fuera necesario (ej: xp: 0, avatar: 'default.png').
            };

            // Guardar el nuevo usuario en la lista de todos los usuarios.
            allUsers.push(newUser);
            // Actualizar la lista de usuarios en localStorage.
            localStorage.setItem(LS_ALL_USERS, JSON.stringify(allUsers));

            // Establecer el nuevo usuario como el usuario actual (simulando un inicio de sesión automático después del registro).
            localStorage.setItem(LS_CURRENT_USER, JSON.stringify(newUser));

            // Mostrar mensaje de éxito.
            showMessage('¡Registro exitoso! Redirigiendo a tu perfil...', 'success');

            // Redirigir al usuario a la página de perfil después de un breve retraso
            // para que pueda ver el mensaje de éxito.
            setTimeout(() => {
                window.location.href = 'perfil.html'; // O a 'index.html', 'metas.html', etc.
            }, 2000);
        });
    }
}); // Fin del event listener 'DOMContentLoaded'
