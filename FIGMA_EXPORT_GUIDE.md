# Guia de Exportação para o Figma — Márcio Rogério Corretor

Este guia ensina como importar o mini-site completo (design Dark Luxury, imagens, tipografia e botões) para dentro do **Figma** em camadas 100% editáveis com **Auto Layout**.

---

## 🚀 Método 1: Importação Direta via Plugin (Recomendado — 1 Clique)

O método oficial e mais preciso para converter sites ao vivo em layouts do Figma utiliza o plugin **html.to.design** ou **HTML to Figma (Builder.io)**.

### Passo a passo:
1. **Copie a URL da aplicação:**
   ```
   https://ais-pre-kerozsvxxqok67h74qxf4n-876870352705.us-east1.run.app
   ```
   *(ou a sua URL de desenvolvimento: `https://ais-dev-kerozsvxxqok67h74qxf4n-876870352705.us-east1.run.app`)*

2. **No Figma:**
   - Abra um novo arquivo ou o seu projeto no Figma.
   - Clique com o botão direito na tela ou no menu superior em **Plugins** → **Find more plugins...**
   - Pesquise por: `html.to.design` (desenvolvido por Divriots) ou `HTML to Figma` (desenvolvido por Builder.io).
   - Execute o plugin.

3. **Configuração da Captura:**
   - No campo de URL do plugin, cole a URL copiada no Passo 1.
   - Em **Viewports**, selecione:
     - **Mobile**: `iPhone 14/15 Pro (390px ou 430px)` para o formato de celular.
     - **Custom**: `1080 x 1920 px` se quiser na proporção de Story/Instagram.
   - Marque a opção **Full Page** (Página inteira) para capturar desde o cabeçalho até o rodapé.
   - Clique no botão **Import**.

4. **Resultado no Figma:**
   - Todo o mini-site será importado como **Frames vetoriais com Auto Layout**, textos editáveis com as fontes do Google Fonts (`Cormorant Garamond` e `Plus Jakarta Sans`), imagens em alta definição e estilos de cores preservados!

---

## 🎨 Método 2: Importar Design Tokens (Tokens Studio for Figma)

Se você utiliza o plugin **Tokens Studio for Figma**:
1. Abra o arquivo `figma-design-tokens.json` na raiz deste projeto.
2. No plugin Tokens Studio, clique em **Tools** → **Load from JSON**.
3. Todos os estilos de cores (Dourado Âmbar, Deep Noir, Champagne), tamanhos de fontes e raios de borda serão importados diretamente para o seu Design System.

---

## 📋 Resumo das Cores & Tipografia no Figma:

- **Dourado Principal:** `#C5973D`
- **Dourado Champagne:** `#D4AF37`
- **Dourado Suave:** `#E8D5A0`
- **Fundo Deep Noir:** `#0E0F12`
- **Cards Grafite:** `#151619`
- **Bordas Sutis:** `rgba(255, 255, 255, 0.08)`
- **Fonte de Títulos:** `Cormorant Garamond` (disponível gratuitamente na biblioteca do Figma)
- **Fonte de Texto:** `Plus Jakarta Sans` (disponível gratuitamente na biblioteca do Figma)
