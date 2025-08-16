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
        $miei_voli = $_GET['miei'] ?? false;

        // Join con modelli per ottenere informazioni sul modello
        if ($miei_voli) {
            $stmt = $pdo->prepare("
                SELECT v.*, p.nome, p.cognome, m.nome AS modello_nome, m.tipo AS modello_tipo, m.apertura_alare, m.peso_decollo
                FROM voli v
                JOIN piloti p ON v.pilota_id = p.id
                LEFT JOIN modelli m ON v.model_id = m.id
                WHERE v.pilota_id = ?
                ORDER BY v.ora_inizio DESC
            ");
            $stmt->execute([$user['user_id']]);
        } else {
            $stmt = $pdo->prepare("
                SELECT v.*, p.nome, p.cognome, m.nome AS modello_nome, m.tipo AS modello_tipo, m.apertura_alare, m.peso_decollo
                FROM voli v
                JOIN piloti p ON v.pilota_id = p.id
                LEFT JOIN modelli m ON v.model_id = m.id
                ORDER BY v.ora_inizio DESC
            ");
            $stmt->execute();
        }

        $voli = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($voli);
        break;
        
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Ora richiediamo model_id invece di tipo_aereo libero
        $model_id = isset($input['model_id']) ? intval($input['model_id']) : 0;
        $ora_inizio = $input['ora_inizio'] ?? '';
        $durata = $input['durata'] ?? 0;
        $note = $input['note'] ?? '';
        
        if ($model_id <= 0 || empty($ora_inizio) || $durata <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Dati mancanti o non validi']);
            exit;
        }
        
        // Verifica che il modello esista e appartenga al pilota (o sia pubblico) - per ora controllo appartenenza
        $stmt = $pdo->prepare("SELECT id FROM modelli WHERE id = ? AND pilota_id = ?");
        $stmt->execute([$model_id, $user['user_id']]);
        if (!$stmt->fetch(PDO::FETCH_ASSOC)) {
            http_response_code(404);
            echo json_encode(['error' => 'Modello non trovato o non di tua proprietà']);
            exit;
        }

        $stmt = $pdo->prepare("
            INSERT INTO voli (pilota_id, model_id, ora_inizio, durata, note) 
            VALUES (?, ?, ?, ?, ?)
        ");

        if ($stmt->execute([$user['user_id'], $model_id, $ora_inizio, $durata, $note])) {
            $voloId = $pdo->lastInsertId();
            
            $stmt = $pdo->prepare("
                SELECT v.*, p.nome, p.cognome 
                FROM voli v 
                JOIN piloti p ON v.pilota_id = p.id 
                WHERE v.id = ?
            ");
            $stmt->execute([$voloId]);
            $volo = $stmt->fetch(PDO::FETCH_ASSOC);
            
            http_response_code(201);
            echo json_encode(['success' => true, 'volo' => $volo]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Errore durante la registrazione del volo']);
        }
        break;
        
    case 'DELETE':
        // Supporta: DELETE /voli.php?id=123
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'ID volo non valido']);
            exit;
        }

        // Verifica che il volo esista e appartenga all'utente autenticato
        $stmt = $pdo->prepare("SELECT pilota_id FROM voli WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'Volo non trovato']);
            exit;
        }

        if ($row['pilota_id'] != $user['user_id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Non autorizzato a eliminare questo volo']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM voli WHERE id = ?");
        if ($stmt->execute([$id])) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Errore durante la cancellazione del volo']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Metodo non consentito']);
        break;
}
?>