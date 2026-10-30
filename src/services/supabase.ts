import { SiteConfig, CapturedLead } from '../types';

export interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

export const SUPABASE_STORAGE_KEY = 'marciorogerio_supabase_credentials';

/**
 * Normaliza e limpa a URL do Supabase para o formato base:
 * Remove sufixos comuns como /rest/v1, /rest/v1/ ou barras no final.
 * Exemplo: 'https://xyz.supabase.co/rest/v1/' -> 'https://xyz.supabase.co'
 */
export function cleanSupabaseUrl(url: string): string {
  if (!url) return '';
  let clean = url.trim();
  clean = clean.replace(/\/rest(\/v1)?\/?$/i, '');
  clean = clean.replace(/\/+$/, '');
  return clean;
}

/**
 * Obtém as credenciais do Supabase:
 * 1. Prioridade: Variáveis de ambiente Vite (.env ou painel da Netlify)
 * 2. Fallback: Configurações salvas diretamente pelo corretor no Painel Studio
 */
export function getSupabaseCredentials(): SupabaseCredentials | null {
  // 1. Variáveis de ambiente
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey && typeof envUrl === 'string' && typeof envKey === 'string') {
    const cleanUrl = cleanSupabaseUrl(envUrl);
    const cleanKey = envKey.trim();
    if (cleanUrl.startsWith('http') && cleanKey.length > 10) {
      return { url: cleanUrl, anonKey: cleanKey };
    }
  }

  // 2. Armazenamento configurado pelo corretor no painel
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(SUPABASE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.url && parsed.anonKey) {
          const cleanUrl = cleanSupabaseUrl(String(parsed.url));
          const cleanKey = String(parsed.anonKey).trim();
          if (cleanUrl.startsWith('http') && cleanKey.length > 10) {
            return { url: cleanUrl, anonKey: cleanKey };
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  return null;
}

/**
 * Salva as credenciais do Supabase configuradas pelo painel
 */
export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window === 'undefined') return;
  const cleanUrl = cleanSupabaseUrl(url);
  const cleanKey = anonKey.trim();
  localStorage.setItem(
    SUPABASE_STORAGE_KEY,
    JSON.stringify({ url: cleanUrl, anonKey: cleanKey })
  );
}

/**
 * Remove as credenciais do Supabase
 */
export function clearSupabaseCredentials(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SUPABASE_STORAGE_KEY);
}

/**
 * Testa a conexão com o Supabase
 */
export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const cleanUrl = cleanSupabaseUrl(url);
    const cleanKey = anonKey.trim();

    if (!cleanUrl.startsWith('http')) {
      return { success: false, message: 'URL do Supabase inválida. Deve iniciar com https://' };
    }

    const res = await fetch(`${cleanUrl}/rest/v1/site_config?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': cleanKey,
        'Authorization': `Bearer ${cleanKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      return { success: true, message: 'Conexão estabelecida com sucesso! A tabela site_config está pronta.' };
    }

    if (res.status === 404 || res.status === 400) {
      return {
        success: false,
        message: 'Conectou ao Supabase, mas a tabela "site_config" ainda não existe. Execute o script SQL no painel do Supabase.',
      };
    }

    if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        message: 'Chave anônima (anon key) inválida ou sem permissão de leitura.',
      };
    }

    return { success: false, message: `Erro HTTP ${res.status} ao conectar ao Supabase.` };
  } catch (err: any) {
    return { success: false, message: `Falha de rede ao conectar: ${err?.message || 'Verifique sua conexão'}` };
  }
}

/**
 * Busca as configurações ativas na nuvem do Supabase
 */
export async function fetchConfigFromSupabase(): Promise<SiteConfig | null> {
  const creds = getSupabaseCredentials();
  if (!creds) return null;

  try {
    const res = await fetch(`${creds.url}/rest/v1/site_config?id=eq.main&select=config`, {
      method: 'GET',
      headers: {
        'apikey': creds.anonKey,
        'Authorization': `Bearer ${creds.anonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0 && data[0]?.config) {
      return data[0].config as SiteConfig;
    }
  } catch (err) {
    console.warn('Supabase offline ou inacessível no momento:', err);
  }

  return null;
}

/**
 * Salva as configurações permanentemente na nuvem do Supabase
 */
export async function saveConfigToSupabase(config: SiteConfig): Promise<boolean> {
  const creds = getSupabaseCredentials();
  if (!creds) return false;

  try {
    const res = await fetch(`${creds.url}/rest/v1/site_config`, {
      method: 'POST',
      headers: {
        'apikey': creds.anonKey,
        'Authorization': `Bearer ${creds.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id: 'main',
        config,
        updated_at: new Date().toISOString(),
      }),
    });

    return res.ok;
  } catch (err) {
    console.error('Falha ao gravar no Supabase:', err);
    return false;
  }
}

/**
 * Registra novo lead capturado na nuvem do Supabase
 */
export async function saveLeadToSupabase(lead: CapturedLead): Promise<boolean> {
  const creds = getSupabaseCredentials();
  if (!creds) return false;

  try {
    const res = await fetch(`${creds.url}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'apikey': creds.anonKey,
        'Authorization': `Bearer ${creds.anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: lead.name,
        telefone: lead.whatsapp,
        empreendimento: lead.interest || '',
        name: lead.name,
        whatsapp: lead.whatsapp,
        interest: lead.interest || '',
        lead_type: lead.type || 'geral',
        property_id: lead.propertyId || '',
        created_at: new Date().toISOString(),
      }),
    });

    return res.ok;
  } catch (err) {
    return false;
  }
}

