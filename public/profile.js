// public/profile.js

// Espera a que todo el contenido del DOM (estructura HTML) esté completamente cargado y parseado
// antes de ejecutar el código JavaScript.
document.addEventListener('DOMContentLoaded', () => {
    // --- SELECTORES DOM ---
    // Obtiene referencias a los elementos HTML de la página de perfil
    // para poder mostrar datos del usuario y manejar interacciones.
    const darkModeToggle = document.getElementById('darkModeToggle'); // Botón para cambiar tema claro/oscuro.
    const userAvatar = document.getElementById('userAvatar'); // Elemento <img> para mostrar el avatar del usuario.
    const usernameDisplay = document.getElementById('usernameDisplay'); // Elemento para mostrar el nombre de usuario.
    const emailDisplay = document.getElementById('emailDisplay'); // Elemento para mostrar el email del usuario.
    const joinDateDisplay = document.getElementById('joinDateDisplay'); // Elemento para mostrar la fecha de registro.
    const userXPDisplay = document.getElementById('userTotalXP'); // Elemento para mostrar el XP total del usuario.
    const userLevelDisplay = document.getElementById('userLevel'); // Elemento para mostrar el nivel calculado del usuario.
    const goalsCompleted = document.getElementById('goalsCompleted'); // Elemento para mostrar el número de metas completadas.
    const achievementsUnlocked = document.getElementById('achievementsUnlocked'); // Elemento para mostrar el número de logros desbloqueados.
    const journalEntries = document.getElementById('journalEntries'); // Elemento para mostrar el número de entradas de diario.
    const editProfileBtn = document.getElementById('editProfileBtn'); // Botón para editar el perfil (ej. cambiar nombre).
    const changePasswordBtn = document.getElementById('changePasswordBtn'); // Botón para cambiar la contraseña (funcionalidad futura).
    const logoutBtn = document.getElementById('logoutBtn'); // Botón para cerrar sesión.
    const avatarUploadInput = document.getElementById('avatarUploadInput'); // Input de tipo 'file' (oculto) para subir avatar.
    const triggerAvatarUploadBtn = document.getElementById('triggerAvatarUploadBtn'); // Botón visible para iniciar la subida de avatar.

    // --- CLAVES LOCALSTORAGE (Consistentes con otros scripts) ---
    // Define constantes para las claves de localStorage. Esto ayuda a mantener la consistencia
    // a través de los diferentes archivos JavaScript y facilita la gestión de los datos.
    const LS_CURRENT_USER = 'currentUser'; // Clave para el objeto del usuario actualmente logueado.
    const LS_USER_AVATAR_PREFIX = 'diarioQuestUserAvatar_'; // Prefijo para guardar avatares, seguido del ID de usuario.
    const LS_THEME = 'diarioQuestTheme'; // Clave para la preferencia de tema (claro/oscuro).
    const LS_USER_XP = 'diarioQuestUserXP'; // Clave para el XP total del usuario.
    const LS_COMPLETED_GOALS_COUNT = 'diarioQuestCompletedGoalsCount'; // Clave para el contador de metas completadas.
    const LS_ACHIEVEMENTS_STATUS = 'diarioQuestAchievementsStatus'; // Clave para el estado de los logros predefinidos.
    const LS_JOURNAL_ENTRIES = 'diarioQuestJournalEntries'; // Clave para las entradas del diario.

    // --- DATOS DEL USUARIO ACTUAL ---
    // Carga la información del usuario que ha iniciado sesión desde localStorage.
    let activeUser = JSON.parse(localStorage.getItem(LS_CURRENT_USER));
    // Define un identificador único para el usuario, que se usará para claves de localStorage específicas del usuario (como el avatar).
    // Si no hay usuario activo, se usa 'guest' por defecto.
    let userIdentifier = 'guest';
    if (activeUser) {
        // Intenta usar el ID del usuario. Si no existe, usa el nombre. Como último recurso, genera un ID temporal.
        // Esto es importante para que la clave del avatar sea consistente para el mismo usuario.
        userIdentifier = activeUser.id || activeUser.name || `user_${Date.now()}`;
    } else {
        // Si no hay usuario activo (es decir, nadie ha iniciado sesión),
        // redirige a la página de login para asegurar que esta página solo sea accesible por usuarios logueados.
        // (Descomentar la siguiente línea si se quiere forzar el login para ver el perfil)
        // window.location.href = 'login.html';
        // return; // Detiene la ejecución del script si no hay usuario.
    }


    // --- Cargar/Actualizar Modo Oscuro ---
    // Función para aplicar el tema (claro u oscuro) al cuerpo del documento y actualizar el ícono del botón.
    const applyDarkMode = (isDark) => {
        const theme = isDark ? 'dark' : 'light'; // Determina el nombre del tema.
        if (isDark) {
            document.body.classList.add('dark'); // Añade la clase 'dark' para estilos oscuros.
            if (darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // Cambia el ícono a un sol.
        } else {
            document.body.classList.remove('dark'); // Quita la clase 'dark' para estilos claros.
            if (darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>'; // Cambia el ícono a una luna.
        }
        localStorage.setItem(LS_THEME, theme); // Guarda la nueva preferencia de tema.
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

    // --- CÁLCULO DE NIVEL (Ejemplo simple) ---
    // Función para calcular el nivel del usuario basado en su XP.
    // Esta es una lógica de ejemplo y puede hacerse más compleja.
    function calculateLevel(xp) {
        // Por cada 100 XP, el usuario sube un nivel. El nivel base es 1.
        return Math.floor(xp / 100) + 1;
    }

    // --- Cargar Datos del Perfil (Desde localStorage) ---
    // Función principal para cargar y mostrar toda la información del perfil del usuario.
    const loadUserProfile = () => {
        // Carga el avatar guardado para el usuario actual.
        // La clave del avatar incluye el `userIdentifier` para que cada usuario tenga su propio avatar.
        const savedAvatar = localStorage.getItem(LS_USER_AVATAR_PREFIX + userIdentifier);
        if (userAvatar) { // Verifica que el elemento <img> del avatar exista en el HTML.
            if (savedAvatar) {
                userAvatar.src = savedAvatar; // Muestra el avatar guardado.
            } else {
                userAvatar.src = 'default-avatar.png'; // Muestra un avatar por defecto si no hay uno guardado.
            }
        }

        if (activeUser) { // Si hay un usuario activo (registrado o invitado con datos).
            if (usernameDisplay) usernameDisplay.textContent = activeUser.name || 'Usuario'; // Muestra el nombre o 'Usuario' por defecto.
            if (emailDisplay) emailDisplay.textContent = activeUser.email || 'No especificado'; // Muestra el email o 'No especificado'.
            // Muestra la fecha de registro formateada, o un mensaje si no está disponible.
            if (joinDateDisplay) joinDateDisplay.textContent = activeUser.joinDate ? `Miembro desde: ${new Date(activeUser.joinDate).toLocaleDateString()}` : 'Miembro desde: (No disponible)';
        } else { // Si no hay usuario activo (ej. se accedió a perfil.html sin loguearse y no se redirigió).
            if (usernameDisplay) usernameDisplay.textContent = 'Invitado'; // Muestra 'Invitado'.
            if (emailDisplay) emailDisplay.textContent = '-'; // Placeholder para email.
            if (joinDateDisplay) joinDateDisplay.textContent = '-'; // Placeholder para fecha de registro.
            // Deshabilita botones que no tienen sentido para un usuario no logueado o invitado sin persistencia.
            if (editProfileBtn) editProfileBtn.disabled = true;
            if (triggerAvatarUploadBtn) triggerAvatarUploadBtn.style.display = 'none'; // Oculta botón de cambiar avatar.
            if (changePasswordBtn) changePasswordBtn.disabled = true;
        }

        // Carga y muestra el XP total del usuario.
        const currentXP = parseInt(localStorage.getItem(LS_USER_XP)) || 0;
        if (userXPDisplay) userXPDisplay.textContent = currentXP;
        // Calcula y muestra el nivel del usuario basado en su XP.
        if (userLevelDisplay) userLevelDisplay.textContent = calculateLevel(currentXP);

        // Carga y muestra el número de metas completadas.
        const completedGoalsCount = parseInt(localStorage.getItem(LS_COMPLETED_GOALS_COUNT)) || 0;
        if (goalsCompleted) goalsCompleted.textContent = completedGoalsCount;

        // Carga los datos de logros, cuenta cuántos están desbloqueados y lo muestra.
        const achievementsData = JSON.parse(localStorage.getItem(LS_ACHIEVEMENTS_STATUS)) || {};
        const unlockedAchievementsCount = Object.values(achievementsData).filter(ach => ach.unlocked).length;
        if (achievementsUnlocked) achievementsUnlocked.textContent = unlockedAchievementsCount;

        // Carga las entradas del diario, cuenta cuántas hay y lo muestra.
        const journalEntriesData = JSON.parse(localStorage.getItem(LS_JOURNAL_ENTRIES)) || [];
        if (journalEntries) journalEntries.textContent = journalEntriesData.length;
    };

    loadUserProfile(); // Llama a la función para cargar los datos del perfil al iniciar la página.

    // --- Lógica para Cambiar Avatar ---
    // Solo activa esta funcionalidad si los elementos necesarios existen y hay un usuario activo.
    if (triggerAvatarUploadBtn && avatarUploadInput && activeUser) {
        // Cuando se hace clic en el botón visible de "cambiar avatar",
        // se simula un clic en el input de tipo 'file' (que está oculto).
        triggerAvatarUploadBtn.addEventListener('click', () => {
            avatarUploadInput.click(); // Abre el diálogo del sistema para seleccionar un archivo.
        });

        // Cuando el usuario selecciona un archivo en el input 'file'.
        avatarUploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0]; // Obtiene el archivo seleccionado.
            if (file && file.type.startsWith('image/')) { // Verifica que sea un archivo y que sea de tipo imagen.
                const reader = new FileReader(); // Crea un FileReader para leer el contenido del archivo.
                // Cuando el archivo se ha leído completamente:
                reader.onload = (e) => {
                    if (userAvatar) userAvatar.src = e.target.result; // Muestra la previsualización del avatar.
                    try {
                        // Guarda la imagen como una cadena Base64 en localStorage.
                        // La clave es específica para el usuario actual.
                        localStorage.setItem(LS_USER_AVATAR_PREFIX + userIdentifier, e.target.result);
                        alert('Avatar actualizado.');
                    } catch (error) {
                        // localStorage tiene un límite de tamaño (usualmente 5-10MB).
                        // Si la imagen es muy grande, puede fallar el guardado.
                        console.error("Error guardando avatar en localStorage:", error);
                        alert("Error al guardar el avatar. La imagen podría ser demasiado grande para el almacenamiento local.");
                    }
                };
                // Si hay un error al leer el archivo.
                reader.onerror = () => {
                    alert('Error al leer el archivo de imagen.');
                };
                reader.readAsDataURL(file); // Inicia la lectura del archivo como una Data URL (Base64).
            } else if (file) { // Si se seleccionó un archivo, pero no es una imagen.
                alert('Por favor, selecciona un archivo de imagen válido (ej: JPG, PNG, GIF).');
            }
            // Resetea el valor del input de archivo para permitir seleccionar el mismo archivo de nuevo si es necesario.
            avatarUploadInput.value = null;
        });
    }

    // --- Manejadores de Eventos para Botones de Acción ---
    // Si el botón de editar perfil existe y hay un usuario activo.
    if (editProfileBtn && activeUser) {
        editProfileBtn.addEventListener('click', () => {
            // Pide al usuario un nuevo nombre mediante un prompt.
            const newUsername = prompt("Ingresa tu nuevo nombre de usuario:", activeUser.name || "");
            // Si el usuario ingresó un nombre y no es solo espacios en blanco.
            if (newUsername !== null && newUsername.trim() !== "") {
                activeUser.name = newUsername.trim(); // Actualiza el nombre en el objeto `activeUser`.
                // Si el `userIdentifier` se basaba en el nombre (para usuarios sin ID fijo), actualízalo.
                if (!activeUser.id) {
                    userIdentifier = activeUser.name;
                }
                // Guarda el objeto `activeUser` actualizado en localStorage.
                localStorage.setItem(LS_CURRENT_USER, JSON.stringify(activeUser));
                if (usernameDisplay) usernameDisplay.textContent = activeUser.name; // Actualiza el nombre en la página.
                alert('Nombre de usuario actualizado.');
            } else if (newUsername === "") { // Si el usuario ingresó un nombre vacío.
                alert('El nombre de usuario no puede estar vacío.');
            }
        });
    }

    // Si el botón de cambiar contraseña existe y hay un usuario activo.
    if (changePasswordBtn && activeUser) {
        changePasswordBtn.addEventListener('click', () => {
            // Esta funcionalidad no está implementada completamente.
            // En una aplicación real, esto implicaría verificar la contraseña actual
            // y enviar la nueva contraseña (hasheada) a un backend.
            alert('Funcionalidad "Cambiar Contraseña" aún no implementada.');
        });
    }

    // Si el botón de cerrar sesión existe.
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            alert('Cerrando sesión...');
            // Elimina la información del usuario actual de localStorage.
            localStorage.removeItem(LS_CURRENT_USER);
            // Elimina el avatar del usuario si no es el invitado.
            if (userIdentifier !== 'guest') {
                localStorage.removeItem(LS_USER_AVATAR_PREFIX + userIdentifier);
            }
            // Considera si quieres limpiar otros datos específicos del usuario (XP, metas, etc.) al cerrar sesión.
            // Por ahora, se mantienen para que, si el mismo "usuario" (basado en email) vuelve a iniciar sesión,
            // pueda recuperar su progreso. Si se usa un backend, esta lógica sería diferente.

            // Redirige al usuario a la página de login.
            window.location.href = 'login.html';
        });
    }
}); // Fin del event listener 'DOMContentLoaded'