/* =====================================================================
   BORELLI ADVOCACIA · Protótipo A · app.js
   JavaScript puro, sem dependências (as formas da marca vêm de
   /assets/js/bforms.js). Cada módulo só liga se a página tiver o elemento.
   1. Cabeçalho fixo que encolhe e publica a altura em --cab-h
   2. Painel Atuação no computador (clique, passar o mouse, Esc, clique fora)
   3. Menu do celular (abre e fecha, foco preso, Esc fecha, devolve o foco)
   4. Carta de negativa anotada (grifo e nota ligados; folha no celular)
   5. Prazos máximos de atendimento (RN 566/2022), com o dia-limite
   6. Página de tema: índice "Nesta página" (parte atual e linha de leitura)
   7. Página de tema: as cirurgias em pílulas
   8. Página de tema: lista de documentos (marca, guarda, imprime, copia)
   Nada aqui envia dado a lugar nenhum. Movimento: respeita o sistema.
   ===================================================================== */
(function () {
  'use strict';

  var doc = document;
  var html = doc.documentElement;
  html.classList.add('js');
  var mm = function (q) { return window.matchMedia ? window.matchMedia(q) : { matches: false, addEventListener: function () {} }; };
  var reduz = mm('(prefers-reduced-motion: reduce)');
  var largo = mm('(min-width: 1025px)');
  var ponteiroFino = mm('(hover: hover) and (pointer: fine)');

  /* Em navegador automatizado (captura de tela, teste), a rolagem é instantânea, como as formas do bforms */
  if (navigator.webdriver) html.style.scrollBehavior = 'auto';

  function $(sel, raiz) { return (raiz || doc).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || doc).querySelectorAll(sel)); }
  function rolagem() { return (reduz.matches || navigator.webdriver) ? 'auto' : 'smooth'; }
  function visivel(el) { return !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length)); }
  function focaveis(raiz) {
    return $$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', raiz).filter(visivel);
  }
  function aoMudar(m, fn) {
    if (m.addEventListener) m.addEventListener('change', fn);
    else if (m.addListener) m.addListener(fn);
  }
  function alturaCab() { return parseFloat(getComputedStyle(html).getPropertyValue('--cab-h')) || 80; }

  /* ---------- 1. Cabeçalho fixo ---------- */
  var cab = $('#cabecalho');
  function medeCabecalho() {
    if (cab) html.style.setProperty('--cab-h', Math.round(cab.getBoundingClientRect().height) + 'px');
  }
  var rolarAgendado = false;
  var ouvintesRolagem = [];
  function aoRolar() {
    if (rolarAgendado) return;
    rolarAgendado = true;
    window.requestAnimationFrame(function () {
      rolarAgendado = false;
      if (cab) {
        var encolher = (window.scrollY || window.pageYOffset) > 24;
        if (encolher !== cab.classList.contains('encolhido')) {
          cab.classList.toggle('encolhido', encolher);
          if (reduz.matches) medeCabecalho();
        }
      }
      ouvintesRolagem.forEach(function (fn) { fn(); });
    });
  }
  if (cab) {
    cab.addEventListener('transitionend', function (e) { if (e.target === cab) medeCabecalho(); });
    medeCabecalho();
  }
  window.addEventListener('scroll', aoRolar, { passive: true });
  window.addEventListener('resize', function () { medeCabecalho(); aoRolar(); });

  /* ---------- 2. Painel Atuação (computador) ---------- */
  var botaoAtuacao = $('.site-nav-botao');
  var painel = $('#painel-atuacao');
  if (botaoAtuacao && painel) {
    var abertoPor = '';
    var tAbre = 0, tFecha = 0;
    var abrePainel = function (por) {
      clearTimeout(tFecha);
      abertoPor = por;
      if (!painel.hidden) return;
      painel.hidden = false;
      botaoAtuacao.setAttribute('aria-expanded', 'true');
    };
    var fechaPainel = function (devolverFoco) {
      clearTimeout(tAbre);
      if (painel.hidden) return;
      painel.hidden = true;
      abertoPor = '';
      botaoAtuacao.setAttribute('aria-expanded', 'false');
      if (devolverFoco) botaoAtuacao.focus();
    };
    botaoAtuacao.addEventListener('click', function () {
      if (painel.hidden) abrePainel('clique');
      else if (abertoPor === 'mouse') abertoPor = 'clique';
      else fechaPainel(false);
    });
    botaoAtuacao.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        abrePainel('clique');
        var primeiro = $('a', painel);
        if (primeiro) primeiro.focus();
      }
    });
    [botaoAtuacao.parentNode, painel].forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        if (!ponteiroFino.matches) return;
        clearTimeout(tFecha);
        if (painel.hidden) tAbre = setTimeout(function () { abrePainel('mouse'); }, 120);
      });
      el.addEventListener('mouseleave', function () {
        if (!ponteiroFino.matches) return;
        clearTimeout(tAbre);
        if (abertoPor === 'mouse') tFecha = setTimeout(function () { fechaPainel(false); }, 220);
      });
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || painel.hidden) return;
      var dentro = painel.contains(doc.activeElement) || doc.activeElement === botaoAtuacao;
      fechaPainel(dentro);
    });
    doc.addEventListener('click', function (e) {
      if (painel.hidden) return;
      if (painel.contains(e.target) || botaoAtuacao.contains(e.target)) {
        if (e.target.closest && e.target.closest('a')) fechaPainel(false);
        return;
      }
      fechaPainel(false);
    });
    painel.addEventListener('focusout', function (e) {
      var para = e.relatedTarget;
      if (para && !painel.contains(para) && para !== botaoAtuacao) fechaPainel(false);
    });
    aoMudar(largo, function () { if (!largo.matches) fechaPainel(false); });
  }

  /* ---------- 3. Menu do celular ---------- */
  var botaoMenu = $('.site-menu');
  var menu = $('#menu-movel');
  if (botaoMenu && menu) {
    var foraDoMenu = $$('#conteudo, .rodape-site, .pular');
    var abreMenu = function () {
      medeCabecalho();
      menu.hidden = false;
      botaoMenu.setAttribute('aria-expanded', 'true');
      botaoMenu.setAttribute('aria-label', 'Fechar o menu');
      html.classList.add('menu-aberto');
      foraDoMenu.forEach(function (el) { el.inert = true; el.setAttribute('aria-hidden', 'true'); });
      var primeiro = focaveis(menu)[0];
      if (primeiro) primeiro.focus();
    };
    var fechaMenu = function (devolverFoco) {
      if (menu.hidden) return;
      menu.hidden = true;
      botaoMenu.setAttribute('aria-expanded', 'false');
      botaoMenu.setAttribute('aria-label', 'Abrir o menu');
      html.classList.remove('menu-aberto');
      foraDoMenu.forEach(function (el) { el.inert = false; el.removeAttribute('aria-hidden'); });
      if (devolverFoco) botaoMenu.focus();
    };
    botaoMenu.addEventListener('click', function () {
      if (menu.hidden) abreMenu();
      else fechaMenu(true);
    });
    doc.addEventListener('keydown', function (e) {
      if (menu.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); fechaMenu(true); return; }
      if (e.key !== 'Tab') return;
      var ciclo = [botaoMenu].concat(focaveis(menu));
      var i = ciclo.indexOf(doc.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); ciclo[ciclo.length - 1].focus(); }
      else if (!e.shiftKey && (i === ciclo.length - 1 || i === -1)) { e.preventDefault(); ciclo[0].focus(); }
    });
    menu.addEventListener('click', function (e) {
      var link = e.target.closest && e.target.closest('a[href]');
      if (link) fechaMenu(false);
    });
    $$('.menu-movel-sub', menu).forEach(function (b) {
      var alvo = doc.getElementById(b.getAttribute('aria-controls'));
      b.addEventListener('click', function () {
        var abrir = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', String(abrir));
        if (alvo) alvo.hidden = !abrir;
      });
    });
    aoMudar(largo, function () { if (largo.matches) fechaMenu(false); });
  }

  /* ---------- 4. Carta de negativa anotada ---------- */
  var leitura = $('[data-leitura]');
  if (leitura) {
    var grifos = $$('.carta-grifo', leitura);
    var notas = $$('.leitura-nota', leitura);
    var total = notas.length;
    var aviso = $('[data-leitura-status]', leitura);
    var folha = $('#leitura-folha');
    var folhaPos = $('#leitura-folha-pos');
    var folhaT = $('#leitura-folha-t');
    var folhaCorpo = $('[data-leitura-folha-corpo]');
    var folhaPassos = $$('.leitura-passo', folha || doc);
    var origem = null;
    var atual = 0;
    notas.forEach(function (li, i) { if (li.classList.contains('ativa')) atual = i + 1; });

    var tituloDa = function (n) { var t = $('.leitura-nota-t', notas[n - 1]); return t ? t.textContent : ''; };
    var grifoDa = function (n) { return grifos.filter(function (g) { return g.getAttribute('data-nota') === String(n); })[0]; };

    var ativa = function (n) {
      atual = n;
      grifos.forEach(function (g) {
        var sim = g.getAttribute('data-nota') === String(n);
        g.classList.toggle('ativo', sim);
        if (sim) g.setAttribute('aria-current', 'true'); else g.removeAttribute('aria-current');
      });
      notas.forEach(function (li, i) {
        var sim = i + 1 === n;
        var b = $('.leitura-nota-cab button', li);
        var corpo = $('.leitura-nota-corpo', li);
        li.classList.toggle('ativa', sim);
        if (b) b.setAttribute('aria-expanded', String(sim));
        if (corpo) corpo.hidden = !sim;
      });
      if (aviso) aviso.textContent = n ? 'Nota ' + n + ' de ' + total + ' aberta: ' + tituloDa(n) + '.' : '';
    };

    var naTela = function (el, folga) {
      var r = el.getBoundingClientRect();
      var topo = alturaCab() + (folga || 0);
      return r.top >= topo && r.bottom <= (window.innerHeight || html.clientHeight);
    };

    var preencheFolha = function (n) {
      var corpo = $('.leitura-nota-corpo', notas[n - 1]);
      folhaPos.textContent = 'Nota ' + n + ' de ' + total;
      folhaT.textContent = tituloDa(n);
      folhaCorpo.innerHTML = corpo ? corpo.innerHTML : '';
      folhaPassos.forEach(function (b) {
        var alvo = n + Number(b.getAttribute('data-passo'));
        b.disabled = alvo < 1 || alvo > total;
      });
    };
    var mostraGrifoAcimaDaFolha = function (g) {
      if (!g) return;
      var r = g.getBoundingClientRect();
      var topo = alturaCab() + 16;
      var limite = window.innerHeight - folha.offsetHeight - 16;
      if (r.top < topo || r.bottom > limite) {
        window.scrollBy({ top: r.top - topo - 8, behavior: rolagem() });
      }
    };
    var abreFolha = function (n, de) {
      if (!folha) return;
      preencheFolha(n);
      folha.hidden = false;
      origem = de || grifoDa(n) || origem;
      mostraGrifoAcimaDaFolha(grifoDa(n));
      folhaT.focus({ preventScroll: true });
    };
    var fechaFolha = function (devolverFoco) {
      if (!folha || folha.hidden) return;
      folha.hidden = true;
      if (devolverFoco && origem) origem.focus({ preventScroll: true });
    };

    grifos.forEach(function (g) {
      g.addEventListener('click', function (e) {
        e.preventDefault();
        var n = Number(g.getAttribute('data-nota'));
        ativa(n);
        if (largo.matches) {
          var li = notas[n - 1];
          if (li && !naTela(li, 16)) li.scrollIntoView({ block: 'nearest', behavior: rolagem() });
        } else {
          abreFolha(n, g);
        }
      });
    });
    notas.forEach(function (li, i) {
      var b = $('.leitura-nota-cab button', li);
      if (!b) return;
      b.addEventListener('click', function () {
        var n = i + 1;
        if (atual === n) { ativa(0); return; }
        ativa(n);
        var g = grifoDa(n);
        if (largo.matches && g && !naTela(g, 16)) g.scrollIntoView({ block: 'center', behavior: rolagem() });
      });
    });
    if (folha) {
      $('.leitura-folha-fechar', folha).addEventListener('click', function () { fechaFolha(true); });
      folhaPassos.forEach(function (b) {
        b.addEventListener('click', function () {
          var n = atual + Number(b.getAttribute('data-passo'));
          if (n < 1 || n > total) return;
          ativa(n);
          origem = grifoDa(n);
          abreFolha(n, origem);
        });
      });
      folha.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { e.preventDefault(); fechaFolha(true); }
      });
      doc.addEventListener('click', function (e) {
        if (folha.hidden) return;
        if (folha.contains(e.target) || (e.target.closest && e.target.closest('.carta-grifo'))) return;
        fechaFolha(false);
      });
      aoMudar(largo, function () { if (largo.matches) fechaFolha(false); });
    }
  }

  /* ---------- 5. Prazos máximos de atendimento (RN 566/2022, art. 3º) ----------
     Dias úteis: segunda a sexta, sem os feriados nacionais fixados em lei federal.
     RN 566: segundo a ANS, o dia do pedido conta. RN 623: a resposta conta do dia útil seguinte. */
  var FERIADOS = ['01-01', '04-21', '05-01', '09-07', '10-12', '11-02', '11-15', '11-20', '12-25'];
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var SEMANA = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  function dois(n) { return (n < 10 ? '0' : '') + n; }
  function diaUtil(d) {
    var w = d.getDay();
    if (w === 0 || w === 6) return false;
    return FERIADOS.indexOf(dois(d.getMonth() + 1) + '-' + dois(d.getDate())) === -1;
  }
  function somaDiasUteis(inicio, n, contaInicio) {
    var d = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
    var c = (contaInicio && diaUtil(d)) ? 1 : 0;
    while (c < n) { d.setDate(d.getDate() + 1); if (diaUtil(d)) c++; }
    return d;
  }
  function porExtenso(d) { return d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear(); }
  /* a data entra como dd/mm/aaaa (o campo de data nativo segue a língua do navegador, não a da página) */
  function leData(v) {
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v || '');
    if (!m) return null;
    var d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    return (d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[1])) ? d : null;
  }

  var prazos = $('[data-prazos]');
  if (prazos) {
    var seletor = $('select', prazos);
    var campoData = $('[data-prazos-data]', prazos);
    var ajudaData = $('[data-prazos-ajuda]', prazos);
    var ajudaPadrao = ajudaData ? ajudaData.textContent : '';
    var formataData = function () {
      var dig = campoData.value.replace(/\D/g, '').slice(0, 8);
      var out = dig.length > 4 ? dig.slice(0, 2) + '/' + dig.slice(2, 4) + '/' + dig.slice(4)
        : dig.length > 2 ? dig.slice(0, 2) + '/' + dig.slice(2) : dig;
      if (out !== campoData.value) campoData.value = out;
    };
    var avisaData = function (pedido) {
      if (!ajudaData) return;
      var completo = campoData.value.length === 10;
      var erro = completo && !pedido;
      ajudaData.classList.toggle('erro', erro);
      ajudaData.textContent = erro ? 'Confira a data: dia, mês e ano, como 05/10/2026.' : ajudaPadrao;
      if (erro) campoData.setAttribute('aria-invalid', 'true'); else campoData.removeAttribute('aria-invalid');
    };
    var elDias = $('[data-prazos-dias]', prazos);
    var elUn = $('[data-prazos-un]', prazos);
    var elDesc = $('[data-prazos-desc]', prazos);
    var elTexto = $('[data-prazos-texto]', prazos);
    var elLimite = $('[data-prazos-limite]', prazos);
    var elResp = $('[data-prazos-resposta]', prazos);
    var mostraPrazo = function () {
      var o = seletor.options[seletor.selectedIndex];
      var dias = Number(o.getAttribute('data-dias'));
      var resp = Number(o.getAttribute('data-resp'));
      var art = o.getAttribute('data-art');
      var pedido = campoData ? leData(campoData.value) : null;
      if (campoData) avisaData(pedido);
      elDesc.textContent = o.getAttribute('data-desc');
      elLimite.hidden = true;
      elLimite.innerHTML = '';
      if (dias === 0) {
        elDias.textContent = 'Imediato';
        elUn.textContent = '';
        elTexto.textContent = 'Na urgência e na emergência, o atendimento é imediato (Resolução Normativa nº 566/2022 da ANS, ' + art + ').';
        elResp.textContent = 'A resposta ao pedido também é imediata (RN 623/2024, art. 12).';
        return;
      }
      elDias.textContent = String(dias);
      elUn.textContent = 'dias úteis';
      elTexto.textContent = 'Prazo máximo para realizar o atendimento, contado do pedido (Resolução Normativa nº 566/2022 da ANS, ' + art + ').';
      var respMenor = resp < dias;
      elResp.textContent = respMenor
        ? 'A resposta ao pedido tem prazo próprio: até ' + resp + ' dias úteis (RN 623/2024, art. 12).'
        : 'Aqui o prazo de atendimento é o menor, e a resposta ao pedido deve vir dentro dele (RN 623/2024, art. 12, § 1º).';
      if (!pedido) return;
      if (pedido < new Date(2023, 1, 1)) {
        elLimite.hidden = false;
        elLimite.textContent = 'A RN 566/2022 vale para pedidos feitos a partir de 1º de fevereiro de 2023.';
        return;
      }
      var limite = somaDiasUteis(pedido, dias, true);
      var b = doc.createElement('b');
      b.textContent = porExtenso(limite);
      elLimite.appendChild(b);
      elLimite.appendChild(doc.createTextNode(
        'Dia-limite para realizar o atendimento, uma ' + SEMANA[limite.getDay()] + '. Pedido em ' + porExtenso(pedido) +
        '; segundo a ANS, o dia do pedido já conta.'));
      elLimite.hidden = false;
      if (respMenor) {
        var limiteResp = somaDiasUteis(pedido, resp, false);
        elResp.textContent = 'A resposta ao pedido vem antes: até ' + porExtenso(limiteResp) + ', em ' + resp + ' dias úteis contados do dia útil seguinte ao pedido (RN 623/2024, art. 12).';
      }
    };
    seletor.addEventListener('change', mostraPrazo);
    if (campoData) campoData.addEventListener('input', function () { formataData(); mostraPrazo(); });
    prazos.addEventListener('submit', function (e) { e.preventDefault(); });
    mostraPrazo();
  }

  /* ---------- 6. Página de tema: índice "Nesta página" ---------- */
  var indice = $('[data-indice]');
  if (indice) {
    var partes = $$('[data-parte]');
    var linksIndice = $$('a[href^="#"]', indice);
    var campos = ['campo-papel', 'campo-nevoa', 'campo-noite', 'campo-marinho', 'campo-branco'];
    var barra = $('[data-indice-barra]', indice);
    var botaoIndice = $('[data-indice-botao]', indice);
    var listaIndice = $('[data-indice-lista]', indice);
    var rotuloAtual = $('[data-indice-atual]', indice);
    var campoDa = function (el) {
      for (var i = 0; i < campos.length; i++) if (el.classList.contains(campos[i])) return campos[i];
      return 'campo-papel';
    };
    var atualizaIndice = function () {
      var cabH = alturaCab();
      var r = indice.getBoundingClientRect();
      var linha = largo.matches ? r.top + Math.min(r.height, 320) / 2 : cabH + r.height + 24;
      var leitura2 = Math.max(cabH + 96, window.innerHeight * 0.32);
      var sob = null, lida = null;
      partes.forEach(function (p) {
        var pr = p.getBoundingClientRect();
        if (pr.top <= linha && pr.bottom > linha) sob = p;
        if (pr.top <= leitura2) lida = p;
      });
      /* o índice fica sempre na margem em Papel; a parte sob ele só serve para saber onde se está */
      indice.setAttribute('data-campo', sob ? campoDa(sob) : 'campo-papel');
      var idAtual = lida ? lida.id : (partes[0] && partes[0].id);
      linksIndice.forEach(function (a) {
        var sim = a.getAttribute('href') === '#' + idAtual;
        if (sim) {
          a.setAttribute('aria-current', 'location');
          if (rotuloAtual) rotuloAtual.textContent = a.textContent.replace(/\s+/g, ' ').trim();
        } else a.removeAttribute('aria-current');
      });
      if (barra && partes.length) {
        var corpoIni = partes[0].getBoundingClientRect().top + window.scrollY;
        var ultima = partes[partes.length - 1];
        var corpoFim = ultima.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
        var feito = (window.scrollY - corpoIni + cabH) / Math.max(1, corpoFim - corpoIni + cabH);
        barra.style.transform = 'scaleX(' + Math.max(0, Math.min(1, feito)).toFixed(3) + ')';
      }
    };
    ouvintesRolagem.push(atualizaIndice);
    window.addEventListener('resize', atualizaIndice);
    atualizaIndice();

    if (botaoIndice && listaIndice) {
      var abreIndice = function (abrir) {
        botaoIndice.setAttribute('aria-expanded', String(abrir));
        indice.classList.toggle('indice-aberto', abrir);
      };
      botaoIndice.addEventListener('click', function () {
        abreIndice(botaoIndice.getAttribute('aria-expanded') !== 'true');
      });
      linksIndice.forEach(function (a) { a.addEventListener('click', function () { if (!largo.matches) abreIndice(false); }); });
      doc.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && botaoIndice.getAttribute('aria-expanded') === 'true') { abreIndice(false); botaoIndice.focus(); }
      });
      doc.addEventListener('click', function (e) {
        if (botaoIndice.getAttribute('aria-expanded') === 'true' && !indice.contains(e.target)) abreIndice(false);
      });
      aoMudar(largo, function () { abreIndice(false); atualizaIndice(); });
    }
  }

  /* ---------- 7. Página de tema: as cirurgias em pílulas ----------
     Sem JavaScript, a lista inteira aparece; com ele, uma pílula por vez abre a sua explicação. */
  var proc = $('[data-procedimentos]');
  if (proc) {
    var pilulas = $$('.proc-pilula', proc);
    var itens = $$('.proc-item', proc);
    var grupoPilulas = $('[data-proc-pilulas]', proc);
    var escolhe = function (id) {
      pilulas.forEach(function (p) { p.setAttribute('aria-pressed', String(p.getAttribute('data-proc') === id)); });
      itens.forEach(function (it) { it.classList.toggle('ativo', it.id === id); });
    };
    pilulas.forEach(function (p, i) {
      p.addEventListener('click', function () { escolhe(p.getAttribute('data-proc')); });
      p.addEventListener('keydown', function (e) {
        var alvo = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') alvo = pilulas[(i + 1) % pilulas.length];
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') alvo = pilulas[(i - 1 + pilulas.length) % pilulas.length];
        if (alvo) { e.preventDefault(); alvo.focus(); escolhe(alvo.getAttribute('data-proc')); }
      });
    });
    if (grupoPilulas) grupoPilulas.hidden = false;
    var inicial = pilulas.filter(function (p) { return p.getAttribute('aria-pressed') === 'true'; })[0] || pilulas[0];
    if (inicial) escolhe(inicial.getAttribute('data-proc'));
  }

  /* ---------- 8. Página de tema: lista de documentos ---------- */
  var docs = $('[data-documentos]');
  if (docs) {
    var chave = 'borelli-documentos-' + (docs.getAttribute('data-documentos') || 'tema');
    var caixas = $$('input[type="checkbox"]', docs);
    var contagem = $('[data-documentos-contagem]', docs);
    var progresso = $('[data-documentos-progresso]', docs);
    var avisoDocs = $('[data-documentos-aviso]', docs);
    var le = function () {
      try { return JSON.parse(window.localStorage.getItem(chave) || '[]') || []; } catch (err) { return []; }
    };
    var grava = function () {
      var marcados = caixas.filter(function (c) { return c.checked; }).map(function (c) { return c.value; });
      try { window.localStorage.setItem(chave, JSON.stringify(marcados)); return true; } catch (err) { return false; }
    };
    var conta = function () {
      var n = caixas.filter(function (c) { return c.checked; }).length;
      if (contagem) contagem.textContent = n + ' de ' + caixas.length + (n === 1 ? ' documento marcado' : ' documentos marcados');
      if (progresso) progresso.style.transform = 'scaleX(' + (caixas.length ? n / caixas.length : 0).toFixed(3) + ')';
      return n;
    };
    var diz = function (t) {
      if (!avisoDocs) return;
      avisoDocs.textContent = '';
      window.setTimeout(function () { avisoDocs.textContent = t; }, 40);
    };
    var textoDe = function (c, sel) {
      var el = $(sel, c.closest('li'));
      return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
    };
    var salvos = le();
    caixas.forEach(function (c) {
      c.checked = salvos.indexOf(c.value) !== -1;
      c.addEventListener('change', function () {
        var ok = grava();
        var n = conta();
        if (!ok) diz('As marcações valem só enquanto esta página estiver aberta: este navegador não deixa guardar.');
        else diz(n + ' de ' + caixas.length + ' marcados. Guardado só neste navegador.');
      });
    });
    conta();

    var imprimir = $('[data-documentos-imprimir]', docs);
    var folhaImpressao = $('#impressao-lista');
    var montaImpressao = function () {
      if (!folhaImpressao) return;
      var hoje = new Date();
      var n = caixas.filter(function (c) { return c.checked; }).length;
      var partesHtml = [];
      var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
      partesHtml.push('<div class="impressao-cab"><img src="/borelli-site-previa/assets/img/marca/borelli-horizontal-sem-apoio-marinho.svg" alt="Borelli Advocacia" width="166" height="36"><p>advborelli.com.br</p></div>');
      partesHtml.push('<p class="impressao-titulo">' + esc(docs.getAttribute('data-titulo') || 'Documentos') + '</p>');
      partesHtml.push('<p class="impressao-data">Lista impressa em ' + dois(hoje.getDate()) + '/' + dois(hoje.getMonth() + 1) + '/' + hoje.getFullYear() + ' · ' + n + ' de ' + caixas.length + ' marcados</p>');
      $$('.docs-grupo', docs).forEach(function (g) {
        var leg = $('legend', g);
        partesHtml.push('<p class="impressao-grupo">' + esc(leg ? leg.textContent : '') + '</p><ul>');
        $$('input[type="checkbox"]', g).forEach(function (c) {
          var d = textoDe(c, '.doc-d');
          partesHtml.push('<li class="' + (c.checked ? 'marcado' : '') + '"><span class="caixa"></span><span><b>' + esc(textoDe(c, '.doc-t')) + '</b>' + (d ? '<span class="d">' + esc(d) + '</span>' : '') + '</span></li>');
        });
        partesHtml.push('</ul>');
      });
      partesHtml.push('<p class="impressao-nota">Sigilo: documentos de saúde são dados sensíveis (Lei 13.709/2018, art. 5º, II). Não envie documentos, fotos ou detalhes do seu caso pelo formulário do site.</p>');
      partesHtml.push('<p class="impressao-id">Caico Borelli Sociedade Individual de Advocacia · Registro OAB/CE [nº] · Responsável: Caico Borelli · OAB/CE 24.895</p>');
      partesHtml.push('<p class="impressao-aviso">Conteúdo informativo. Não constitui promessa de resultado, prazo ou valor. Cada caso é analisado individualmente.</p>');
      folhaImpressao.innerHTML = partesHtml.join('');
    };
    if (imprimir) {
      imprimir.addEventListener('click', function () {
        montaImpressao();
        html.classList.add('imprimindo-lista');
        var limpa = function () { html.classList.remove('imprimindo-lista'); window.removeEventListener('afterprint', limpa); };
        window.addEventListener('afterprint', limpa);
        window.print();
        window.setTimeout(limpa, 1000);
      });
    }
    var copiar = $('[data-documentos-copiar]', docs);
    if (copiar) {
      copiar.addEventListener('click', function () {
        var titulo = docs.getAttribute('data-titulo') || 'Documentos';
        var linhas = [];
        $$('.docs-grupo', docs).forEach(function (g) {
          var leg = $('legend', g);
          linhas.push('');
          linhas.push((leg ? leg.textContent : '').toUpperCase());
          $$('input[type="checkbox"]', g).forEach(function (c) {
            linhas.push((c.checked ? 'Tenho · ' : 'Falta · ') + textoDe(c, '.doc-t'));
          });
        });
        var texto = titulo + '\n' + linhas.join('\n') + '\n\nBorelli Advocacia · advborelli.com.br';
        var feito = function () { diz('Lista copiada. Cole onde quiser guardar.'); };
        var falhou = function () { diz('Não foi possível copiar. Use o botão de imprimir ou salve a página.'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(feito, falhou);
        else falhou();
      });
    }
    var limpar = $('[data-documentos-limpar]', docs);
    if (limpar) {
      limpar.addEventListener('click', function () {
        caixas.forEach(function (c) { c.checked = false; });
        try { window.localStorage.removeItem(chave); } catch (err) { /* sem armazenamento: nada a apagar */ }
        conta();
        diz('Marcações apagadas deste navegador.');
      });
    }
  }
})();
