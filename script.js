/* ================================================================
   script.js — Lógica da aplicação Kaffe Für Alle
   ================================================================ */

// ===== CONFIGURAÇÕES =====
const LOGO_PRINCIPAL_URL = '';
const LOGO_COMPACTA_URL = '';
const IMAGEM_DESTAQUE_URL = '';

const CATEGORIAS = [
  { label: 'Notícias', description: 'Brasil e mundo em um só lugar.' },
  { label: 'Economia', description: 'Mercados, negócios e trabalho.' },
  { label: 'Tecnologia', description: 'Inovação, ciência digital e futuro.' },
  { label: 'Esportes', description: 'Resultados, times e competições.' },
  { label: 'Ciência & Cultura', description: 'Ideias, descobertas e repertório.' },
];

const JORNAIS_PADRAO = [
  { name: 'Folha de São Paulo', site: 'https://www.folha.uol.com.br/', rss: 'https://feeds.folha.uol.com.br/emcimadahora/rss091.xml', logo: '', category: 'Notícias' },
  { name: 'G1 Globo', site: 'https://g1.globo.com/', rss: 'https://g1.globo.com/rss/g1/', logo: '', category: 'Notícias' },
  { name: 'O Globo', site: 'https://oglobo.globo.com/', rss: 'https://oglobo.globo.com/rss/', logo: '', category: 'Notícias' },
  { name: 'Estadão', site: 'https://www.estadao.com.br/', rss: 'https://www.estadao.com.br/rss/', logo: '', category: 'Notícias' },
  { name: 'UOL', site: 'https://www.uol.com.br/', rss: 'https://rss.uol.com.br/xml/noticias.xml', logo: '', category: 'Notícias' },
  { name: 'CNN Brasil', site: 'https://www.cnnbrasil.com.br/', rss: 'https://www.cnnbrasil.com.br/feed/', logo: '', category: 'Notícias' },
  { name: 'BBC Brasil', site: 'https://www.bbc.com/portuguese', rss: 'https://feeds.bbci.co.uk/portuguese/rss.xml', logo: '', category: 'Notícias' },
  { name: 'Valor Econômico', site: 'https://valor.globo.com/', rss: 'https://valor.globo.com/rss/valor/', logo: '', category: 'Economia' },
  { name: 'InvestNews', site: 'https://investnews.com.br/', rss: 'https://investnews.com.br/feed/', logo: '', category: 'Economia' },
  { name: 'InfoMoney', site: 'https://www.infomoney.com.br/', rss: 'https://www.infomoney.com.br/feed/', logo: '', category: 'Economia' },
  { name: 'ESPN Brasil', site: 'https://www.espn.com.br/', rss: 'https://www.espn.com.br/espn/rss/news', logo: '', category: 'Esportes' },
  { name: 'GE Globo', site: 'https://ge.globo.com/', rss: 'https://ge.globo.com/rss/ge/', logo: '', category: 'Esportes' },
  { name: 'Olhar Digital', site: 'https://olhardigital.com.br/', rss: 'https://olhardigital.com.br/rss', logo: '', category: 'Tecnologia' },
  { name: 'Tecmundo', site: 'https://www.tecmundo.com.br/', rss: 'https://www.tecmundo.com.br/rss', logo: '', category: 'Tecnologia' },
  { name: 'Canaltech', site: 'https://canaltech.com.br/', rss: 'https://canaltech.com.br/rss/', logo: '', category: 'Tecnologia' },
  { name: 'Galileu', site: 'https://galileu.globo.com/', rss: 'https://galileu.globo.com/rss/galileu/', logo: '', category: 'Ciência & Cultura' },
  { name: 'Super Interessante', site: 'https://super.abril.com.br/', rss: 'https://super.abril.com.br/rss/', logo: '', category: 'Ciência & Cultura' },
  { name: 'Veja', site: 'https://veja.abril.com.br/', rss: 'https://veja.abril.com.br/feed/', logo: '', category: 'Ciência & Cultura' },
];

const CHAVE_JORNAIS = 'cafe_jornais_nativo';
const CHAVE_SENHA = 'cafe_senha_nativo';
const CHAVE_SESSAO = 'cafe_sessao_nativo';
const SENHA_PADRAO = 'cafe123';

