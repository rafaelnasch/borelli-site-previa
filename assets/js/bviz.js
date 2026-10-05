/* =====================================================================
   BVIZ · motor de gráficos da Borelli Advocacia · sistema Grifo Nosso v1
   SVG puro, zero dependências, JavaScript ES2015 simples, determinístico
   (sem Math.random, sem Date): mesma entrada e mesma largura geram sempre
   o mesmo desenho, na tela e no PDF.

   COMO USAR (duas formas)
     1. Declarativa, sem escrever JavaScript: o motor monta sozinho no carregamento.
        <figure class="grafico">
          <span class="rotulo">Rótulo</span>
          <p class="grafico-titulo">Título que já diz a conclusão</p>
          <div class="grafico-svg" data-bviz='{"tipo":"barras","rotulos":["Jan","Fev","Mar"],"valores":[12,18,31],"destaque":2}'></div>
          <figcaption class="legenda">Fonte e data. "Dado ilustrativo", quando for.</figcaption>
        </figure>
     2. Por chamada: bviz.barras('id-ou-elemento', { rotulos:[...], valores:[...], destaque:2 });

   AS CORES SAEM DO CAMPO (ou da opção campo)
     Sem opção, o motor lê as variáveis do lugar onde o gráfico está: --dado-destaque
     (ouro no azul, azul Borelli no claro), --dado-1 a --dado-4, --f-titulo, --f-texto,
     --f-apoio, --f-linha e --f-fundo. No campo Marinho o destaque vira champanhe sozinho
     (o ouro fica em 4,2:1 ali). Com {campo:'noite'} ou {campo:'papel'} (também 'mare',
     'abismo', 'marinho', 'branco', 'nevoa') usa a paleta fixa da casa, útil fora do brand
     book (deck, peça exportada). Dentro do SVG toda cor sai em HEX por extenso (#244460),
     em atributo fill/stroke: o desenho copiado para outro programa não perde a cor.
     O neutro das barras é calculado para ficar em pelo menos 3:1 contra o fundo (contraste
     de elemento gráfico); texto sempre na cor de título, texto ou apoio do campo (AA).

   OPÇÕES COMUNS (em português; os nomes em inglês também valem)
     destaque    -1      índice do ÚNICO destaque (-1 = sem destaque)
     vrotulos    auto    valores já formatados em pt-BR ("1.240", "21 dias úteis", "64%")
     unidade     nenhum  unidade no fim da linha de base ("DIAS ÚTEIS", "%")
     campo       auto    'noite' | 'papel' | 'mare' | 'abismo' | 'marinho' | 'branco' | 'nevoa'
     altura      auto    altura do desenho (barras 300, linha 260; os demais calculam)
     largura     auto    largura do viewBox; padrão = largura do contêiner entre 300 e 1200
                         (1 unidade é cerca de 1 px: o rótulo sai no tamanho real no celular)
     peca        auto    dentro de uma .peca o motor mede a peça e escala o desenho para o
                         rótulo de 11 unidades valer o rótulo da peça (26 px no post de 1080).
                         Passe a largura em px da peça para fixar, ou false para desligar.
     estilo      barras  'haste' (ou 'fio') troca a barra por haste fina com o losango na
                         ponta (barras e barras-h)
     fonte       nenhum  escreve a fonte dentro do SVG (para gráfico que sai do brand book)
     ilustrativo false   escreve "Dados ilustrativos" dentro do SVG (ou o texto passado,
                         como "Dado ilustrativo")
     animar      true    entrada discreta ao aparecer na tela (a barra cresce, a linha se
                         desenha, o losango chega por último); nunca com prefers-reduced-motion,
                         na impressão nem em navegador automatizado (captura de tela)
     aria        "Gráfico"  rótulo acessível: escreva a conclusão

   TIPOS
     barras       { rotulos, valores, vrotulos, destaque, unidade, altura, estilo }
                  (palavra do rótulo maior que a coluna: deita e vira barras-h; deitar:false impede)
     barras-h     { rotulos, valores, vrotulos, destaque, estilo, empilhar }   (ranking; sem espaço
                  ao lado, o rótulo sobe para cima da barra; empilhar true ou false força)
     linha        { rotulos, valores, vrotulos, destaque, area, todos, altura }
     composicao   { segmentos:[{rotulo,valor,vrotulo}], destaque }        (partes de um todo, 100%)
     anel         { valor (0 a 100), vrotulo, rotulo, tamanho }
     funil        { etapas:[{rotulo,valor,vrotulo}], destaque, taxas }    (jornada com perda)
     fluxo        { passos:[{rotulo,sub}], destaque, numeros }            (processo, sem número)
     kpi          { valor, vrotulo, unidade, rotulo, sub, serie }         (número em destaque)
     linha-tempo  { eventos:[{data,rotulo,sub}], destaque }                (cronologia)
     cota         { rotulo }                                               (medida entre dois traços)
   Funções: bviz.<tipo>(el, opts) · bviz.render(el, tipo, opts) · bviz.montar(raiz)
            bviz.redesenhar() · bviz.fmt(n, {dec, prefixo, sufixo}) · bviz.svg(el)
            bviz.animar = false desliga a entrada em todos os gráficos.

   REGRAS DA CASA EMBUTIDAS
     Um destaque por gráfico, na cor de ênfase do campo; o resto é neutro. O ouro marca
     pouco (lei I): só o destaque, e só sobre azul; no claro o destaque é o azul Borelli.
     Zero linha de grade, zero 3D, zero sombra, zero pizza de muitas fatias (partes de um
     todo viram uma barra de 100%). Barras finas de ponta reta, base zero. Linha de base
     de 1 px. O LOSANGO da casa (quadrado girado 45°) marca o destaque na linha, no anel,
     na linha do tempo e na haste; os outros pontos são losangos pequenos de contorno.
     Número antes do rótulo: o número de destaque em Newsreader 500, rótulos e valores em
     Lexend. O título do gráfico é a conclusão e fica fora do SVG, no .grafico, com a
     fonte e a data na legenda. Dado ilustrativo sempre rotulado (legenda ou opção
     ilustrativo). Cada SVG ganha um id único (bv1, bv2...), estável entre redesenhos.

   O QUE O MOTOR NÃO DESENHA NA COMUNICAÇÃO DA BORELLI (publicidade da advocacia, OAB)
     Número de processos, taxa de êxito, número de clientes atendidos, valor de condenação
     ou de acordo, nota ou quantidade de avaliações: nunca, em nenhuma peça. Dado de
     cliente: nunca, nem somado. Pode: número de norma e dado público oficial (prazo,
     percentual, tema de tribunal), com a norma e o artigo conferidos na fonte oficial;
     sem conferência, a legenda diz "Dado ilustrativo". Números de operação (canais,
     tempo de resposta) só em relatório interno.

   REDESENHO
     Um ResizeObserver (espera de 120 ms), o evento beforeprint e o carregamento das
     fontes chamam redesenhar(), que mede de novo o contêiner e as fontes reais.
   ===================================================================== */
