# Guia de Publicação: GitHub & Hospedagem PHP

Este projeto é um Minisite / Link na Bio independente para Corretores de Imóveis com painel administrativo Studio & Canva embutido e gravação direta em PHP (`dados.json`).

---

## 1. Como Enviar para o GitHub

Se você estiver usando o terminal no seu computador:

```bash
# 1. Inicialize o repositório git (se ainda não tiver feito)
git init

# 2. Adicione todos os arquivos
git add .

# 3. Crie o primeiro commit
git commit -m "Minisite Imobiliário Márcio Rogério - Pronto para Produção"

# 4. Conecte ao seu repositório no GitHub (troque pelo seu link do GitHub)
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git

# 5. Envie para o GitHub
git branch -M main
git push -u origin main
```

---

## 2. Como Gerar os Arquivos para Hospedar em PHP

Para gerar a pasta final pronta para a sua hospedagem:

```bash
# Instala as dependências (apenas na 1ª vez)
npm install

# Gera a pasta de produção
npm run build
```

Isso criará a pasta **`dist/`** com os seguintes arquivos:
- **`index.html`** → A página principal do mini-site
- **`salvar.php`** → O script PHP que grava os dados e fotos enviadas pelo painel
- **`dados.json`** → O banco de dados em arquivo JSON
- **`.htaccess`** → Arquivo de configuração de velocidade Gzip e rotas para Apache/cPanel
- **`assets/`** → Pasta contendo os arquivos JS, CSS e imagens otimizadas

---

## 3. Publicando na Hospedagem (cPanel, Hostinger, Locaweb, KingHost, etc.)

1. Acesse o **Gerenciador de Arquivos** (ou FileZilla/FTP) da sua hospedagem.
2. Abra a pasta pública do seu domínio (geralmente chamada de **`public_html`**, **`www`** ou **`htdocs`**).
3. Envie **todo o conteúdo de dentro da pasta `dist/`** diretamente para essa pasta pública.
4. **Permissões de Escrita:**
   - Garanta que o arquivo `dados.json` ou a pasta `public_html` tenha permissão de escrita para o PHP (permissão padrão `755` ou `664`).
5. Pronto! Acesse seu domínio: `https://seusite.com.br`

---

## 4. Acesso Administrativo do Corretor

- **Para clientes:** O site abre limpo, sem botões de edição ou painéis.
- **Para o corretor:** 
  - Desça até o rodapé e toque no **ícone de cadeado** discreto (ou acesse `https://seusite.com.br/?admin`).
  - Digite a senha inicial de fábrica: **`1234`**.
  - O painel abrirá com a visualização do celular em tempo real ao lado das configurações.
  - Altere fotos, dados, imóveis e troque a senha na aba *Perfil & Identidade*.
  - Clique em **"Salvar Alterações"** para gravar no servidor.
