/* =====================================================================
   BORELLI ADVOCACIA · ferramentas/guias-indice.js · o índice /guias/
   Página: src/paginas/guias/index.html (ficha "scripts").
   Sem JavaScript, a lista inteira dos guias (marcador @lista-guias) fica à vista.
   Com ele:
   1. agrupa os cartões por tema (o tema de cada cartão vem do data-tema e do
      rótulo "Guia · Tema"), na ordem dos temas com mais guias;
   2. monta os botões de tema a partir dos temas que existem de fato ("Todos"
      primeiro), com aria-pressed;
   3. liga a busca: sem acento e sem maiúscula, todas as palavras precisam
      aparecer no título, na descrição, no rótulo ou, quando o /busca.json
      responde, nos intertítulos e nos termos do guia;
   4. aceita ?tema=<tema> e ?q=<palavra> ao abrir; guarda só o tema no
      endereço (history.replaceState). O que a pessoa digita nunca fica no
      endereço: ele iria no Referer, nos registros do servidor e no histórico,
      e a palavra pode ser dado de saúde (LGPD). O ?q= da chegada é apagado
      logo depois de lido, como o site.js faz com assunto e origem;
   5. anuncia a contagem numa região aria-live; Esc no campo apaga a busca.
   Nada do que a pessoa digita sai do navegador. O filtro é próprio desta
   página: não usa o data-filtro-temas do site.js.
   ===================================================================== */
