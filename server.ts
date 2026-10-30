import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Shared server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Chat endpoint powered by Gemini 3.8 Flash for qualifying leads with Knowledge Base priority
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, brokerInfo, promptInstruction, knowledgeBase, properties } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Mensagens não fornecidas.' });
    }

    const brokerName = brokerInfo?.name || 'Márcio Rogério';
    const brokerCreci = brokerInfo?.creci || 'CRECI-PR 59138';
    const brokerCity = brokerInfo?.city || 'Mandirituba, Curitiba e Região Metropolitana';
    const brokerPhone = brokerInfo?.phone || '5541999999999';

    // 1. PRIORIDADE TOTAL: Verificar se a última pergunta do usuário bate exatamente com a Base de Conhecimento
    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === 'user')?.text || '';

    if (Array.isArray(knowledgeBase) && knowledgeBase.length > 0 && lastUserMessage) {
      const normalize = (str: string) =>
        str
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s]/gi, ' ')
          .replace(/\s+/g, ' ')
          .trim();

      const normalizedUser = normalize(lastUserMessage);
      const userWords = new Set(normalizedUser.split(' ').filter((w: string) => w.length > 2));

      for (const item of knowledgeBase) {
        if (!item.answer || !item.answer.trim()) continue;

        const rawQ = item.question || '';
        const normalizedQ = normalize(rawQ);

        // Correspondência exata da pergunta
        if (normalizedUser === normalizedQ) {
          return res.json({ reply: item.answer.trim(), matchedFromKnowledgeBase: true });
        }

        // Substring direta
        if (
          normalizedQ.length >= 4 &&
          (normalizedUser.includes(normalizedQ) || normalizedQ.includes(normalizedUser))
        ) {
          return res.json({ reply: item.answer.trim(), matchedFromKnowledgeBase: true });
        }

        // Palavras-chave separadas por vírgula, ponto e vírgula ou barra
        const keywords = rawQ
          .split(/[,;/|]+/)
          .map((k: string) => normalize(k))
          .filter((k: string) => k.length >= 3);

        for (const kw of keywords) {
          if (kw.length >= 3 && normalizedUser.includes(kw)) {
            return res.json({ reply: item.answer.trim(), matchedFromKnowledgeBase: true });
          }

          const kwWords = kw.split(' ').filter((w: string) => w.length > 2);
          if (
            kwWords.length >= 2 &&
            kwWords.every((w: string) => userWords.has(w) || normalizedUser.includes(w))
          ) {
            return res.json({ reply: item.answer.trim(), matchedFromKnowledgeBase: true });
          }
        }
      }
    }

    // 2. Construção das instruções da IA com regras estritas de tom, geografia e limites
    const knowledgeBaseText = Array.isArray(knowledgeBase) && knowledgeBase.length > 0
      ? knowledgeBase
          .map((kb: any, i: number) => `[Item ${i + 1}] Pergunta/Tema: "${kb.question}"\nResposta Exata Obrigatória: "${kb.answer}"`)
          .join('\n\n')
      : 'Nenhum item adicional.';

    const propertiesText = Array.isArray(properties) && properties.length > 0
      ? properties
          .map((p: any) => `- ${p.title} (${p.neighborhood}) | Tipo: ${p.type} | Preço: ${p.price || 'Sob Consulta'}`)
          .join('\n')
      : 'Consultar opções disponíveis.';

    const systemInstruction = `
Você é o assistente virtual do corretor de imóveis ${brokerName} (${brokerCreci}). Tom profissional, refinado e consultivo em português.

1. REGRA GEOGRÁFICA OBRIGATÓRIA (CRÍTICA):
JAMAIS diga ou insinue que o corretor Márcio Rogério é exclusivo de Mandirituba e Curitiba.
Sua área de atuação é ampla e sem barreiras:
- Foco regional e forte atuação: Mandirituba, Curitiba e Região Metropolitana.
- Soluções de compra, venda e investimento consolidadas: São Paulo, Paraguai e mercado internacional na Flórida/Miami (EUA), além de outras regiões.
- Trate sempre com naturalidade e capacidade de atendimento oportunidades nessas regiões e além.

2. BASE DE CONHECIMENTO REGISTRADA (PRIORIDADE TOTAL):
Abaixo estão as respostas oficiais cadastradas pelo corretor no painel. Se a pergunta do cliente abordar qualquer um desses assuntos, use EXATAMENTE o conteúdo dessas respostas, sem alterar o sentido nem contradizer:
${knowledgeBaseText}

3. IMÓVEIS REAIS CADASTRADOS (GROUNDING):
${propertiesText}
NUNCA invente imóveis, preços, metragens ou condições. Só cite imóveis e detalhes que constam na lista acima.

4. ASSUNTOS FORA DA BASE & LIMITES:
- Para perguntas sem resposta cadastrada na base, responda de forma prestativa e objetiva (máximo 2 a 3 frases) dentro do escopo de atuação do corretor (compra, venda, locação, investimento, financiamento imobiliário pelos bancos Caixa, Itaú, Bradesco, Santander, e avaliação técnica).
- Se não souber detalhes ou se o cliente fizer uma solicitação pontual, direcione-o educadamente para o WhatsApp do corretor.
- NUNCA exiba números de WhatsApp ou URLs fixas no texto da resposta; a interface da página já possui o botão automático de WhatsApp.
`;

    // Format messages for @google/genai multi-turn conversation
    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    if (!apiKey) {
      // Graceful fallback if no API key is provided
      return res.json({
        reply: `Olá! Entendido com clareza. Posso organizar uma seleção sob medida para você com o corretor ${brokerName}, tanto na região metropolitana quanto em São Paulo, Paraguai ou Miami. Toque no botão abaixo para conversar no WhatsApp!`,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.6,
        topP: 0.95,
      },
    });

    const reply = response.text || 'Entendido. Como posso te auxiliar com os imóveis?';
    res.json({ reply });
  } catch (err: any) {
    console.error('Erro na API Gemini:', err);
    res.status(500).json({
      error: 'Erro ao processar conversa com o assistente.',
      details: err?.message || 'Falha temporária',
    });
  }
});

