// public/index.js
// Este archivo es script de Node.js para interactuar con una base de datos SQLite.
// No es un script que se ejecute en el navegador como los otros archivos JS del proyecto (login.js, diario.js, etc.).
// Se utiliza para configurar y realizar operaciones básicas en una base de datos local.

// Importa el módulo 'sqlite3'. El '.verbose()' habilita mensajes de error más detallados.
const sqlite3 = require('sqlite3').verbose();

// Abre (o crea si no existe) una base de datos llamada 'mydatabase.db' en el mismo directorio que este script.
// El callback (err) => { ... } se ejecuta una vez que la conexión se establece o falla.
const db = new sqlite3.Database('./mydatabase.db', (err) => {
    if (err) {
        // Si hay un error al abrir/crear la base de datos, lo muestra en la consola.
        console.error("Error al abrir la base de datos:", err.message);
        return; // Termina la ejecución de esta función de callback si hay error.
    }
    // Si la conexión es exitosa, lo indica en la consola.
    console.log('Conectado a la base de datos SQLite (mydatabase.db).');
});

// db.serialize() asegura que las operaciones dentro de su callback se ejecuten en orden (secuencialmente).
// Esto es útil para operaciones que dependen de que la anterior haya terminado, como crear una tabla antes de insertar datos.
db.serialize(() => {
    // Comando SQL para crear una tabla llamada 'users' si aún no existe.
    // La tabla tendrá dos columnas:
    // - id: Un entero, clave primaria, que se autoincrementa.
    // - name: Un texto, que no puede ser nulo (NOT NULL).
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)", (err) => {
        if (err) {
            // Si hay un error al crear la tabla, lo muestra en consola.
            return console.error("Error al crear la tabla 'users':", err.message);
        }
        // Si la tabla se verifica o crea correctamente, lo indica.
        console.log("Tabla 'users' verificada/creada correctamente.");

        // Define una función para listar todos los usuarios y luego cerrar la conexión a la base de datos.
        // Esta función se llamará después de intentar la inserción o verificar la existencia de un usuario.
        const listUsersAndCloseDB = () => {
            console.log("Usuarios actuales en la base de datos:");
            // db.each() ejecuta una consulta SQL y llama a un callback por cada fila encontrada.
            // "SELECT id, name FROM users" selecciona las columnas id y name de todas las filas en la tabla 'users'.
            db.each("SELECT id, name FROM users", (err, row) => {
                if (err) {
                    // Si hay un error durante la consulta de una fila.
                    console.error("Error al consultar 'users':", err.message);
                    return;
                }
                // Muestra la información de cada usuario encontrado.
                console.log(`ID: ${row.id}\t Nombre: ${row.name}`);
            }, (err, count) => { // Este segundo callback de db.each() se ejecuta después de procesar todas las filas (o si hay un error).
                if (err) {
                    // Si hay un error al finalizar la consulta.
                    console.error("Error finalizando la consulta de usuarios:", err.message);
                }
                // Muestra cuántos usuarios se encontraron en total.
                console.log(`Se encontraron ${count} usuarios.`);
                
                // Cierra la conexión a la base de datos.
                db.close((err) => {
                    if (err) {
                        // Si hay un error al cerrar la base de datos.
                        console.error("Error al cerrar la base de datos:", err.message);
                    }
                    // Indica que la conexión se ha cerrado.
                    console.log('Cerrada la conexión a la base de datos.');
                });
            });
        };

        // Ejemplo de cómo verificar si un usuario existe y, si no, insertarlo.
        const exampleUserName = 'Usuario Ejemplo';
        // db.get() ejecuta una consulta SQL y espera encontrar como máximo una fila.
        // "SELECT name FROM users WHERE name = ?" busca un usuario por su nombre.
        // El '?' es un placeholder que se reemplaza por el valor en el array [exampleUserName].
        db.get("SELECT name FROM users WHERE name = ?", [exampleUserName], (err, row) => {
            if (err) {
                // Si hay un error al buscar el usuario.
                console.error("Error al buscar usuario:", err.message);
                listUsersAndCloseDB(); // Intenta listar y cerrar la BD incluso si hay error aquí.
                return;
            }
            if (!row) { // Si 'row' es undefined, significa que no se encontró el usuario.
                // Inserta el nuevo usuario.
                // "INSERT INTO users(name) VALUES(?)" inserta una nueva fila en la tabla 'users'.
                // 'this.lastID' dentro del callback de db.run() (cuando se usa una función normal, no arrow function)
                // contiene el ID de la última fila insertada.
                db.run(`INSERT INTO users(name) VALUES(?)`, [exampleUserName], function(err) {
                    if (err) {
                        console.error("Error al insertar en 'users':", err.message);
                    } else {
                        console.log(`Un nuevo usuario '${exampleUserName}' ha sido insertado con el ID ${this.lastID}`);
                    }
                    listUsersAndCloseDB(); // Llama a la función para listar usuarios y cerrar la BD.
                });
            } else { // Si 'row' tiene un valor, el usuario ya existe.
                console.log(`El usuario '${exampleUserName}' ya existe.`);
                listUsersAndCloseDB(); // Llama a la función para listar usuarios y cerrar la BD.
            }
        });
    });
});
