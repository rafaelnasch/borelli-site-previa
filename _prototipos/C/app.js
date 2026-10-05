/* =====================================================================
   BORELLI ADVOCACIA · Protótipo C · app.js
   Sem dependências. As formas da casa vêm de /assets/js/bforms.js.
   1. Cabeçalho que encolhe   2. Painel Atuação   3. Menu do celular
   4. Links da própria página (rolagem suave só com o sistema pedindo movimento)
   5. Carta de negativa anotada   6. Índice "Nesta página"
   7. Pílulas das cirurgias   8. Lista de documentos
   Nada aqui envia dado a lugar nenhum: o que se guarda fica no navegador.
   ===================================================================== */
(function () {
  'use strict';
  var doc = document;
  var raiz = doc.documentElement;
  var mqTela = window.matchMedia('(min-width: 1025px)');
  var mqCalma = window.matchMedia('(prefers-reduced-motion: reduce)');

  function $(sel, el) { return (el || doc).querySelector(sel); }
  function $$(sel, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(sel)); }
  function visivel(el) { return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length); }
  function focaveis(el) {
    return $$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])', el).filter(visivel);
  }
  function aoMudar(mq, fn) {
    if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn);
  }
  function dois(n) { return (n < 10 ? '0' : '') + n; }
  function foca(el) {
    if (!el) return;
    try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
  }
  function rolaAte(y) {
    try { window.scrollTo({ top: y, behavior: mqCalma.matches ? 'auto' : 'smooth' }); }
    catch (e) { window.scrollTo(0, y); }
  }
  /* O navegador pode recusar o armazenamento (janela anônima, dados bloqueados): tudo em try/catch */
  var guarda = {
    ler: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    gravar: function (k, v) { try { window.localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    apagar: function (k) { try { window.localStorage.removeItem(k); return true; } catch (e) { return false; } }
  };

  /* ---------- 1. Cabeçalho fixo: encolhe de 96 para 72 ao rolar ---------- */
  var topo = $('#topo');
  function alturaTopo() { return topo ? Math.round(topo.getBoundingClientRect().bottom) : 0; }
  if (topo) {
    var agendado = false;
    var confere = function () {
      agendado = false;
      if (raiz.classList.contains('menu-aberto')) return;
      var deve = window.scrollY > 24;
      if (deve !== topo.classList.contains('encolhido')) topo.classList.toggle('encolhido', deve);
    };
    window.addEventListener('scroll', function () {
      if (!agendado) { agendado = true; window.requestAnimationFrame(confere); }
    }, { passive: true });
    confere();
  }

  /* ---------- 2. Painel Atuação (computador): abre no clique, Esc fecha, foco volta ---------- */
  var gatilho = $('.nav-atuacao');
  var painel = $('#painel-atuacao');
  if (gatilho && painel) {
    var foraDoPainel = function (e) {
      if (!painel.contains(e.target) && !gatilho.contains(e.target)) fechaPainel(false);
    };
    var teclaPainel = function (e) {
      if (e.key === 'Escape') { e.preventDefault(); fechaPainel(true); }
    };
    var abrePainel = function () {
      painel.hidden = false;
      gatilho.setAttribute('aria-expanded', 'true');
      doc.addEventListener('click', foraDoPainel, true);
      doc.addEventListener('keydown', teclaPainel);
    };
    var fechaPainel = function (devolveFoco) {
      if (painel.hidden) return;
      painel.hidden = true;
      gatilho.setAttribute('aria-expanded', 'false');
      doc.removeEventListener('click', foraDoPainel, true);
      doc.removeEventListener('keydown', teclaPainel);
      if (devolveFoco) foca(gatilho);
    };
    /* no computador o link vira botão que abre o painel; no celular continua link da página Atuação */
    var papelDoGatilho = function () {
      if (mqTela.matches) {
        gatilho.setAttribute('role', 'button');
        gatilho.setAttribute('aria-expanded', painel.hidden ? 'false' : 'true');
        gatilho.setAttribute('aria-controls', 'painel-atuacao');
      } else {
        fechaPainel(false);
        gatilho.removeAttribute('role');
        gatilho.removeAttribute('aria-expanded');
        gatilho.removeAttribute('aria-controls');
      }
    };
    gatilho.addEventListener('click', function (e) {
      if (!mqTela.matches) return;
      e.preventDefault();
      if (painel.hidden) abrePainel(); else fechaPainel(false);
    });
    gatilho.addEventListener('keydown', function (e) {
      if (!mqTela.matches) return;
      if (e.key === ' ') { e.preventDefault(); gatilho.click(); }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (painel.hidden) abrePainel();
        foca(focaveis(painel)[0]);
      }
    });
    painel.addEventListener('focusout', function (e) {
      var para = e.relatedTarget;
      if (para && !painel.contains(para) && para !== gatilho) fechaPainel(false);
    });
    painel.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a[href]')) fechaPainel(false);
    });
    aoMudar(mqTela, papelDoGatilho);
    papelDoGatilho();
  }

  /* ---------- 3. Menu do celular: abre, fecha, prende o foco, Esc fecha ---------- */
  var botaoMenu = $('.site-menu');
  var menu = $('#menu-movel');
  if (botaoMenu && menu) {
    var fundo = [$('main'), $('footer'), $('.pular'), $('.topo-marca')].filter(Boolean);
    var menuAberto = false;
    var sub = $('.menu-movel-sub', menu);
    var subAreas = $('#menu-movel-areas');
    var abreSub = function (abre) {
      if (!sub || !subAreas) return;
      sub.setAttribute('aria-expanded', String(abre));
      subAreas.hidden = !abre;
    };
    var teclaMenu = function (e) {
      if (e.key === 'Escape') { e.preventDefault(); fechaMenu(true); return; }
      if (e.key !== 'Tab') return;
      var lista = [botaoMenu].concat(focaveis(menu));
      var i = lista.indexOf(doc.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); lista[lista.length - 1].focus(); }
      else if (!e.shiftKey && (i === -1 || i === lista.length - 1)) { e.preventDefault(); lista[0].focus(); }
    };
    var abreMenu = function () {
      menuAberto = true;
      raiz.style.setProperty('--topo-h', alturaTopo() + 'px');
      raiz.classList.add('menu-aberto');
      menu.hidden = false;
      botaoMenu.setAttribute('aria-expanded', 'true');
      botaoMenu.setAttribute('aria-label', 'Fechar o menu');
      fundo.forEach(function (el) { el.inert = true; el.setAttribute('aria-hidden', 'true'); });
      /* na página de uma área, o grupo Atuação já abre mostrando onde a pessoa está */
      if (subAreas && $('[aria-current]', subAreas)) abreSub(true);
      doc.addEventListener('keydown', teclaMenu);
      foca(focaveis(menu)[0]);
    };
    var fechaMenu = function (devolveFoco) {
      if (!menuAberto) return;
      menuAberto = false;
      menu.hidden = true;
      raiz.classList.remove('menu-aberto');
      botaoMenu.setAttribute('aria-expanded', 'false');
      botaoMenu.setAttribute('aria-label', 'Abrir o menu');
      fundo.forEach(function (el) { el.inert = false; el.removeAttribute('aria-hidden'); });
      doc.removeEventListener('keydown', teclaMenu);
      if (devolveFoco) foca(botaoMenu);
    };
    botaoMenu.addEventListener('click', function () { if (menuAberto) fechaMenu(true); else abreMenu(); });
    menu.addEventListener('click', function (e) {
      var link = e.target.closest && e.target.closest('a[href]');
      if (link) fechaMenu(false);
    });
    if (sub && subAreas) {
      sub.addEventListener('click', function () { abreSub(sub.getAttribute('aria-expanded') !== 'true'); });
    }
    aoMudar(mqTela, function () { if (mqTela.matches) fechaMenu(false); });
  }

  /* ---------- 4. Links da própria página: rolagem suave só se o sistema não pede menos movimento ---------- */
  doc.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href*="#"]');
    if (!a) return;
    var url;
    try { url = new URL(a.getAttribute('href'), window.location.href); } catch (err) { return; }
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.hash.length < 2) return;
    var alvo = doc.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!alvo) return;
    e.preventDefault();
    try { alvo.scrollIntoView({ behavior: mqCalma.matches ? 'auto' : 'smooth', block: 'start' }); }
    catch (err) { alvo.scrollIntoView(); }
    try { window.history.pushState(null, '', url.hash); } catch (err) { /* segue sem mudar o endereço */ }
    if (!/^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(alvo.tagName) && !alvo.hasAttribute('tabindex')) alvo.setAttribute('tabindex', '-1');
    foca(alvo);
  });

  /* ---------- 5. Carta de negativa anotada ("Grifo nosso") ----------
     No computador, a nota fica no painel ao lado da carta (a primeira já aberta).
     No celular, tocar num trecho abre a nota numa folha que sobe da base da tela;
     Esc, o X ou um toque fora fecham. A barra de leitura lembra que os grifos abrem nota. */
  var carta = $('[data-carta]');
  if (carta) {
    var trechos = $$('.trecho', carta);
    var abas = $$('.carta-aba', carta);
    var notas = $$('.carta-nota', carta);
    var fecharNota = $('.carta-fechar', carta);
    var contagem = $('.carta-contagem b', carta);
    var docaAbrir = $('.carta-doca-abrir', carta);
    var anuncio = $('#carta-anuncio');
    var total = notas.length;
    var atual = 1;
    var origem = null;
    var folhaAberta = function () { return carta.classList.contains('carta--aberta'); };

    var ativa = function (n, anunciar) {
      atual = n;
      notas.forEach(function (nota) {
        var sim = +nota.getAttribute('data-nota') === n;
        nota.classList.toggle('inativa', !sim);
        if (sim) nota.removeAttribute('aria-hidden'); else nota.setAttribute('aria-hidden', 'true');
      });
      abas.forEach(function (aba) { aba.setAttribute('aria-pressed', String(+aba.getAttribute('data-nota') === n)); });
      var mostra = mqTela.matches || folhaAberta();
      trechos.forEach(function (t) { t.setAttribute('aria-expanded', String(mostra && +t.getAttribute('data-nota') === n)); });
      if (contagem) contagem.textContent = dois(n);
      if (docaAbrir) { docaAbrir.setAttribute('data-nota', String(n)); docaAbrir.textContent = 'Ler a nota ' + dois(n); }
      if (anuncio && anunciar !== false) {
        var titulo = $('.carta-nota-titulo', notas[n - 1]);
        var nome = titulo ? titulo.textContent.replace(/^\s*\d+\s*/, '').trim() : '';
        anuncio.textContent = 'Nota ' + dois(n) + ' de ' + dois(total) + ': ' + nome + '.';
      }
    };
    var trechoNaTela = function (n) {
      var t = trechos[n - 1];
      if (!t) return;
      var r = t.getBoundingClientRect();
      var cima = alturaTopo() + 16;
      var folha = $('.carta-painel', carta);
      var baixo = window.innerHeight - (folhaAberta() && folha ? folha.offsetHeight : 0) - 16;
      if (r.top < cima || r.bottom > baixo) rolaAte(window.scrollY + r.top - cima - 8);
    };
    var foraDaFolha = function (e) {
      if (!folhaAberta()) return;
      if (e.target.closest && (e.target.closest('.carta-painel') || e.target.closest('.trecho') || e.target.closest('.carta-doca'))) return;
      fechaFolha(false);
    };
    var teclaFolha = function (e) { if (e.key === 'Escape' && folhaAberta()) { e.preventDefault(); fechaFolha(true); } };
    var abreNota = function (n, quem) {
      if (mqTela.matches) { ativa(n); trechoNaTela(n); return; }
      var jaAberta = folhaAberta();
      carta.classList.add('carta--aberta');
      if (quem) origem = quem;
      ativa(n);
      if (!jaAberta) {
        doc.addEventListener('keydown', teclaFolha);
        doc.addEventListener('click', foraDaFolha, true);
        if (quem) foca(notas[n - 1]);
      }
      window.requestAnimationFrame(function () { trechoNaTela(n); });
    };
    var fechaFolha = function (devolveFoco) {
      if (!folhaAberta()) return;
      carta.classList.remove('carta--aberta');
      doc.removeEventListener('keydown', teclaFolha);
      doc.removeEventListener('click', foraDaFolha, true);
      trechos.forEach(function (t) { t.setAttribute('aria-expanded', 'false'); });
      if (anuncio) anuncio.textContent = 'Nota fechada.';
      if (devolveFoco && origem) foca(origem);
      origem = null;
    };

    trechos.forEach(function (t) {
      var n = +t.getAttribute('data-nota');
      t.addEventListener('click', function () { abreNota(n, t); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abreNota(n, t); }
      });
    });
    abas.forEach(function (aba) {
      aba.addEventListener('click', function () { var n = +aba.getAttribute('data-nota'); ativa(n); trechoNaTela(n); });
    });
    $$('.carta-passo', carta).forEach(function (b) {
      b.addEventListener('click', function () {
        var n = atual + (+b.getAttribute('data-passo'));
        if (n < 1) n = total;
        if (n > total) n = 1;
        ativa(n);
        trechoNaTela(n);
      });
    });
    if (docaAbrir) docaAbrir.addEventListener('click', function () { abreNota(+docaAbrir.getAttribute('data-nota') || 1, docaAbrir); });
    /* a barra de leitura do celular só aparece com a carta na tela */
    var folhaCarta = $('.carta-folha', carta);
    if (folhaCarta && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (en) { carta.classList.toggle('carta--na-tela', en.isIntersecting); });
      }, { rootMargin: '-30% 0px -20% 0px', threshold: 0 }).observe(folhaCarta);
    }
    if (fecharNota) fecharNota.addEventListener('click', function () { fechaFolha(true); });
    aoMudar(mqTela, function () { if (mqTela.matches) fechaFolha(false); ativa(atual, false); });
    ativa(1, false);
  }

  /* ---------- 6. Índice "Nesta página": parte atual, progresso, recolhível no celular ---------- */
  var indice = $('.indice');
  if (indice) {
    var linksIndice = $$('.c18-indice a', indice);
    var partes = linksIndice.map(function (a) { return doc.getElementById(a.getAttribute('href').slice(1)); });
    var alternar = $('.indice-alternar', indice);
    var atualTxt = $('.indice-atual', indice);
    var corpo = $('.partes');
    var marcada = -1;
    var marca = function (i) {
      if (i === marcada) return;
      marcada = i;
      linksIndice.forEach(function (a, j) { if (j === i) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
      if (atualTxt && linksIndice[i]) {
        var num = linksIndice[i].querySelector('span');
        var resto = linksIndice[i].textContent.replace(num ? num.textContent : '', '').replace(/\s+/g, ' ').trim();
        atualTxt.textContent = (num ? num.textContent + ' · ' : '') + resto;
      }
    };
    var espiaAgendado = false;
    var espia = function () {
      espiaAgendado = false;
      var linha = window.innerHeight * 0.32;
      var i = 0;
      partes.forEach(function (p, j) { if (p && p.getBoundingClientRect().top <= linha) i = j; });
      /* no fim da página a última parte vale, mesmo que não chegue à linha */
      if (window.innerHeight + window.scrollY >= doc.documentElement.scrollHeight - 4) i = partes.length - 1;
      marca(i);
      if (corpo) {
        var r = corpo.getBoundingClientRect();
        var feito = (window.innerHeight * 0.5 - r.top) / Math.max(1, r.height);
        indice.style.setProperty('--progresso', String(Math.max(0, Math.min(1, feito))));
      }
    };
    window.addEventListener('scroll', function () {
      if (!espiaAgendado) { espiaAgendado = true; window.requestAnimationFrame(espia); }
    }, { passive: true });
    window.addEventListener('resize', espia);
    espia();

    var fechaIndice = function (devolveFoco) {
      if (!indice.classList.contains('aberto')) return;
      indice.classList.remove('aberto');
      if (alternar) alternar.setAttribute('aria-expanded', 'false');
      if (devolveFoco) foca(alternar);
    };
    if (alternar) {
      alternar.addEventListener('click', function () {
        var abre = !indice.classList.contains('aberto');
        indice.classList.toggle('aberto', abre);
        alternar.setAttribute('aria-expanded', String(abre));
      });
      doc.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && indice.classList.contains('aberto')) { e.preventDefault(); fechaIndice(true); }
      });
      doc.addEventListener('click', function (e) {
        if (indice.classList.contains('aberto') && !indice.contains(e.target)) fechaIndice(false);
      });
    }
    linksIndice.forEach(function (a) { a.addEventListener('click', function () { fechaIndice(false); }); });
  }

  /* ---------- 7. Pílulas das cirurgias: cada uma mostra o que é ---------- */
  $$('[data-procedimentos]').forEach(function (grupo) {
    var botoes = $$('button[data-def]', grupo);
    var defs = $$('.proc-def', grupo);
    botoes.forEach(function (b) {
      b.addEventListener('click', function () {
        botoes.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        defs.forEach(function (p) { p.hidden = p.id !== b.getAttribute('data-def'); });
      });
    });
  });

  /* ---------- 8. Lista de documentos: marca, guarda no navegador, imprime e copia ---------- */
  var lista = $('#lista-docs');
  if (lista) {
    var chave = 'borelli:documentos:' + (lista.getAttribute('data-tema') || 'geral');
    var caixas = $$('input[type="checkbox"]', lista);
    var contador = $('.docs-contagem p', lista);
    var barra = $('.docs-linha', lista);
    var avisoDocs = $('#docs-anuncio');
    var avisoGuarda = $('.docs-aviso', lista);
    var salvo = {};
    try { salvo = JSON.parse(guarda.ler(chave) || '{}') || {}; } catch (e) { salvo = {}; }
    caixas.forEach(function (c) { if (salvo[c.value]) c.checked = true; });

    var conta = function (anunciar) {
      var feitos = caixas.filter(function (c) { return c.checked; }).length;
      var txt = feitos + ' de ' + caixas.length + ' documentos separados';
      if (contador) contador.textContent = txt;
      if (barra) barra.style.setProperty('--feito', String(caixas.length ? feitos / caixas.length : 0));
      if (anunciar && avisoDocs) avisoDocs.textContent = txt + '.';
    };
    var salva = function () {
      var marcados = {};
      caixas.forEach(function (c) { if (c.checked) marcados[c.value] = 1; });
      var ok = guarda.gravar(chave, JSON.stringify(marcados));
      if (!ok && avisoGuarda) avisoGuarda.textContent = 'Este navegador não deixou guardar as marcações. Elas valem até você fechar a página.';
    };
    caixas.forEach(function (c) { c.addEventListener('change', function () { salva(); conta(true); }); });
    conta(false);

    var botaoImprimir = $('[data-acao="imprimir"]', lista);
    if (botaoImprimir) {
      botaoImprimir.addEventListener('click', function () {
        raiz.classList.add('imprime-docs');
        var depois = function () { raiz.classList.remove('imprime-docs'); window.removeEventListener('afterprint', depois); };
        window.addEventListener('afterprint', depois);
        try { window.print(); } catch (e) { depois(); }
      });
    }

    var textoDaLista = function () {
      var titulo = lista.getAttribute('data-titulo') || 'Documentos';
      var partes = $$('.docs-grupo', lista).map(function (grupo) {
        var legenda = $('legend', grupo);
        var linhas = $$('input[type="checkbox"]', grupo).map(function (c) {
          var rotulo = c.parentNode.textContent.replace(/\s+/g, ' ').trim();
          return (c.checked ? '[x] ' : '[ ] ') + rotulo;
        });
        return (legenda ? legenda.textContent.trim() + '\n' : '') + linhas.join('\n');
      });
      return titulo + '\n\n' + partes.join('\n\n') + '\n\nLista de apoio da Borelli Advocacia (advborelli.com.br). Não analisa o seu caso.';
    };
    var copiaPeloCampo = function (texto) {
      var campo = doc.createElement('textarea');
      campo.value = texto;
      campo.setAttribute('readonly', '');
      campo.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
      doc.body.appendChild(campo);
      campo.select();
      var ok = false;
      try { ok = doc.execCommand('copy'); } catch (e) { ok = false; }
      doc.body.removeChild(campo);
      return ok;
    };
    var botaoCopiar = $('[data-acao="copiar"]', lista);
    if (botaoCopiar) {
      var rotuloCopiar = botaoCopiar.textContent;
      var avisa = function (ok) {
        botaoCopiar.textContent = ok ? 'Lista copiada' : 'Não deu para copiar';
        if (avisoDocs) avisoDocs.textContent = ok ? 'Lista copiada.' : 'Não deu para copiar a lista neste navegador.';
        window.setTimeout(function () { botaoCopiar.textContent = rotuloCopiar; }, 2400);
      };
      botaoCopiar.addEventListener('click', function () {
        var texto = textoDaLista();
        try {
          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(texto).then(function () { avisa(true); }, function () { avisa(copiaPeloCampo(texto)); });
            return;
          }
        } catch (e) { /* segue para o campo */ }
        avisa(copiaPeloCampo(texto));
      });
    }
    var botaoLimpar = $('[data-acao="limpar"]', lista);
    if (botaoLimpar) {
      botaoLimpar.addEventListener('click', function () {
        caixas.forEach(function (c) { c.checked = false; });
        guarda.apagar(chave);
        conta(true);
      });
    }
  }
})();
