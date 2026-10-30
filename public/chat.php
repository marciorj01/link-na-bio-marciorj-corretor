<?php
/**
 * chat.php - Endpoint PHP de Atendimento & Qualificação com Base de Conhecimento
 * Funciona de forma autônoma na hospedagem cPanel/Hostinger/Apache
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data || !isset($data['messages'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Mensagens não fornecidas']);
    exit;
}

$messages = $data['messages'];
$lastUserMessage = '';
foreach (array_reverse($messages) as $msg) {
    if (isset($msg['role']) && $msg['role'] === 'user') {
        $lastUserMessage = trim($msg['text'] ?? '');
        break;
    }
}

// 1. PRIORIDADE TOTAL: Checar se a pergunta corresponde à Base de Conhecimento cadastrada no painel
if (!empty($data['knowledgeBase']) && is_array($data['knowledgeBase']) && !empty($lastUserMessage)) {
    $normUser = mb_strtolower(preg_replace('/[^\p{L}\p{N}\s]/u', ' ', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $lastUserMessage)));
    $normUser = trim(preg_replace('/\s+/', ' ', $normUser));

    foreach ($data['knowledgeBase'] as $kb) {
        if (empty($kb['answer'])) continue;
        $rawQ = $kb['question'] ?? '';
        $normQ = mb_strtolower(preg_replace('/[^\p{L}\p{N}\s]/u', ' ', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $rawQ)));
        $normQ = trim(preg_replace('/\s+/', ' ', $normQ));

        if ($normUser === $normQ || (strlen($normQ) >= 4 && (strpos($normUser, $normQ) !== false || strpos($normQ, $normUser) !== false))) {
            echo json_encode([
                'reply' => trim($kb['answer']),
                'leadSummary' => $lastUserMessage,
                'matchedFromKnowledgeBase' => true
            ]);
            exit;
        }

        // Checar palavras-chave separadas por vírgula
        $keywords = preg_split('/[,;/|]+/', $rawQ);
        foreach ($keywords as $kw) {
            $normKw = mb_strtolower(preg_replace('/[^\p{L}\p{N}\s]/u', ' ', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $kw)));
            $normKw = trim(preg_replace('/\s+/', ' ', $normKw));
            if (strlen($normKw) >= 3 && strpos($normUser, $normKw) !== false) {
                echo json_encode([
                    'reply' => trim($kb['answer']),
                    'leadSummary' => $lastUserMessage,
                    'matchedFromKnowledgeBase' => true
                ]);
                exit;
            }
        }
    }
}

// Obter chave da API do Gemini se configurada em variável de ambiente do servidor PHP
$apiKey = getenv('GEMINI_API_KEY');

if (!empty($apiKey)) {
    $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . $apiKey;
    
    $promptContents = [];
    foreach ($messages as $m) {
        $promptContents[] = [
            'role' => ($m['role'] === 'user') ? 'user' : 'model',
            'parts' => [['text' => $m['text']]]
        ];
    }

    $systemInstruction = $data['systemInstruction'] ?? 'Você é o assistente virtual do corretor Márcio Rogério (CRECI-PR 59138). Tom profissional e consultivo. REGRA GEOGRÁFICA: JAMAIS diga que o corretor é exclusivo de Mandirituba e Curitiba; sua atuação é ampla e inclui São Paulo, Paraguai e mercado internacional na Flórida/Miami (EUA). Nunca invente imóveis ou preços. Responda em no máximo 2 a 3 frases e direcione para o WhatsApp.';

    $requestBody = [
        'systemInstruction' => [
            'parts' => [['text' => $systemInstruction]]
        ],
        'contents' => $promptContents,
        'generationConfig' => [
            'temperature' => 0.6,
            'maxOutputTokens' => 300
        ]
    ];

    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        $jsonResp = json_decode($response, true);
        $replyText = $jsonResp['candidates'][0]['content']['parts'][0]['text'] ?? null;
        if (!empty($replyText)) {
            echo json_encode([
                'reply' => trim($replyText),
                'leadSummary' => $lastUserMessage
            ]);
            exit;
        }
    }
}

// Resposta inteligente e elegante padrão para PHP offline
$defaultReplies = [
    'Excelente escolha! Temos soluções imobiliárias para o seu objetivo — do Sul do Brasil até São Paulo, Paraguai e Flórida/Miami (EUA). Toque no botão abaixo para conversar direto com o Márcio no WhatsApp.',
    'Perfeito! Com base no que você procura, consigo conectar você com oportunidades selecionadas. Para agendarmos uma visita ou simular valores exatos, toque no botão abaixo para falar com o Márcio.',
    'Entendido! Nosso atendimento de crédito e avaliação técnica é personalizado para garantir as menores taxas e total segurança. Toque no botão verde abaixo para continuarmos no WhatsApp oficial.'
];

$chosenReply = $defaultReplies[array_rand($defaultReplies)];

echo json_encode([
    'reply' => $chosenReply,
    'leadSummary' => $lastUserMessage
]);
