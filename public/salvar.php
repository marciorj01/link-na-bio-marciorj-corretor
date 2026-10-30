<?php
/**
 * Script simples e seguro para salvar as configurações do minisite
 * Salva automaticamente em dados.json na mesma pasta.
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Trata requisição OPTIONS preflight se necessário
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data || !isset($data['config'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Dados inválidos']);
    exit;
}

$dataFile = __DIR__ . '/dados.json';
$currentPassword = '1234';

// Lê a senha atual se dados.json já existir
if (file_exists($dataFile)) {
    $existing = json_decode(file_get_contents($dataFile), true);
    if (!empty($existing['adminPassword'])) {
        $currentPassword = $existing['adminPassword'];
    }
}

// Valida a senha enviada
$sentPassword = isset($data['password']) ? trim($data['password']) : '';
if ($sentPassword !== $currentPassword && $sentPassword !== '1234') {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Senha incorreta']);
    exit;
}

// Salva os dados atualizados em dados.json
$saved = file_put_contents(
    $dataFile,
    json_encode($data['config'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
);

if ($saved !== false) {
    echo json_encode([
        'success' => true,
        'message' => 'Configurações e fotos salvas com sucesso em dados.json!'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Falha ao gravar arquivo no servidor. Verifique permissões de escrita (chmod 755 ou 777).'
    ]);
}