/**
 * Insere um lead direto com nome, telefone e empreendimento
 */
export async function insertLead(leadData: {
  nome: string;
  telefone: string;
  empreendimento: string;
}): Promise<{ success: boolean; error?: string }> {
  const creds = getSupabaseCredentials();
  if (!creds) {
    return { success: false, error: 'Supabase não conectado.' };
  }

  try {
    const res = await fetch(`${creds.url}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'apikey': creds.anonKey,
        'Authorization': `Bearer ${creds.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        nome: leadData.nome,
        telefone: leadData.telefone,
        empreendimento: leadData.empreendimento,
        name: leadData.nome,
        whatsapp: leadData.telefone,
        interest: leadData.empreendimento,
        created_at: new Date().toISOString(),
      }),
    });

    if (res.ok) {
      return { success: true };
    }

    const errJson = await res.json().catch(() => null);
    return {
      success: false,
      error: errJson?.message || `Erro HTTP ${res.status} ao registrar lead.`,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Falha de conexão ao enviar dados.' };
  }
}

/**
 * Gera URL temporária e assinada para download de arquivo do Supabase Storage
 * Ex: supabase.storage.from('plantas').createSignedUrl('helbor-vm125-apresentacao.pdf', 120)
 */
export async function createSignedStorageUrl(
  bucket: string,
  filePath: string,
  expiresInSeconds: number = 120
): Promise<{ success: boolean; signedUrl?: string; error?: string }> {
  const creds = getSupabaseCredentials();
  if (!creds) {
    return { success: false, error: 'Supabase não conectado neste minisite.' };
  }

  try {
    const cleanPath = filePath.replace(/^\/+/, '');
    const endpoint = `${creds.url}/storage/v1/object/sign/${bucket}/${cleanPath}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': creds.anonKey,
        'Authorization': `Bearer ${creds.anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expiresIn: expiresInSeconds }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      if (res.status === 404 || errJson?.statusCode === '404' || errJson?.error === 'Not Found') {
        return {
          success: false,
          error: `O arquivo "${filePath}" não foi encontrado no bucket "${bucket}" do Supabase Storage. Certifique-se de que o bucket "plantas" existe e contém o arquivo.`,
        };
      }
      return {
        success: false,
        error: errJson?.message || `Erro HTTP ${res.status} ao gerar URL assinada do arquivo.`,
      };
    }

    const data = await res.json();
    if (data && data.signedURL) {
      let fullUrl = data.signedURL;
      if (!fullUrl.startsWith('http')) {
        if (fullUrl.startsWith('/storage/v1')) {
          fullUrl = `${creds.url}${fullUrl}`;
        } else {
          fullUrl = `${creds.url}/storage/v1${fullUrl}`;
        }
      }
      return { success: true, signedUrl: fullUrl };
    }

    return { success: false, error: 'Resposta inválida do Supabase Storage.' };
  } catch (err: any) {
    return {
      success: false,
      error: `Falha de rede ao conectar com Supabase Storage: ${err?.message || 'Verifique sua conexão'}`,
    };
  }
}

/**
 * SQL de instalação de 1 clique para colar no Supabase SQL Editor
 */
export const SUPABASE_SETUP_SQL = `-- 1. Criar tabela de configurações do minisite
create table if not exists public.site_config (
  id text primary key default 'main',
  config jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Criar ou atualizar tabela para registro de leads
create table if not exists public.leads (
  id bigint generated by default as identity primary key,
  nome text,
  telefone text,
  empreendimento text,
  name text,
  whatsapp text,
  interest text,
  lead_type text default 'plantas',
  property_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Habilitar segurança por linha (Row Level Security)
alter table public.site_config enable row level security;
alter table public.leads enable row level security;

-- 4. Políticas de acesso idempotentes (podem ser executadas quantas vezes quiser)
drop policy if exists "Leitura publica da configuracao" on public.site_config;
drop policy if exists "Gravacao da configuracao pelo painel" on public.site_config;
drop policy if exists "Atualizacao da configuracao pelo painel" on public.site_config;
drop policy if exists "Gravacao publica de leads" on public.leads;
drop policy if exists "Leitura de leads pelo corretor" on public.leads;
drop policy if exists "Insercao publica de leads" on public.leads;

create policy "Leitura publica da configuracao" on public.site_config for select using (true);
create policy "Gravacao da configuracao pelo painel" on public.site_config for insert with check (true);
create policy "Atualizacao da configuracao pelo painel" on public.site_config for update using (true);

create policy "Gravacao publica de leads" on public.leads for insert with check (true);
create policy "Leitura de leads pelo corretor" on public.leads for select using (true);

-- 5. Criar bucket privado 'plantas' no Supabase Storage
insert into storage.buckets (id, name, public)
values ('plantas', 'plantas', false)
on conflict (id) do nothing;

-- 6. Política para permitir que usuários anônimos gerem Signed URL de download
drop policy if exists "Permitir download assinado de plantas" on storage.objects;
create policy "Permitir download assinado de plantas" on storage.objects
  for select using (bucket_id = 'plantas');
`;

