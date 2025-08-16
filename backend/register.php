<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Metodo non consentito']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$nome = trim($input['nome'] ?? '');
$telefono = trim($input['telefono'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (empty($nome) || empty($telefono) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Tutti i campi sono obbligatori']);
    exit;
}

// Divide nome in nome e cognome (se possibile)
$parts = preg_split('/\s+/', $nome);
$firstName = $parts[0] ?? '';
$lastName = isset($parts[1]) ? implode(' ', array_slice($parts, 1)) : '';

$pdo = getDB();

// Verifica se esiste già un utente con la stessa email o username
$stmt = $pdo->prepare("SELECT id FROM piloti WHERE username = ? OR email = ? LIMIT 1");
$usernameCandidate = strtolower(str_replace(' ', '', $email));
$stmt->execute([$usernameCandidate, $email]);
if ($stmt->fetch(PDO::FETCH_ASSOC)) {
    http_response_code(409);
    echo json_encode(['error' => 'Utente già registrato con questa email']);
    exit;
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("INSERT INTO piloti (username, password, nome, cognome, email, telefono) VALUES (?, ?, ?, ?, ?, ?)");
if ($stmt->execute([$usernameCandidate, $passwordHash, $firstName, $lastName, $email, $telefono])) {
    $id = $pdo->lastInsertId();
    $payload = [
        'user_id' => $id,
        'username' => $usernameCandidate,
        'nome' => $firstName,
        'cognome' => $lastName,
        'exp' => time() + (24 * 60 * 60)
    ];
    $token = generateJWT($payload);
    
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => $id,
            'username' => $usernameCandidate,
            'nome' => $firstName,
            'cognome' => $lastName,
            'email' => $email,
            'telefono' => $telefono
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Errore durante la registrazione']);
}

?>
