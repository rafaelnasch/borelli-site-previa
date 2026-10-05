/* =====================================================================
   BORELLI ADVOCACIA · ferramentas/familia.js · a página-hub de Direito de Família
   (/atuacao/direito-de-familia/). Dois comportamentos, ligados só quando acha o elemento:
   · Documentos por tema (parte 03, [data-fam-docs]): com JavaScript, as pílulas mostram um
     tema por vez; sem ele, todos os temas aparecem, um embaixo do outro. Um link para
     "#documentos-<tema>" (o "Documentos deste tema" de cada bloco da parte 02) abre o tema
     certo e leva até ele.
   · Temas da parte 02: no celular, o site.js deixa cada tema recolhível (o primeiro aberto).
     Um link ou um endereço com "#divorcio", "#pensao"... abre o tema pedido e leva até ele.
   Nada é enviado a lugar nenhum: tudo acontece na página.
   ===================================================================== */
(function () {
  'use strict';
  var doc = document;
  var B = window.Borelli || {};
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || doc).querySelectorAll(sel)); }
  var foca = B.foca || function (el) { if (el) el.focus(); };
  var poucoMovimento = function () { return B.poucoMovimento ? B.poucoMovimento() : false; };
  var leva = function (el) {
    if (!el) return;
    var comportamento = poucoMovimento() || doc.documentElement.classList.contains('automatizado') ? 'auto' : 'smooth';
    try { el.scrollIntoView({ block: 'start', behavior: comportamento }); } catch (e) { el.scrollIntoView(true); }
  };
  var porId = function (hash) {
    if (!hash || hash.length < 2) return null;
    try { return doc.getElementById(decodeURIComponent(hash.slice(1))); } catch (e) { return null; }
  };

  /* ---------- Documentos por tema ---------- */
  var mostraDocs = null;
  $$('[data-fam-docs]').forEach(function (raiz) {
    var escolha = raiz.querySelector('[data-fam-docs-escolha]');
    var botoes = $$('[data-fam-tema]', raiz);
    if (!escolha || !botoes.length) return;
    var painel = function (b) { return doc.getElementById(b.getAttribute('data-fam-tema')); };
    var mostra = function (b) {
      botoes.forEach(function (o) {
        var sim = o === b;
        o.setAttribute('aria-pressed', sim ? 'true' : 'false');
        var p = painel(o);
        if (p) p.hidden = !sim;
      });
    };
    botoes.forEach(function (b, i) {
      b.addEventListener('click', function () { mostra(b); });
      b.addEventListener('keydown', function (e) {
        var alvo = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') alvo = botoes[(i + 1) % botoes.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') alvo = botoes[(i - 1 + botoes.length) % botoes.length];
        else if (e.key === 'Home') alvo = botoes[0];
        else if (e.key === 'End') alvo = botoes[botoes.length - 1];
        if (alvo) { e.preventDefault(); foca(alvo); mostra(alvo); }
      });
    });
    escolha.hidden = false;
    raiz.classList.add('fam-docs-pronto');
    mostra(botoes.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })[0] || botoes[0]);
    /* devolve o botão do painel pedido (ou null), para os links "#documentos-<tema>" */
    mostraDocs = function (alvo) {
      var b = botoes.filter(function (o) { return painel(o) === alvo; })[0];
      if (!b) return false;
      mostra(b);
      return true;
    };
  });

  /* ---------- Temas da parte 02 (recolhíveis no celular pelo site.js) ---------- */
  var abreTema = function (alvo) {
    if (!alvo || !alvo.classList || !alvo.classList.contains('regra')) return false;
    if (alvo.classList.contains('regra--fechada')) {
      var botao = alvo.querySelector('.regra-botao');
      if (botao) botao.click();
    }
    return true;
  };

  /* um alvo do endereço: abre o que precisa e leva até ele */
  var trata = function (hash, rolar) {
    var alvo = porId(hash);
    if (!alvo) return;
    var achou = (mostraDocs && mostraDocs(alvo)) || abreTema(alvo);
    if (achou && rolar) leva(alvo);
  };

  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var hash = a.getAttribute('href');
    var alvo = porId(hash);
    if (!alvo) return;
    var docs = mostraDocs && mostraDocs(alvo);
    var tema = !docs && abreTema(alvo);
    if (docs || tema) {
      /* o painel ou o tema acabou de mudar de altura: a rolagem é feita aqui, no lugar certo */
      e.preventDefault();
      if (window.history && window.history.pushState) window.history.pushState(null, '', hash);
      leva(alvo);
    }
  });
  window.addEventListener('hashchange', function () { trata(window.location.hash, true); });
  /* o site.js recolhe os temas ao carregar; o pedido do endereço vem depois dele */
  var inicio = function () { if (window.location.hash) setTimeout(function () { trata(window.location.hash, true); }, 80); };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', inicio);
  else inicio();
})();
