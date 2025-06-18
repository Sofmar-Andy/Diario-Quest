// init-db.js
const pool = require('./db');

(async () => {
    try {
    // Usuarios
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE,
        password VARCHAR(255) NOT NULL,
        avatar TEXT,
        xp INT DEFAULT 0,
        level INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Metas
    await pool.query(`
        CREATE TABLE IF NOT EXISTS metas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(200),
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        xp_reward INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);

    // Entradas de diario
    await pool.query(`
        CREATE TABLE IF NOT EXISTS diario (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(200),
        content TEXT,
        tags VARCHAR(200),
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);

    // Logros
    await pool.query(`
        CREATE TABLE IF NOT EXISTS logros (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        key_name VARCHAR(100),
        unlocked_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);

    console.log('Tablas creadas correctamente.');
    process.exit(0);
    } catch (err) {
    console.error('Error al inicializar la BD:', err);
    process.exit(1);
    }
})();
