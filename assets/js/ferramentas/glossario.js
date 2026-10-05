/* =====================================================================
   BORELLI ADVOCACIA · ferramentas/glossario.js · busca instantânea no glossário
   do processo, sem acento e sem maiúscula. Parte: src/partes/ferramenta-glossario.html.
   Dados: /assets/data/glossario.json (bloco G do dossiê guia-glossario-do-processo.md),
   um objeto por termo: { termo, explicacao, categoria }; o "Para você:" dentro da
   explicação sai em destaque. Primeiro os termos cujo nome tem a palavra, depois os
   que a têm na explicação; mostra até 8. Esc apaga a busca e volta aos quatro termos
   de partida. Nada do que a pessoa digita sai do navegador.
   ===================================================================== */
(function () {
  'use strict';
  var doc = document;
  var B = window.Borelli || {};
  function $(sel, raiz) { return (raiz || doc).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || doc).querySelectorAll(sel)); }
  var semAcento = B.semAcento || function (t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  /* realça o trecho buscado sem perder os acentos do original (NFD e NFC têm o mesmo número de
     letras-base; a busca compara o texto sem acento e corta o original nas mesmas posições) */
  function marca(texto, busca) {
    if (!busca) return esc(texto);
    var base = '', mapa = [];
    for (var i = 0; i < texto.length; i++) {
      var b = semAcento(texto.charAt(i));
      for (var k = 0; k < b.length; k++) { base += b.charAt(k); mapa.push(i); }
    }
    var p = base.indexOf(busca);
    if (p < 0) return esc(texto);
    var ini = mapa[p], fim = mapa[p + busca.length - 1] + 1;
    return esc(texto.slice(0, ini)) + '<mark>' + esc(texto.slice(ini, fim)) + '</mark>' + esc(texto.slice(fim));
  }
  var PARA_VOCE = /\s*Para você:\s*/;

  $$('[data-glossario]').forEach(function (raiz) {
    var campo = $('[data-glossario-campo]', raiz);
    var lista = $('[data-glossario-lista]', raiz);
    var status = $('[data-glossario-status]', raiz);
    if (!campo || !lista) return;
    var inicial = lista.innerHTML, inicialStatus = status ? status.textContent : '';
    var termos = null;
    var termo = function (t, busca) {
      var partes = String(t.explicacao || '').split(PARA_VOCE);
      return '<div class="gl-termo"><dt>' + marca(t.termo, busca) + '</dt><dd><p>' + esc(partes[0]) + '</p>' +
        (partes[1] ? '<p class="gl-voce"><b>Para você:</b> ' + esc(partes.slice(1).join(' ')) + '</p>' : '') +
        '<p class="gl-cat">' + esc(t.categoria || '') + '</p></dd></div>';
    };
    var diz = function (t) { if (status) { if (B.anunciar) B.anunciar(status, t); else status.textContent = t; } };
    var filtra = function () {
      if (!termos) return;
      var b = semAcento(campo.value.trim()).replace(/\s+/g, ' ');
      if (b.length < 2) { lista.innerHTML = inicial; if (status) status.textContent = inicialStatus; return; }
      var porNome = termos.filter(function (t) { return semAcento(t.termo).indexOf(b) >= 0; });
      var porTexto = termos.filter(function (t) { return porNome.indexOf(t) < 0 && semAcento(t.explicacao).indexOf(b) >= 0; });
      var achados = porNome.concat(porTexto);
      lista.innerHTML = achados.slice(0, 8).map(function (t) { return termo(t, b); }).join('');
      var total = achados.length;
      diz(!total ? 'Nenhum termo com essa palavra. Tente outra, como "liminar" ou "juntada".'
        : total === 1 ? '1 termo encontrado.'
        : total > 8 ? total + ' termos encontrados. Aparecem os 8 primeiros; continue digitando para filtrar.'
        : total + ' termos encontrados.');
    };
    var espera = 0;
    campo.addEventListener('input', function () { clearTimeout(espera); espera = setTimeout(filtra, 120); });
    campo.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && campo.value) { e.preventDefault(); campo.value = ''; filtra(); }
    });
    fetch(raiz.getAttribute('data-fonte') || '/borelli-site-previa/assets/data/glossario.json', { credentials: 'same-origin' })
      .then(function (r) { if (!r.ok) throw new Error('glossario ' + r.status); return r.json(); })
      .then(function (d) { termos = Array.isArray(d) ? d : []; if (campo.value) filtra(); })
      .catch(function () { if (status) status.textContent = 'A busca não carregou agora. Os termos estão neste guia.'; });
    raiz.classList.add('ferr-pronta');
  });
})();