const bviz = (() => {
  'use strict';
  const registro = new Set();
  const temDoc = typeof document !== 'undefined';
  let seq = 0;

  /* ---------- paletas da casa (HEX por extenso) ---------- */
  const PALETAS = {
    papel: { destaque: '#244460', d1: '#6F8BA6', d2: '#5B6875', d3: '#B7C6D4', d4: '#DFE7EE',
      titulo: '#172B3D', texto: '#3F4A56', apoio: '#5B6875', fio: '#DFE7EE', fundo: '#F7F9FB' },
    noite: { destaque: '#C9A24D', d1: '#EBD081', d2: '#AEBCCB', d3: '#4C6680', d4: '#2A4057',
      titulo: '#FFFFFF', texto: '#DCE6EF', apoio: '#AEBCCB', fio: '#2A4057', fundo: '#172B3D' }
  };
  PALETAS.mare = Object.assign({}, PALETAS.noite, { fundo: '#1E354B' });
  PALETAS.abismo = Object.assign({}, PALETAS.noite, { fundo: '#0F1D2A' });
  PALETAS.marinho = Object.assign({}, PALETAS.noite, { destaque: '#EBD081', d1: '#FFFFFF', d3: '#5A7896', d4: '#3A5875', apoio: '#C2CFDC', fio: '#3A5875', fundo: '#244460' });
  PALETAS.branco = Object.assign({}, PALETAS.papel, { fundo: '#FFFFFF' });
  PALETAS.nevoa = Object.assign({}, PALETAS.papel, { apoio: '#56626F', fundo: '#E1ECF5' });
  const VARS = { destaque: '--dado-destaque', d1: '--dado-1', d2: '--dado-2', d3: '--dado-3', d4: '--dado-4',
    titulo: '--f-titulo', texto: '--f-texto', apoio: '--f-apoio', fio: '--f-linha', fundo: '--f-fundo' };

  /* qualquer cor (#abc, #aabbcc, rgb(), rgba()) vira #AABBCC; o resto é ignorado */
  function hex(v) {
    v = String(v || '').trim();
    let m;
    if (/^#[0-9a-f]{3}$/i.test(v)) return ('#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]).toUpperCase();
    if (/^#[0-9a-f]{6}$/i.test(v)) return v.toUpperCase();
    if (/^#[0-9a-f]{8}$/i.test(v)) return v.slice(0, 7).toUpperCase();
    m = v.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
    if (m) return '#' + [m[1], m[2], m[3]].map(n => ('0' + Math.max(0, Math.min(255, Math.round(+n))).toString(16)).slice(-2)).join('').toUpperCase();
    return null;
  }
  function mistura(a, b, t) {
    const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const x = p(a), y = p(b);
    return '#' + x.map((v, i) => ('0' + Math.round(v + (y[i] - v) * t).toString(16)).slice(-2)).join('').toUpperCase();
  }
  function luz(h) {
    const v = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(x => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }
  function contraste(a, b) {
    const la = luz(a), lb = luz(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  /* o neutro das barras: o --dado-3 do campo, levado em direção ao apoio até ficar em
     pelo menos 3:1 contra o fundo (contraste pedido para elemento gráfico) */
  function completa(c) {
    /* no claro o neutro puxa para o --dado-1 (azul acinzentado); no azul, para o apoio */
    const alvo = luz(c.fundo) > 0.4 ? c.d1 : c.apoio;
    let t = 0, n = c.d3;
    while (contraste(n, c.fundo) < 3 && t < 2) {
      t = Math.min(2, t + 0.05);
      n = t <= 1 ? mistura(c.d3, alvo, t) : mistura(alvo, c.apoio, t - 1);
    }
    c.neutro = n;
    return c;
  }
  /* a cor que está de fato atrás do gráfico (campo, painel, peça): recheio dos losangos */
  function fundoReal(el) {
    try {
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
        const bg = getComputedStyle(n).backgroundColor, m = bg && bg.match(/rgba?\(([^)]*)\)/);
        if (!m) continue;
        const partes = m[1].split(/[\s,/]+/).filter(Boolean);
        if (partes.length < 4 || parseFloat(partes[3]) > 0.5) return hex(bg);
      }
    } catch (err) { /* sem estilo calculado */ }
    return null;
  }
  function cores(el, o) {
    if (o && o.campo && PALETAS[o.campo]) return completa(Object.assign({}, PALETAS[o.campo]));
    let c = Object.assign({}, PALETAS.papel);
    try {
      const cs = getComputedStyle(el);
      Object.keys(VARS).forEach(k => { const h = hex(cs.getPropertyValue(VARS[k])); if (h) c[k] = h; });
    } catch (err) { /* sem estilo calculado: fica o papel */ }
    /* o campo Marinho herda as séries do azul: ali o destaque é champanhe e os neutros são os dele */
    if (c.fundo === PALETAS.marinho.fundo) c = Object.assign(c, { destaque: PALETAS.marinho.destaque, d1: PALETAS.marinho.d1, d3: PALETAS.marinho.d3, d4: PALETAS.marinho.d4 });
    const real = fundoReal(el);
    if (real) c.fundo = real;
    return completa(c);
  }

  /* ---------- tipografia no SVG ---------- */
  const NUM = "font-family:'Newsreader','Source Serif 4',Georgia,serif;font-variant-numeric:lining-nums";
  const LAB = "font-family:'Lexend','Inter',system-ui,sans-serif;font-variant-numeric:lining-nums tabular-nums";
  const fonte = (f, peso, tam, ls) => `${f};font-weight:${peso};font-size:${tam}px` + (ls ? `;letter-spacing:${ls}px` : '');
  const r2 = v => Math.round(v * 100) / 100;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const alvo = e => (typeof e === 'string' ? (temDoc ? document.getElementById(e) : null) : e);
  const dois = n => (n < 10 ? '0' : '') + n;
  function T(x, y, conteudo, f, peso, tam, cor, anc, ls, extra) {
    return `<text x="${r2(x)}" y="${r2(y)}"${anc && anc !== 'start' ? ` text-anchor="${anc}"` : ''} fill="${cor}" style="${fonte(f, peso, tam, ls)}"${extra || ''}>${esc(conteudo)}</text>`;
  }
  const R = (x, y, w, h, cor, extra) => `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(Math.max(0, w))}" height="${r2(Math.max(0, h))}" fill="${cor}"${extra || ''}/>`;
  const L = (x1, y1, x2, y2, cor, w, extra) => `<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" stroke="${cor}" stroke-width="${w || 1}"${extra || ''}/>`;
  /* o LOSANGO da casa (quadrado girado 45°): r é a meia-diagonal, da ponta ao centro */
  const D = (cx, cy, r, fill, extra) => `<path d="M${r2(cx)} ${r2(cy - r)}L${r2(cx + r)} ${r2(cy)}L${r2(cx)} ${r2(cy + r)}L${r2(cx - r)} ${r2(cy)}Z" fill="${fill}" stroke-linejoin="miter"${extra || ''}/>`;

  /* ---------- medição de texto (SVG oculto; sem medida, estima) ---------- */
  const cache = new Map();
  let medidor = null;
  function mede(txt, f, peso, tam, ls) {
    txt = String(txt);
    const k = f.length + '|' + peso + '|' + tam + '|' + (ls || 0) + '|' + txt;
    if (cache.has(k)) return cache.get(k);
    let w = 0;
    try {
      if (temDoc && document.body) {
        if (!medidor || !medidor.isConnected) {
          const NS = 'http://www.w3.org/2000/svg';
          medidor = document.createElementNS(NS, 'svg');
          medidor.setAttribute('aria-hidden', 'true');
          medidor.setAttribute('width', '1'); medidor.setAttribute('height', '1');
          medidor.style.cssText = 'position:absolute;left:0;top:0;width:1px;height:1px;overflow:hidden;visibility:hidden;pointer-events:none';
          medidor.appendChild(document.createElementNS(NS, 'text'));
          document.body.appendChild(medidor);
        }
        const t = medidor.firstChild;
        t.setAttribute('style', fonte(f, peso, tam, ls));
        t.textContent = txt;
        w = t.getComputedTextLength();
      }
    } catch (err) { w = 0; }
    if (!w) w = txt.length * 0.6 * tam + (ls || 0) * txt.length;
    cache.set(k, w);
    return w;
  }
  /* quebra por palavras em até maxL linhas, nunca no meio da palavra */
  function quebra(txt, f, peso, tam, maxW, maxL, ls) {
    const pal = String(txt).split(/\s+/).filter(Boolean);
    if (!pal.length) return [''];
    const linhas = [];
    let atual = pal[0];
    for (let i = 1; i < pal.length; i++) {
      const tenta = atual + ' ' + pal[i];
      if (mede(tenta, f, peso, tam, ls) <= maxW) atual = tenta;
      else { linhas.push(atual); atual = pal[i]; }
    }
    linhas.push(atual);
    if (linhas.length > maxL) {
      const cab = linhas.slice(0, maxL - 1);
      cab.push(linhas.slice(maxL - 1).join(' '));
      return cab;
    }
    return linhas;
  }
  const maiorPalavra = (textos, f, peso, tam, ls) => Math.max(0, ...textos.map(t => Math.max(0, ...String(t || '').split(/\s+/).map(w => mede(w, f, peso, tam, ls)))));

  /* ---------- números em pt-BR ---------- */
  function fmt(n, o) {
    o = o || {};
    const dec = o.dec == null ? 0 : o.dec;
    const neg = n < 0;
    const partes = Math.abs(Number(n) || 0).toFixed(dec).split('.');
    const inteiro = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (neg ? '-' : '') + (o.prefixo || '') + inteiro + (dec > 0 ? ',' + partes[1] : '') + (o.sufixo || '');
  }
  function auto(v) {
    if (typeof v !== 'number' || !isFinite(v)) return String(v);
    if (Number.isInteger(v)) return fmt(v);
    return fmt(v, { dec: Math.abs(v * 10 - Math.round(v * 10)) < 1e-9 ? 1 : 2 });
  }
  const rotulos = (vals, vl) => vals.map((v, i) => (vl && vl[i] != null ? String(vl[i]) : auto(v)));

  /* ---------- largura do viewBox ----------
     Na tela: a largura do contêiner (1 unidade = 1 px). Dentro de uma .peca: a largura
     proporcional à peça, para o rótulo de 11 unidades valer o rótulo da peça. */
  function emPeca(el) {
    try {
      const peca = el.closest && el.closest('.peca');
      const mock = peca && peca.closest('.mock');
      if (!mock) return null;
      const cs = getComputedStyle(mock);
      const base = parseFloat(cs.getPropertyValue('--base')) || 1080;
      const rot = parseFloat(cs.getPropertyValue('--pc-rotulo')) || 26;
      const mw = mock.getBoundingClientRect().width, w = el.clientWidth;
      if (!(mw > 0 && w > 0)) return null;
      return { px: w * base / mw, rot };
    } catch (err) { return null; }
  }
  function largura(el, o) {
    if (o.w) return o.w;
    if (o.peca !== false) {
      const p = +o.peca ? { px: +o.peca, rot: 26 } : emPeca(el);
      if (p) return Math.round(Math.max(280, p.px * 11 / p.rot));
    }
    let cw = 0;
    try {
      const cs = getComputedStyle(el);
      cw = el.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    } catch (err) { cw = 0; }
    if (!cw || cw <= 0) return 640;
    return Math.round(Math.max(300, Math.min(1200, cw)));
  }

  /* ---------- entrada discreta (respeita prefers-reduced-motion) ---------- */
  const agora = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : 0);
  function semMovimento() {
    try {
      if (typeof navigator !== 'undefined' && navigator.webdriver) return true;   /* captura automática: desenho final */
      return !window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('print').matches;
    }
    catch (err) { return true; }
  }
  let ioAnima = null;
  function animaQuando(el, o) {
    if (o.animar === false || api.animar === false || !temDoc || semMovimento()) return;
    if (typeof IntersectionObserver === 'undefined' || !Element.prototype.animate) return;
    if (el.__bvT != null) { const dt = agora() - el.__bvT; if (dt < 1100) anima(el, dt); return; }
    if (!ioAnima) ioAnima = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      ioAnima.unobserve(en.target);
      en.target.__bvT = agora();
      anima(en.target, 0);
    }), { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    if (!el.__bvObs) { el.__bvObs = 1; ioAnima.observe(el); }
  }
  function anima(el, desde) {
    const svg = el.firstElementChild;
    if (!svg) return;
    let i = 0;
    Array.prototype.forEach.call(svg.querySelectorAll('[data-a]'), n => {
      const a = n.getAttribute('data-a'), atraso = Math.min(i++, 10) * 50;
      const ops = { duration: 720, delay: atraso, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' };
      let k = null;
      try {
        if (a === 'y' || a === 'x' || a === 'xc') {
          n.style.transformBox = 'fill-box';
          n.style.transformOrigin = a === 'y' ? '50% 100%' : (a === 'x' ? '0% 50%' : '50% 50%');
          k = n.animate(a === 'y' ? [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }] : [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], ops);
        } else if (a === 'd') {
          const tam = n.getTotalLength ? n.getTotalLength() : 0;
          if (tam) k = n.animate([{ strokeDasharray: tam + ' ' + tam, strokeDashoffset: tam }, { strokeDasharray: tam + ' ' + tam, strokeDashoffset: 0 }], Object.assign({}, ops, { duration: 1000 }));
        } else if (a === 'r') {
          const v = n.getAttribute('data-v'), tot = n.getAttribute('data-c');
          k = n.animate([{ strokeDasharray: '0 ' + tot }, { strokeDasharray: v + ' ' + tot }], Object.assign({}, ops, { duration: 1000 }));
        } else if (a === 'p') {
          n.style.transformBox = 'fill-box'; n.style.transformOrigin = '50% 50%';
          k = n.animate([{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], Object.assign({}, ops, { delay: atraso + 420, duration: 420 }));
        } else {
          k = n.animate([{ opacity: 0 }, { opacity: 1 }], ops);
        }
        if (k && desde) k.currentTime = desde;
      } catch (err) { /* navegador sem suporte: fica o desenho final */ }
    });
  }
  function terminaAnimacoes() {
    registro.forEach(el => {
      try { const s = el.firstElementChild; if (s && s.getAnimations) s.getAnimations({ subtree: true }).forEach(a => a.finish()); } catch (err) { /* ok */ }
    });
  }

  /* ---------- montagem do SVG ---------- */
  function registra(el, tipo, o) { el.__bviz = { tipo, opts: o }; registro.add(el); observa(el); }
  /* rodapé opcional dentro do SVG: fonte e/ou "Dados ilustrativos" */
  function rodape(c, W, y0, o) {
    if (!o.fonte && !o.ilustrativo) return { s: '', h: 0 };
    const partes = [];
    if (o.fonte) partes.push('Fonte: ' + o.fonte);
    if (o.ilustrativo) partes.push(typeof o.ilustrativo === 'string' ? o.ilustrativo : 'Dados ilustrativos');
    const ls = quebra(partes.join(' · '), LAB, 400, 13, W, 3);
    let s = L(0, y0 + 16.5, W, y0 + 16.5, c.fio, 1);
    ls.forEach((ln, k) => { s += T(0, y0 + 37 + k * 18, ln, LAB, 400, 13, c.apoio, 'start'); });
    return { s, h: 27 + ls.length * 18 };
  }
  function monta(el, W, H, miolo, o, c, tipo) {
    if (!el.__bvId) el.__bvId = 'bv' + (++seq);
    const rp = rodape(c, W, H, o);
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" id="${el.__bvId}" data-bviz-tipo="${tipo}" viewBox="0 0 ${r2(W)} ${r2(H + rp.h)}" role="img" aria-label="${esc(o.aria || 'Gráfico')}" focusable="false" style="width:100%;height:auto;display:block">${miolo}${rp.s}</svg>`;
    animaQuando(el, o);
  }
  const hiDe = o => (o.highlight == null ? -1 : +o.highlight);
  const haste = o => o.estilo === 'haste' || o.estilo === 'fio';
  const inicia = (e, tipo, o) => { const el = alvo(e); if (!el) return null; registra(el, tipo, o); return el; };

  /* =========================================================== BARRAS */
  function bars(e, o) {
    o = o || {};
    const el = inicia(e, 'bars', o); if (!el) return;
    const c = cores(el, o), W = largura(el, o), H = o.h || 300;
    const vals = (o.values || []).map(v => +v || 0), labs = (o.labels || []).map(l => String(l == null ? '' : l));
    const vls = rotulos(vals, o.vlabels), hi = hiDe(o), n = Math.max(1, vals.length), fio = haste(o);
    const uTxt = o.unit ? String(o.unit).toUpperCase() : '';
    const uw = uTxt ? mede(uTxt, LAB, 500, 11, 2.2) + 16 : 0;
    const plotW = W - uw;
    const cw = plotW / n;
    let fs = cw < 52 ? 11 : 13;
    if (fs === 13 && maiorPalavra(labs, LAB, 500, 13) > cw - 8) fs = 11;
    /* palavra que não cabe na coluna nem em 11 px: o gráfico deita e vira ranking (o celular agradece) */
    if (o.deitar !== false && maiorPalavra(labs, LAB, 600, 11) > cw - 4) { hbars(el, o, true); return; }
    const lh = fs + 4;
    const linhas = labs.map((l, i) => quebra(l, LAB, i === hi ? 600 : 500, fs, cw - 8, 2));
    const nL = Math.max(1, ...linhas.map(l => l.length));
    const pb = 22 + (nL - 1) * lh + 8;
    const pt = hi >= 0 ? 50 : 30;
    const base = H - pb, ph = base - pt;
    const max = Math.max(...vals, 0) || 1;
    const bw = Math.min(34, cw * 0.42);
    const comuns = vls.filter((t, i) => i !== hi);
    const mostraV = Math.max(0, ...comuns.map(t => mede(t, LAB, 500, 13))) <= cw - 4;
    const cabe = (w, cx) => Math.max(w / 2 + 1, Math.min(W - w / 2 - 1, cx));
    let s = '';
    vals.forEach((v, i) => {
      const cx = i * cw + cw / 2, ehHi = i === hi;
      const bh = Math.max(2, (Math.max(0, v) / max) * ph);
      const cor = ehHi ? c.destaque : c.neutro, rl = ehHi ? 7.5 : 4.5;
      if (fio) {
        s += L(cx, base, cx, base - bh + rl, cor, ehHi ? 2 : 1.5, ' data-a="y"');
        s += D(cx, base - bh, rl, cor, ' data-a="p"');
      } else s += R(cx - bw / 2, base - bh, bw, bh, cor, ' data-a="y"');
      const topo = base - bh - (fio ? rl : 0);
      if (ehHi) s += T(cabe(mede(vls[i], NUM, 500, 32), cx), topo - 12, vls[i], NUM, 500, 32, c.titulo, 'middle', 0, ' data-a="f"');
      else if (mostraV) s += T(cabe(mede(vls[i], LAB, 500, 13), cx), topo - 9, vls[i], LAB, 500, 13, c.apoio, 'middle');
      linhas[i].forEach((ln, k) => {
        const tw = mede(ln, LAB, ehHi ? 600 : 500, fs);
        s += T(cabe(tw, cx), base + 20 + k * lh, ln, LAB, ehHi ? 600 : 500, fs, ehHi ? c.titulo : c.apoio, 'middle');
      });
    });
    s += L(0, base + 0.5, W, base + 0.5, c.apoio, 1);
    if (uTxt) s += T(W, base + 20, uTxt, LAB, 500, 11, c.apoio, 'end', 2.2);
    monta(el, W, H, s, o, c, 'barras');
  }

  /* =========================================================== BARRAS HORIZONTAIS (ranking) */
  /* Dois arranjos: rótulo ao lado da barra (quando sobra pelo menos 30% da largura para a
     barra) ou rótulo em cima e barra embaixo (celular e rótulos longos). interno = chamada
     de barras() que deitou: não registra de novo. */
  function hbars(e, o, interno) {
    o = o || {};
    const el = interno ? alvo(e) : inicia(e, 'hbars', o); if (!el) return;
    const c = cores(el, o), W = largura(el, o), fio = haste(o);
    const vals = (o.values || []).map(v => +v || 0), labs = (o.labels || []).map(l => String(l == null ? '' : l));
    const vls = rotulos(vals, o.vlabels), hi = hiDe(o);
    const barH = 10, max = Math.max(...vals, 0) || 1;
    const gapV = fio ? 16 : 10;          /* do fim da barra (ou da ponta do losango) até o valor */
    const tamHi = t => Math.max(22, Math.min(26, 26 * (W * 0.42) / Math.max(1, mede(t, NUM, 500, 26))));   /* Newsreader nunca abaixo de 22 */
    const valW = Math.max(0, ...vls.map((t, i) => (i === hi ? mede(t, NUM, 500, tamHi(t)) : mede(t, LAB, 500, 13)))) + 2;
    const maxLab = Math.max(0, ...labs.map((l, i) => mede(l, LAB, i === hi ? 600 : 500, 13)));
    const labw = o.labw || Math.round(Math.min(W * 0.4, maxLab + 16));
    const empilha = o.empilhar === true || (o.empilhar !== false && (W - labw - valW - gapV) < W * 0.3);
    const barra = (x0, cy, bw, i) => {
      const ehHi = i === hi, cor = ehHi ? c.destaque : c.neutro, rl = ehHi ? 7 : 4.5;
      if (fio) return L(x0, cy, x0 + bw - rl, cy, cor, ehHi ? 2 : 1.5, ' data-a="x"') + D(x0 + bw, cy, rl, cor, ' data-a="p"');
      return R(x0, cy - barH / 2, bw, barH, cor, ' data-a="x"');
    };
    const valor = (vx, cy, i) => (i === hi ? T(vx, cy + tamHi(vls[i]) * 0.33, vls[i], NUM, 500, r2(tamHi(vls[i])), c.titulo, 'start', 0, ' data-a="f"')
      : T(vx, cy + 4.7, vls[i], LAB, 500, 13, c.apoio, 'start'));
    let s = '', H;
    if (empilha) {
      const barMax = Math.max(40, W - valW - gapV - (fio ? 8 : 0));
      let y = 0;
      vals.forEach((v, i) => {
        const ehHi = i === hi, peso = ehHi ? 600 : 500;
        const ls = quebra(labs[i], LAB, peso, 13, W, 2);
        ls.forEach((ln, k) => { s += T(0, y + 13 + k * 18, ln, LAB, peso, 13, ehHi ? c.titulo : c.apoio, 'start'); });
        const cy = y + 13 + (ls.length - 1) * 18 + 8 + (ehHi ? 15 : 10);
        const bw = Math.max(2, (Math.max(0, v) / max) * barMax);
        s += L(0.5, cy - 9, 0.5, cy + 9, c.apoio, 1);             /* a linha de base, em cada barra */
        s += barra(0, cy, bw, i) + valor(bw + gapV, cy, i);
        y = cy + (ehHi ? 15 : 10) + 14;
      });
      H = Math.max(1, y - 10);
    } else {
      const rowH = 38, barMax = Math.max(40, W - labw - valW - gapV);
      H = Math.max(1, vals.length) * rowH;
      vals.forEach((v, i) => {
        const cy = i * rowH + rowH / 2, ehHi = i === hi;
        const bw = Math.max(2, (Math.max(0, v) / max) * barMax);
        s += barra(labw, cy, bw, i);
        const peso = ehHi ? 600 : 500, corT = ehHi ? c.titulo : c.apoio, disp = labw - 14;
        let ls = [labs[i]], fs = 13;
        if (mede(ls[0], LAB, peso, 13) > disp) { fs = 11; ls = quebra(ls[0], LAB, peso, 11, disp, 2); }
        if (ls.length === 1) s += T(labw - 14, cy + fs * 0.36, ls[0], LAB, peso, fs, corT, 'end');
        else ls.forEach((ln, k) => { s += T(labw - 14, cy - 7 + k * 14 + fs * 0.36, ln, LAB, peso, fs, corT, 'end'); });
        s += valor(labw + bw + gapV, cy, i);
      });
      s += L(labw - 0.5, 0, labw - 0.5, H, c.apoio, 1);
    }
    monta(el, W, H, s, o, c, 'barras-h');
  }

  /* posição do número de destaque sem encostar na linha nem nos outros pontos */
  function lugarLivre(x, y, w, W, base, pts, ignora) {
    const colide = (x0, x1, y0, y1) => {
      if (x0 < 0 || x1 > W || y0 < 0 || y1 > base - 2) return true;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], lo = Math.max(x0, a[0]), hi = Math.min(x1, b[0]);
        if (lo > hi) continue;
        const dx = (b[0] - a[0]) || 1;
        const ya = a[1] + (b[1] - a[1]) * (lo - a[0]) / dx, yb = a[1] + (b[1] - a[1]) * (hi - a[0]) / dx;
        if (Math.max(ya, yb) >= y0 - 3 && Math.min(ya, yb) <= y1 + 3) return true;
      }
      for (let i = 0; i < pts.length; i++) {
        if (i === ignora) continue;
        const p = pts[i];
        if (p[0] >= x0 - 6 && p[0] <= x1 + 6 && p[1] >= y0 - 6 && p[1] <= y1 + 6) return true;
      }
      return false;
    };
    const cx = Math.max(w / 2 + 2, Math.min(W - w / 2 - 2, x));
    const opcoes = [
      { x: cx, y: y - 19, a: 'middle', b: [cx - w / 2, cx + w / 2, y - 43, y - 17] },
      { x: x - 15, y: y - 12, a: 'end', b: [x - 15 - w, x - 15, y - 36, y - 10] },
      { x: x + 15, y: y - 12, a: 'start', b: [x + 15, x + 15 + w, y - 36, y - 10] },
      { x: cx, y: y + 40, a: 'middle', b: [cx - w / 2, cx + w / 2, y + 16, y + 42], baixo: true },
      { x: x - 15, y: y + 30, a: 'end', b: [x - 15 - w, x - 15, y + 6, y + 32], baixo: true },
      { x: x + 15, y: y + 30, a: 'start', b: [x + 15, x + 15 + w, y + 6, y + 32], baixo: true }
    ];
    for (let i = 0; i < opcoes.length; i++) { const o = opcoes[i]; if (!colide(o.b[0], o.b[1], o.b[2], o.b[3])) return o; }
    return opcoes[0];
  }

  /* =========================================================== LINHA */
  function line(e, o) {
    o = o || {};
    const el = inicia(e, 'line', o); if (!el) return;
    const c = cores(el, o), W = largura(el, o), H = o.h || 260;
    const vals = (o.values || []).map(v => +v || 0), labs = (o.labels || []).map(l => String(l == null ? '' : l));
    const vls = rotulos(vals, o.vlabels), n = vals.length, hi = hiDe(o);
    const area = !!o.area, todos = !!o.todos;
    if (!n) { monta(el, W, H, '', o, c, 'linha'); return; }
    const meia = i => Math.max(mede(labs[i] || '', LAB, i === hi ? 600 : 500, 13), i === hi ? mede(vls[i], NUM, 500, 30) : mede(vls[i], LAB, 500, 13)) / 2;
    const pl = Math.max(16, meia(0) + 4), pr = Math.max(16, meia(n - 1) + 4);
    const pt = 54, pb = 34, base = H - pb;
    const max = Math.max(...vals), min = Math.min(...vals);
    const lo = area ? Math.min(0, min) : min - (max - min || 1) * 0.3;
    const hiV = max === lo ? lo + 1 : max;
    const px = i => (n === 1 ? W / 2 : pl + (i * (W - pl - pr)) / (n - 1));
    const py = v => pt + (1 - (v - lo) / (hiV - lo)) * (base - pt - 8);
    const pts = vals.map((v, i) => `${r2(px(i))},${r2(py(v))}`).join(' ');
    let s = '';
    if (area) s += `<polygon points="${r2(px(0))},${r2(base)} ${pts} ${r2(px(n - 1))},${r2(base)}" fill="${c.neutro}" fill-opacity=".16" data-a="f"/>`;
    s += L(0, base + 0.5, W, base + 0.5, c.apoio, 1);
    const pts0 = vals.map((v, i) => [px(i), py(v)]);
    const hiPos = hi >= 0 && hi < n ? lugarLivre(px(hi), py(vals[hi]), mede(vls[hi], NUM, 500, 30), W, base, pts0, hi) : null;
    if (hiPos && !hiPos.baixo) s += L(px(hi), py(vals[hi]) + 11, px(hi), base, c.destaque, 1, ' stroke-dasharray="2 3" data-a="f"');
    s += `<polyline points="${pts}" fill="none" stroke="${c.titulo}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" data-a="d"/>`;
    const hiW = hi >= 0 ? mede(vls[hi], NUM, 500, 30) : 0;
    const mostraV = i => {
      if (i === hi) return true;
      if (!todos && i !== 0 && i !== n - 1) return false;
      if (hi < 0) return true;
      const d = Math.abs(px(i) - px(hi)), wv = mede(vls[i], LAB, 500, 13);
      return d > (wv + hiW) / 2 + 8 || Math.abs(py(vals[i]) - py(vals[hi])) > 30;
    };
    const larg = Math.max(0, ...labs.map((l, i) => mede(l, LAB, i === hi ? 600 : 500, 13)));
    const passo = n > 1 ? (W - pl - pr) / (n - 1) : W;
    const k = Math.max(1, Math.ceil((larg + 10) / passo));
    const fixos = [n - 1]; if (hi >= 0) fixos.push(hi);
    const mostraL = i => fixos.indexOf(i) >= 0 || (i % k === 0 && fixos.every(f => Math.abs(px(i) - px(f)) >= larg + 8));
    vals.forEach((v, i) => {
      if (i === hi) return;
      const x = px(i), y = py(v);
      s += D(x, y, 4.2, c.fundo, ` stroke="${c.titulo}" stroke-width="1.5" data-a="f"`);
      if (mostraV(i)) s += T(x, y - 11, vls[i], LAB, 500, 13, c.apoio, 'middle', 0, ' data-a="f"');
    });
    if (hi >= 0 && hi < n) {
      const x = px(hi), y = py(vals[hi]);
      s += D(x, y, 8.5, c.destaque, ` stroke="${c.fundo}" stroke-width="2" data-a="p"`);
      /* o número do destaque procura um lugar livre: em cima, à esquerda, à direita, embaixo */
      const pos = lugarLivre(x, y, hiW, W, base, pts0, hi);
      s += T(pos.x, pos.y, vls[hi], NUM, 500, 30, c.titulo, pos.a, 0, ' data-a="f"');
    }
    labs.forEach((l, i) => {
      if (!mostraL(i)) return;
      s += T(px(i), base + 21, l, LAB, i === hi ? 600 : 500, 13, i === hi ? c.titulo : c.apoio, 'middle');
    });
    monta(el, W, H, s, o, c, 'linha');
  }

  /* =========================================================== COMPOSIÇÃO (100%) */
  function share(e, o) {
    o = o || {};
    const el = inicia(e, 'share', o); if (!el) return;
    const c = cores(el, o), W = largura(el, o);
    const sg = o.segments || [], hi = hiDe(o);
    const barH = 14, sep = 2;
    const tot = sg.reduce((a, t) => a + (+t.value || 0), 0) || 1;
    /* três neutros em degraus: o mais forte perto do apoio, o neutro de 3:1 e o mais leve perto do fundo */
    const neutros = [mistura(c.neutro, c.apoio, 0.45), c.neutro, mistura(c.neutro, c.fundo, 0.38)];
    let k = 0;
    const cor = sg.map((t, i) => (i === hi ? c.destaque : neutros[(k++) % 3]));
    const vls = sg.map(t => (t.vlabel != null ? String(t.vlabel) : auto(+t.value || 0)));
    let s = '', x = 0, topo = 0;
    /* o destaque ganha o número em Newsreader sobre o próprio trecho */
    if (hi >= 0 && hi < sg.length) {
      let x0 = 0;
      for (let i = 0; i < hi; i++) x0 += ((+sg[i].value || 0) / tot) * W;
      const nw = mede(vls[hi], NUM, 500, 34), lw = mede(sg[hi].label || '', LAB, 600, 13);
      const bloco = nw + 10 + lw;
      const bx = Math.max(0, Math.min(W - bloco, x0));
      s += T(bx, 30, vls[hi], NUM, 500, 34, c.titulo, 'start', 0, ' data-a="f"');
      s += T(bx + nw + 10, 30, sg[hi].label || '', LAB, 600, 13, c.titulo, 'start', 0, ' data-a="f"');
      topo = 44;
    }
    sg.forEach((t, i) => {
      const w = ((+t.value || 0) / tot) * W;
      const gap = i < sg.length - 1 ? sep : 0;
      s += R(x, topo, w - gap, barH, cor[i], ' data-a="x"');
      x += w;
    });
    const linhaH = 26, y0 = topo + barH + 30;
    let lx = 0, ly = 0;
    sg.forEach((t, i) => {
      const lw = mede(t.label || '', LAB, 500, 13), vw = mede(vls[i], LAB, 600, 13), iw = 10 + 8 + lw + 6 + vw;
      if (lx > 0 && lx + iw > W) { lx = 0; ly++; }
      const yy = y0 + ly * linhaH, ehHi = i === hi;
      s += R(lx, yy - 10, 10, 10, cor[i]);
      s += T(lx + 18, yy, t.label || '', LAB, 500, 13, ehHi ? c.titulo : c.apoio, 'start');
      s += T(lx + 18 + lw + 6, yy, vls[i], LAB, 600, 13, ehHi ? c.titulo : c.texto, 'start');
      lx += iw + 24;
    });
    monta(el, W, y0 + ly * linhaH + 8, s, o, c, 'composicao');
  }

  /* =========================================================== ANEL (o arco do valor, com o losango na ponta) */
  function ring(e, o) {
    o = o || {};
    const el = inicia(e, 'ring', o); if (!el) return;
    const c = cores(el, o), S = o.s || 220, W = Math.max(S, o.w || largura(el, o)), H = S;
    const cx = W / 2, cy = S / 2, sw = 3, r = S / 2 - 12, Cc = 2 * Math.PI * r;
    const frac = Math.min(1, Math.max(0, (+o.value || 0) / 100));
    const vl = o.vlabel != null ? String(o.vlabel) : auto(+o.value || 0) + '%';
    let s = `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(r)}" fill="none" stroke="${c.neutro}" stroke-width="1"/>`;
    s += L(cx, cy - r - 7, cx, cy - r + 7, c.apoio, 1);
    if (frac > 0) {
      s += `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(r)}" transform="rotate(-90 ${r2(cx)} ${r2(cy)})" fill="none" stroke="${c.destaque}" stroke-width="${sw}" stroke-dasharray="${r2(Cc * frac)} ${r2(Cc)}" data-a="r" data-v="${r2(Cc * frac)}" data-c="${r2(Cc)}"/>`;
      const a = -Math.PI / 2 + frac * 2 * Math.PI;
      s += D(cx + r * Math.cos(a), cy + r * Math.sin(a), 8.5, c.destaque, ` stroke="${c.fundo}" stroke-width="2" data-a="p"`);
    }
    let tam = S * 0.25;
    const interno = (r - 10) * 2 * 0.82;
    const nw = mede(vl, NUM, 500, tam);
    if (nw > interno) tam = tam * interno / nw;
    const lab = o.label ? String(o.label).toUpperCase() : '';
    const ls = lab ? quebra(lab, LAB, 500, 11, interno * 0.86, 2, 2.2) : [];
    const blocoH = tam * 0.72 + (ls.length ? 12 + ls.length * 15 : 0);
    const topo = cy - blocoH / 2;
    s += T(cx, topo + tam * 0.72, vl, NUM, 500, r2(tam), c.titulo, 'middle');
    ls.forEach((ln, k) => { s += T(cx + 1.1, topo + tam * 0.72 + 23 + k * 15, ln, LAB, 500, 11, c.apoio, 'middle', 2.2); });
    monta(el, W, H, s, o, c, 'anel');
  }

  /* =========================================================== FUNIL (jornada com perda entre etapas) */
  function funnel(e, o) {
    o = o || {};
    const el = inicia(e, 'funnel', o); if (!el) return;
    const c = cores(el, o), W = largura(el, o);
    const st = o.stages || [], hi = hiDe(o), taxas = !!o.taxas;
    const vls = st.map(t => (t.vlabel != null ? String(t.vlabel) : auto(+t.value || 0)));
    const max = Math.max(...st.map(t => +t.value || 0), 0) || 1;
    const barH = 12, labH = 30, gap = taxas ? 34 : 18;
    const larg = t => Math.max(W * 0.06, Math.min(W, ((+t.value || 0) / max) * W));
    let s = '', y = 0;
    st.forEach((t, i) => {
      const ehHi = i === hi, w = larg(t), x = (W - w) / 2;
      const valW = ehHi ? mede(vls[i], NUM, 500, 28) : mede(vls[i], LAB, 600, 15);
      const lab = quebra(String(t.label == null ? '' : t.label), LAB, ehHi ? 600 : 500, 13, W - valW - 16, 2);
      const extra = (lab.length - 1) * 16;
      lab.forEach((ln, k) => { s += T(0, y + 18 + k * 16, ln, LAB, ehHi ? 600 : 500, 13, ehHi ? c.titulo : c.texto, 'start'); });
      if (ehHi) s += T(W, y + 22, vls[i], NUM, 500, 28, c.titulo, 'end', 0, ' data-a="f"');
      else s += T(W, y + 18, vls[i], LAB, 600, 15, c.texto, 'end');
      const by = y + labH + extra;
      s += R(x, by, w, barH, ehHi ? c.destaque : c.neutro, ' data-a="xc"');
      y = by + barH;
      if (i < st.length - 1) {
        if (taxas) {
          const a = +t.value || 0, b = +st[i + 1].value || 0;
          const pct = a > 0 ? Math.round((b / a) * 100) : 0;
          const txt = pct + '% seguem';
          s += L(W / 2, y + 4, W / 2, y + 11, c.apoio, 1);
          s += T(W / 2, y + 25, txt, LAB, 500, 11, c.apoio, 'middle', 0.6);
        }
        y += gap;
      }
    });
    monta(el, W, Math.max(1, y), s, o, c, 'funil');
  }

  /* =========================================================== FLUXO (processo em etapas) */
  function flow(e, o) {
    o = o || {};
    const el = inicia(e, 'flow', o); if (!el) return;
    const c = cores(el, o), W = largura(el, o);
    const st = o.steps || [], k = st.length, hi = hiDe(o), numeros = o.numeros !== false;
    const cel = 32, pad = 18, m = 1;
    /* lado a lado; empilha quando a caixa ficaria estreita demais para a maior palavra */
    const mp = (campo, peso, tam) => maiorPalavra(st.map(t => t[campo]), LAB, peso, tam);
    const box0 = (W - m * 2 - cel * (k - 1)) / Math.max(1, k);
    const cabeLado = box0 - pad * 2 >= mp('label', 600, 13);
    const vert = k > 1 && ((W < 520 && k > 3) || box0 < 120 || !cabeLado);
    const boxW = vert ? W - m * 2 : box0;
    const tw = boxW - pad * 2;
    /* só corpos da escala da casa: título 15 ou 13, apoio 13 ou 11 */
    const fl = mp('label', 600, 15) <= tw ? 15 : 13;
    const fsb = mp('sub', 400, 13) <= tw ? 13 : 11;
    const lhL = fl * 1.33, lhS = fsb * 1.38;
    const numH = numeros ? 34 : 0;
    const blocos = st.map(t => {
      const Lq = quebra(t.label || '', LAB, 600, fl, tw, 3);
      const S = t.sub ? quebra(t.sub, LAB, 400, fsb, tw, 4) : [];
      return { L: Lq, S, th: Lq.length * lhL + (S.length ? 6 + S.length * lhS : 0) };
    });
    const maxTh = Math.max(0, ...blocos.map(b => b.th));
    const boxH = pad + numH + maxTh + pad;
    const H = vert ? k * boxH + (k - 1) * cel + m * 2 : boxH + m * 2;
    let s = '';
    st.forEach((t, i) => {
      const ehHi = i === hi;
      const x = vert ? m : m + i * (boxW + cel), y = vert ? m + i * (boxH + cel) : m;
      s += `<g data-a="f"><rect x="${r2(x)}" y="${r2(y)}" width="${r2(boxW)}" height="${r2(boxH)}" fill="none" stroke="${ehHi ? c.destaque : c.fio}" stroke-width="1"/>`;
      let ty = y + pad;
      if (numeros) {
        s += T(x + pad, ty + 24, dois(i + 1), NUM, 500, 28, ehHi ? c.destaque : c.apoio, 'start');
        if (ehHi) s += D(x + boxW - pad - 6, ty + 14, 6, c.destaque);
        ty += numH;
      }
      const b = blocos[i];
      b.L.forEach(ln => { ty += lhL; s += T(x + pad, ty - fl * 0.33, ln, LAB, 600, r2(fl), c.titulo, 'start'); });
      if (b.S.length) ty += 6;
      b.S.forEach(ln => { ty += lhS; s += T(x + pad, ty - fsb * 0.36, ln, LAB, 400, r2(fsb), c.apoio, 'start'); });
      s += '</g>';
      if (i < k - 1) {
        const est = `fill="none" stroke="${c.apoio}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"`;
        if (vert) {
          const cx = x + boxW / 2, cy = y + boxH + cel / 2;
          s += `<path d="M${r2(cx - 7)},${r2(cy - 3.5)} L${r2(cx)},${r2(cy + 3.5)} L${r2(cx + 7)},${r2(cy - 3.5)}" ${est}/>`;
        } else {
          const cx = x + boxW + cel / 2, cy = y + boxH / 2;
          s += `<path d="M${r2(cx - 3.5)},${r2(cy - 7)} L${r2(cx + 3.5)},${r2(cy)} L${r2(cx - 3.5)},${r2(cy + 7)}" ${est}/>`;
        }
      }
    });
    monta(el, W, H, s, o, c, 'fluxo');
  }

  /* =========================================================== KPI (número em destaque) */
  function kpi(e, o) {
    o = o || {};
    const el = inicia(e, 'kpi', o); if (!el) return;
    const c = cores(el, o), W = largura(el, o);
    const vl = o.vlabel != null ? String(o.vlabel) : auto(+o.value || 0);
    const un = o.unit ? String(o.unit).toUpperCase() : '';
    const serie = (o.serie || []).map(v => +v || 0);
    const lado = serie.length > 1 && W >= 460;
    let tam = Math.min(104, Math.max(56, W * 0.24));
    const uw = un ? mede(un, LAB, 500, 11, 2.2) + 14 : 0;
    const dispN = (lado ? W * 0.56 : W) - uw;
    let nw = mede(vl, NUM, 500, tam);
    if (nw > dispN) { tam = tam * dispN / nw; nw = dispN; }
    const base = tam * 0.8;
    let s = T(0, base, vl, NUM, 500, r2(tam), c.titulo, 'start', 0, ' data-a="f"');
    if (un) s += T(nw + 12, base, un, LAB, 500, 11, c.apoio, 'start', 2.2);
    /* o fio de destaque sob o número */
    let y = base + tam * 0.16 + 12;
    s += R(0, y, Math.max(48, Math.min(nw, W)), 2, c.destaque, ' data-a="x"');
    y += 2;
    const larguraTxt = lado ? W * 0.56 : W;
    if (o.label) {
      const ls = quebra(o.label, LAB, 500, 15, larguraTxt, 3);
      ls.forEach((ln, k) => { s += T(0, y + 26 + k * 21, ln, LAB, 500, 15, c.texto, 'start'); });
      y += 26 + (ls.length - 1) * 21 + 6;
    }
    if (o.sub) {
      const ls = quebra(o.sub, LAB, 400, 13, larguraTxt, 3);
      ls.forEach((ln, k) => { s += T(0, y + 18 + k * 18, ln, LAB, 400, 13, c.apoio, 'start'); });
      y += 18 + (ls.length - 1) * 18 + 6;
    }
    if (serie.length > 1) {
      const sx = lado ? W * 0.64 : 0, sw = lado ? W - sx - 8 : W - 8;
      const sy = lado ? 8 : y + 20, sh = lado ? Math.max(40, base - 4) : 52;
      const mx = Math.max(...serie), mn = Math.min(...serie), amp = mx - mn || 1;
      const px = i => sx + (i * sw) / (serie.length - 1);
      const py = v => sy + (1 - (v - mn) / amp) * sh;
      const pts = serie.map((v, i) => `${r2(px(i))},${r2(py(v))}`).join(' ');
      s += L(sx, sy + sh + 8.5, sx + sw, sy + sh + 8.5, c.fio, 1);
      s += `<polyline points="${pts}" fill="none" stroke="${c.apoio}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" data-a="d"/>`;
      const u = serie.length - 1;
      s += D(px(u), py(serie[u]), 7, c.destaque, ` stroke="${c.fundo}" stroke-width="2" data-a="p"`);
      if (!lado) y = sy + sh + 12;
    }
    monta(el, W, Math.max(y + 4, lado ? base + tam * 0.3 : 0), s, o, c, 'kpi');
  }

  /* =========================================================== LINHA DO TEMPO */
  function timeline(e, o) {
    o = o || {};
    const el = inicia(e, 'timeline', o); if (!el) return;
    const c = cores(el, o), W = largura(el, o);
    const ev = o.eventos || o.events || [], n = ev.length;
    const hi = o.highlight == null ? n - 1 : +o.highlight;
    if (!n) { monta(el, W, 20, '', o, c, 'linha-tempo'); return; }
    const datas = ev.map(t => String(t.data || '').toUpperCase());
    const colW = W / n;
    const precisa = Math.max(maiorPalavra(ev.map(t => t.label), LAB, 600, 13), ...datas.map(d => mede(d, LAB, 500, 11, 2.2))) + 18;
    const horizontal = n > 1 && colW >= Math.max(118, precisa);
    /* o agora: losango cheio com o contorno em volta; o que passou: cheio pequeno; o que falta: contorno */
    const ponto = (x, y, i) => {
      if (i === hi) return D(x, y, 13, 'none', ` stroke="${c.destaque}" stroke-width="1" data-a="p"`) + D(x, y, 7.5, c.destaque, ' data-a="p"');
      if (i < hi) return D(x, y, 4.5, c.apoio, ' data-a="p"');
      return D(x, y, 4.5, c.fundo, ` stroke="${c.apoio}" stroke-width="1.5" data-a="p"`);
    };
    let s = '', H = 0;
    if (horizontal) {
      const eixo = 42, x0 = 14, xh = x0 + Math.max(0, hi) * colW;
      s += L(x0, eixo, Math.min(W, xh), eixo, c.apoio, 1, ' data-a="x"');
      if (hi < n - 1) s += L(xh, eixo, W, eixo, c.apoio, 1, ' stroke-dasharray="3 4" data-a="x"');
      let fundo = 0;
      ev.forEach((t, i) => {
        const x = i * colW, ehHi = i === hi, tw = colW - 20;
        s += T(x, 18, datas[i], LAB, 500, 11, ehHi ? c.destaque : c.apoio, 'start', 2.2);
        s += ponto(x + x0, eixo, i);
        let y = eixo + 36;
        quebra(t.label || '', LAB, 600, 13, tw, 3).forEach(ln => { s += T(x, y, ln, LAB, 600, 13, ehHi ? c.titulo : c.texto, 'start'); y += 18; });
        if (t.sub) { y += 2; quebra(t.sub, LAB, 400, 13, tw, 4).forEach(ln => { s += T(x, y, ln, LAB, 400, 13, c.apoio, 'start'); y += 18; }); }
        fundo = Math.max(fundo, y);
      });
      H = fundo - 8;
    } else {
      const x0 = 14, tx = 40, tw = W - tx;
      let y = 8;
      const centros = [];
      let partes = '';
      ev.forEach((t, i) => {
        const ehHi = i === hi;
        centros.push(y + 7);
        partes += T(tx, y + 11, datas[i], LAB, 500, 11, ehHi ? c.destaque : c.apoio, 'start', 2.2);
        let yy = y + 11 + 22;
        quebra(t.label || '', LAB, 600, 13, tw, 3).forEach(ln => { partes += T(tx, yy, ln, LAB, 600, 13, ehHi ? c.titulo : c.texto, 'start'); yy += 18; });
        if (t.sub) { yy += 2; quebra(t.sub, LAB, 400, 13, tw, 5).forEach(ln => { partes += T(tx, yy, ln, LAB, 400, 13, c.apoio, 'start'); yy += 18; }); }
        y = yy + 14;
      });
      const yh = centros[Math.max(0, Math.min(n - 1, hi))];
      s += L(x0, centros[0], x0, yh, c.apoio, 1, ' data-a="f"');
      if (hi < n - 1) s += L(x0, yh, x0, centros[n - 1], c.apoio, 1, ' stroke-dasharray="3 4" data-a="f"');
      ev.forEach((t, i) => { s += ponto(x0, centros[i], i); });
      s += partes;
      H = y - 14;
    }
    monta(el, W, Math.max(40, H), s, o, c, 'linha-tempo');
  }

  /* =========================================================== COTA */
  function cota(e, o) {
    o = o || {};
    const el = inicia(e, 'cota', o); if (!el) return;
    const c = cores(el, o), W = largura(el, o), H = 24, cy = 12;
    const lab = String(o.label || '').toUpperCase();
    const tw = mede(lab, LAB, 500, 11, 2.2);
    const a = W / 2 - tw / 2 - 10, b = W / 2 + tw / 2 + 10;
    let s = L(0.5, cy, a, cy, c.apoio, 1) + L(b, cy, W - 0.5, cy, c.apoio, 1);
    s += L(0.5, cy - 6, 0.5, cy + 6, c.apoio, 1) + L(W - 0.5, cy - 6, W - 0.5, cy + 6, c.apoio, 1);
    s += T(W / 2 + 1.1, cy + 4, lab, LAB, 500, 11, c.apoio, 'middle', 2.2);
    o = Object.assign({ aria: lab, animar: false }, o);
    monta(el, W, H, s, o, c, 'cota');
  }

  /* =========================================================== montagem e nomes */
  const tipos = { bars, hbars, line, share, ring, funnel, flow, kpi, timeline, cota };
  const TIPO = { barras: 'bars', 'barras-h': 'hbars', barrash: 'hbars', ranking: 'hbars', linha: 'line', composicao: 'share', 'composição': 'share',
    anel: 'ring', funil: 'funnel', fluxo: 'flow', numero: 'kpi', 'número': 'kpi', 'linha-tempo': 'timeline', 'linha-do-tempo': 'timeline', cronologia: 'timeline' };
  const CHAVE = { rotulos: 'labels', valores: 'values', vrotulos: 'vlabels', destaque: 'highlight', unidade: 'unit', altura: 'h', largura: 'w',
    etapas: 'stages', segmentos: 'segments', passos: 'steps', rotulo: 'label', valor: 'value', vrotulo: 'vlabel', tamanho: 's' };
  function normaliza(o) {
    if (Array.isArray(o)) return o.map(normaliza);
    if (!o || typeof o !== 'object') return o;
    const r = {};
    Object.keys(o).forEach(k => { r[CHAVE[k] || k] = normaliza(o[k]); });
    return r;
  }
  function render(el, tipo, opts) {
    const f = tipos[TIPO[tipo] || tipo];
    if (f) f(el, normaliza(opts || {}));
    else if (typeof console !== 'undefined') console.error('bviz: tipo desconhecido "' + tipo + '"');
  }
  function montar(raiz) {
    if (!temDoc) return;
    (raiz || document).querySelectorAll('[data-bviz]').forEach(el => {
      if (el.__bvizMontado || el.tagName.toLowerCase() === 'svg') return;
      let cfg;
      try { cfg = JSON.parse(el.getAttribute('data-bviz')); } catch (err) { console.error('bviz: data-bviz não é JSON válido', el); return; }
      el.__bvizMontado = 1;
      render(el, cfg.tipo, cfg);
    });
  }
  function redesenhar() {
    registro.forEach(el => {
      if (!el.isConnected) { registro.delete(el); return; }
      const c = el.__bviz;
      if (c && tipos[c.tipo]) tipos[c.tipo](el, c.opts);
    });
  }
  /* o SVG pronto, com xmlns e cores em HEX, para salvar ou colar em outro programa */
  function svg(e) {
    const el = alvo(e);
    const s = el && (el.tagName && el.tagName.toLowerCase() === 'svg' ? el : el.querySelector('svg'));
    return s ? s.outerHTML : '';
  }
  let ro = null, espera = 0;
  const larguras = new WeakMap();
  function observa(el) {
    if (!ro && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(entradas => {
        let mudou = false;
        entradas.forEach(en => {
          const w = Math.round(en.contentRect.width);
          if (larguras.get(en.target) !== w) { larguras.set(en.target, w); mudou = true; }
        });
        if (!mudou) return;
        clearTimeout(espera);
        espera = setTimeout(redesenhar, 120);
      });
    }
    if (ro && !larguras.has(el)) { larguras.set(el, Math.round(el.clientWidth || 0)); ro.observe(el); }
  }
  const api = { bars, hbars, line, share, ring, funnel, flow, kpi, timeline, cota,
    barras: bars, barrasH: hbars, ranking: hbars, linha: line, composicao: share, anel: ring, funil: funnel, fluxo: flow,
    numero: kpi, linhaTempo: timeline,
    fmt, render, montar, redesenhar, svg, paletas: PALETAS, animar: true, version: '1.0' };
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeprint', () => { terminaAnimacoes(); redesenhar(); });
    try {
      if (temDoc && document.fonts) {
        const recarrega = () => { cache.clear(); redesenhar(); };
        document.fonts.ready.then(recarrega);
        document.fonts.addEventListener('loadingdone', recarrega);
      }
    } catch (err) { /* sem API de fontes: segue com a medida atual */ }
    if (temDoc) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => montar());
      else montar();
    }
  }
  return api;
})();
if (typeof window !== 'undefined') window.bviz = bviz;
