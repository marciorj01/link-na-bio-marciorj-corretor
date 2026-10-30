import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  MessageCircle,
  ArrowRight,
  Loader2,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { SiteConfig, ChatbotConfig } from '../types';
import { formatWhatsAppUrl } from '../utils/whatsapp';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  summaryForWhatsApp?: string;
}

interface ChatbotModalProps {
  config: SiteConfig;
}

import { findKnowledgeBaseMatch } from '../utils/knowledgeMatcher';

export const ChatbotModal: React.FC<ChatbotModalProps> = ({ config }) => {
  const chatbotConfig: ChatbotConfig = config.chatbot || {
    enabled: true,
    botName: 'Assistente do Márcio',
    welcomeMessage:
      'Olá! Seja bem-vindo ao atendimento do corretor Márcio Rogério (CRECI-PR 59138). Estou aqui para entender seu objetivo — do Sul do Brasil a São Paulo, Paraguai e Miami (EUA) — e te conectar com as melhores oportunidades.',
    quickOptions: [
      { id: '1', label: '🏡 Quero comprar imóvel', prompt: 'Gostaria de ver imóveis para compra.' },
      { id: '2', label: '🌾 Chácara em Mandirituba', prompt: 'Procuro chácara ou imóvel com área verde em Mandirituba e região.' },
      { id: '3', label: '📊 Simulação de crédito', prompt: 'Gostaria de simular crédito imobiliário.' },
      { id: '4', label: '🔑 Avaliar ou vender imóvel', prompt: 'Quero avaliar ou vender meu imóvel.' },
    ],
    knowledgeBase: [],
    systemInstruction: '',
    whatsappCtaText: 'Falar com Márcio no WhatsApp',
  };

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnreadAlert, setHasUnreadAlert] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message when opened
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          role: 'model',
          text: chatbotConfig.welcomeMessage,
          timestamp: new Date(),
        },
      ]);
    }
  }, [chatbotConfig.welcomeMessage]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  if (!chatbotConfig.enabled) {
    return null;
  }

  const handleSendMessage = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    // 1. PRIORIDADE TOTAL: Se a pergunta corresponder à Base de Conhecimento, responde EXATAMENTE o texto cadastrado
    const directMatch = findKnowledgeBaseMatch(trimmed, chatbotConfig.knowledgeBase);
    if (directMatch) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `model-${Date.now()}`,
            role: 'model',
            text: directMatch.answer,
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);
      }, 350);
      return;
    }

    try {
      // Call server-side API with Gemini, with automatic fallback to chat.php on Apache/cPanel hosting
      let res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, text: m.text })),
          brokerInfo: {
            name: config.profile.name,
            creci: config.profile.creci,
            city: config.profile.city || 'Mandirituba, Curitiba e Região Metropolitana',
            phone: config.profile.phone,
          },
          promptInstruction: chatbotConfig.systemInstruction,
          knowledgeBase: chatbotConfig.knowledgeBase,
          properties: config.curatedBlock.properties,
        }),
      }).catch(() => null);

      if (!res || !res.ok) {
        // Try standalone PHP endpoint if hosted on Apache/cPanel
        res = await fetch('./chat.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({ role: m.role, text: m.text })),
            systemInstruction: chatbotConfig.systemInstruction,
            knowledgeBase: chatbotConfig.knowledgeBase,
          }),
        }).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        const replyText = data.reply || 'Entendido. Gostaria de dar continuidade no WhatsApp?';
        setMessages((prev) => [
          ...prev,
          {
            id: `model-${Date.now()}`,
            role: 'model',
            text: replyText,
            timestamp: new Date(),
          },
        ]);
      } else {
        throw new Error('Falha na resposta');
      }
    } catch (err) {
      // Smart offline fallback: prioritize knowledge base match, otherwise helpful general response
      const fallbackMatch = findKnowledgeBaseMatch(trimmed, chatbotConfig.knowledgeBase);
      const fallbackText = fallbackMatch
        ? fallbackMatch.answer
        : `Excelente! Registrei seu interesse sobre "${trimmed}". Minha consultoria atende desde Mandirituba e Curitiba até São Paulo, Paraguai e Flórida/Miami (EUA). Para tirar dúvidas pontuais ou receber opções detalhadas, toque no botão abaixo para falar diretamente comigo no WhatsApp!`;

      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: fallbackText,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: chatbotConfig.welcomeMessage,
        timestamp: new Date(),
      },
    ]);
  };

  // Compile full conversation summary to WhatsApp pre-filled message
  const compileWhatsAppLeadSummary = () => {
    const userInputs = messages.filter((m) => m.role === 'user').map((m) => m.text);
    const lastUserText = userInputs.join(' | ');

    const intro = `Olá ${config.profile.name}, estive no seu link da bio e conversei com seu assistente virtual.`;
    const details = userInputs.length > 0 ? `\n\n📌 Meu interesse registrado:\n"${lastUserText}"` : '';
    const closing = `\n\nGostaria de receber mais informações e opções disponíveis.`;

    return formatWhatsAppUrl(config.profile.phone, `${intro}${details}${closing}`);
  };

  return (
    <>
      {/* Floating Chat Launcher Button (Clean & Luxury) */}
      <div className="fixed bottom-20 right-5 z-30 pointer-events-auto flex items-center gap-2">
        {/* Subtle Greeting Bubble */}
        {!isOpen && hasUnreadAlert && (
          <div
            onClick={() => {
              setIsOpen(true);
              setHasUnreadAlert(false);
            }}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#16171B]/95 text-white border border-[#C5973D]/40 shadow-xl backdrop-blur-md cursor-pointer hover:border-[#C5973D] transition-all animate-bounce"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5973D]" />
            <span className="text-xs font-medium text-[#E8D5A0]">
              Posso te ajudar a encontrar seu imóvel?
            </span>
          </div>
        )}

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setHasUnreadAlert(false);
          }}
          className={`w-13 h-13 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 border cursor-pointer ${
            isOpen
              ? 'bg-[#1C1E24] text-white border-white/20 rotate-90'
              : 'bg-gradient-to-br from-[#C5973D] via-[#D4AF37] to-[#A87B28] text-[#0E0F12] border-[#E8D5A0]/50 hover:scale-105 shadow-[#C5973D]/30'
          }`}
          title="Abrir Assistente Virtual de Imóveis"
          aria-label="Abrir Assistente Virtual de Imóveis"
        >
          {isOpen ? (
            <X className="w-5 h-5 stroke-[2.2]" />
          ) : (
            <div className="relative">
              <Bot className="w-6 h-6 stroke-[2]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#121316] animate-pulse" />
            </div>
          )}
        </button>
      </div>

      {/* Chatbot Window Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-x-4 bottom-24 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[380px] md:w-[410px] h-[540px] max-h-[82vh] bg-[#141519] rounded-3xl border border-[#C5973D]/35 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_30px_rgba(197,151,61,0.15)] flex flex-col overflow-hidden z-40 animate-fade-in text-left">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-[#1A1C22] to-[#121316] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C5973D]/15 border border-[#C5973D]/40 flex items-center justify-center text-[#E8D5A0] shadow-inner">
                <Bot className="w-5 h-5 text-[#C5973D]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-serif font-medium text-white">
                    {chatbotConfig.botName}
                  </h4>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-[#9E9B95]">
                  Qualificador de Leads · {config.profile.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-lg text-[#9E9B95] hover:text-white hover:bg-white/5 transition-colors"
                title="Reiniciar conversa"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#9E9B95] hover:text-white hover:bg-white/5 transition-colors"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation Body */}
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3.5 bg-[#0D0E11]/90">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-7 h-7 rounded-full bg-[#C5973D]/20 border border-[#C5973D]/40 flex items-center justify-center shrink-0 mt-0.5 text-[#E8D5A0]">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5973D]" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#C5973D] to-[#B8872F] text-[#0E0F12] font-medium rounded-br-xs'
                      : 'bg-[#181A20] text-[#E5E4E0] border border-white/8 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5 text-white/80">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading / Typing indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start animate-fade-in">
                <div className="w-7 h-7 rounded-full bg-[#C5973D]/20 border border-[#C5973D]/40 flex items-center justify-center shrink-0 text-[#E8D5A0]">
                  <Loader2 className="w-3.5 h-3.5 text-[#C5973D] animate-spin" />
                </div>
                <div className="rounded-2xl px-4 py-2.5 bg-[#181A20] text-xs text-[#9E9B95] border border-white/8 rounded-bl-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5973D] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5973D] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5973D] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            {/* Quick Suggestions Chips (when few messages) */}
            {messages.length <= 2 && !isLoading && (
              <div className="pt-2 space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider text-[#9E9B95] block font-semibold">
                  Opções Rápidas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {chatbotConfig.quickOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSendMessage(opt.prompt)}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-[#C5973D]/15 text-[11px] text-[#E8D5A0] hover:text-white border border-white/10 hover:border-[#C5973D]/40 transition-all text-left"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Action Bar: Forward Lead Directly to WhatsApp with compiled context */}
          {messages.length > 1 && (
            <div className="px-4 py-2 bg-[#101115] border-t border-white/8">
              <a
                href={compileWhatsAppLeadSummary()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white font-semibold text-xs shadow-md shadow-emerald-900/30 hover:brightness-110 active:scale-98 transition-all"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{chatbotConfig.whatsappCtaText || 'Enviar dados e continuar no WhatsApp'}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Text Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputMessage);
            }}
            className="p-3 bg-[#121316] border-t border-white/8 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite o que procura ou sua dúvida..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0A0B0D] border border-white/10 text-xs text-[#F8F7F4] placeholder-[#9E9B95] outline-none focus:border-[#C5973D] transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="w-9 h-9 rounded-xl bg-[#C5973D] text-[#0E0F12] flex items-center justify-center transition-all disabled:opacity-40 hover:brightness-105 active:scale-95 cursor-pointer shrink-0"
              title="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
