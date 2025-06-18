// public/diario.js

// Espera a que todo el contenido del DOM esté cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {
    // --- SELECTORES DOM ---
    // Obtiene referencias a los elementos HTML que se manipularán con JavaScript.
    const darkModeToggle = document.getElementById('darkModeToggle'); // Botón para cambiar entre modo claro y oscuro.
    const openNewEntryModalBtn = document.getElementById('openNewEntryModalBtn'); // Botón para abrir el modal de nueva entrada.
    const newEntryModal = document.getElementById('newEntryModal'); // El modal (ventana emergente) para crear/editar entradas.
    const closeNewEntryModalBtn = document.getElementById('closeNewEntryModalBtn'); // Botón para cerrar el modal de nueva entrada.
    const journalEntryForm = document.getElementById('journalEntryForm'); // Formulario dentro del modal para la entrada del diario.
    const journalEntriesContainer = document.getElementById('journalEntriesSection'); // Contenedor donde se mostrarán las entradas del diario.
    const noEntriesMessage = journalEntriesContainer.querySelector('.no-entries-message'); // Mensaje que se muestra si no hay entradas.
    const entryModalTitle = document.getElementById('entryModalTitle'); // Título del modal (cambia si es nueva entrada o edición).

      // --- OBTENER USUARIO ACTUAL ---
    // Carga la información del usuario que ha iniciado sesión desde localStorage.
    const activeUser = JSON.parse(localStorage.getItem('currentUser'));

    // Si no hay un usuario activo (nadie ha iniciado sesión), redirige a la página de login.
    if (!activeUser) {
        window.location.href = 'login.html';
        return; // Detiene la ejecución del script si no hay usuario.
    }
    // Obtiene el ID del usuario activo. Este ID se usará para asociar las entradas del diario al usuario.
    const userId = activeUser.id; // ID único del usuario logueado
    
    // --- CLAVES LOCALSTORAGE ---
    // Define constantes para las claves de localStorage. Esto ayuda a evitar errores de tipeo
    // y facilita la gestión de los datos guardados en el navegador.
    const LS_THEME = 'diarioQuestTheme'; // Clave para guardar la preferencia de tema (claro/oscuro).
    const LS_JOURNAL_ENTRIES = 'diarioQuestJournalEntries'; // Clave para guardar las entradas del diario.
    const LS_JOURNAL_STREAK_DAYS = 'diarioQuestJournalStreakDays'; // Clave para la racha de días escribiendo (para futura integración con logros).

    // --- ESTADO INICIAL ---
    // Carga las entradas del diario desde localStorage. Si no hay nada guardado, inicializa como un array vacío.
    let journalEntries = JSON.parse(localStorage.getItem(LS_JOURNAL_ENTRIES)) || [];
    // let journalStreak = parseInt(localStorage.getItem(LS_JOURNAL_STREAK_DAYS)) || 0; // Para el futuro: carga la racha de días.

    // --- FUNCIONES AUXILIARES ---
    // Guarda el array de entradas del diario en localStorage, convirtiéndolo a formato JSON.
    function saveJournalEntries() {
        localStorage.setItem(LS_JOURNAL_ENTRIES, JSON.stringify(journalEntries));
    }

    // Formatea una cadena de fecha (ISO string) a un formato legible en español.
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    // --- MANEJO DEL TEMA ---
    // Aplica el tema (claro u oscuro) al cuerpo del documento y actualiza el ícono del botón.
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark'); // Añade la clase 'dark' para estilos oscuros.
            if (darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // Cambia el ícono a un sol.
        } else {
            document.body.classList.remove('dark'); // Quita la clase 'dark' para estilos claros.
            if (darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>'; // Cambia el ícono a una luna.
        }
    }
    // Si existe el botón de cambio de tema, le añade un event listener.
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            // Determina el tema actual y lo invierte.
            let currentTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
            localStorage.setItem(LS_THEME, currentTheme); // Guarda la nueva preferencia de tema.
            applyTheme(currentTheme); // Aplica el nuevo tema.
        });
    }

    // --- RENDERIZADO DE ENTRADAS DEL DIARIO ---
    // Dibuja las entradas del diario en el contenedor HTML.
    function renderJournalEntries() {
        // Limpiar contenedor excepto el mensaje de "no entradas".
        // Selecciona todas las tarjetas de entrada existentes y las elimina para evitar duplicados.
        const existingCards = journalEntriesContainer.querySelectorAll('.journal-entry-card');
        existingCards.forEach(card => card.remove());

        // Si no hay entradas, muestra el mensaje de "no hay entradas" y termina la función.
        if (journalEntries.length === 0) {
            if (noEntriesMessage) noEntriesMessage.classList.remove('hidden');
            return;
        }
        // Si hay entradas, oculta el mensaje de "no hay entradas".
        if (noEntriesMessage) noEntriesMessage.classList.add('hidden');

        // Ordena las entradas por fecha, mostrando las más recientes primero.
        // Se crea una copia del array con `[...journalEntries]` para no modificar el original.
        const sortedEntries = [...journalEntries].sort((a, b) => new Date(b.date) - new Date(a.date));

        // Itera sobre cada entrada ordenada para crear su representación HTML.
        sortedEntries.forEach(entry => {
            const entryCard = document.createElement('article'); // Crea un elemento <article> para la tarjeta de entrada.
            entryCard.classList.add('journal-entry-card'); // Añade clase para estilos.
            entryCard.dataset.entryId = entry.id; // Almacena el ID de la entrada en un atributo data-*.

            // Prepara el HTML para las etiquetas (tags), si existen.
            let tagsHTML = '';
            if (entry.tags && entry.tags.length > 0) {
                tagsHTML = entry.tags.map(tag => `<span>#${tag.trim()}</span>`).join(' ');
            }

            // Prepara el HTML para la imagen, si existe.
            let imageHTML = '';
            if (entry.imageUrl) {
                imageHTML = `
                    <div class="entry-image-container">
                        <img src="${entry.imageUrl}" alt="Imagen de la entrada: ${entry.title}">
                    </div>`;
            }

            // Construye el HTML interno de la tarjeta de entrada.
            entryCard.innerHTML = `
                ${imageHTML}
                <div class="entry-header">
                    <h2>${entry.title}</h2>
                    <div class="entry-meta">
                        <span class="entry-date">${formatDate(entry.date)}</span>
                        ${tagsHTML ? `<div class="entry-tags">${tagsHTML}</div>` : ''}
                    </div>
                </div>
                <div class="entry-content">
                    <p>${entry.content.replace(/\n/g, '<br>')}</p> 
                </div>
                <div class="entry-actions">
                    <button class="btn-icon btn-edit-entry" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon btn-delete-entry" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
                    <button class="btn-icon btn-share-entry" title="Compartir (Próximamente)"><i class="fas fa-share-alt"></i></button>
                </div>
            `;
            // Añade la tarjeta de entrada creada al contenedor principal.
            journalEntriesContainer.appendChild(entryCard);
        });
        // Vuelve a añadir los event listeners a los botones de acción de las entradas (editar, eliminar, compartir).
        addEntryActionListeners();
    }
    
    // Añade event listeners a los botones de acción (editar, eliminar, compartir) de cada entrada.
    // Se llama después de renderizar las entradas para asegurar que los botones nuevos tengan listeners.
    function addEntryActionListeners() {
        document.querySelectorAll('.btn-edit-entry').forEach(button => {
            button.addEventListener('click', handleEditEntry);
        });
        document.querySelectorAll('.btn-delete-entry').forEach(button => {
            button.addEventListener('click', handleDeleteEntry);
        });
        document.querySelectorAll('.btn-share-entry').forEach(button => {
            button.addEventListener('click', handleShareEntry);
        });
    }

    // --- MODAL PARA NUEVA/EDITAR ENTRADA ---
    // Si existe el botón para abrir el modal de nueva entrada, le añade un event listener.
    if (openNewEntryModalBtn) {
        openNewEntryModalBtn.addEventListener('click', () => {
            entryModalTitle.textContent = "Nueva Entrada en el Diario"; // Cambia el título del modal.
            journalEntryForm.reset(); // Limpia los campos del formulario.
            document.getElementById('entry-id').value = ''; // Asegura que el campo ID esté vacío para una nueva entrada.
            if (newEntryModal) newEntryModal.classList.add('active'); // Muestra el modal.
        });
    }
    // Si existe el botón para cerrar el modal, le añade un event listener.
    if (closeNewEntryModalBtn) {
        closeNewEntryModalBtn.addEventListener('click', () => {
            if (newEntryModal) newEntryModal.classList.remove('active'); // Oculta el modal.
        });
    }
    // Añade un event listener a la ventana para cerrar el modal si se hace clic fuera de su contenido.
    window.addEventListener('click', (event) => { 
        if (event.target === newEntryModal) { // Si el clic fue directamente sobre el fondo del modal.
            if (newEntryModal) newEntryModal.classList.remove('active'); // Oculta el modal.
        }
    });

    // --- MANEJO DEL FORMULARIO DE ENTRADA ---
    // Si existe el formulario de entrada del diario, le añade un event listener para el evento 'submit'.
    if (journalEntryForm) {
        journalEntryForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Evita que la página se recargue al enviar el formulario.
            // Obtiene los valores de los campos del formulario.
            const entryId = document.getElementById('entry-id').value; // ID de la entrada (vacío si es nueva).
            const title = document.getElementById('entry-title').value.trim(); // Título.
            const content = document.getElementById('entry-content').value.trim(); // Contenido.
            const tagsString = document.getElementById('entry-tags').value.trim(); // Tags como cadena.
            // Convierte la cadena de tags en un array, eliminando espacios y tags vacíos.
            const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
            const imageUrl = document.getElementById('entry-image-url').value.trim(); // URL de la imagen.

            // Validación básica: título y contenido son obligatorios.
            if (!title || !content) {
                alert("El título y el contenido son obligatorios.");
                return;
            }

            if (entryId) { // Si hay un entryId, significa que se está editando una entrada existente.
                const entryIndex = journalEntries.findIndex(entry => entry.id === entryId);
                if (entryIndex > -1) { // Si se encuentra la entrada en el array.
                    // Actualiza los datos de la entrada existente.
                    journalEntries[entryIndex] = {
                        ...journalEntries[entryIndex], // Mantiene propiedades no modificadas (como la fecha de creación original).
                        title,
                        content,
                        tags,
                        imageUrl,
                        lastModified: new Date().toISOString() // Actualiza la fecha de última modificación.
                    };
                }
            } else { // Si no hay entryId, es una nueva entrada.
                const newEntry = {
                    id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // Genera un ID único.
                    title,
                    content,
                    tags,
                    imageUrl,
                    date: new Date().toISOString(), // Fecha de creación.
                    lastModified: new Date().toISOString() // Fecha de última modificación (inicialmente igual a la de creación).
                };
                journalEntries.push(newEntry); // Añade la nueva entrada al array.
                // Aquí se podría actualizar la racha de días escribiendo (LS_JOURNAL_STREAK_DAYS).
            }

            saveJournalEntries(); // Guarda el array actualizado en localStorage.
            renderJournalEntries(); // Vuelve a dibujar las entradas en la página.
            if (newEntryModal) newEntryModal.classList.remove('active'); // Cierra el modal.
        });
    }

    // --- EDITAR Y ELIMINAR ENTRADAS ---
    // Maneja el evento de clic en el botón "Editar" de una entrada.
    function handleEditEntry(event) {
        const card = event.target.closest('.journal-entry-card'); // Encuentra la tarjeta de entrada más cercana al botón.
        const entryId = card.dataset.entryId; // Obtiene el ID de la entrada desde el atributo data-*.
        const entryToEdit = journalEntries.find(entry => entry.id === entryId); // Busca la entrada en el array.

        if (entryToEdit) {
            // Si se encuentra la entrada, rellena el formulario del modal con sus datos.
            entryModalTitle.textContent = "Editar Entrada del Diario";
            document.getElementById('entry-id').value = entryToEdit.id;
            document.getElementById('entry-title').value = entryToEdit.title;
            document.getElementById('entry-content').value = entryToEdit.content;
            document.getElementById('entry-tags').value = entryToEdit.tags ? entryToEdit.tags.join(', ') : '';
            document.getElementById('entry-image-url').value = entryToEdit.imageUrl || '';
            if (newEntryModal) newEntryModal.classList.add('active'); // Muestra el modal.
        }
    }

    // Maneja el evento de clic en el botón "Eliminar" de una entrada.
    function handleDeleteEntry(event) {
        const card = event.target.closest('.journal-entry-card'); // Encuentra la tarjeta de entrada.
        const entryId = card.dataset.entryId; // Obtiene el ID de la entrada.
        
        // Pide confirmación al usuario antes de eliminar.
        if (confirm("¿Estás seguro de que quieres eliminar esta entrada? Esta acción no se puede deshacer.")) {
            // Filtra el array de entradas para quitar la entrada con el ID correspondiente.
            journalEntries = journalEntries.filter(entry => entry.id !== entryId);
            saveJournalEntries(); // Guarda el array modificado.
            renderJournalEntries(); // Vuelve a dibujar las entradas.
        }
    }

    // Maneja el evento de clic en el botón "Compartir" de una entrada.
    function handleShareEntry(event) {
        const card = event.target.closest('.journal-entry-card'); // Encuentra la tarjeta de entrada.
        const entryId = card.dataset.entryId; // Obtiene el ID de la entrada.
        // Por ahora, solo es un placeholder. En el futuro, esto podría generar un enlace único o abrir un diálogo de compartir.
        const entryURL = `${window.location.origin}/diario.html#entry-${entryId}`; // URL simulada para compartir.
        
        // Intenta copiar la URL al portapapeles.
        // navigator.clipboard.writeText() puede no funcionar en todos los navegadores/contextos (ej. sin HTTPS).
        navigator.clipboard.writeText(entryURL).then(() => {
            alert(`¡Enlace a la entrada copiado al portapapeles! (Simulado)\n${entryURL}\n\n(La funcionalidad real de compartir se implementará más adelante)`);
        }).catch(err => alert("Funcionalidad de compartir próximamente. Enlace simulado: " + entryURL));
    }

    // --- INICIALIZACIÓN ---
    // Función que se ejecuta al cargar la página para configurar el estado inicial.
    function init() {
        // Carga la preferencia de tema guardada o usa 'light' por defecto.
        const savedTheme = localStorage.getItem(LS_THEME) || 'light';
        applyTheme(savedTheme); // Aplica el tema.
        renderJournalEntries(); // Dibuja las entradas del diario existentes.
        console.log("Página de Diario Inicializada."); // Mensaje para la consola del navegador.
    }

    init(); // Llama a la función de inicialización.
});
