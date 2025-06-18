<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$conexion = new mysqli("localhost", "root", "tu_contrasena", "diario_quest");

if ($conexion->connect_error) {
    die("Conexión fallida: " . $conexion->connect_error);
}

// Aquí va el resto del código para registrar al usuario, actualizar perfiles, etc.
?>

<?php
$conexion = new mysqli("localhost", "root", "tu_contrasena", "diario_quest");

$nombre = $_POST['nombre'];
$email = $_POST['email'];
$contrasena = hash('sha256', $_POST['contrasena']); // Encriptar contraseña

$sql = "INSERT INTO usuarios (nombre, email, contrasena) VALUES ('$nombre', '$email', '$contrasena')";
if ($conexion->query($sql) === TRUE) {
    echo "Usuario registrado con éxito";
} else {
    echo "Error: " . $conexion->error;
}

$conexion->close();
?>

<?php
$conexion = new mysqli("localhost", "root", "tu_contrasena", "diario_quest");

// ID del usuario que completó la meta
$usuario_id = $_POST['usuario_id'];

$sql = "UPDATE perfiles SET xp_total = xp_total + 10, metas_completadas = metas_completadas + 1 WHERE usuario_id = $usuario_id";
$conexion->query($sql);

$sql_nivel = "UPDATE perfiles SET nivel = CASE  
    WHEN xp_total >= 100 THEN 2  
    WHEN xp_total >= 200 THEN 3  
    WHEN xp_total >= 500 THEN 4  
    ELSE nivel  
END WHERE usuario_id = $usuario_id";
$conexion->query($sql_nivel);

echo "Perfil actualizado con éxito!";
?>
<?php
$conexion = new mysqli("localhost", "root", "tu_contrasena", "diario_quest");

// ID de la meta completada
$meta_id = $_POST['meta_id'];

// Insertar logro
$sql_logro = "INSERT INTO logros (usuario_id, titulo, descripcion) 
SELECT usuario_id, 'Meta completada', '¡Felicidades! Has alcanzado una meta.' FROM metas WHERE id = $meta_id";
$conexion->query($sql_logro);

// Actualizar perfil
$sql_perfil = "UPDATE perfiles SET xp_total = xp_total + 10, metas_completadas = metas_completadas + 1, logros_desbloqueados = logros_desbloqueados + 1 WHERE usuario_id = (SELECT usuario_id FROM metas WHERE id = $meta_id)";
$conexion->query($sql_perfil);

echo "Logro asignado y perfil actualizado.";
?>

