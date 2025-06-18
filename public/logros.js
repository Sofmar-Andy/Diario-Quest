// public/logros.js

// Espera a que todo el contenido del DOM esté cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {

    // --- SELECTORES DOM ---
    const achievementCardsContainer = document.querySelector('.achievements-overview .achievement-cards');
    const customAchievementsList = document.getElementById('customList');
    const addCustomAchievementBtn = document.getElementById('addCustomAchievement');
    const customAchievementModal = document.getElementById('addCustomAchievementModal');
    const closeCustomModalBtn = document.getElementById('closeCustomAchievementModalBtn');
    const customAchievementForm = document.getElementById('customAchievementForm');
    const darkModeToggle = document.getElementById('darkModeToggle'); // Botón para cambiar tema

    // --- CLAVES LOCALSTORAGE ---
    // Defino constantes para las claves de localStorage para evitar errores de tipeo y facilitar cambios.
    const LS_USER_XP = 'diarioQuestUserXP';
    const LS_ACHIEVEMENTS_STATUS = 'diarioQuestAchievementsStatus'; // Para predefinidos
    const LS_CUSTOM_ACHIEVEMENTS = 'diarioQuestCustomAchievements';
    const LS_COMPLETED_GOALS_COUNT = 'diarioQuestCompletedGoalsCount'; // Contador de metas completadas, se actualiza desde metas.js
    const LS_THEME = 'diarioQuestTheme'; // Para el tema claro/oscuro
    const LS_JOURNAL_STREAK_DAYS = 'diarioQuestJournalStreakDays'; // Contador de días de racha escribiendo en el diario

    // --- CONFIGURACIÓN DE LOGROS PREDEFINIDOS ---
    // Objeto que contiene la configuración de cada logro predefinido.
    // Cada logro tiene un ID único, nombre, descripción, una función para verificar sus requisitos, XP otorgado,
    // la ruta a su insignia desbloqueada y el texto de su recompensa.
    const PREDEFINED_ACHIEVEMENTS_CONFIG = {
        "novice_level": {
            name: "Nivel Novato",
            descriptionHTML: "Desbloquea tu potencial inicial.",
            requirementsFn: (stats) => stats.completedGoalsCount >= 1,
            xp: 10,
            badgeUnlocked: "badgeslevel1.png",
            rewardsTextHTML: "+10 XP, Insignia \"Iniciado\"."
        },
        "goal_master": {
            name: "Maestro de Metas",
            descriptionHTML: "Conquista tus objetivos uno por uno.",
            requirementsFn: (stats) => stats.completedGoalsCount >= 10,
            xp: 100,
            badgeUnlocked: "goal_master_badge.png",
            rewardsTextHTML: "+100 XP, Insignia \"Estratega\"."
        },
        "consistent_writer": {
            name: "Escritor Constante",
            descriptionHTML: "La constancia es clave para el autoconocimiento.",
            requirementsFn: (stats) => stats.journalStreakDays >= 7,
            xp: 50,
            badgeUnlocked: "writer_streak_badge.png",
            rewardsTextHTML: "+50 XP, Desbloquea el tema \"Serenidad Nocturna\" para el diario."
        },
        "quest_legend": {
            name: "Leyenda del Quest",
            descriptionHTML: "Has alcanzado la cima de la superación personal.",
            requirementsFn: (stats) => stats.completedGoalsCount >= 50,
            xp: 500,
            badgeUnlocked: "legend_badge.png",
            rewardsTextHTML: "+500 XP, Insignia \"Héroe del Diario\", Acceso prioritario a nuevas funciones."
        }
    };
    const DEFAULT_LOCKED_BADGE = "badgeslock.png";

    // --- ESTADO INICIAL ---
    // Carga el XP del usuario, el estado de los logros predefinidos y los logros personalizados desde localStorage.
    // Si no hay datos guardados, se inicializan con valores por defecto (0 XP, objeto vacío, array vacío).
    let userXP = parseInt(localStorage.getItem(LS_USER_XP)) || 0;
    let achievementsStatus = JSON.parse(localStorage.getItem(LS_ACHIEVEMENTS_STATUS)) || {};
    let customAchievements = JSON.parse(localStorage.getItem(LS_CUSTOM_ACHIEVEMENTS)) || [];

    // --- FUNCIONES AUXILIARES ---
    // Guarda el XP actual del usuario en localStorage.
    function saveUserXP() {
        localStorage.setItem(LS_USER_XP, userXP.toString());
        // Podría añadir aquí una actualización visual del XP en la UI si fuera necesario.
        console.log(`XP Total: ${userXP}`);
    }

    // Guarda el estado (bloqueado/desbloqueado, XP otorgado) de los logros predefinidos.
    function saveAchievementsStatus() {
        localStorage.setItem(LS_ACHIEVEMENTS_STATUS, JSON.stringify(achievementsStatus));
    }

    // Guarda la lista de logros personalizados creados por el usuario.
    function saveCustomAchievements() {
        localStorage.setItem(LS_CUSTOM_ACHIEVEMENTS, JSON.stringify(customAchievements));
    }

    // Obtiene estadísticas relevantes del usuario desde localStorage para verificar requisitos de logros.
    function getUserStats() {
        const completedGoalsCount = parseInt(localStorage.getItem(LS_COMPLETED_GOALS_COUNT)) || 0;
        const journalStreakDays = parseInt(localStorage.getItem(LS_JOURNAL_STREAK_DAYS)) || 0;
        // Puedes añadir más estadísticas aquí según necesites
        return { completedGoalsCount, journalStreakDays };
    }

    // --- RENDERIZADO DE LOGROS ---
    // Actualiza la visualización de los logros predefinidos en el HTML.
    function renderPredefinedAchievements() {
        // Selecciona todas las tarjetas de logros predefinidos que tienen 'data-achievement-id'.
        const predefinedCards = achievementCardsContainer.querySelectorAll('.achievement-card[data-achievement-id]');
        predefinedCards.forEach(card => {
            const id = card.dataset.achievementId;
            const config = PREDEFINED_ACHIEVEMENTS_CONFIG[id];
            if (!config) return; // Si no hay configuración para este ID, no hace nada.

            // Obtiene el estado actual del logro (o crea uno por defecto si no existe).
            const status = achievementsStatus[id] || { unlocked: false, xp_awarded: false };

            // Selecciona los elementos internos de la tarjeta para actualizarlos.
            const visualDiv = card.querySelector('.achievement-visual');
            const img = visualDiv.querySelector('img');
            const titleH3 = card.querySelector('.achievement-info h3');
            const descriptionP = card.querySelector('.achievement-info .achievement-description'); // Clase específica para descripción
            const rewardsP = card.querySelector('.achievement-rewards p');

            titleH3.textContent = config.name;
            descriptionP.innerHTML = config.descriptionHTML; // Usar innerHTML si la descripción tiene formato
            rewardsP.innerHTML = config.rewardsTextHTML; // Usar innerHTML si las recompensas tienen formato

            if (status.unlocked) {
                // Si el logro está desbloqueado, actualiza clases e imagen.
                card.classList.remove('locked');
                card.classList.add('unlocked');
                img.src = config.badgeUnlocked;
                img.alt = `Insignia de ${config.name}`;
            } else {
                // Si está bloqueado, muestra la imagen de candado.
                card.classList.remove('unlocked');
                card.classList.add('locked');
                img.src = DEFAULT_LOCKED_BADGE;
                img.alt = "Insignia bloqueada";
            }
        });
    }

    // Actualiza la visualización de los logros personalizados en el HTML.
    function renderCustomAchievements() {
        customAchievementsList.innerHTML = ''; // Limpiar lista actual
        customAchievements.forEach(ach => {
            // Crea un nuevo elemento 'li' para cada logro personalizado.
            const li = document.createElement('li');
            li.classList.add('achievement-card');
            li.dataset.achievementId = ach.id;

            // Aplica la clase 'unlocked' o 'locked' según corresponda.
            if (ach.unlocked) {
                li.classList.add('unlocked');
            } else {
                li.classList.add('locked');
            }

            // Determinar la imagen y el texto alternativo a mostrar
            let imgSrc, imgAlt;
            if (ach.unlocked) {
                imgSrc = "check.png"; // Imagen de check para logros personalizados completados
                imgAlt = `Logro completado: ${ach.title}`;
            } else {
                imgSrc = DEFAULT_LOCKED_BADGE; // Imagen de candado para logros no completados
                imgAlt = "Insignia bloqueada";
            }

            // Construye el HTML interno de la tarjeta del logro personalizado.
            li.innerHTML = `
                <div class="achievement-visual">
                    <img src="${imgSrc}" alt="${imgAlt}">
                </div>
                <div class="achievement-info">
                    <h3>${ach.title}</h3>
                    <p class="achievement-description">${ach.description}</p>
                    <div class="achievement-requirements">
                        <h4>Requisitos:</h4>
                        <p>${ach.requirementsText || 'Definido por el usuario.'}</p>
                    </div>
                    <div class="achievement-rewards">
                        <h4>Recompensa:</h4>
                        <p>${ach.rewardsText || '¡Satisfacción personal!'}${ach.xp > 0 ? ` (+${ach.xp} XP)` : ''}</p>
                    </div>
                </div>
                
                ${!ach.unlocked ? '<button class="btn btn-sm btn-unlock-custom" data-id="' + ach.id + '">Marcar como Cumplido</button>' : ''}
            `;
            customAchievementsList.appendChild(li);
        });
        addUnlockCustomListeners(); // Vuelve a añadir listeners a los botones de los logros personalizados.
    }
    
    // Añade event listeners a los botones "Marcar como Cumplido" de los logros personalizados.
    // Se llama después de cada renderizado de logros personalizados.
    function addUnlockCustomListeners() {
        document.querySelectorAll('.btn-unlock-custom').forEach(button => {
            button.addEventListener('click', function() {
                const achId = this.dataset.id;
                unlockCustomAchievement(achId);
            });
        });
    }

    // Función para desbloquear un logro personalizado.
    function unlockCustomAchievement(achId) {
        const achIndex = customAchievements.findIndex(a => a.id === achId);
        // Verifica que el logro exista y no esté ya desbloqueado.
        if (achIndex > -1 && !customAchievements[achIndex].unlocked) {
            customAchievements[achIndex].unlocked = true;
            // Otorga XP si no se ha hecho antes para este logro.
            if (!customAchievements[achIndex].xp_awarded) {
                userXP += parseInt(customAchievements[achIndex].xp) || 0;
                customAchievements[achIndex].xp_awarded = true;
                saveUserXP();
            }
            saveCustomAchievements();
            renderCustomAchievements(); // Re-render para actualizar la UI
            // No es necesario renderPredefinedAchievements aquí a menos que un logro personalizado afecte a uno predefinido.
            // checkAndUnlockAllAchievements(); // Podría ser útil si desbloquear uno personalizado puede desencadenar otros.
        }
    }


    // --- LÓGICA DE DESBLOQUEO ---
    // Función genérica para desbloquear un logro predefinido.
    function unlockAchievement(id, xpAmount) {
        // Inicializa el estado del logro si no existe.
        if (!achievementsStatus[id]) {
            achievementsStatus[id] = { unlocked: false, xp_awarded: false };
        }

        if (!achievementsStatus[id].unlocked) {
            achievementsStatus[id].unlocked = true; // Marca como desbloqueado.
            console.log(`Logro "${PREDEFINED_ACHIEVEMENTS_CONFIG[id]?.name || id}" desbloqueado!`);

            // Otorgar XP solo si no se ha otorgado antes para este logro
            if (!achievementsStatus[id].xp_awarded) {
                userXP += xpAmount;
                achievementsStatus[id].xp_awarded = true;
                saveUserXP();
            }
            saveAchievementsStatus();

            // Actualiza la UI para este logro específico (cambia imagen y clases).
            const card = achievementCardsContainer.querySelector(`.achievement-card[data-achievement-id="${id}"]`);
            if (card && PREDEFINED_ACHIEVEMENTS_CONFIG[id]) {
                card.classList.remove('locked');
                card.classList.add('unlocked');
                const img = card.querySelector('.achievement-visual img');
                img.src = PREDEFINED_ACHIEVEMENTS_CONFIG[id].badgeUnlocked;
                img.alt = `Insignia de ${PREDEFINED_ACHIEVEMENTS_CONFIG[id].name}`;
            }
            // Aquí se podrían añadir notificaciones visuales más elaboradas.
        }
    }

    // Verifica todos los logros predefinidos para ver si alguno cumple sus requisitos y debe desbloquearse.
    function checkAndUnlockAllAchievements() {
        const stats = getUserStats(); // Obtiene las estadísticas actuales del usuario.

        // Verificar logros predefinidos
        for (const id in PREDEFINED_ACHIEVEMENTS_CONFIG) {
            const config = PREDEFINED_ACHIEVEMENTS_CONFIG[id];
            const status = achievementsStatus[id] || { unlocked: false, xp_awarded: false };

            // Si el logro no está desbloqueado y su función de requisitos devuelve true...
            if (!status.unlocked && config.requirementsFn(stats)) {
                unlockAchievement(id, config.xp); // ...desbloquéalo.
            }
        }
        // Los logros personalizados se desbloquean manualmente a través de su botón.
        renderCustomAchievements(); // Asegura que los botones de desbloqueo manual se actualicen
    }

    // --- GESTIÓN DE LOGROS PERSONALIZADOS (MODAL) ---
    // Muestra el modal para añadir un logro personalizado.
    if (addCustomAchievementBtn) {
        addCustomAchievementBtn.addEventListener('click', () => {
            customAchievementModal.classList.add('active'); // Usa clase para transiciones CSS.
            customAchievementForm.reset(); // Limpiar formulario
        });
    }

    // Cierra el modal al hacer clic en el botón de cerrar (X).
    if (closeCustomModalBtn) {
        closeCustomModalBtn.addEventListener('click', () => {
            customAchievementModal.classList.remove('active');
        });
    }

    // Cierra el modal si se hace clic fuera de su contenido (en el fondo oscuro).
    window.addEventListener('click', (event) => {
        if (event.target === customAchievementModal) {
            customAchievementModal.classList.remove('active');
        }
    });

    // Maneja el envío del formulario para crear un nuevo logro personalizado.
    if (customAchievementForm) {
        customAchievementForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const title = document.getElementById('customAchTitle').value.trim();
            const description = document.getElementById('customAchDesc').value.trim();
            const requirementsText = document.getElementById('customAchReq').value.trim();
            const rewardsText = document.getElementById('customAchRew').value.trim();
            const imageFile = document.getElementById('customAchImgFile').files[0]; // Obtener el archivo de imagen
            const xp = parseInt(document.getElementById('customAchXP').value) || 0;

            // El título y la descripción son obligatorios.
            if (title && description) {
                const createAchievement = (badgeImageData) => {
                    const newCustomAchievement = {
                        id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                        title,
                        description,
                        requirementsText,
                        rewardsText,
                        xp,
                        unlocked: false,
                        xp_awarded: false,
                        // Usa la imagen cargada o la por defecto si no se seleccionó ninguna o hubo error.
                        badgeImg: badgeImageData || "custom_badge_default.png"
                    };
                    customAchievements.push(newCustomAchievement);
                    saveCustomAchievements();
                    renderCustomAchievements();
                    customAchievementModal.classList.remove('active');
                    customAchievementForm.reset(); // Limpiar formulario después de guardar
                    document.getElementById('customAchImgFile').value = ''; // Limpiar el input de archivo
                };

                if (imageFile) {
                    // Si el usuario seleccionó un archivo de imagen
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        // Cuando el archivo se haya leído, e.target.result contendrá la Data URL (Base64)
                        createAchievement(e.target.result);
                    };
                    reader.onerror = function() {
                        console.error("Error al leer el archivo de imagen.");
                        alert("Hubo un error al cargar la imagen. Se usará la insignia por defecto.");
                        createAchievement(null); // Usar insignia por defecto en caso de error
                    };
                    reader.readAsDataURL(imageFile); // Inicia la lectura del archivo como Data URL
                } else {
                    // Si no se seleccionó imagen, crea el logro con la insignia por defecto
                    createAchievement(null);
                }
            } else {
                alert('El título y la descripción son obligatorios para el logro personalizado.');
            }
        });
    }
    // --- MANEJO DEL MODO OSCURO ---
    // Aplica el tema (claro/oscuro) al body y actualiza el texto del botón.
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark');
            if(darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // Icono de sol
        } else {
            document.body.classList.remove('dark');
            if(darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>'; // Icono de luna
        }
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            let currentTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
            localStorage.setItem(LS_THEME, currentTheme);
            applyTheme(currentTheme);
        });
    }
    
    // --- INICIALIZACIÓN ---
    // Función que se ejecuta al cargar la página.
    function init() {
        // Aplica el tema guardado en localStorage o el tema claro por defecto.
        const savedTheme = localStorage.getItem(LS_THEME) || 'light'; // 'light' por defecto
        applyTheme(savedTheme);

        renderPredefinedAchievements(); // Dibuja los logros predefinidos.
        renderCustomAchievements();
        checkAndUnlockAllAchievements(); // Comprueba si algún logro debe desbloquearse al cargar.
        console.log("Logros inicializados. XP Actual:", userXP);
        console.log("Tema actual:", savedTheme);
        console.log("Estadísticas actuales (simuladas/cargadas):", getUserStats());
    }

    init();

    // --- SIMULACIÓN DE PROGRESO (PARA PRUEBAS) ---
    // Estas funciones se exponen globalmente (window.SIM_...) para poder llamarlas desde la consola del navegador
    // y así simular el progreso del usuario para probar el desbloqueo de logros.
    window.SIM_completeGoal = () => {
        let count = parseInt(localStorage.getItem(LS_COMPLETED_GOALS_COUNT)) || 0;
        count++;
        localStorage.setItem(LS_COMPLETED_GOALS_COUNT, count.toString());
        console.log(`Meta completada. Total: ${count}`);
        checkAndUnlockAllAchievements();
        renderPredefinedAchievements(); // Re-render para reflejar cambios si un logro se desbloquea
    };

    window.SIM_increaseJournalStreak = () => {
        let streak = parseInt(localStorage.getItem(LS_JOURNAL_STREAK_DAYS)) || 0;
        streak++;
        localStorage.setItem(LS_JOURNAL_STREAK_DAYS, streak.toString());
        console.log(`Racha de diario aumentada. Días: ${streak}`);
        checkAndUnlockAllAchievements();
        renderPredefinedAchievements();
    };

    // Resetea todo el progreso de logros, XP y estadísticas simuladas.
    window.SIM_resetAchievementsProgress = () => {
        localStorage.removeItem(LS_USER_XP);
        localStorage.removeItem(LS_ACHIEVEMENTS_STATUS);
        localStorage.removeItem(LS_CUSTOM_ACHIEVEMENTS);
        localStorage.removeItem(LS_COMPLETED_GOALS_COUNT);
        // localStorage.removeItem(LS_THEME); // Opcional: resetear tema también
        localStorage.removeItem(LS_JOURNAL_STREAK_DAYS);
        userXP = 0;
        achievementsStatus = {};
        customAchievements = [];
        console.log("Progreso de logros y XP reseteado.");
        init(); // Re-inicializar para reflejar el reseteo en la UI
    };
    
    console.log("Para simular progreso, usa en la consola: SIM_completeGoal(), SIM_increaseJournalStreak(), o SIM_resetAchievementsProgress()");

});
