import { ChatbotKnowledgeItem } from '../types';

/**
 * Normaliza strings para comparação flexível (remove acentos, pontuação e converte para minúsculas).
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacríticos
    .replace(/[^\w\s]/gi, ' ') // substitui pontuações por espaço
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Busca se a mensagem do usuário corresponde a algum item cadastrado na Base de Conhecimento.
 * Se houver correspondência, retorna o item exato para que a resposta seja usada na íntegra.
 */
export function findKnowledgeBaseMatch(
  userMessage: string,
  knowledgeBase?: ChatbotKnowledgeItem[]
): ChatbotKnowledgeItem | null {
  if (!knowledgeBase || knowledgeBase.length === 0 || !userMessage) {
    return null;
  }

  const normalizedUser = normalizeText(userMessage);
  if (!normalizedUser) return null;

  const userWords = new Set(normalizedUser.split(' ').filter((w) => w.length > 2));

  for (const item of knowledgeBase) {
    if (!item.answer || !item.answer.trim()) continue;

    const rawQuestion = item.question || '';
    const normalizedQuestion = normalizeText(rawQuestion);

    // 1. Correspondência exata da frase inteira
    if (normalizedUser === normalizedQuestion) {
      return item;
    }

    // 2. Se a pergunta estiver contida na mensagem do usuário ou vice-versa (mínimo 4 caracteres)
    if (
      normalizedQuestion.length >= 4 &&
      (normalizedUser.includes(normalizedQuestion) || normalizedQuestion.includes(normalizedUser))
    ) {
      return item;
    }

    // 3. Suporte a palavras-chave separadas por vírgula, barra ou ponto e vírgula
    const keywordSegments = rawQuestion
      .split(/[,;/|]+/)
      .map((k) => normalizeText(k))
      .filter((k) => k.length >= 3);

    for (const segment of keywordSegments) {
      // Se o usuário digitou exatamente o termo ou o termo está contido na mensagem
      if (segment.length >= 3 && normalizedUser.includes(segment)) {
        return item;
      }

      // Se for composto por múltiplas palavras (ex: "sao paulo", "seguro locacao", "onde atende")
      const segmentWords = segment.split(' ').filter((w) => w.length > 2);
      if (
        segmentWords.length >= 2 &&
        segmentWords.every((w) => userWords.has(w) || normalizedUser.includes(w))
      ) {
        return item;
      }
    }
  }

  return null;
}
