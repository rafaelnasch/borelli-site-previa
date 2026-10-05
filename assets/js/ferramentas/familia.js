/* =====================================================================
   BORELLI ADVOCACIA · ferramentas/familia.js · a página-hub de Direito de Família
   (/atuacao/direito-de-familia/). Dois comportamentos, ligados só quando acha o elemento:
   · Documentos por tema (parte 03, [data-fam-docs]): com JavaScript, as pílulas mostram um
     tema por vez; sem ele, todos os temas aparecem, um embaixo do outro. Um link para
     "#documentos-<tema>" (o "Documentos deste tema" de cada bloco da parte 02) abre o tema
     certo e leva até ele.
   · Temas da parte 02: no celular, o site.js deixa cada tema recolhível (o primeiro aberto).
     Um link ou um endereço com "#divorcio", "#pensao"... abre o tema pedido e leva até ele.
   · Endereço: o tema aberto vai para o endereço sem criar entrada nova no histórico do navegador.
     Curatela, medidas protetivas e registro civil tratam de dados sensíveis (dossiê, nota de
     privacidade): o nome deles não vai para o endereço; no lugar, fica a parte da página.
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
  var SENSIVEL = /curatela|medidas-protetivas|registro-civil/;
  /* grava no endereço sem nova entrada no histórico; tema sensível vira a parte em que ele está */
  var anota = function (hash) {
    if (!window.history || !window.history.replaceState) return;
    if (SENSIVEL.test(hash)) hash = hash.indexOf('#documentos') === 0 ? '#documentos' : '#o-que-diz-a-regra';
    try { window.history.replaceState(window.history.state, '', hash); } catch (e) { /* endereço fica como está */ }
  };
  var porId = function (hash) {
    if (!hash || hash.length < 2) return null;
    try { return doc.getElementById(decodeURIComponent(hash.slice(1))); } catch (e) { return null; }
  };

  /* a lista de curatela guardava marcações numa versão de prévia; agora é lista simples: apaga o que ficou */
  try { window.localStorage.removeItem('borelli-docs:familia-curatela'); } catch (e) { /* sem acesso ao armazenamento */ }

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
      b.addEventListener('click', function () { mostra(b); anota('#' + b.getAttribute('data-fam-tema')); });
      b.addEventListener('keydown', function (e) {
        var alvo = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') alvo = botoes[(i + 1) % botoes.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') alvo = botoes[(i - 1 + botoes.length) % botoes.length];
        else if (e.key === 'Home') alvo = botoes[0];
        else if (e.key === 'End') alvo = botoes[botoes.length - 1];
        if (alvo) { e.preventDefault(); foca(alvo); mostra(alvo); anota('#' + alvo.getAttribute('data-fam-tema')); }
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
    if (achou && SENSIVEL.test(hash)) anota(hash);
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
      anota(hash);
      leva(alvo);
    }
  });
  window.addEventListener('hashchange', function () { trata(window.location.hash, true); });
  /* o site.js recolhe os temas ao carregar; o pedido do endereço vem depois dele */
  var inicio = function () { if (window.location.hash) setTimeout(function () { trata(window.location.hash, true); }, 80); };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', inicio);
  else inicio();
})();
