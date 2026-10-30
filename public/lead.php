<?php
/**
 * Script simples para registrar leads capturados pelo Lead Magnet em hospedagem PHP
 * Grava em leads.json na mesma pasta.
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$leadsFile = __DIR__ . '/leads.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($leadsFile)) {
        $leads = json_decode(file_get_contents($leadsFile), true);
        echo json_encode(['success' => true, 'leads' => is_array($leads) ? $leads : []]);
    } else {
        echo json_encode(['success' => true, 'leads' => []]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $lead = json_decode($raw, true);

    if (!$lead || empty($lead['name']) || empty($lead['email'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Nome e e-mail são obrigatórios']);
        exit;
    }

    $leads = [];
    if (file_exists($leadsFile)) {
        $existing = json_decode(file_get_contents($leadsFile), true);
        if (is_array($existing)) {
            $leads = $existing;
        }
    }

    $newLead = [
        'id' => isset($lead['id']) ? $lead['id'] : 'lead-' . time(),
        'name' => trim($lead['name']),
        'email' => trim($lead['email']),
        'phone' => isset($lead['phone']) ? trim($lead['phone']) : null,
        'createdAt' => isset($lead['createdAt']) ? $lead['createdAt'] : date('c'),
        'materialTitle' => isset($lead['materialTitle']) ? $lead['materialTitle'] : 'Guia do Investidor',
    ];

    array_unshift($leads, $newLead);

    file_put_contents($leadsFile, json_encode($leads, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    echo json_encode(['success' => true, 'count' => count($leads)]);
    exit;
}
