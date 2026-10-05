/* =====================================================================
   BFORMS · formas da casa da Borelli Advocacia · sistema Grifo Nosso v1
   A ilustração do escritório. Quando uma peça precisa de uma FORMA (um conceito, não um
   dado), ela sai daqui: nunca de banco de imagem, nunca de emoji, nunca de desenho feito na
   hora e nunca de clichê jurídico (balança, martelo de juiz, coluna grega, livro de leis,
   estátua da Justiça).

   De onde vêm as formas
   · Todas saem da geometria do símbolo: a grade de 45°, o losango (quadrado girado 45°,
     com meia-diagonal de um módulo), a linha reta das barras da moldura e a ponta em ângulo
     reto dos dois chevrons. Ecoam o símbolo sem imitá-lo: nenhuma forma junta os três
     losangos no arranjo do símbolo com a moldura e as pontas. O símbolo, quando a peça
     precisa dele, é sempre o arquivo de assets/.

   Regras do motor
   · JavaScript ES2015 simples, zero dependências, SVG puro. As formas simples usam viewBox
     0 0 120 120. A trama, a moldura com foto, o percurso com rótulos, o grifo com texto e a
     linha divisora medem o contêiner.
   · Determinístico: nunca Math.random, nunca Date. Mesma entrada, mesmo desenho.
   · Na tela, traço de 1,5 px que não engrossa quando a forma cresce (vector-effect:
     non-scaling-stroke); as linhas de construção e a moldura têm 1 px. Dentro de uma .peca
     (em .mock), o motor mede a peça e desenha em proporção: a linha da peça (2 px na de
     1080; 2,5 no traço da forma) e o losango da peça (18 px de lado).
   · Cantos retos: ponta de linha reta e junção em ângulo vivo, como o traço do símbolo.
   · Cores do campo onde a forma está: --f-linha-destaque no traço principal (ouro no azul,
     azul Borelli no claro, champanhe no Marinho), --f-losango no losango, --f-apoio no traço
     secundário e --dado-3 nas linhas de construção. O grifo é a faixa --grifo no claro e o
     sublinhado --f-grifo-linha no azul. Ou cores fixas pela opção campo ('noite' | 'papel' |
     'mare' | 'abismo' | 'marinho' | 'branco' | 'nevoa'). Sempre HEX por extenso, em
     atributo: nenhum degradê de cor, nenhum metal (o metal é só da marca). O ouro nunca é
     texto no claro: lá a forma sai em azul Borelli.
   · Uma forma por peça ou por bloco, ao lado do texto, nunca atrás de texto de leitura.
     A trama é a única de fundo: só em campo azul e nunca atrás de texto pequeno.
   · Um losango cheio por peça no máximo: as formas saem com losangos de contorno, e o cheio
     só onde a forma marca a informação principal.
   · Entrada discreta ao aparecer na tela (o losango chega por último, o grifo passa da
     esquerda para a direita); nunca com prefers-reduced-motion, na impressão nem em
     navegador automatizado (captura de tela). animar:false desliga numa forma;
     bforms.animar = false desliga todas.

   Como usar
     <div class="forma-svg" data-bforms="losango"></div>                       (monta sozinho)
     <div class="forma-svg" data-bforms='{"forma":"percurso","rotulos":["Negativa","Documentos","Pedido","Decisão"]}'></div>
     bforms.elo(el, { aria:'Documento e regra' })                              (por chamada)
     bforms.render(el, nome, opts) · bforms.montar(raiz) · bforms.redesenhar()
     bforms.svg(nome, opts) devolve o SVG pronto (texto), com as medidas da peça de 1080,
     para salvar ou levar ao Canva.
   Opções comuns: aria (texto: role="img" com aria-label; sem aria, a forma é decorativa;
   percurso com rótulos, grifo com texto e moldura com alt descrevem-se sozinhos), campo,
   peca (largura da forma em px da peça; false desliga), animar.

   As nove formas da casa
     linha     a régua: a estrutura, o que organiza e separa (a barra da moldura do símbolo).
               Opções: orientacao 'horizontal' | 'vertical'; losango true | false | 'cheio'
               (o marcador no começo da linha); marcas (true: a régua com as marcas do
               módulo); divisor (true: a linha na largura do contêiner, com 16 px de altura,
               para separar trechos de uma página ou de uma peça)
     losango   o foco, a parte que decide: um losango com espaço em volta. Opções: cheio
     elo       dois losangos que se tocam por uma ponta: pessoa e direito, documento e regra.
               Opções: orientacao 'horizontal' | 'vertical'; cheio 0 | 1 (qual dos dois sai
               cheio; sem a opção, o ponto de contato é que se marca)
     avanco    uma a três pontas em ângulo reto, o chevron do símbolo: o próximo passo.
               Opções: n (1 a 3); direcao 'direita' | 'baixo'
     percurso  etapas em losango ligadas por linha, fechando com o avanço: as etapas do caso.
               Opções: passos (3 a 5); destaque (0 = a primeira; -1 = nenhuma); rotulos e
               subs (com os nomes das etapas vira diagrama: número em Newsreader, etapa e
               explicação em Lexend que quebra linha; horizontal quando cabe, vertical
               quando não; de 2 a 6 etapas)
     trama     a malha de losangos do símbolo como textura de fundo em campo azul (a mesma da
               classe .trama). Opções: densidade (losangos na largura: 'baixa' 4, 'media' 6,
               'alta' 9, ou um número de 2 a 16; sem ela, um losango a cada 90 px na tela e a
               cada 180 px na peça, 6 na de 1080); opacidade (de 0,04 a 0,4; padrão 0,16);
               esmaecer ('esquerda', o padrão: some para a esquerda; 'direita' | 'cima' |
               'baixo' | false); proporcao (largura/altura, quando o contêiner não tem altura)
     grade45   a grade de construção com os nós: precisão, método. Opções: n (3 a 8
               módulos); destaque [coluna, linha] do nó marcado (a soma é par) ou false;
               nos (true); mira (true: as duas diagonais que passam pelo nó marcado)
     moldura   a janela da foto: retângulo de linha fina a 12 px da imagem, com um losango
               num canto. Opções: foto (caminho relativo da imagem), alt, proporcao ('4/5'),
               alinhar ('topo' | 'centro' | 'base'), canto ('se' | 'sd' | 'ie' | 'id':
               superior esquerdo, superior direito, inferior esquerdo, inferior direito;
               padrão 'sd'), cheio (true), amostra (sem foto, o bloco que marca o lugar
               dela; false tira; o arquivo de bforms.svg sai sem ela)
     grifo     a faixa de marca-texto sob uma palavra: o destaque. Sem texto, um parágrafo
               com uma palavra grifada. Opções: texto (a palavra ou a frase, em Newsreader
               500); grifar (o trecho que recebe o grifo; padrão: o texto inteiro); tamanho
               (px; padrão 40 na tela e o título da peça dentro de uma .peca)
   ===================================================================== */
