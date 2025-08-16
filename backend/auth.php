<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Username e password richiesti']);
        exit;
    }
    
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT * FROM piloti WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user && password_verify($password, $user['password'])) {
        $payload = [
            'user_id' => $user['id'],
            'username' => $user['username'],
            'nome' => $user['nome'],
            'cognome' => $user['cognome'],
            'exp' => time() + (24 * 60 * 60) // 24 ore
        ];
        
        $token = generateJWT($payload);
        
        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'nome' => $user['nome'],
                'cognome' => $user['cognome']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Credenziali non valide']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Metodo non consentito']);
}
?>