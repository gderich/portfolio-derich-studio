# Portfólio Derich Studio

Portfólio de Gabriel Derich Freitas: página inicial, página de oferta de sites (R$ 750) e estudos de caso da Caxtros Barber e do portal Estaca Messejana.

Site estático: sem React, sem instalação de pacotes e sem banco de dados.

## Estrutura

| Arquivo | Função |
| --- | --- |
| `dist/index.html` | Página inicial |
| `dist/sites.html` (+ `sites.css`, `sites.js`) | Oferta de sites e formulário que monta a mensagem de WhatsApp |
| `dist/caxtros.html`, `dist/estaca.html` | Estudos de caso (galeria "Anatomia do projeto") |
| `dist/style.css` | Estilos compartilhados |
| `dist/site.js` | Galeria dos estudos de caso (abas acessíveis, carregamento sob demanda). Os dados ficam em `<script id="gallery-data">` de cada página |
| `dist/contact.js` | Janela de briefing que abre antes do WhatsApp |
| `dist/hero-gradient.js` | Fundo animado (WebGL) e frases do hero da home |
| `dist/fonts/` | DM Sans e Manrope hospedadas localmente (OFL) |
| `dist/images/` | Imagens em WebP. Pré-visualização social em JPG (`derich-preview-v2.jpg`, `caxtros-og.jpg`) |
| `dist/404.html`, `robots.txt`, `sitemap.xml` | Erro 404 e SEO |
| `netlify.toml` | Publicação, cabeçalhos de segurança (CSP) e cache |
| `tools/optimize_images.py` | Converte imagens novas para WebP |

## Abrir no computador

```bash
python3 -m http.server 8000 --directory dist
```

Abra `http://localhost:8000`. As páginas com URL limpa (`/caxtros`, `/sites`) funcionam na Netlify; localmente use `/caxtros.html`.

## Rotinas comuns

**Trocar o número de WhatsApp.** O número está nos links `https://wa.me/...` de `index.html`, `caxtros.html`, `estaca.html` e `sites.html`. Os scripts leem o número desses links, então basta trocá-lo nos HTML (busca e substituição de `5585996946551`).

**Adicionar ou trocar imagens.** Coloque o PNG/JPG em `dist/images/`, rode `python3 tools/optimize_images.py` (requer `pip install pillow`) e use o `.webp` gerado. Em `<img>` estáticas, informe `width` e `height` para evitar deslocamento de layout.

**Mudar de domínio.** Troque `derichstudio.netlify.app` por seu domínio em: `canonical`, `og:url`, `og:image`, JSON-LD (`index.html`), `sitemap.xml` e `robots.txt`.

**Política de segurança (CSP).** O `netlify.toml` só permite arquivos do próprio site. Se um dia adicionar analytics, vídeo incorporado ou outro serviço externo, inclua a origem correspondente em `Content-Security-Policy`.

## Licenças de terceiros

Veja `THIRD_PARTY_NOTICES.md` (simplex noise do hero e fontes).

## Contato

Gabriel Derich Freitas, [gabrielderich1@gmail.com](mailto:gabrielderich1@gmail.com)
