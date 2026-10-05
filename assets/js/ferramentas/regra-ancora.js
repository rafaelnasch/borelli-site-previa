/* =====================================================================
   BORELLI ADVOCACIA · ferramentas/regra-ancora.js
   Regras numeradas da parte 02 abertas pelo link.
   No celular (até 640 px), o site.js recolhe as regras da parte 02 e deixa só a primeira aberta.
   Quando um link da própria página leva a uma regra fechada ("Situações de que esta página trata",
   "Veja na parte 02"), este módulo abre a regra antes da rolagem, para a pessoa chegar ao texto e
   não só ao título. Vale também para o endereço que já chega com a âncora.
   Sem JavaScript, ou no computador, as regras já estão abertas e nada muda.
   Entra pela ficha "scripts" das páginas /atuacao/medicamentos-de-alto-custo/ e /atuacao/bariatrica/.
   ===================================================================== */
(function () {
  'use strict';

  var abre = function (id) {
    if (!id) return null;
    var alvo;
    try { alvo = document.getElementById(decodeURIComponent(id)); } catch (e) { return null; }
    if (!alvo || !alvo.closest) return null;
    var li = alvo.closest('li.regra');
    if (!li) return null;
    var botao = li.querySelector('.regra-botao');
    if (!botao || botao.getAttribute('aria-expanded') !== 'false') return null;
    botao.click();
    return alvo;
  };

  var doHash = function () { abre(location.hash.slice(1)); };

  /* clique num link interno: abre antes de o navegador rolar até a âncora */
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a[href^="#"]') : null;
    if (a) abre(a.getAttribute('href').slice(1));
  });
  window.addEventListener('hashchange', doHash);

  /* endereço que já chega com a âncora: espera o site.js ligar os botões */
  var inicio = function () {
    setTimeout(function () {
      var aberto = abre(location.hash.slice(1));
      if (aberto && aberto.scrollIntoView) aberto.scrollIntoView();
    }, 0);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicio);
  else inicio();
})();