// ===== ESTADO GLOBAL =====
let estado = {
  jornais: [],
  categoriaAtiva: 'Todos',
  busca: '',
};

// ===== ARMAZENAMENTO =====
function carregarJornaisDoStorage() {
  try {
    const saved = localStorage.getItem(CHAVE_JORNAIS);
    estado.jornais = saved ? JSON.parse(saved) : JORNAIS_PADRAO;
    if (!saved) localStorage.setItem(CHAVE_JORNAIS, JSON.stringify(JORNAIS_PADRAO));
  } catch {
    estado.jornais = JORNAIS_PADRAO;
  }
}

function salvarJornaisStorage() {
  localStorage.setItem(CHAVE_JORNAIS, JSON.stringify(estado.jornais));
}

// ===== UTILITÁRIOS =====
function getLogoUrl(jornal) {
  if (jornal.logo && jornal.logo.trim()) return jornal.logo;
  try {
    const url = new URL(jornal.site);
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
  } catch {
    return '';
  }
}

function formatarData(t) {
  if (!t) return '';
  const d = new Date(t);
  if (isNaN(d)) return t;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function isLive(dataStr) {
  if (!dataStr) return false;
  const d = new Date(dataStr);
  if (isNaN(d)) return false;
  return Date.now() - d.getTime() < 7200000; // 2 horas
}

// ===== ROTEAMENTO =====
function router() {
  const hash = window.location.hash || '#/';
  const app = document.getElementById('app');
  window.scrollTo({ top: 0, behavior: 'auto' });

  if (hash === '#/admin') {
    renderAdmin(app);
  } else if (hash.startsWith('#/jornal/')) {
    const nomeJornal = decodeURIComponent(hash.replace('#/jornal/', ''));
    renderJornal(app, nomeJornal);
  } else {
    renderHome(app);
  }
}

// ===== FILTROS E BUSCA =====
window.filtrarPorCategoria = function(cat) {
  estado.categoriaAtiva = cat;
  estado.busca = '';
  if (window.location.hash !== '#/') {
    window.location.hash = '#/';
  } else {
    renderHome(document.getElementById('app'));
    const sec = document.getElementById('jornais');
    if (sec) sec.scrollIntoView({ behavior: 'smooth' });
  }
};

window.handleSearchInput = function(e) {
  estado.busca = e.target.value;
  renderHomeContent();
};

// ===== MODO LEITURA =====
window.toggleModoLeitura = function() {
  document.body.classList.toggle('modo-leitura');
  const btn = document.querySelector('.compact-nav button:last-child');
  if (btn) btn.textContent = document.body.classList.contains('modo-leitura') ? '📖 Sair' : '📖 Ler';
};

// ===== RENDERIZAR HOME =====
function renderHome(container) {
  container.innerHTML = `
    <header class="main-header">
      <div class="utility-row">
        <span>pausa, café & informação</span>
        <span>edição diária · brasil</span>
        <span>cafeteria & leitura</span>
      </div>
      <div class="brand-row">
        <div class="brand-copy">
          <span class="eyebrow">um jornal para acompanhar sua pausa</span>
          <h1>Kaffe Für Alle</h1>
          <p>Escolha um assunto. Encontre uma boa leitura.</p>
        </div>
        <div class="brand-logo-area">
          ${LOGO_PRINCIPAL_URL ? `<img src="${LOGO_PRINCIPAL_URL}" alt="Logo" style="width:100%; height:120px; object-fit:cover;" />` : '<div class="asset-slot"><span>sua logo principal</span></div>'}
        </div>
      </div>
      <nav class="main-menu" aria-label="Menu principal">
        <button type="button" onclick="filtrarPorCategoria('Todos')">Início</button>
        <button type="button" onclick="filtrarPorCategoria('Economia')">Economia</button>
        <button type="button" onclick="filtrarPorCategoria('Tecnologia')">Tecnologia</button>
        <button type="button" onclick="filtrarPorCategoria('Esportes')">Esportes</button>
        <button type="button" onclick="filtrarPorCategoria('Ciência & Cultura')">Ciência & Cultura</button>
        <a href="#/admin">Painel da Cafeteria</a>
      </nav>
    </header>

    <section class="hero-editorial">
      <div class="hero-copy">
        <span class="eyebrow" style="color: #F4B173;">destaque da casa</span>
        <h2>Informação que cabe na sua pausa.</h2>
        <p>Uma seleção de jornais organizada por assunto para você acompanhar o dia com clareza, no ritmo de um bom café.</p>
        <button type="button" class="text-link" onclick="filtrarPorCategoria('Todos')">explorar jornais →</button>
      </div>
      <div class="hero-image-slot">
        ${IMAGEM_DESTAQUE_URL ? `<img src="${IMAGEM_DESTAQUE_URL}" alt="Destaque" style="width:100%; height:100%; object-fit:cover;" />` : '<div class="asset-slot" style="height:100%; max-width:none;"><span>imagem de destaque</span></div>'}
      </div>
    </section>

    <section class="topic-strip">
      <button type="button" class="topic-card" onclick="filtrarPorCategoria('Economia')">
        <span class="topic-label">Economia</span>
        <strong>Mercados e escolhas para entender o dia.</strong>
      </button>
      <button type="button" class="topic-card" onclick="filtrarPorCategoria('Tecnologia')">
        <span class="topic-label">Tecnologia</span>
        <strong>Ideias desenhando o próximo capítulo.</strong>
      </button>
      <button type="button" class="topic-card topic-card-solid" onclick="filtrarPorCategoria('Ciência & Cultura')">
        <span class="topic-label" style="color: #1C1008;">Ciência & Cultura</span>
        <strong>Repertório para olhar o mundo por ângulos diversos.</strong>
      </button>
    </section>

    <div class="separator-cafe">☕ ☕ ☕</div>

    <div id="home-content-area"></div>

    <section class="cafe-institutional-section" id="a-cafeteria">
      <div class="section-heading-row" style="margin-bottom: 2rem;">
        <div>
          <span class="eyebrow" style="color: #E89C5D;">espaço & essência</span>
          <h2>A Cafeteria Kaffe Für Alle</h2>
        </div>
        <span class="count-pill">hospitalidade & leitura</span>
      </div>

      <div class="cafe-header-grid">
        <div class="cafe-story-box">
          <span class="eyebrow" style="color: #E89C5D;">nossa história</span>
          <h3>Onde o aroma do café encontra a clareza da notícia.</h3>
          <p>Fundada para ser um refúgio urbano contra a pressa do dia a dia, a Kaffe Für Alle combina a excelência dos grãos selecionados com o prazer insubstituível de folhear e acompanhar os principais acontecimentos do Brasil e do mundo.</p>
          <p>Nosso espaço foi arquitetado para abrigar conversas inspiradoras, momentos de introspecção e uma pausa revigorante, sempre acompanhada de um café perfeitamente extraído.</p>
          <a href="#/admin" class="brand-button" style="margin-top: 1rem;">gerenciar jornais ↗</a>
        </div>
        
        <div class="cafe-info-grid">
          <div class="cafe-info-card">
            <span style="font-size: 1.5rem;">🕒</span>
            <h4>Horário de Funcionamento</h4>
            <ul>
              <li><strong>Segunda a Sexta:</strong> 07:30 — 20:00</li>
              <li><strong>Sábados:</strong> 08:00 — 19:30</li>
              <li><strong>Domingos e Feriados:</strong> 08:30 — 15:00</li>
            </ul>
          </div>
          <div class="cafe-info-card">
            <span style="font-size: 1.5rem;">📍</span>
            <h4>Localização & Contato</h4>
            <p style="margin-bottom: 0.5rem;">Rua dos Cafeicultores, 412 — Centro Histórico</p>
            <p style="margin-bottom: 0.5rem;">(11) 98765-4321 / contato@kaffefuralle.com.br</p>
            <p style="color: #E89C5D; font-weight: 600; margin-top: 0.75rem;">Wi-Fi cortesia para leitores</p>
          </div>
        </div>
      </div>

      <div class="cafe-specials">
        <span class="eyebrow" style="color: #E89C5D;">especialidades da casa</span>
        <h3 style="font-family: 'Poppins', sans-serif; font-size: 1.4rem; color: #FDF8F4; margin: 0.3rem 0 0 0;">Cafés, métodos e acompanhamentos</h3>
        
        <div class="cafe-specials-grid">
          <div class="special-item">
            <span>01</span>
            <h4>Espresso da Casa & V60</h4>
            <p>Grãos 100% arábica de altitude, torra fresca e notas de chocolate amargo e caramelo, extraídos com precisão em cada xícara.</p>
          </div>
          <div class="special-item">
            <span>02</span>
            <h4>Pães de Fermentação Lenta</h4>
            <p>Assados diariamente em parceria com produtores locais, perfeitos para acompanhar sua manteiga artesanal ou geleia da estação.</p>
          </div>
          <div class="special-item">
            <span>03</span>
            <h4>Mesa de Jornais & Revistas</h4>
            <p>Curadoria diária impressa e digital para você ler em nossas poltronas confortáveis enquanto aprecia sua bebida favorita.</p>
          </div>
        </div>
      </div>

      <div style="margin-top: 3rem;">
        <span class="eyebrow" style="color: #E89C5D;">galeria do espaço</span>
        <h3 style="font-family: 'Poppins', sans-serif; font-size: 1.4rem; color: #FDF8F4; margin: 0.3rem 0 0 0;">Atmosfera e aconchego</h3>
        <div class="cafe-gallery-grid">
          <div class="gallery-slot"><span>foto do balcão</span></div>
          <div class="gallery-slot"><span>espaço de leitura</span></div>
          <div class="gallery-slot"><span>grãos e torra</span></div>
        </div>
      </div>

      <div class="cafe-contact-banner">
        <div>
          <span class="eyebrow" style="color: #F4B173;">venha nos visitar</span>
          <h3>Sua mesa favorita já está reservada.</h3>
          <p>Traga seu notebook, seu livro ou venha simplesmente para acompanhar as notícias do dia com tranquilidade.</p>
        </div>
        <a href="#/admin" class="brand-button" style="background: #FDF8F4; color: #1C1008; white-space: nowrap;">fazer reserva / contato</a>
      </div>
    </section>

    <footer class="site-footer">
      <div>
        <strong>Kaffe Für Alle</strong>
        <span>café & notícias para todos</span>
      </div>
      <a href="#/admin">🔒 painel da cafeteria</a>
    </footer>
  `;
  renderHomeContent();
}

function renderHomeContent() {
  const area = document.getElementById('home-content-area');
  if (!area) return;

  const termo = estado.busca.trim().toLowerCase();
  const filtrados = estado.jornais.filter((j) => {
    const matchCat = estado.categoriaAtiva === 'Todos' || j.category === estado.categoriaAtiva;
    const matchBusca = !termo || j.name.toLowerCase().includes(termo);
    return matchCat && matchBusca;
  });

  const grupos = CATEGORIAS.map((meta) => ({
    ...meta,
    jornais: filtrados.filter((j) => j.category === meta.label),
  })).filter((g) => g.jornais.length > 0);

  let htmlNav = `
    <button type="button" class="category-btn ${estado.categoriaAtiva === 'Todos' ? 'active' : ''}" onclick="filtrarPorCategoria('Todos')">
      Todos <span>${estado.jornais.length}</span>
    </button>
  `;
  CATEGORIAS.forEach((c) => {
    const count = estado.jornais.filter((j) => j.category === c.label).length;
    htmlNav += `
      <button type="button" class="category-btn ${estado.categoriaAtiva === c.label ? 'active' : ''}" onclick="filtrarPorCategoria('${c.label}')">
        ${c.label} <span>${count}</span>
      </button>
    `;
  });

  let htmlGrupos = '';
  if (filtrados.length === 0) {
    htmlGrupos = `
      <div class="empty-state">
        <h3>Nenhum jornal encontrado</h3>
        <p>Tente outra busca ou selecione outra categoria.</p>
        <button type="button" class="brand-button" onclick="filtrarPorCategoria('Todos')">ver todos</button>
      </div>
    `;
  } else {
    grupos.forEach((g) => {
      let htmlCards = '';
      g.jornais.forEach((j) => {
        const logo = getLogoUrl(j);
        htmlCards += `
          <a href="#/jornal/${encodeURIComponent(j.name)}" class="newspaper-card">
            <div class="newspaper-mark">
              <img src="${logo}" alt="" onerror="this.style.display='none'" />
              <span>${j.name.charAt(0)}</span>
            </div>
            <div style="min-width:0; flex:1;">
              <div class="newspaper-category">🏷️ ${j.category}</div>
              <h3>${j.name}</h3>
              <p>ver manchetes →</p>
            </div>
          </a>
        `;
      });

      htmlGrupos += `
        <div class="category-group" style="margin-bottom: 2rem;">
          <div class="category-group-heading">
            <div class="category-group-title">
              <div>
                <span>${g.label}</span>
                <small>${g.description}</small>
              </div>
            </div>
            <span class="count-pill">${g.jornais.length} ${g.jornais.length === 1 ? 'jornal' : 'jornais'}</span>
          </div>
          <div class="newspapers-grid">
            ${htmlCards}
          </div>
        </div>
      `;
    });
  }

  area.innerHTML = `
    <section class="newspapers-section" id="jornais">
      <div class="section-heading-row">
        <div>
          <span class="eyebrow" style="color: #E89C5D;">navegue por assunto</span>
          <h2>Jornais disponíveis</h2>
        </div>
        <div class="search-field">
          <span>🔍</span>
          <input type="text" id="input-busca" placeholder="Buscar jornal..." value="${estado.busca}" oninput="handleSearchInput(event)" />
          ${estado.busca ? '<button type="button" onclick="estado.busca=\'\'; renderHomeContent();">✕</button>' : ''}
        </div>
      </div>

      <nav class="category-nav" aria-label="Categorias">
        ${htmlNav}
      </nav>

      ${htmlGrupos}
    </section>
  `;
}

// ===== RENDERIZAR JORNAL (MANCHETES) =====
async function renderJornal(container, nomeJornal) {
  const jornal = estado.jornais.find((j) => j.name === nomeJornal);
  if (!jornal) {
    container.innerHTML = `
      <div class="site-shell inner-route">
        <a href="#/" class="back-link">← voltar para o início</a>
        <div class="empty-state">
          <h3>Jornal não encontrado</h3>
          <p>O veículo solicitado não está cadastrado.</p>
          <a href="#/" class="brand-button" style="margin-top:1rem;">voltar</a>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <main class="site-shell inner-route">
      <a href="#/" class="back-link">← voltar para categorias</a>
      <header class="article-header">
        <span class="eyebrow" style="color: #E89C5D;">${jornal.category}</span>
        <h1>${jornal.name}</h1>
        <p>manchetes selecionadas para a sua pausa</p>
      </header>
      <div id="feed-container">
        <div style="padding: 3rem 0; text-align: center; color: #C8B2A0;">Carregando manchetes em tempo real...</div>
      </div>
      <footer class="site-footer" style="margin-top:3rem;">
        <a href="#/">← voltar ao início</a>
        <a href="${jornal.site}" target="_blank" rel="noreferrer">site oficial ↗</a>
      </footer>
    </main>
  `;

  try {
    const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(jornal.rss)}`;
    const res = await fetch(url);
    const data = await res.json();
    const feedContainer = document.getElementById('feed-container');

    if (data.status !== 'ok' || !data.items || data.items.length === 0) {
      feedContainer.innerHTML = `
        <div style="padding: 2rem; background: #2B180D; border-left: 4px solid #E89C5D; margin: 2rem 0;">
          <p style="margin:0 0 1rem 0;">Não foi possível carregar o feed RSS automaticamente para ${jornal.name}.</p>
          <a href="${jornal.site}" target="_blank" rel="noreferrer" class="brand-button">visitar site oficial ↗</a>
        </div>
      `;
      return;
    }

    let htmlNoticias = '';
    data.items.forEach((item, idx) => {
      const div = document.createElement('div');
      div.innerHTML = item.description || '';
      const resumo = (div.textContent || '').trim().slice(0, 400);
      const dataPub = item.pubDate ? new Date(item.pubDate).toLocaleDateString('pt-BR') : '';
      const numStr = String(idx + 1).padStart(2, '0');
      const live = isLive(item.pubDate) ? '<span class="live-badge">ao vivo</span>' : '';

      htmlNoticias += `
        <article class="feed-article">
          <span class="article-number">${numStr}</span>
          <div>
            <h2><a href="${item.link}" target="_blank" rel="noreferrer">${item.title} ${live}</a></h2>
            <p>${resumo || 'Leia a matéria completa na fonte.'}</p>
            <div class="feed-meta">
              <span>${dataPub}</span>
              <a href="${item.link}" target="_blank" rel="noreferrer">ler matéria ↗</a>
            </div>
          </div>
        </article>
      `;
    });

    feedContainer.innerHTML = htmlNoticias;
  } catch {
    const feedContainer = document.getElementById('feed-container');
    if (feedContainer) {
      feedContainer.innerHTML = `
        <div style="padding: 2rem; background: #2B180D; border-left: 4px solid #E89C5D; margin: 2rem 0;">
          <p style="margin:0 0 1rem 0;">Erro ao carregar manchetes de ${jornal.name}.</p>
          <a href="${jornal.site}" target="_blank" rel="noreferrer" class="brand-button">visitar site oficial ↗</a>
        </div>
      `;
    }
  }
}

// ===== PAINEL ADMIN =====
function renderAdmin(container) {
  const logged = sessionStorage.getItem(CHAVE_SESSAO) === '1';

  let htmlAdminBody = '';
  if (!logged) {
    htmlAdminBody = `
      <form onsubmit="handleLogin(event)" class="admin-login">
        <p style="margin:0 0 1rem 0; color:#C8B2A0; font-size:0.9rem;">Insira a senha da cafeteria para gerenciar os veículos cadastrados.</p>
        <label for="senha-admin" style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:#E89C5D; letter-spacing:0.08em;">Senha</label>
        <input type="password" id="senha-admin" placeholder="Digite a senha (padrão: cafe123)" required />
        <button type="submit" class="brand-button" style="margin-top:0.5rem;">🔒 entrar</button>
      </form>
    `;
  } else {
    let htmlLista = '';
    estado.jornais.forEach((j) => {
      const logo = getLogoUrl(j);
      htmlLista += `
        <div class="admin-item">
          <div class="newspaper-mark" style="width:32px; height:32px; font-size:0.8rem;">
            <img src="${logo}" alt="" onerror="this.style.display='none'" />
            <span>${j.name.charAt(0)}</span>
          </div>
          <div style="min-width:0; flex:1;">
            <strong style="display:block; font-size:0.9rem; color:#FDF8F4;">${j.name}</strong>
            <small style="color:#C8B2A0; font-size:0.75rem;">${j.category} · ${j.site}</small>
          </div>
          <button type="button" onclick="removerJornal('${j.name}')" style="background:transparent; border:0; color:#D9534F; cursor:pointer; font-weight:bold; font-size:1.1rem;" title="Remover">✕</button>
        </div>
      `;
    });

    let optionsCat = '';
    CATEGORIAS.forEach((c) => {
      optionsCat += `<option value="${c.label}">${c.label}</option>`;
    });

    htmlAdminBody = `
      <div class="admin-content">
        <div style="display:flex; align-items:center; justify-content:between; padding:0.75rem 1rem; background:#1C1008; border:1px solid #4A301E; margin-bottom:1.5rem; font-size:0.85rem;">
          <span style="color:#E89C5D; font-weight:bold;">✓ Sessão de administrador ativa</span>
          <button type="button" onclick="handleLogout()" class="brand-button" style="padding:0.3rem 0.6rem; font-size:0.65rem;">sair</button>
        </div>

        <form onsubmit="adicionarJornal(event)" class="admin-form">
          <h2 style="margin:0; font-size:1rem; color:#E89C5D; text-transform:uppercase; letter-spacing:0.08em;">+ Adicionar novo jornal</h2>
          <div class="admin-form-grid">
            <div>
              <label style="display:block; font-size:0.7rem; font-weight:700; text-transform:uppercase; color:#C8B2A0; margin-bottom:0.25rem;">Nome do veículo</label>
              <input type="text" id="novo-nome" placeholder="Ex.: Gazeta do Café" required />
            </div>
            <div>
              <label style="display:block; font-size:0.7rem; font-weight:700; text-transform:uppercase; color:#C8B2A0; margin-bottom:0.25rem;">Categoria</label>
              <select id="novo-cat">${optionsCat}</select>
            </div>
            <div>
              <label style="display:block; font-size:0.7rem; font-weight:700; text-transform:uppercase; color:#C8B2A0; margin-bottom:0.25rem;">Site oficial</label>
              <input type="url" id="novo-site" placeholder="https://exemplo.com.br" required />
            </div>
            <div>
              <label style="display:block; font-size:0.7rem; font-weight:700; text-transform:uppercase; color:#C8B2A0; margin-bottom:0.25rem;">Feed RSS</label>
              <input type="url" id="novo-rss" placeholder="https://exemplo.com.br/feed/" required />
            </div>
          </div>
          <button type="submit" class="brand-button" style="width:fit-content;">cadastrar veículo</button>
        </form>

        <div style="margin-top: 2rem;">
          <h2 style="font-size:1rem; color:#E89C5D; border-bottom:2px solid #E89C5D; padding-bottom:0.5rem; margin-bottom:1rem; text-transform:uppercase; letter-spacing:0.08em;">Veículos cadastrados (${estado.jornais.length})</h2>
          <div>${htmlLista}</div>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <main class="site-shell inner-route">
      <a href="#/" class="back-link">← voltar para o início</a>
      <div class="admin-panel">
        <div class="admin-heading">
          <div>
            <span class="eyebrow" style="color: #E89C5D;">gerenciamento da cafeteria</span>
            <h1 style="margin:0; font-size:1.25rem; font-weight:700;">Painel Administrativo</h1>
          </div>
        </div>
        ${htmlAdminBody}
      </div>
    </main>
  `;
}

// ===== FUNÇÕES DE ADMIN (globais) =====
window.handleLogin = function(e) {
  e.preventDefault();
  const input = document.getElementById('senha-admin');
  const senhaAtual = localStorage.getItem(CHAVE_SENHA) || SENHA_PADRAO;
  if (input && input.value === senhaAtual) {
    sessionStorage.setItem(CHAVE_SESSAO, '1');
    router();
  } else {
    alert('Senha incorreta.');
  }
};

window.handleLogout = function() {
  sessionStorage.removeItem(CHAVE_SESSAO);
  router();
};

window.adicionarJornal = function(e) {
  e.preventDefault();
  const nome = document.getElementById('novo-nome').value.trim();
  const cat = document.getElementById('novo-cat').value;
  const site = document.getElementById('novo-site').value.trim();
  const rss = document.getElementById('novo-rss').value.trim();

  if (!nome || !site || !rss) return;

  if (estado.jornais.some((j) => j.name.toLowerCase() === nome.toLowerCase())) {
    alert('Esse veículo já está cadastrado.');
    return;
  }

  estado.jornais.push({ name: nome, site, rss, logo: '', category: cat });
  salvarJornaisStorage();
  router();
};

window.removerJornal = function(nome) {
  if (confirm(`Deseja remover o jornal "${nome}"?`)) {
    estado.jornais = estado.jornais.filter((j) => j.name !== nome);
    salvarJornaisStorage();
    router();
  }
};

// ===== EVENTOS E INICIALIZAÇÃO =====
function handleScroll() {
  const header = document.getElementById('compact-header');
  const btnTopo = document.getElementById('back-to-top');
  const scrollY = window.scrollY;

  if (header) {
    if (scrollY > 380) header.classList.add('visible');
    else header.classList.remove('visible');
  }
  if (btnTopo) {
    if (scrollY > 380) btnTopo.classList.remove('hidden');
    else btnTopo.classList.add('hidden');
  }
}

function initApp() {
  carregarJornaisDoStorage();
  window.addEventListener('hashchange', router);
  window.addEventListener('scroll', handleScroll, { passive: true });
  router();
}

document.addEventListener('DOMContentLoaded', initApp);
