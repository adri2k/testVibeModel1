<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

define('DB_FILE', __DIR__ . '/aeromodellismo.db');
define('JWT_SECRET', 'aeromodellismo_fano_jwt_secret_2024');

function getDB() {
    try {
        $pdo = new PDO('sqlite:' . DB_FILE);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }
}

function initDB() {
    $pdo = getDB();
    
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS piloti (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            nome TEXT NOT NULL,
            cognome TEXT NOT NULL,
            email TEXT
        )
    ");
    // Assicura la presenza della colonna 'telefono' (per DB esistenti)
    try {
        $cols = $pdo->query("PRAGMA table_info(piloti)")->fetchAll(PDO::FETCH_ASSOC);
        $hasTelefono = false;
        foreach ($cols as $col) {
            if ($col['name'] === 'telefono') {
                $hasTelefono = true;
                break;
            }
        }

        if (!$hasTelefono) {
            $pdo->exec("ALTER TABLE piloti ADD COLUMN telefono TEXT");
        }
    } catch (PDOException $e) {
        // Se l'ALTER fallisce per qualsiasi ragione, non blocchiamo l'inizializzazione
    }
    
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS voli (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pilota_id INTEGER NOT NULL,
            tipo_aereo TEXT,
            model_id INTEGER,
            ora_inizio DATETIME NOT NULL,
            durata INTEGER NOT NULL,
            note TEXT,
            FOREIGN KEY (pilota_id) REFERENCES piloti (id)
        )
    ");

    // Tabella per i modelli di aeromodelli
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS modelli (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pilota_id INTEGER NOT NULL,
            tipo TEXT NOT NULL,
            apertura_alare TEXT,
            peso_decollo TEXT,
            nome TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (pilota_id) REFERENCES piloti (id)
        )
    ");

    // Se il DB esistente non ha la colonna model_id in voli, proviamo ad aggiungerla
    try {
        $cols = $pdo->query("PRAGMA table_info(voli)")->fetchAll(PDO::FETCH_ASSOC);
        $hasModelId = false;
        foreach ($cols as $col) {
            if ($col['name'] === 'model_id') {
                $hasModelId = true;
                break;
            }
        }
        if (!$hasModelId) {
            $pdo->exec("ALTER TABLE voli ADD COLUMN model_id INTEGER");
        }
    } catch (PDOException $e) {
        // ignore
    }
    
    // Crea pilota admin di default
    $passwordHash = password_hash('admin123', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT OR IGNORE INTO piloti (username, password, nome, cognome, email) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute(['admin', $passwordHash, 'Admin', 'Aeromodellismo', 'admin@aeromodellismofano.it']);
}

function generateJWT($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode($payload);
    
    $headerEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $payloadEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, JWT_SECRET, true);
    $signatureEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
}

function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) != 3) return false;
    
    $signature = hash_hmac('sha256', $parts[0] . "." . $parts[1], JWT_SECRET, true);
    $signatureEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    if ($signatureEncoded !== $parts[2]) return false;
    
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
    return $payload;
}

function getAuthUser() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (strpos($authHeader, 'Bearer ') !== 0) return null;
    
    $token = substr($authHeader, 7);
    return verifyJWT($token);
}

initDB();
?>