<?php
require_once 'config.php';

$user = getAuthUser();
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Token non valido']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

switch ($method) {
    case 'GET':
        // Se ?miei=true ritorna solo i modelli dell'utente
        $miei = isset($_GET['miei']) && $_GET['miei'] == 'true';
        if ($miei) {
            $stmt = $pdo->prepare("SELECT * FROM modelli WHERE pilota_id = ? ORDER BY created_at DESC");
            $stmt->execute([$user['user_id']]);
        } else {
            $stmt = $pdo->prepare("SELECT m.*, p.nome as pilota_nome, p.cognome as pilota_cognome FROM modelli m JOIN piloti p ON m.pilota_id = p.id ORDER BY m.created_at DESC");
            $stmt->execute();
        }
        $models = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($models);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $tipo = trim($input['tipo'] ?? '');
        $apertura = trim($input['apertura_alare'] ?? '');
        $peso = trim($input['peso_decollo'] ?? '');
        $nome = trim($input['nome'] ?? '');

        if (empty($tipo) || empty($nome)) {
            http_response_code(400);
            echo json_encode(['error' => 'Tipo e Nome sono obbligatori']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO modelli (pilota_id, tipo, apertura_alare, peso_decollo, nome) VALUES (?, ?, ?, ?, ?)");
        if ($stmt->execute([$user['user_id'], $tipo, $apertura, $peso, $nome])) {
            $id = $pdo->lastInsertId();
            $stmt = $pdo->prepare("SELECT * FROM modelli WHERE id = ?");
            $stmt->execute([$id]);
            $model = $stmt->fetch(PDO::FETCH_ASSOC);
            http_response_code(201);
            echo json_encode(['success' => true, 'model' => $model]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Errore durante la creazione del modello']);
        }
        break;

    case 'PUT':
        // Aggiorna modello: PUT /modelli.php?id=123
        parse_str(file_get_contents('php://input'), $putVars);
        $input = json_decode(file_get_contents('php://input'), true);
        // supporta sia JSON che urlencoded fallback
        if (!$input) $input = $putVars;

        $id = isset($_GET['id']) ? intval($_GET['id']) : (isset($input['id']) ? intval($input['id']) : 0);
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'ID modello non valido']);
            exit;
        }

        $tipo = trim($input['tipo'] ?? '');
        $apertura = trim($input['apertura_alare'] ?? '');
        $peso = trim($input['peso_decollo'] ?? '');
        $nome = trim($input['nome'] ?? '');

        // Controlla esistenza e proprietà
        $stmt = $pdo->prepare("SELECT pilota_id FROM modelli WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'Modello non trovato']);
            exit;
        }
        if ($row['pilota_id'] != $user['user_id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Non autorizzato']);
            exit;
        }

        if (empty($tipo) || empty($nome)) {
            http_response_code(400);
            echo json_encode(['error' => 'Tipo e Nome sono obbligatori']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE modelli SET tipo = ?, apertura_alare = ?, peso_decollo = ?, nome = ? WHERE id = ?");
        if ($stmt->execute([$tipo, $apertura, $peso, $nome, $id])) {
            $stmt = $pdo->prepare("SELECT * FROM modelli WHERE id = ?");
            $stmt->execute([$id]);
            $model = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'model' => $model]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Errore durante l\'aggiornamento']);
        }
        break;

    case 'DELETE':
        // DELETE /modelli.php?id=123
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'ID modello non valido']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT pilota_id FROM modelli WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'Modello non trovato']);
            exit;
        }
        if ($row['pilota_id'] != $user['user_id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Non autorizzato']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM modelli WHERE id = ?");
        if ($stmt->execute([$id])) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Errore durante la cancellazione']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Metodo non consentito']);
        break;
}
?>