(function () {
  'use strict';
  var doc = document;
  var B = window.Borelli || {};
  function $(sel, raiz) { return (raiz || doc).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || doc).querySelectorAll(sel)); }
  var semAcento = B.semAcento || function (t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  function anunciar(alvo, texto) {
    if (B.anunciar) { B.anunciar(alvo, texto); return; }
    if (alvo) alvo.textContent = texto;
  }
  function plural(n, um, varios) { return n === 1 ? '1 ' + um : n + ' ' + varios; }

  function iniciar() {
    var caixa = $('[data-gi]');
    var area = $('[data-gi-lista]');
    var listaOriginal = area && $('[data-guias-lista]', area);
    if (!caixa || !area || !listaOriginal) return;
    var campo = $('[data-gi-campo]', caixa);
    var temasCaixa = $('[data-gi-temas]', caixa);
    var status = $('[data-gi-status]', caixa);
    var nada = $('[data-gi-nada]');
    var vazioPadrao = $('[data-guias-vazio]', area);
    if (vazioPadrao) vazioPadrao.parentNode.removeChild(vazioPadrao);

    /* 1. os itens, com o texto de busca de cada um */
    var itens = $$(':scope > li', listaOriginal).map(function (li) {
      var rot = $('.rotulo', li);
      var partesRot = rot ? rot.textContent.split(' · ') : [];
      var link = $('a[href]', li);
      return {
        li: li,
        tema: li.getAttribute('data-tema') || 'geral',
        nomeTema: (partesRot.length > 1 ? partesRot[partesRot.length - 1] : 'Outros').trim(),
        href: link ? link.getAttribute('href') : '',
        texto: semAcento(li.textContent.replace(/\s+/g, ' '))
      };
    });
    if (!itens.length) return;

    /* "Procurar em todo o site": a busca do site abre com a mesma palavra. Fase de captura, para valer antes
       do abrirBusca do site.js, que roda a busca logo depois de carregar o índice. */
    var abrirSite = nada && $('[data-busca-abrir]', nada);
    if (abrirSite) abrirSite.addEventListener('click', function () {
      var c = $('[data-busca] [data-busca-campo]');
      if (c) c.value = campo.value;
    }, true);

    /* 2. os grupos por tema */
    var grupos = {};
    var ordem = [];
    itens.forEach(function (it) {
      if (!grupos[it.tema]) { grupos[it.tema] = { slug: it.tema, nome: it.nomeTema, itens: [] }; ordem.push(it.tema); }
      grupos[it.tema].itens.push(it);
    });
    ordem.sort(function (a, b) {
      var d = grupos[b].itens.length - grupos[a].itens.length;
      return d || grupos[a].nome.localeCompare(grupos[b].nome, 'pt-BR');
    });
    var porTema = doc.createElement('div');
    porTema.className = 'gi-grupos';
    ordem.forEach(function (slug, i) {
      var g = grupos[slug];
      var sec = doc.createElement('section');
      sec.className = 'gi-grupo';
      sec.setAttribute('data-gi-grupo', slug);
      sec.setAttribute('aria-labelledby', 'gi-grupo-' + i);
      var cab = doc.createElement('div');
      cab.className = 'gi-grupo-cab';
      var h = doc.createElement('p');   /* os cartões já são h3: o tema não disputa o mesmo nível */
      h.className = 'gi-grupo-t';
      h.id = 'gi-grupo-' + i;
      h.textContent = g.nome;
      var n = doc.createElement('p');
      n.className = 'gi-grupo-n';
      n.setAttribute('aria-hidden', 'true');
      cab.appendChild(h);
      cab.appendChild(n);
      var ul = doc.createElement('ul');
      ul.className = 'guias-lista gi-grupo-lista nao-llm';
      g.itens.forEach(function (it) { ul.appendChild(it.li); });
      sec.appendChild(cab);
      sec.appendChild(ul);
      porTema.appendChild(sec);
      g.sec = sec;
      g.contador = n;
    });
    listaOriginal.parentNode.replaceChild(porTema, listaOriginal);

    /* 3. os botões de tema (só com mais de um tema) */
    var botoes = [];
    function botao(slug, nome) {
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'pilula';
      b.setAttribute('data-gi-tema', slug);
      b.setAttribute('aria-pressed', slug ? 'false' : 'true');
      b.textContent = nome;
      temasCaixa.appendChild(b);
      botoes.push(b);
    }
    if (ordem.length > 1) {
      botao('', 'Todos');
      ordem.forEach(function (slug) { botao(slug, grupos[slug].nome); });
    } else {
      temasCaixa.hidden = true;
    }

    /* 4. termos e intertítulos do busca.json, quando ele responde */
    if (window.fetch) {
      fetch('/borelli-site-previa/busca.json', { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : []; }).then(function (dados) {
        var mapa = {};
        (dados || []).forEach(function (d) { if (d && d.u) mapa[d.u] = d; });
        itens.forEach(function (it) {
          var d = mapa[it.href];
          if (d) it.texto += ' ' + semAcento([].concat(d.h || [], d.k || []).join(' '));
        });
        if (campo.value) aplicar(false);
      }).catch(function () { /* sem o busca.json, a busca usa o texto dos cartões */ });
    }

    var temaAtual = '';
    function aplicar(anunciarContagem) {
      var q = semAcento(campo.value).replace(/\s+/g, ' ').trim();
      var palavras = q ? q.split(' ') : [];
      var total = 0;
      ordem.forEach(function (slug) {
        var g = grupos[slug];
        var n = 0;
        var noTema = !temaAtual || temaAtual === slug;
        g.itens.forEach(function (it) {
          var mostra = noTema && palavras.every(function (p) { return it.texto.indexOf(p) !== -1; });
          it.li.hidden = !mostra;
          if (mostra) n += 1;
        });
        g.sec.hidden = n === 0;
        g.contador.textContent = plural(n, 'guia', 'guias');
        total += n;
      });
      if (nada) nada.hidden = total > 0;
      var nomeTema = temaAtual && grupos[temaAtual] ? grupos[temaAtual].nome : '';
      var frase;
      if (!q && !temaAtual) frase = plural(total, 'guia publicado', 'guias publicados') + ', agrupados por tema.';
      else if (total === 0) frase = 'Nenhum guia encontrado.';
      else frase = plural(total, 'guia encontrado', 'guias encontrados') + (nomeTema ? ' em ' + nomeTema : '') + '.';
      if (anunciarContagem) anunciar(status, frase);
      else status.textContent = frase;
      /* o endereço guarda só o tema, sem recarregar a página; a palavra digitada não vai para ele */
      try {
        var u = new URL(window.location.href);
        u.searchParams.delete('q');
        if (temaAtual) u.searchParams.set('tema', temaAtual); else u.searchParams.delete('tema');
        window.history.replaceState(null, '', u.pathname + u.search + u.hash);
      } catch (e) { /* navegador antigo: segue sem mudar o endereço */ }
    }
    function escolherTema(slug, anunciarContagem) {
      temaAtual = grupos[slug] ? slug : '';
      botoes.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-gi-tema') === temaAtual ? 'true' : 'false'); });
      aplicar(anunciarContagem);
    }

    temasCaixa.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-gi-tema]');
      if (b) escolherTema(b.getAttribute('data-gi-tema'), true);
    });
    var espera = null;
    campo.addEventListener('input', function () {
      clearTimeout(espera);
      espera = setTimeout(function () { aplicar(true); }, 150);
    });
    campo.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && campo.value) { e.preventDefault(); e.stopPropagation(); campo.value = ''; aplicar(true); }
      if (e.key === 'Enter') e.preventDefault();
    });

    /* estado inicial pelo endereço (?tema= e ?q=) */
    var params;
    try { params = new URLSearchParams(window.location.search); } catch (e) { params = null; }
    if (params && params.get('q')) {
      campo.value = params.get('q');
      try {
        params.delete('q');
        var resto = params.toString();
        window.history.replaceState(null, '', window.location.pathname + (resto ? '?' + resto : '') + window.location.hash);
      } catch (e) { /* navegador antigo: segue sem mudar o endereço */ }
    }
    caixa.hidden = false;
    escolherTema(params ? params.get('tema') || '' : '', false);
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
