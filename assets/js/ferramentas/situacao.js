/* =====================================================================
   BORELLI ADVOCACIA · ferramentas/situacao.js · "Onde você está agora?"
   (seletor do protótipo B; DIREÇÃO, seção 1, item 2).
   A lista de situações em losangos abre, ao lado, o caminho da situação: quatro
   passos com a norma de cada passo e a página certa.
   · computador (a partir de 1025 px): funciona como abas, um caminho sempre aberto
     ao lado do trilho Noite; setas para cima e para baixo, Home e End percorrem;
   · celular: vira sanfona; o caminho abre logo abaixo da situação escolhida.
   Sem JavaScript, todos os caminhos aparecem abertos, um embaixo do outro.
   O endereço com #cam-negativa (ou outro caminho) abre o caminho certo.
   Sem :has(): a situação aberta recebe a classe .sit--aberta.
   ===================================================================== */
(function () {
  'use strict';
  var doc = document;
  var B = window.Borelli || {};
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || doc).querySelectorAll(sel)); }
  var midia = B.midia || function (q) { return window.matchMedia(q); };
  var aoMudar = B.aoMudar || function (m, fn) { if (m.addEventListener) m.addEventListener('change', fn); };
  var foca = B.foca || function (el) { if (el) el.focus(); };

  $$('[data-situacao]').forEach(function (raiz) {
    var btns = $$('.sit-btn', raiz);
    if (!btns.length) return;
    var computador = midia('(min-width: 1025px)');
    var padrao = btns.filter(function (b) { return b.getAttribute('aria-expanded') === 'true'; })[0] || btns[0];
    var regiao = function (b) { return doc.getElementById(b.getAttribute('aria-controls')); };
    var define = function (b, aberto) {
      b.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      if (b.parentNode) b.parentNode.classList.toggle('sit--aberta', aberto);
      var r = regiao(b);
      if (r) r.hidden = !aberto;
    };
    var abertos = function () { return btns.filter(function (b) { return b.getAttribute('aria-expanded') === 'true'; }); };
    var so = function (b) { btns.forEach(function (o) { define(o, o === b); }); };
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        var aberto = b.getAttribute('aria-expanded') === 'true';
        if (computador.matches) { if (!aberto) so(b); return; }
        if (aberto) { define(b, false); return; }
        so(b);
        if (B.garanteVisivel) B.garanteVisivel(b);
      });
      b.addEventListener('keydown', function (e) {
        var alvo = null;
        if (e.key === 'ArrowDown') alvo = btns[(i + 1) % btns.length];
        else if (e.key === 'ArrowUp') alvo = btns[(i - 1 + btns.length) % btns.length];
        else if (e.key === 'Home') alvo = btns[0];
        else if (e.key === 'End') alvo = btns[btns.length - 1];
        if (alvo) { e.preventDefault(); foca(alvo); }
      });
    });
    var arruma = function () {
      var a = abertos();
      if (computador.matches && a.length !== 1) so(a[0] || padrao);
    };
    var pedido = window.location.hash ? btns.filter(function (b) { return '#' + b.getAttribute('aria-controls') === window.location.hash; })[0] : null;
    if (pedido) so(pedido);
    else if (computador.matches) so(padrao);
    else btns.forEach(function (b) { define(b, false); });
    aoMudar(computador, arruma);
    raiz.classList.add('situacao-pronta');
  });
})();
