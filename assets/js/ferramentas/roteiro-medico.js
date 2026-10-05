/* Roteiro para a conversa com o médico (BRIEF, seção 7, ferramenta 4), no guia do relatório médico.
   A lista usa o componente de documentos do site.js ([data-documentos]): marcar, guardar só no navegador,
   imprimir e copiar. Como os itens são pontos da conversa, e não documentos, este módulo só troca a palavra
   do contador ("0 de 8 documentos marcados" vira "0 de 8 itens marcados"). Sem JavaScript, a lista aparece
   inteira, com o contador já escrito em itens. */
(function () {
  'use strict';
  if (!window.MutationObserver) return;
  var raizes = document.querySelectorAll('[data-roteiro]');
  Array.prototype.forEach.call(raizes, function (raiz) {
    var contagem = raiz.querySelector('[data-documentos-contagem]');
    if (!contagem) return;
    var troca = function () {
      var t = contagem.textContent;
      var n = t.replace('documentos marcados', 'itens marcados').replace('documento marcado', 'item marcado');
      if (n !== t) contagem.textContent = n;
    };
    troca();
    new MutationObserver(troca).observe(contagem, { childList: true, characterData: true, subtree: true });
  });
})();
