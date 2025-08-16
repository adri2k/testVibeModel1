<?php
require_once 'config.php';

echo json_encode([
    'message' => 'AeromodellismoFano API',
    'version' => '1.0.0',
    'endpoints' => [
        'POST /auth.php' => 'Login',
        'GET /voli.php' => 'Lista tutti i voli',
        'GET /voli.php?miei=true' => 'Lista voli del pilota autenticato',
        'POST /voli.php' => 'Crea nuovo volo'
    ]
]);
?>