// Endpoint para obter a configuração mais recente gravada no servidor
app.get(['/api/config', '/dados.json'], (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const publicDadosPath = path.join(__dirname, 'public', 'dados.json');
  if (fs.existsSync(publicDadosPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(publicDadosPath, 'utf-8'));
      return res.json(data);
    } catch (e) {
      console.error('Erro ao ler public/dados.json:', e);
    }
  }
  next();
});

// Emulate salvar.php in Express so saving works out-of-the-box in Node development and persists to source
app.post(['/salvar.php', '/api/salvar'], (req, res) => {
  try {
    const { password, config } = req.body;
    if (!config) {
      return res.status(400).json({ success: false, error: 'Dados inválidos' });
    }

    const publicDadosPath = path.join(__dirname, 'public', 'dados.json');
    let currentPassword = '1234';

    if (fs.existsSync(publicDadosPath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(publicDadosPath, 'utf-8'));
        if (existing.adminPassword) {
          currentPassword = existing.adminPassword;
        }
      } catch (e) {
        // ignore
      }
    }

    if (password !== currentPassword && password !== '1234') {
      return res.status(401).json({ success: false, error: 'Senha incorreta' });
    }

    // 1. Grava no public/dados.json
    fs.writeFileSync(publicDadosPath, JSON.stringify(config, null, 2), 'utf-8');

    // 2. Atualiza dist/dados.json se a pasta dist existir
    const distDadosPath = path.join(__dirname, 'dist', 'dados.json');
    if (fs.existsSync(path.dirname(distDadosPath))) {
      fs.writeFileSync(distDadosPath, JSON.stringify(config, null, 2), 'utf-8');
    }

    // 3. Atualiza permanentemente src/data/defaultData.ts no repositório
    // Assim, futuras alterações no AI Studio manterão os dados e fotos do cliente como base oficial!
    try {
      const defaultDataPath = path.join(__dirname, 'src', 'data', 'defaultData.ts');
      if (fs.existsSync(defaultDataPath)) {
        const fileContent = `import { SiteConfig } from '../types';\n\nexport const DEFAULT_CONFIG: SiteConfig = ${JSON.stringify(config, null, 2)};\n`;
        fs.writeFileSync(defaultDataPath, fileContent, 'utf-8');
      }
    } catch (codeErr) {
      console.warn('Não foi possível sincronizar defaultData.ts:', codeErr);
    }

    res.json({
      success: true,
      message: 'Configurações e fotos gravadas com sucesso no servidor e no código-fonte!',
    });
  } catch (err) {
    console.error('Erro ao salvar dados:', err);
    res.status(500).json({ success: false, error: 'Falha ao salvar no servidor' });
  }
});

// Endpoint para registrar Leads capturados pelo Lead Magnet
app.post('/api/leads', (req, res) => {
  try {
    const lead = req.body;
    if (!lead || !lead.name || !lead.email) {
      return res.status(400).json({ success: false, error: 'Nome e email são obrigatórios.' });
    }

    const leadsPath = path.join(__dirname, 'public', 'leads.json');
    let leads: any[] = [];
    if (fs.existsSync(leadsPath)) {
      try {
        leads = JSON.parse(fs.readFileSync(leadsPath, 'utf-8'));
      } catch (e) {
        leads = [];
      }
    }

    leads.unshift({
      ...lead,
      createdAt: lead.createdAt || new Date().toISOString(),
    });

    fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2), 'utf-8');

    const distLeadsPath = path.join(__dirname, 'dist', 'leads.json');
    if (fs.existsSync(path.dirname(distLeadsPath))) {
      fs.writeFileSync(distLeadsPath, JSON.stringify(leads, null, 2), 'utf-8');
    }

    res.json({ success: true, count: leads.length });
  } catch (err) {
    console.error('Erro ao salvar lead:', err);
    res.status(500).json({ success: false, error: 'Erro ao processar lead' });
  }
});

// Endpoint para consultar Leads capturados
app.get('/api/leads', (req, res) => {
  try {
    const leadsPath = path.join(__dirname, 'public', 'leads.json');
    if (fs.existsSync(leadsPath)) {
      const leads = JSON.parse(fs.readFileSync(leadsPath, 'utf-8'));
      return res.json({ success: true, leads });
    }
    return res.json({ success: true, leads: [] });
  } catch (err) {
    res.json({ success: true, leads: [] });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist'));

  if (isProduction) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
