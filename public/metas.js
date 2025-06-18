// public/metas.js

// Espera a que todo el contenido del DOM esté cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {

    // --- SELECTORES DOM ---
    const darkModeToggle = document.getElementById('darkModeToggle');
    const surveySection = document.getElementById('initialSurveySection');
    const surveyForm = document.getElementById('surveyForm');
    const goalsDisplaySection = document.getElementById('goalsDisplaySection');
    const goalsListContainer = document.getElementById('goalsList');
    const openAddGoalModalBtn = document.getElementById('openAddGoalModalBtn');
    const goalModal = document.getElementById('goalModal');
    const closeGoalModalBtn = document.getElementById('closeGoalModalBtn');
    const goalForm = document.getElementById('goalForm');
    const goalModalTitle = document.getElementById('goalModalTitle');
    const totalUserXPDisplay = document.getElementById('totalUserXP'); // Elemento para mostrar el XP total.

    // --- CLAVES LOCALSTORAGE ---
    // Constantes para las claves de localStorage, para consistencia y evitar errores.
    const LS_THEME = 'diarioQuestTheme';
    const LS_USER_XP = 'diarioQuestUserXP';
    const LS_USER_GOALS = 'diarioQuestUserGoals';
    const LS_COMPLETED_GOALS_COUNT = 'diarioQuestCompletedGoalsCount';
    const LS_SURVEY_COMPLETED = 'diarioQuestSurveyCompleted'; // Indica si el usuario ya completó el cuestionario inicial.

    // --- ESTADO INICIAL ---
    // Carga los datos del usuario desde localStorage o establece valores por defecto.
    let userXP = parseInt(localStorage.getItem(LS_USER_XP)) || 0;
    let userGoals = JSON.parse(localStorage.getItem(LS_USER_GOALS)) || [];
    let completedGoalsCount = parseInt(localStorage.getItem(LS_COMPLETED_GOALS_COUNT)) || 0;
    let surveyCompleted = localStorage.getItem(LS_SURVEY_COMPLETED) === 'true';

    // --- FUNCIONES AUXILIARES ---
    // Guarda el XP del usuario en localStorage y actualiza su visualización en la página.
    function saveUserXP() {
        localStorage.setItem(LS_USER_XP, userXP.toString());
        if (totalUserXPDisplay) totalUserXPDisplay.textContent = userXP;
    }
    // Guarda la lista actual de metas del usuario en localStorage.
    function saveUserGoals() {
        localStorage.setItem(LS_USER_GOALS, JSON.stringify(userGoals));
    }
    // Guarda el contador de metas completadas en localStorage.
    function saveCompletedGoalsCount() {
        localStorage.setItem(LS_COMPLETED_GOALS_COUNT, completedGoalsCount.toString());
    }
    // Marca el cuestionario como completado (o no) en localStorage y actualiza la visibilidad de las secciones.
    function setSurveyCompleted(status) {
        localStorage.setItem(LS_SURVEY_COMPLETED, status.toString());
        surveyCompleted = status;
        toggleSectionsVisibility();
    }

    // Muestra u oculta la sección del cuestionario o la de visualización de metas,
    // según si el cuestionario ya fue completado.
    function toggleSectionsVisibility() {
        if (surveyCompleted) {
            if (surveySection) surveySection.classList.add('hidden'); // Oculta cuestionario
            if (goalsDisplaySection) goalsDisplaySection.classList.remove('hidden'); // Muestra metas
        } else {
            if (surveySection) surveySection.classList.remove('hidden'); // Muestra cuestionario
            if (goalsDisplaySection) goalsDisplaySection.classList.add('hidden'); // Oculta metas
        }
    }

    // --- MANEJO DEL TEMA ---
    // Aplica el tema (claro/oscuro) al body y actualiza el texto del botón.
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark');
            if (darkModeToggle) darkModeToggle.textContent = '☀️'; // Sol para modo oscuro
        } else {
            document.body.classList.remove('dark');
            if (darkModeToggle) darkModeToggle.textContent = '🌙'; // Luna para modo claro
        }
    }
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            let currentTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
            localStorage.setItem(LS_THEME, currentTheme);
            applyTheme(currentTheme);
        });
    }

    // --- CUESTIONARIO INICIAL ---
    // Maneja el envío del formulario del cuestionario inicial.
    if (surveyForm) {
        surveyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const ageRange = surveyForm.ageRange.value;
            const interest = surveyForm.interest.value;
            generateInitialGoals(ageRange, interest); // Genera metas basadas en las respuestas.
            setSurveyCompleted(true); // Marca el cuestionario como completado.
            renderGoals(); // Muestra las metas generadas.
        });
    }

    // Genera un conjunto de metas iniciales basadas en el rango de edad e interés del usuario.
    function generateInitialGoals(ageRange, interest) {
        const initialGoals = [];
        // Metas comunes
        initialGoals.push({
            // Genera un ID único para la meta.
            id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            title: "Beber 2 litros de agua al día",
            description: "Mantener una buena hidratación.",
            xpValue: 10,
            isCompleted: false,
            dateAdded: new Date().toISOString().split('T')[0],
            dueDate: null
        });
        initialGoals.push({
            id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            title: "Dormir 7-8 horas",
            description: "Priorizar el descanso para mejorar energía y concentración.",
            xpValue: 15,
            isCompleted: false,
            dateAdded: new Date().toISOString().split('T')[0],
            dueDate: null
        });

        if (interest === 'salud') {
            // Metas específicas para el interés "salud".
            initialGoals.push({
                id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                title: "Hacer 30 min de ejercicio",
                description: "Caminar, correr, o cualquier actividad física.",
                xpValue: 25,
                isCompleted: false,
                dateAdded: new Date().toISOString().split('T')[0],
                dueDate: null
            });
            initialGoals.push({
                id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                title: "Meditar 5 minutos",
                description: "Empezar el día con calma y enfoque.",
                xpValue: 15,
                isCompleted: false,
                dateAdded: new Date().toISOString().split('T')[0],
                dueDate: null
            });
        } else if (interest === 'aprendizaje') {
            initialGoals.push({
                id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                title: "Leer 1 capítulo de un libro",
                description: "Expandir conocimientos o disfrutar de una historia.",
                xpValue: 20,
                isCompleted: false,
                dateAdded: new Date().toISOString().split('T')[0],
                dueDate: null
            });
            initialGoals.push({
                id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                title: "Dedicar 20 min a aprender algo nuevo",
                description: "Un idioma, una habilidad, un curso online.",
                xpValue: 30,
                isCompleted: false,
                dateAdded: new Date().toISOString().split('T')[0],
                dueDate: null
            });
        } else if (interest === 'creatividad') {
            initialGoals.push({
                id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                title: "Escribir 1 página en el diario",
                description: "Reflexionar sobre el día o explorar ideas.",
                xpValue: 15,
                isCompleted: false,
                dateAdded: new Date().toISOString().split('T')[0],
                dueDate: null
            });
            initialGoals.push({
                id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                title: "Dedicar 30 min a un hobby creativo",
                description: "Dibujar, tocar un instrumento, etc.",
                xpValue: 25,
                isCompleted: false,
                dateAdded: new Date().toISOString().split('T')[0],
                dueDate: null
            });
        } else if (interest === 'productividad') {
            initialGoals.push({
                id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                title: "Planificar las tareas del día siguiente",
                description: "Organizar prioridades para un día efectivo.",
                xpValue: 20,
                isCompleted: false,
                dateAdded: new Date().toISOString().split('T')[0],
                dueDate: null
            });
            initialGoals.push({
                id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                title: "Limpiar y organizar el espacio de trabajo",
                description: "Un entorno ordenado fomenta la concentración.",
                xpValue: 15,
                isCompleted: false,
                dateAdded: new Date().toISOString().split('T')[0],
                dueDate: null
            });
        }
        // Se podrían añadir más metas basadas en 'ageRange' o combinaciones de edad e interés.
        userGoals.push(...initialGoals);
        saveUserGoals();
    }

    // --- RENDERIZADO DE METAS ---
    // Dibuja las tarjetas de metas en el contenedor HTML.
    function renderGoals() {
        if (!goalsListContainer) return;
        goalsListContainer.innerHTML = ''; // Limpia el contenedor antes de redibujar.

        // Si no hay metas y el cuestionario ya se completó, muestra un mensaje.
        if (userGoals.length === 0 && surveyCompleted) {
            goalsListContainer.innerHTML = "<p>No tienes metas todavía. ¡Añade algunas!</p>";
        }

        // Ordena las metas: primero las no completadas, luego por fecha de adición.
        userGoals.sort((a, b) => a.isCompleted - b.isCompleted || new Date(a.dateAdded) - new Date(b.dateAdded)); // Mostrar no completadas primero

        userGoals.forEach(goal => {
            // Crea un div para cada tarjeta de meta.
            const card = document.createElement('div');
            card.classList.add('goal-card');
            if (goal.isCompleted) card.classList.add('completed');
            card.dataset.goalId = goal.id;

            // Formatea y muestra la fecha límite si existe.
            let dueDateHTML = '';
            if (goal.dueDate) {
                const due = new Date(goal.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Normalizar para comparar solo fechas
                let dueClass = '';
                if (!goal.isCompleted && due < today) {
                    dueClass = 'overdue'; // Clase para metas vencidas (se puede estilizar en CSS).
                }
                dueDateHTML = `<p class="goal-due-date ${dueClass}">Fecha Límite: ${new Date(goal.dueDate).toLocaleDateString()}</p>`;
            }

            card.innerHTML = `
                <h3>${goal.title}</h3>
                ${goal.description ? `<p>${goal.description}</p>` : ''}
                <p class="goal-xp">XP: ${goal.xpValue}</p>
                ${dueDateHTML}
                ${goal.isCompleted ?
                    `<button class="btn-undo-goal" data-id="${goal.id}">Deshacer</button>` :
                    `<button class="btn-complete-goal" data-id="${goal.id}">Completar Meta</button>`
                }
            `;
            goalsListContainer.appendChild(card);
        });

        // (Re)Añade event listeners a los botones de completar/deshacer de las tarjetas.
        document.querySelectorAll('.btn-complete-goal, .btn-undo-goal').forEach(button => {
            button.addEventListener('click', function() {
                toggleGoalCompletion(this.dataset.id);
            });
        });
    }

    // --- GESTIÓN DE METAS (AÑADIR, COMPLETAR) ---
    // Cambia el estado de completado de una meta.
    function toggleGoalCompletion(goalId) {
        const goalIndex = userGoals.findIndex(g => g.id === goalId);
        if (goalIndex === -1) return;

        const goal = userGoals[goalIndex];
        // Si la meta ya está completada, la marca como no completada (deshacer).
        if (goal.isCompleted) { // Deshacer
            goal.isCompleted = false;
            goal.dateCompleted = null;
            userXP -= goal.xpValue; // Restar XP
            completedGoalsCount--;
        } else { // Completar
            goal.isCompleted = true;
            goal.dateCompleted = new Date().toISOString().split('T')[0];
            userXP += goal.xpValue; // Sumar XP
            completedGoalsCount++;
        }

        if (userXP < 0) userXP = 0; // Asegura que el XP no sea negativo.
        if (completedGoalsCount < 0) completedGoalsCount = 0;

        saveUserXP();
        saveUserGoals();
        saveCompletedGoalsCount();
        renderGoals();
        // Opcionalmente, se podría disparar un evento para que logros.js re-evalúe los logros inmediatamente.
        // window.dispatchEvent(new CustomEvent('goalsUpdated'));
    }

    // --- MODAL PARA AÑADIR/EDITAR METAS ---
    // Abre el modal para añadir una nueva meta.
    if (openAddGoalModalBtn) {
        openAddGoalModalBtn.addEventListener('click', () => {
            goalModalTitle.textContent = "Añadir Nueva Meta";
            goalForm.reset();
            document.getElementById('goalId').value = ''; // Asegurar que no haya ID para nueva meta
            if (goalModal) goalModal.classList.add('active'); // Muestra el modal.
        });
    }
    // Cierra el modal al hacer clic en el botón de cerrar (X).
    if (closeGoalModalBtn) {
        closeGoalModalBtn.addEventListener('click', () => {
            if (goalModal) goalModal.classList.remove('active');
        });
    }
    // Cierra el modal si se hace clic fuera de su contenido.
    window.addEventListener('click', (event) => { // Cerrar al hacer clic fuera
        if (event.target === goalModal) {
            if (goalModal) goalModal.classList.remove('active');
        }
    });

    if (goalForm) {
        // Maneja el envío del formulario para añadir o editar una meta.
        goalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('goalId').value;
            const title = document.getElementById('goalTitle').value.trim();
            const description = document.getElementById('goalDescription').value.trim();
            const xpValue = parseInt(document.getElementById('goalXP').value);
            const dueDate = document.getElementById('goalDueDate').value || null;

            // Validación básica.
            if (!title || xpValue < 0) {
                alert("El título es obligatorio y el XP no puede ser negativo.");
                return;
            }

            if (id) {
                // Lógica para editar una meta existente (actualmente no implementada, pero preparada).
                // const goalIndex = userGoals.findIndex(g => g.id === id);
                // if (goalIndex > -1) { ... }
            } else { // Añadir una nueva meta.
                const newGoal = {
                    // Genera un ID único.
                    id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                    title,
                    description,
                    xpValue,
                    isCompleted: false,
                    dateAdded: new Date().toISOString().split('T')[0],
                    dueDate,
                    dateCompleted: null
                };
                userGoals.push(newGoal);
            }
            saveUserGoals();
            renderGoals();
            if (goalModal) goalModal.classList.remove('active');
        });
    }

    // --- INICIALIZACIÓN ---
    // Función que se ejecuta al cargar la página.
    function init() {
        const savedTheme = localStorage.getItem(LS_THEME) || 'light'; // Carga el tema o usa 'light' por defecto.
        applyTheme(savedTheme);
        saveUserXP(); // Actualiza el display de XP con el valor cargado.
        toggleSectionsVisibility(); // Decide si mostrar el cuestionario o las metas.

        // Si el cuestionario ya fue completado, renderiza las metas existentes.
        if (surveyCompleted) {
            renderGoals();
        }
        console.log("Página de Metas Inicializada. XP:", userXP, "Metas Completadas:", completedGoalsCount);
    }

    init();
});