const bforms = (() => {
  'use strict';
  let seq = 0, seqX = 0;
  const temDoc = typeof document !== 'undefined';
  const el$ = e => (typeof e === 'string' ? (temDoc ? document.getElementById(e) : null) : e);
  const f = v => (Math.round(v * 100) / 100).toString();
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const lim = (v, a, b) => Math.max(a, Math.min(b, v));
  const R2 = Math.SQRT2;
  const NS = ' vector-effect="non-scaling-stroke"';
  const nomes = ['linha', 'losango', 'elo', 'avanco', 'percurso', 'trama', 'grade45', 'moldura', 'grifo'];

  /* ---------- paletas da casa (HEX por extenso) ---------- */
  const PALETAS = {
    papel: { traco: '#244460', losango: '#244460', apoio: '#5B6875', fio: '#B7C6D4', fundo: '#F7F9FB',
      titulo: '#172B3D', texto: '#3F4A56', grifo: '#FFE9A8', sublinhado: '#244460' },
    noite: { traco: '#C9A24D', losango: '#C9A24D', apoio: '#AEBCCB', fio: '#4C6680', fundo: '#172B3D',
      titulo: '#FFFFFF', texto: '#DCE6EF', grifo: '', sublinhado: '#C9A24D' }
  };
  PALETAS.mare = Object.assign({}, PALETAS.noite, { fundo: '#1E354B' });
  PALETAS.abismo = Object.assign({}, PALETAS.noite, { fundo: '#0F1D2A' });
  PALETAS.marinho = Object.assign({}, PALETAS.noite, { traco: '#EBD081', losango: '#EBD081', sublinhado: '#EBD081', apoio: '#C2CFDC', fio: '#5A7896', fundo: '#244460' });
  PALETAS.branco = Object.assign({}, PALETAS.papel, { fundo: '#FFFFFF' });
  PALETAS.nevoa = Object.assign({}, PALETAS.papel, { apoio: '#56626F', fundo: '#E1ECF5' });
  const VARS = [['traco', '--f-linha-destaque'], ['losango', '--f-losango'], ['apoio', '--f-apoio'], ['fio', '--dado-3'],
    ['fundo', '--f-fundo'], ['titulo', '--f-titulo'], ['texto', '--f-texto'], ['sublinhado', '--f-grifo-linha'], ['grifo', '--grifo']];

  /* qualquer cor (#abc, #aabbcc, rgb(), rgba()) vira #AABBCC; o resto (transparent, degradê) é ignorado */
  function hex(v) {
    v = String(v || '').trim();
    let m;
    if (/^#[0-9a-f]{3}$/i.test(v)) return ('#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]).toUpperCase();
    if (/^#[0-9a-f]{6}$/i.test(v)) return v.toUpperCase();
    if (/^#[0-9a-f]{8}$/i.test(v)) return v.slice(0, 7).toUpperCase();
    m = v.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?/i);
    if (m) {
      if (m[4] != null && parseFloat(m[4]) === 0) return null;          /* transparente */
      return '#' + [m[1], m[2], m[3]].map(n => ('0' + Math.max(0, Math.min(255, Math.round(+n))).toString(16)).slice(-2)).join('').toUpperCase();
    }
    return null;
  }
  function luz(h) {
    const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function completa(c) {
    c.claro = luz(c.fundo) > 0.4;
    if (c.claro && !c.grifo) c.grifo = '#FFE9A8';
    if (!c.claro) c.grifo = '';                     /* no azul, o grifo é o sublinhado */
    if (!c.sublinhado) c.sublinhado = c.traco;
    return c;
  }
  /* a cor que está de fato atrás da forma (o painel de uma galeria, a peça, o campo) */
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
    const c = Object.assign({}, PALETAS.papel);
    try {
      const cs = getComputedStyle(el);
      VARS.forEach(par => { const h = hex(cs.getPropertyValue(par[1])); if (h) c[par[0]] = h; });
    } catch (err) { /* sem estilo calculado: fica o papel */ }
    /* o campo Marinho não redefine --dado-3: a linha de construção vem da paleta dele */
    if (c.fundo === PALETAS.marinho.fundo) c.fio = PALETAS.marinho.fio;
    const real = fundoReal(el);
    if (real) c.fundo = real;
    return completa(c);
  }

  /* ---------- medida: na tela (traço fixo) ou na peça (em proporção) ---------- */
  const pecaPadrao = px => ({ px, esc: 1, base: 1080, linhaRaw: 2, linha: 2.5, losango: 18, rot: 26, titulo: 104 });
  function naPeca(el, o) {
    if (o.peca === false) return null;
    if (+o.peca) return pecaPadrao(+o.peca);
    try {
      const peca = el.closest && el.closest('.peca');
      const mock = peca && peca.closest('.mock');
      if (!mock) return null;
      const cs = getComputedStyle(mock);
      const base = parseFloat(cs.getPropertyValue('--base')) || 1080;
      const mw = mock.getBoundingClientRect().width, w = el.clientWidth;
      if (!(mw > 0 && w > 0)) return null;
      const lr = parseFloat(cs.getPropertyValue('--pc-linha')) || 2;
      return { px: w * base / mw, esc: mw / base, base, linhaRaw: lr, linha: Math.max(1.5, lr * 1.25),
        losango: parseFloat(cs.getPropertyValue('--pc-losango')) || 18, rot: parseFloat(cs.getPropertyValue('--pc-rotulo')) || 26,
        titulo: parseFloat(cs.getPropertyValue('--pc-titulo')) || 104 };
    } catch (err) { return null; }
  }
  /* formas de 120 × 120: w1 traço principal, w2 linha de construção, k escala do losango marcador */
  function medida(p) {
    if (!p) return { w1: 1.5, w2: 1, k: 1, ns: NS, p: null };
    const u = 120 / p.px;                              /* unidades do desenho por px da peça */
    return { w1: p.linha * u, w2: p.linha * 0.6 * u, k: Math.min(1, (p.losango / R2 * u) / 5), ns: '', p };
  }

  /* ---------- primitivas ---------- */
  const dLos = (cx, cy, r) => `M${f(cx)} ${f(cy - r)}L${f(cx + r)} ${f(cy)}L${f(cx)} ${f(cy + r)}L${f(cx - r)} ${f(cy)}Z`;
  function kit(c, m) {
    /* traço reto, junção em ângulo vivo (o símbolo não tem canto redondo) */
    const tr = (d, cor, esp, extra) => `<path d="${d}" fill="none" stroke="${cor}" stroke-width="${f(esp || m.w1)}" stroke-linejoin="miter" stroke-miterlimit="4"${m.ns}${extra || ''}/>`;
    /* losango do tamanho da forma (não encolhe na peça) */
    const contorno = (cx, cy, r, cor, esp, extra) => tr(dLos(cx, cy, r), cor, esp, extra);
    /* losango vazado: só o contorno, para qualquer fundo (a linha para na ponta dele) */
    const vazado = (cx, cy, r, cor) => `<path d="${dLos(cx, cy, r * m.k)}" fill="none" stroke="${cor || c.traco}" stroke-width="${f(m.w1)}" stroke-linejoin="miter"${m.ns} data-a="p"/>`;
    /* losango cheio: a informação principal (um por peça) */
    const cheio = (cx, cy, r, cor) => `<path d="${dLos(cx, cy, r * m.k)}" fill="${cor || c.losango}" data-a="p"/>`;
    /* nó da grade */
    const no = (cx, cy, r, cor) => `<path d="${dLos(cx, cy, r * m.k)}" fill="${cor}"/>`;
    return { tr, contorno, vazado, cheio, no };
  }
  /* segmentos das diagonais de 45° dentro de um retângulo [x0,x1] × [y0,y1] */
  function diagonal(soma, s, x0, y0, x1, y1) {
    let a, b;
    if (soma) { a = Math.max(x0, s - y1); b = Math.min(x1, s - y0); return b - a > 0.01 ? `M${f(a)} ${f(s - a)}L${f(b)} ${f(s - b)}` : ''; }
    a = Math.max(x0, y0 + s); b = Math.min(x1, y1 + s);
    return b - a > 0.01 ? `M${f(a)} ${f(a - s)}L${f(b)} ${f(b - s)}` : '';
  }

  /* ---------- as formas de 120 × 120 ---------- */
  const formas = {
    /* LINHA · a régua: a estrutura (a barra da moldura do símbolo virando régua) */
    linha: (c, o, m, K) => {
      const v = o.orientacao === 'vertical' || o.vertical === true;
      const los = o.losango === undefined ? true : o.losango;
      const r = 5, a = 14, b = 106, ini = los ? a + 2 * r * m.k : a;
      let s = '';
      if (o.marcas) {
        let d = '';
        for (let i = 0, x = ini; x <= b + 0.01; i++, x += 12) {
          const l = i % 4 === 0 ? 8 : 4.5;
          d += v ? `M60 ${f(x)}H${f(60 + l)}` : `M${f(x)} 60V${f(60 + l)}`;
        }
        s += K.tr(d, c.apoio, m.w2);
      }
      s += K.tr(v ? `M60 ${f(ini)}V${b}` : `M${f(ini)} 60H${b}`, c.traco);
      if (los) {
        const cx = v ? 60 : a + r * m.k, cy = v ? a + r * m.k : 60;
        s += los === 'cheio' ? K.cheio(cx, cy, r) : K.vazado(cx, cy, r, c.losango);
      }
      return s;
    },
    /* LOSANGO · o foco: a parte que decide, com espaço em volta */
    losango: (c, o, m, K) => K.contorno(60, 60, 44, c.fio, m.w2) +
      (o.cheio ? `<path d="${dLos(60, 60, 13)}" fill="${c.losango}" data-a="p"/>` : K.contorno(60, 60, 13, c.losango, m.w1, ' data-a="p"')),
    /* ELO · dois losangos que se tocam por uma ponta */
    elo: (c, o, m, K) => {
      const v = o.orientacao === 'vertical', R = 23;
      const A = v ? [60, 60 - R] : [60 - R, 60], B = v ? [60, 60 + R] : [60 + R, 60];
      const ch = o.cheio == null || o.cheio === false ? -1 : +o.cheio;
      const cheioGrande = P => `<path d="${dLos(P[0], P[1], R)}" fill="${c.losango}" data-a="p"/>`;
      let s = ch === 0 ? cheioGrande(A) : K.contorno(A[0], A[1], R, c.apoio);
      s += ch === 1 ? cheioGrande(B) : K.contorno(B[0], B[1], R, c.traco);
      if (ch < 0) s += K.cheio(60, 60, 4.5);                 /* o ponto de contato */
      return s;
    },
    /* AVANÇO · uma a três pontas em ângulo reto: o próximo passo */
    avanco: (c, o, m, K) => {
      const n = lim(Math.round(+o.n || 1), 1, 3);
      const h = [30, 26, 22][n - 1], passo = [0, 19, 16][n - 1];
      const x0 = 60 - (h + (n - 1) * passo) / 2;
      let s = '';
      for (let i = 0; i < n; i++) {
        const xa = x0 + i * passo;
        const atras = n - 1 - i;       /* a da frente é o traço principal; as de trás, apoio cada vez mais leve */
        s += K.tr(`M${f(xa)} ${f(60 - h)}L${f(xa + h)} 60L${f(xa)} ${f(60 + h)}`, atras ? c.apoio : c.traco, 0, atras ? ` stroke-opacity="${atras === 1 ? 0.75 : 0.45}"` : '');
      }
      return o.direcao === 'baixo' ? `<g transform="rotate(90 60 60)">${s}</g>` : s;
    },
    /* PERCURSO · etapas em losango ligadas por linha, fechando com o avanço */
    percurso: (c, o, m, K) => {
      const n = lim(Math.round(+o.passos || (o.rotulos && o.rotulos.length) || 4), 3, 5);
      const d = o.destaque == null ? 0 : (+o.destaque < 0 ? -1 : lim(Math.round(+o.destaque), 0, n - 1));
      const x = i => 14 + i * 74 / (n - 1), xv = 106, hc = 8;
      const rr = i => (i === d ? 6.5 : 4.5) * m.k;
      let s = '';
      /* a linha liga os losangos pela ponta (não passa por dentro deles): vale em qualquer fundo */
      for (let i = 0; i < n; i++) {
        const fim = i < n - 1 ? x(i + 1) - rr(i + 1) : xv;
        s += i < d ? K.tr(`M${f(x(i) + rr(i))} 60H${f(fim)}`, c.traco) : K.tr(`M${f(x(i) + rr(i))} 60H${f(fim)}`, c.apoio, m.w2);
      }
      s += K.tr(`M${xv - hc} ${60 - hc}L${xv} 60L${xv - hc} ${60 + hc}`, c.traco);
      for (let i = 0; i < n; i++) s += i === d ? K.cheio(x(i), 60, 6.5) : K.vazado(x(i), 60, 4.5, c.traco);
      return s;
    },
    /* TRAMA · a malha de losangos (aqui, o recorte quadrado; no uso real, mede o contêiner) */
    trama: (c, o, m) => trama(120, 120, c, Object.assign({}, o, { esmaecer: false }), m.p, 'bft').s,
    /* GRADE45 · a grade de construção com os nós: precisão, método */
    grade45: (c, o, m, K) => {
      const n = lim(Math.round(+o.n || 4), 3, 8), N = 2 * n, a = 12, b = 108, h = (b - a) / N;
      let dA = '';
      for (let S = 0; S <= 2 * N; S += 2) dA += diagonal(true, 2 * a + S * h, a, a, b, b);
      for (let D = -N; D <= N; D += 2) dA += diagonal(false, D * h, a, a, b, b);
      let s = K.tr(dA, c.fio, m.w2);
      let dst = o.destaque === false ? null : (Array.isArray(o.destaque) ? o.destaque.map(Number) : [Math.round(N * 0.75), Math.round(N * 0.25)]);
      if (dst) {
        dst = [lim(Math.round(dst[0]), 0, N), lim(Math.round(dst[1]), 0, N)];
        if ((dst[0] + dst[1]) % 2) dst[1] = dst[1] < N ? dst[1] + 1 : dst[1] - 1;   /* só nós da grade */
      }
      if (dst && o.mira !== false) {
        const px = a + dst[0] * h, py = a + dst[1] * h;
        s += K.tr(diagonal(true, px + py, a, a, b, b) + diagonal(false, px - py, a, a, b, b), c.traco);
      }
      if (o.nos !== false) {
        for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
          if ((i + j) % 2 || (dst && i === dst[0] && j === dst[1])) continue;
          s += K.no(a + i * h, a + j * h, 1.7, c.apoio);
        }
      }
      if (dst) s += K.cheio(a + dst[0] * h, a + dst[1] * h, 5.5);
      return s;
    },
    /* MOLDURA · a janela da foto: linha fina a uma distância da imagem, losango num canto */
    moldura: (c, o, m, K) => {
      const r = 5, k = r * m.k + 1, d = 11;
      /* a amostra é o lugar da foto; no arquivo para baixar ela sai (a foto entra por baixo da moldura) */
      let s = o.amostra === false ? '' : `<rect x="${f(k + d)}" y="${f(k + d)}" width="${f(120 - 2 * (k + d))}" height="${f(120 - 2 * (k + d))}" fill="${c.fio}"/>`;
      s += K.tr(quadro(o.canto, k, k, 120 - k, 120 - k, r * m.k), c.traco, m.w2);
      const p = canto(o.canto, k, k, 120 - k, 120 - k);
      return s + (o.cheio === false ? K.vazado(p[0], p[1], r, c.losango) : K.cheio(p[0], p[1], r));
    },
    /* GRIFO · a faixa de marca-texto sob uma palavra (sem texto: um parágrafo com uma palavra grifada) */
    grifo: (c, o, m) => {
      const linhas = [[22, 12, 26, 13], [14, 20, 24, 15], [26, 16, 22], [18, 24, 12]];
      const ys = [36, 52, 68, 84], x0 = 16, sep = 5, e = 3, alvo = [1, 2];
      let s = '';
      linhas.forEach((ws, li) => {
        let x = x0;
        ws.forEach((w, wi) => {
          const eh = li === alvo[0] && wi === alvo[1], y = ys[li];
          if (eh && c.claro) s += `<rect x="${f(x - 2.5)}" y="${f(y - 1)}" width="${f(w + 5)}" height="6.5" fill="${c.grifo}" data-a="g"/>`;
          s += `<rect x="${f(x)}" y="${f(y - e / 2)}" width="${f(w)}" height="${e}" fill="${eh ? c.titulo : c.apoio}"${eh ? '' : ' fill-opacity=".5"'}/>`;
          if (eh && !c.claro) s += `<rect x="${f(x)}" y="${f(y + 4)}" width="${f(w)}" height="${f(Math.max(1.6, m.w1))}" fill="${c.sublinhado}" data-a="g"/>`;
          x += w + sep;
        });
      });
      return s;
    }
  };
  const APELIDO = { regua: 'linha', 'régua': 'linha', fio: 'linha', divisor: 'linha', foco: 'losango', ponto: 'losango',
    ligacao: 'elo', 'ligação': 'elo', relacao: 'elo', 'relação': 'elo', 'avanço': 'avanco', seta: 'avanco', chevron: 'avanco',
    etapas: 'percurso', jornada: 'percurso', malha: 'trama', textura: 'trama', grade: 'grade45', 'grade-45': 'grade45',
    construcao: 'grade45', 'construção': 'grade45', janela: 'moldura', foto: 'moldura', 'marca-texto': 'grifo', destaque: 'grifo' };
  function canto(qual, x0, y0, x1, y1) {
    return ({ se: [x0, y0], sd: [x1, y0], ie: [x0, y1], id: [x1, y1] })[qual] || [x1, y0];
  }
  /* o retângulo da moldura, aberto no canto do losango: a linha para nas pontas dele */
  function quadro(qual, x0, y0, x1, y1, r) {
    const q = ({ se: 0, sd: 1, id: 2, ie: 3 })[qual];
    const cantos = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], i = q == null ? 1 : q;
    const a = cantos[i], prox = cantos[(i + 1) % 4], ant = cantos[(i + 3) % 4];
    const passo = (de, para) => [de[0] + Math.sign(para[0] - de[0]) * r, de[1] + Math.sign(para[1] - de[1]) * r];
    const ini = passo(a, prox), fim = passo(a, ant);
    let d = `M${f(ini[0])} ${f(ini[1])}`;
    for (let k = 1; k <= 3; k++) { const pt = cantos[(i + k) % 4]; d += `L${f(pt[0])} ${f(pt[1])}`; }
    return d + `L${f(fim[0])} ${f(fim[1])}`;
  }
  function razao(v, padrao) {
    if (typeof v === 'number' && v > 0) return v;
    const m = String(v || '').match(/^\s*([\d.]+)\s*[/:x×]\s*([\d.]+)\s*$/);
    return m && +m[2] ? +m[1] / +m[2] : padrao;
  }

  /* ---------- texto (medida real no documento; sem documento, estima) ---------- */
  const LEX = "font-family:'Lexend','Inter',system-ui,sans-serif", NEWS = "font-family:'Newsreader','Source Serif 4',Georgia,serif";
  const est = (fam, peso, tam, extra) => `${fam};font-weight:${peso};font-size:${f(tam)}px${extra || ''}`;
  let medidor = null;
  const cacheTxt = new Map();
  function mede(txt, estilo) {
    txt = String(txt);
    const k = estilo + '|' + txt;
    if (cacheTxt.has(k)) return cacheTxt.get(k);
    let w = 0;
    try {
      if (temDoc && document.body) {
        if (!medidor || !medidor.isConnected) {
          const SVGNS = 'http://www.w3.org/2000/svg';
          medidor = document.createElementNS(SVGNS, 'svg');
          medidor.setAttribute('aria-hidden', 'true');
          medidor.style.cssText = 'position:absolute;left:0;top:0;width:1px;height:1px;overflow:hidden;visibility:hidden;pointer-events:none';
          medidor.appendChild(document.createElementNS(SVGNS, 'text'));
          document.body.appendChild(medidor);
        }
        const t = medidor.firstChild;
        t.setAttribute('style', estilo + ';white-space:pre');
        t.textContent = txt;
        w = t.getComputedTextLength();
      }
    } catch (err) { w = 0; }
    if (!w && txt) w = txt.length * parseFloat((estilo.match(/font-size:([\d.]+)/) || [0, 12])[1]) * 0.58;
    cacheTxt.set(k, w);
    return w;
  }
  function quebra(txt, estilo, maxW) {
    const pal = String(txt || '').split(/\s+/).filter(Boolean);
    if (!pal.length) return [];
    const linhas = [];
    let atual = pal[0];
    for (let i = 1; i < pal.length; i++) {
      const tenta = atual + ' ' + pal[i];
      if (mede(tenta, estilo) <= maxW) atual = tenta; else { linhas.push(atual); atual = pal[i]; }
    }
    linhas.push(atual);
    return linhas;
  }
  const T = (x, y, txt, estilo, cor, extra) => `<text x="${f(x)}" y="${f(y)}" fill="${cor}" style="${estilo}"${extra || ''}>${esc(txt)}</text>`;
  const lista = arr => (arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' e ' + arr[arr.length - 1]);

  /* ---------- formas que medem o contêiner ---------- */
  /* LINHA DIVISORA: a linha na largura toda, com o losango de contorno no começo */
  function divisor(W, c, o, p) {
    const esp = p ? p.linhaRaw : 1.5, r = p ? p.losango / R2 : 5, ns = p ? '' : NS;
    const H = Math.max(16, 2 * r + esp + 6), y = H / 2;
    const los = o.losango === undefined ? true : o.losango;
    let s = '', x0 = 0;
    if (los) {
      const cx = r + esp / 2 + 0.5;
      x0 = cx + r;
      s = los === 'cheio' ? `<path d="${dLos(cx, y, r)}" fill="${c.losango}" data-a="p"/>`
        : `<path d="${dLos(cx, y, r)}" fill="none" stroke="${c.losango}" stroke-width="${f(esp)}" stroke-linejoin="miter"${ns} data-a="p"/>`;
    }
    return { vb: `0 0 ${f(W)} ${f(H)}`, s: `<path d="M${f(x0)} ${f(y)}H${f(W)}" fill="none" stroke="${c.traco}" stroke-width="${f(esp)}"${ns}/>` + s };
  }

  /* PERCURSO COM RÓTULOS: vira diagrama; horizontal quando cabe, vertical quando não */
  function percursoRotulado(W, c, o, p) {
    const rot = o.rotulos.slice(0, 6).map(x => String(x == null ? '' : x));
    const n = Math.max(1, rot.length);
    const subs = Array.isArray(o.subs) ? o.subs.map(x => String(x == null ? '' : x)) : [];
    const d = o.destaque == null ? 0 : (+o.destaque < 0 ? -1 : lim(Math.round(+o.destaque), 0, n - 1));
    /* na tela, o rótulo de 11 px; na peça, o rótulo da peça (26 px no post de 1080): tudo cresce junto */
    const e = p ? p.rot / 11 : 1;
    const tl = 15 * e, ts = 13 * e, tn = 24 * e;
    const e1 = p ? p.linha : 1.5, e2 = p ? p.linha * 0.6 : 1, ns = p ? '' : NS;
    const r = p ? p.losango / R2 : 5, rd = r * 1.3, hc = r * 1.35;
    const eL = est(LEX, 500, tl), eS = est(LEX, 400, ts), eN = est(NEWS, 500, tn, ';font-variant-numeric:lining-nums');
    const lhL = tl * 1.32, lhS = ts * 1.45;
    const num = i => (i < 9 ? '0' : '') + (i + 1);
    const maior = Math.max(0, ...rot.map(x => Math.max(0, ...x.split(/\s+/).map(w => mede(w, eL)))));
    const col = W / n;
    let horizontal = n > 1 && col >= Math.max(maior + 24 * e, 96 * e);
    /* lado a lado só se nenhuma etapa passar de quatro linhas (nome e explicação somados) */
    if (horizontal) horizontal = rot.every((x, i) => quebra(x, eL, col - 22 * e).length + (subs[i] ? quebra(subs[i], eS, col - 22 * e).length : 0) <= 4);
    const marca = (x, y, i) => (i === d ? `<path d="${dLos(x, y, rd)}" fill="${c.losango}" data-a="p"/>`
      : `<path d="${dLos(x, y, r)}" fill="none" stroke="${c.traco}" stroke-width="${f(e1)}" stroke-linejoin="miter"${ns} data-a="p"/>`);
    const rr = i => (i === d ? rd : r);
    /* trecho da linha entre dois losangos (de ponta a ponta): o que já passou em traço, o resto em apoio */
    const trecho = (i, a, b, vertical) => {
      const dd = vertical ? `M${f(a[0])} ${f(a[1])}V${f(b)}` : `M${f(a[0])} ${f(a[1])}H${f(b)}`;
      return i < d ? tr(dd, c.traco, e1) : tr(dd, c.apoio, e2);
    };
    const tr = (dd, cor, w) => `<path d="${dd}" fill="none" stroke="${cor}" stroke-width="${f(w)}" stroke-linejoin="miter" stroke-miterlimit="4"${ns}/>`;
    let s = '', H;
    if (horizontal) {
      const y = rd + 1, xs = i => i * col + rd, xv = W - e1;
      for (let i = 0; i < n; i++) s += trecho(i, [xs(i) + rr(i), y], i < n - 1 ? xs(i + 1) - rr(i + 1) : xv, false);
      s += tr(`M${f(xv - hc)} ${f(y - hc)}L${f(xv)} ${f(y)}L${f(xv - hc)} ${f(y + hc)}`, c.traco, e1);
      let fundo = 0;
      for (let i = 0; i < n; i++) {
        s += marca(xs(i), y, i);
        const x0 = i * col, tw = col - 22 * e;
        let yy = y + rd + 16 * e + tn * 0.72;
        s += T(x0, yy, num(i), eN, i === d ? c.losango : c.apoio);
        yy += 6 * e;
        quebra(rot[i], eL, tw).forEach(ln => { yy += lhL; s += T(x0, yy - tl * 0.3, ln, eL, c.titulo); });
        if (subs[i]) { yy += 4 * e; quebra(subs[i], eS, tw).forEach(ln => { yy += lhS; s += T(x0, yy - ts * 0.3, ln, eS, c.apoio); }); }
        fundo = Math.max(fundo, yy);
      }
      H = fundo + 2 * e;
    } else {
      const x0 = rd + 1, tx = x0 + rd + 14 * e, numW = mede('00', eN) + 12 * e, tw = Math.max(40, W - tx - numW);
      const blocos = rot.map((x, i) => ({ L: quebra(x, eL, tw), S: subs[i] ? quebra(subs[i], eS, tw) : [] }));
      const alt = b => Math.max(1, b.L.length) * lhL + (b.S.length ? 4 * e + b.S.length * lhS : 0);
      const ys = [];
      let y = Math.max(rd + 1, tl);
      for (let i = 0; i < n; i++) { ys.push(y); y += Math.max(54 * e, alt(blocos[i]) + 26 * e); }
      const yu = ys[n - 1], fimTexto = yu - tl * 0.62 + alt(blocos[n - 1]);
      const yv = Math.max(yu + rd + 24 * e, fimTexto + 12 * e);
      for (let i = 0; i < n; i++) s += trecho(i, [x0, ys[i] + rr(i)], i < n - 1 ? ys[i + 1] - rr(i + 1) : yv, true);
      s += tr(`M${f(x0 - hc)} ${f(yv - hc)}L${f(x0)} ${f(yv)}L${f(x0 + hc)} ${f(yv - hc)}`, c.traco, e1);
      for (let i = 0; i < n; i++) {
        const yb = ys[i] + tl * 0.36;
        s += marca(x0, ys[i], i);
        s += T(tx, yb + tn * 0.05, num(i), eN, i === d ? c.losango : c.apoio);
        let yy = yb;
        blocos[i].L.forEach((ln, k) => { s += T(tx + numW, yy, ln, eL, c.titulo); if (k < blocos[i].L.length - 1) yy += lhL; });
        if (blocos[i].S.length) { yy += 4 * e; blocos[i].S.forEach(ln => { yy += lhS; s += T(tx + numW, yy, ln, eS, c.apoio); }); }
      }
      H = yv + e1 + 1;
    }
    const aria = 'Percurso em ' + n + (n === 1 ? ' etapa: ' : ' etapas: ') + lista(rot) + (d >= 0 && n > 1 ? '. Em destaque: ' + rot[d] + '.' : '.');
    return { vb: `0 0 ${f(W)} ${f(H)}`, s, aria };
  }

  /* TRAMA: as duas famílias de diagonais (os losangos grandes, que se tocam pela ponta) e o
     losango de dentro, com metade da medida. A mesma geometria da textura .trama do documento. */
  function densidade(v, W, p) {
    const nomeado = { baixa: 4, media: 6, 'média': 6, alta: 9 }[String(v || '').toLowerCase()];
    if (nomeado) return nomeado;
    if (+v) return lim(Math.round(+v), 2, 16);
    return lim(Math.round(W / (p ? 180 : 90)), 4, 16);      /* padrão: um losango a cada 90 px na tela, 180 px na peça */
  }
  function trama(W, H, c, o, p, id) {
    const cel = W / densidade(o.densidade, W, p), q = cel / 4;
    const op = lim(o.opacidade == null ? 0.16 : +o.opacidade, 0.04, 0.4);
    const esp = p ? p.linhaRaw : 1, ns = p ? '' : NS;
    let dA = '', dB = '';
    for (let k = -1; (k + 0.5) * cel <= W + H + cel; k++) dA += diagonal(true, (k + 0.5) * cel, 0, 0, W, H);
    for (let k = Math.floor(-H / cel) - 1; (k + 0.5) * cel <= W + cel; k++) dA += diagonal(false, (k + 0.5) * cel, 0, 0, W, H);
    for (let i = 0; i * cel < W; i++) for (let j = 0; j * cel < H; j++) dB += dLos((i + 0.5) * cel, (j + 0.5) * cel, q);
    const alias = { base: 'cima', topo: 'baixo', cheia: false, nenhum: false, 'false': false };
    let esm = o.esmaecer === undefined ? 'esquerda' : o.esmaecer;
    if (Object.prototype.hasOwnProperty.call(alias, String(esm))) esm = alias[String(esm)];
    const eixo = { esquerda: [W, 0, 0, 0], direita: [0, 0, W, 0], cima: [0, H, 0, 0], baixo: [0, 0, 0, H] }[esm];
    let defs = '', mascara = '';
    if (eixo) {
      const paradas = (esm === 'cima' || esm === 'baixo') ? [[0, 1], [0.7, 0]] : [[0, 1], [0.4, 0.55], [0.78, 0]];
      defs = `<linearGradient id="${id}-g" gradientUnits="userSpaceOnUse" x1="${f(eixo[0])}" y1="${f(eixo[1])}" x2="${f(eixo[2])}" y2="${f(eixo[3])}">` +
        paradas.map(pp => `<stop offset="${pp[0]}" stop-color="#FFFFFF" stop-opacity="${pp[1]}"/>`).join('') + '</linearGradient>' +
        `<mask id="${id}-m" maskUnits="userSpaceOnUse" x="0" y="0" width="${f(W)}" height="${f(H)}"><rect width="${f(W)}" height="${f(H)}" fill="url(#${id}-g)"/></mask>`;
      mascara = ` mask="url(#${id}-m)"`;
    }
    const tr = dd => `<path d="${dd}" fill="none" stroke="${c.traco}" stroke-width="${f(esp)}" stroke-linejoin="miter"${ns}/>`;
    return { vb: `0 0 ${f(W)} ${f(H)}`, defs, s: `<g stroke-opacity="${op}"${mascara}>${tr(dA)}${tr(dB)}</g>`,
      estilo: 'width:100%;height:100%;display:block;overflow:hidden' };
  }

  /* MOLDURA COM FOTO: a foto dentro do SVG, com a linha a 12 px e o losango no canto */
  function molduraFoto(W, c, o, p) {
    const prop = razao(o.proporcao, 4 / 5);
    const esp = p ? p.linhaRaw : 1, ns = p ? '' : NS, r = p ? p.losango / R2 : 5;
    const k = r + esp / 2, d = p ? 12 * p.linhaRaw : 12;
    const wp = Math.max(10, W - 2 * (k + d)), hp = wp / prop, H = hp + 2 * (k + d);
    const al = { topo: 'YMin', base: 'YMax' }[o.alinhar] || 'YMid';
    let s = `<image href="${esc(o.foto)}" x="${f(k + d)}" y="${f(k + d)}" width="${f(wp)}" height="${f(hp)}" preserveAspectRatio="xMid${al} slice"/>`;
    s += `<path d="${quadro(o.canto, k, k, W - k, H - k, r)}" fill="none" stroke="${c.traco}" stroke-width="${f(esp)}" stroke-linejoin="miter"${ns}/>`;
    const q = canto(o.canto, k, k, W - k, H - k);
    s += o.cheio === false ? `<path d="${dLos(q[0], q[1], r)}" fill="none" stroke="${c.losango}" stroke-width="${f(esp * 1.5)}" stroke-linejoin="miter"${ns} data-a="p"/>`
      : `<path d="${dLos(q[0], q[1], r)}" fill="${c.losango}" data-a="p"/>`;
    return { vb: `0 0 ${f(W)} ${f(H)}`, s, aria: o.alt ? String(o.alt) : '' };
  }

  /* GRIFO COM TEXTO: a palavra em Newsreader 500; no claro, a faixa âmbar atrás da metade de
     baixo (de 0,24 em acima da linha de base a 0,2 em abaixo); no azul, o sublinhado dourado
     a 0,16 em da linha de base, com 0,07 em de espessura. As medidas do grifo do documento. */
  function grifoTexto(c, o, p) {
    const fs = +o.tamanho || (p ? p.titulo : 40);
    const eT = est(NEWS, 500, fs, ';font-variant-numeric:lining-nums');
    const txt = String(o.texto);
    let alvo = o.grifar != null ? String(o.grifar) : txt, i0 = alvo ? txt.indexOf(alvo) : -1;
    if (i0 < 0) { alvo = txt; i0 = 0; }
    const wa = i0 ? mede(txt.slice(0, i0), eT) : 0, wm = mede(alvo, eT), wd = mede(txt.slice(i0 + alvo.length), eT);
    const pad = 0.1 * fs, base = fs * 0.98, W = 2 * pad + wa + wm + wd, H = fs * 1.3;
    let s = '';
    if (c.claro) s += `<rect x="${f(pad + wa - 0.06 * fs)}" y="${f(base - 0.24 * fs)}" width="${f(wm + 0.12 * fs)}" height="${f(0.44 * fs)}" fill="${c.grifo}" data-a="g"/>`;
    s += `<text x="${f(pad)}" y="${f(base)}" fill="${c.titulo}" xml:space="preserve" style="${eT};white-space:pre">${esc(txt)}</text>`;
    if (!c.claro) s += `<rect x="${f(pad + wa)}" y="${f(base + 0.16 * fs)}" width="${f(wm)}" height="${f(Math.max(p ? p.linhaRaw : 2, 0.07 * fs))}" fill="${c.sublinhado}" data-a="g"/>`;
    const estilo = p ? `width:min(100%,calc(var(--u,1px) * ${f(W)}));height:auto;display:block;overflow:visible`
      : `width:${f(W)}px;max-width:100%;height:auto;display:block;overflow:visible`;
    return { vb: `0 0 ${f(W)} ${f(H)}`, s, aria: txt, estilo, w: W, h: H };
  }

  /* ---------- entrada discreta (respeita prefers-reduced-motion) ---------- */
  const agora = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : 0);
  function semMovimento() {
    try {
      if (typeof navigator !== 'undefined' && navigator.webdriver) return true;   /* captura automática: desenho final */
      return !window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('print').matches;
    } catch (err) { return true; }
  }
  let io = null;
  function animaQuando(t, o) {
    if (o.animar === false || api.animar === false || !temDoc || semMovimento()) return;
    if (typeof IntersectionObserver === 'undefined' || !Element.prototype.animate) return;
    if (t.__bfT != null) { const dt = agora() - t.__bfT; if (dt < 1100) anima(t, dt); return; }
    if (!io) io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      en.target.__bfT = agora();
      anima(en.target, 0);
    }), { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    if (!t.__bfObs) { t.__bfObs = 1; io.observe(t); }
  }
  function anima(t, desde) {
    const svg = t.firstElementChild;
    if (!svg) return;
    try {
      const a = svg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 640, easing: 'ease-out', fill: 'backwards' });
      if (desde) a.currentTime = desde;
      let i = 0;
      Array.prototype.forEach.call(svg.querySelectorAll('[data-a="p"]'), n => {
        n.style.transformBox = 'fill-box'; n.style.transformOrigin = '50% 50%';
        const k = n.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 460, delay: 360 + Math.min(i++, 8) * 60, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
        if (desde) k.currentTime = desde;
      });
      Array.prototype.forEach.call(svg.querySelectorAll('[data-a="g"]'), n => {
        n.style.transformBox = 'fill-box'; n.style.transformOrigin = '0% 50%';
        const k = n.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 560, delay: 280, easing: 'cubic-bezier(.3,.6,.2,1)', fill: 'backwards' });
        if (desde) k.currentTime = desde;
      });
    } catch (err) { /* sem suporte: fica o desenho final */ }
  }

  /* ---------- montagem ---------- */
  const registro = new Set();
  let ro = null, espera = 0;
  const larguras = new WeakMap();
  function observa(t) {
    if (!ro && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(es => {
        let mudou = false;
        es.forEach(en => { const w = Math.round(en.contentRect.width); if (larguras.get(en.target) !== w) { larguras.set(en.target, w); mudou = true; } });
        if (!mudou) return;
        clearTimeout(espera); espera = setTimeout(redesenhar, 120);
      });
    }
    if (ro && !larguras.has(t)) { larguras.set(t, Math.round(t.clientWidth || 0)); ro.observe(t); }
  }
  function larguraDe(t) {
    let w = 0;
    try { w = t.clientWidth; } catch (err) { w = 0; }
    return w > 0 ? w : 600;
  }
  function desenho(t, nome, o) {
    const c = cores(t, o), p = naPeca(t, o), m = medida(p);
    const W = () => (p ? p.px : larguraDe(t));
    if (nome === 'linha' && o.divisor) return divisor(W(), c, o, p);
    if (nome === 'percurso' && Array.isArray(o.rotulos) && o.rotulos.length) return percursoRotulado(W(), c, o, p);
    if (nome === 'moldura' && o.foto) return molduraFoto(W(), c, o, p);
    if (nome === 'grifo' && o.texto != null && String(o.texto) !== '') return grifoTexto(c, o, p);
    if (nome === 'trama') {
      const w = W();
      let h = 0;
      if (o.proporcao) h = w / razao(o.proporcao, 1);
      else { const ch = t.clientHeight, cw = t.clientWidth; h = ch > 0 && cw > 0 ? ch * w / cw : w; }
      return trama(w, h, c, o, p, t.__bfId);
    }
    return { vb: '0 0 120 120', s: formas[nome](c, o, m, kit(c, m)) };
  }
  function wrap(e, nome, o) {
    const t = el$(e); if (!t) return null;
    if (!t.__bfId) t.__bfId = 'bf' + (++seq);
    const r = desenho(t, nome, o);
    const rot = o.aria || r.aria;
    const a11y = rot ? `role="img" aria-label="${esc(rot)}"` : 'aria-hidden="true"';
    const estilo = r.estilo || 'width:100%;height:auto;display:block;overflow:visible';
    t.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" id="${t.__bfId}" data-bforms="${nome}" viewBox="${r.vb}" ${a11y} focusable="false" style="${estilo}">${r.defs ? '<defs>' + r.defs + '</defs>' : ''}${r.s}</svg>`;
    t.__bforms = { nome, opts: o };
    registro.add(t);
    observa(t);
    animaQuando(t, o);
    return t.firstChild;
  }

  const api = {};
  nomes.forEach(nome => { api[nome] = (e, o) => wrap(e, nome, o || {}); });
  const nomeDe = n => { n = String(n == null ? '' : n).trim(); const b = n.toLowerCase(); return formas[b] ? b : (APELIDO[b] || n); };
  function render(e, nome, o) {
    o = Object.assign({}, o || {});
    if (String(nome).trim().toLowerCase() === 'divisor' && o.divisor == null) o.divisor = true;
    const n = nomeDe(nome);
    if (formas[n]) return wrap(e, n, o);
    if (typeof console !== 'undefined') console.error('bforms: forma desconhecida "' + nome + '". As formas da casa: ' + nomes.join(', ') + '.');
    return null;
  }
  /* SVG pronto (texto), fora da página, para salvar ou importar no Canva: fundo transparente,
     cores da paleta pedida (padrão: papel) e as medidas da peça de 1080 para o tamanho pedido.
     Formas simples: 480 px (opção largura), traço de 2,5 px e losango da peça. Trama: 1080 ×
     1350 (largura e proporcao). Percurso com rótulos e linha divisora: 936 px, a largura útil
     do post. Grifo com texto: a palavra no tamanho do título da peça (104 px). */
  function svg(nome, o) {
    o = Object.assign({}, o || {});
    if (String(nome).trim().toLowerCase() === 'divisor' && o.divisor == null) o.divisor = true;
    const n = nomeDe(nome);
    if (!formas[n]) return '';
    const c = completa(Object.assign({}, PALETAS[o.campo] || PALETAS.papel));
    const id = 'bfx' + (++seqX);
    if (n === 'moldura' && o.amostra == null) o.amostra = false;
    let r;
    if (n === 'linha' && o.divisor) { const W = +o.largura || 936; r = divisor(W, c, o, pecaPadrao(W)); }
    else if (n === 'percurso' && Array.isArray(o.rotulos) && o.rotulos.length) { const W = +o.largura || 936; r = percursoRotulado(W, c, o, pecaPadrao(W)); }
    else if (n === 'trama') { const W = +o.largura || 1080; r = trama(W, W / razao(o.proporcao, 4 / 5), c, o, pecaPadrao(W), id); }
    else if (n === 'moldura' && o.foto) { const W = +o.largura || 480; r = molduraFoto(W, c, o, pecaPadrao(W)); }
    else if (n === 'grifo' && o.texto != null && String(o.texto) !== '') r = grifoTexto(c, o, pecaPadrao(1080));
    else {
      const lado = +o.largura || 480, u = 120 / lado;
      const m = { w1: 2.5 * u, w2: 1.5 * u, k: Math.min(1, (18 / R2 * u) / 5), ns: '', p: null };
      r = { vb: '0 0 120 120', s: formas[n](c, o, m, kit(c, m)), w: lado, h: lado };
    }
    const vb = r.vb.split(' ').map(Number);
    const w = r.w || vb[2], h = r.h || vb[3];
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(w)}" height="${Math.round(h)}" viewBox="${r.vb}">` +
      (r.defs ? '<defs>' + r.defs + '</defs>' : '') + r.s.replace(/ data-a="[pg]"/g, '') + '</svg>';
  }
  function montar(raiz) {
    if (!temDoc) return;
    (raiz || document).querySelectorAll('[data-bforms]').forEach(el => {
      if (el.__bformsMontado || el.tagName.toLowerCase() === 'svg') return;
      const v = el.getAttribute('data-bforms').trim();
      let cfg = { forma: v };
      if (v.charAt(0) === '{') { try { cfg = JSON.parse(v); } catch (err) { console.error('bforms: data-bforms não é JSON válido', el); return; } }
      el.__bformsMontado = 1;
      render(el, cfg.forma, cfg);
    });
  }
  function redesenhar() {
    registro.forEach(t => {
      if (!t.isConnected) { registro.delete(t); return; }
      const c = t.__bforms;
      if (c) wrap(t, c.nome, c.opts);
    });
  }
  if (typeof window !== 'undefined' && temDoc) {
    window.addEventListener('beforeprint', () => {
      registro.forEach(t => { try { const s = t.firstElementChild; if (s && s.getAnimations) s.getAnimations({ subtree: true }).forEach(a => a.finish()); } catch (err) { /* ok */ } });
      redesenhar();
    });
    try {
      if (document.fonts) {
        const comTexto = () => { cacheTxt.clear(); registro.forEach(t => { const c = t.__bforms; if (c && c.opts && (c.opts.rotulos || c.opts.texto != null)) wrap(t, c.nome, c.opts); }); };
        document.fonts.ready.then(comTexto);
        document.fonts.addEventListener('loadingdone', comTexto);
      }
    } catch (err) { /* sem API de fontes: segue com a medida atual */ }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => montar());
    else montar();
  }
  return Object.assign(api, { render, montar, redesenhar, svg, paletas: PALETAS, formas: nomes.slice(), animar: true, version: '1.0' });
})();
if (typeof window !== 'undefined') window.bforms = bforms;
