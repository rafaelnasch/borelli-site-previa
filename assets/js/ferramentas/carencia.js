/* =====================================================================
   BORELLI ADVOCACIA · ferramentas/carencia.js · as carências máximas da
   Lei 9.656/1998 (art. 12, V) e o limite de 24 meses da cobertura parcial
   temporária (art. 11; RN 558/2022). Parte: src/partes/ferramenta-carencia.html.
   Dados: /assets/data/carencia.json (bloco G do dossiê
   guia-carencia-e-doenca-preexistente.md), com as regras de cálculo dele:
   dias corridos (data final = início + prazo; a carência termina ao fim desse
   dia), horas a partir do início (sem a hora exata, o dia seguinte) e meses no
   dia de igual número do mês final, ou no dia seguinte se ele não existir
   (Código Civil, art. 132). Sem descontar fins de semana nem feriados.
   A data é texto com máscara dd/mm/aaaa. Nada do que a pessoa digita sai daqui.
   ===================================================================== */
(function () {
  'use strict';
  var doc = document;
  var B = window.Borelli || {};
  function $(sel, raiz) { return (raiz || doc).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || doc).querySelectorAll(sel)); }
  function dois(n) { return (n < 10 ? '0' : '') + n; }
  var fmt = null;
  try { fmt = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { fmt = null; }
  /* data por extenso, com o ordinal do primeiro dia do mês ("1º de novembro"), como no resto do site */
  function escreve(dt) { return fmt ? fmt.format(dt).replace(/(^|\s)1 de /, '$11\u00ba de ') : dois(dt.getDate()) + '/' + dois(dt.getMonth() + 1) + '/' + dt.getFullYear(); }
  function somaDias(dt, n) { var d = new Date(dt.getTime()); d.setDate(d.getDate() + n); return d; }
  function somaMeses(dt, n) {
    var alvoMes = dt.getMonth() + n;
    var d = new Date(dt.getFullYear(), alvoMes, dt.getDate(), 12);
    /* o dia não existe no mês final (31/01 + 1 mês): vale o dia seguinte, o primeiro do mês depois */
    if (d.getMonth() !== ((alvoMes % 12) + 12) % 12) d = new Date(dt.getFullYear(), alvoMes + 1, 1, 12);
    return d;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  $$('[data-carencia]').forEach(function (raiz) {
    var campo = $('[data-carencia-data]', raiz);
    var ajuda = $('[data-carencia-ajuda]', raiz);
    var lista = $('[data-carencia-lista]', raiz);
    var vazio = $('[data-carencia-vazio]', raiz);
    var form = $('[data-carencia-form]', raiz);
    if (!campo || !lista) return;
    var dados = null;
    var ajudaPadrao = ajuda ? ajuda.innerHTML : '';
    var linha = function (nome, prazo, quando, base, obs) {
      return '<li class="carencia-item"><p class="carencia-tipo">' + esc(nome) + '</p>' +
        '<p class="carencia-prazo"><span class="carencia-num">' + esc(prazo) + '</span><span class="carencia-quando">' + quando + '</span></p>' +
        '<p class="carencia-base">' + esc(base) + '</p>' + (obs ? '<p class="carencia-obs">' + esc(obs) + '</p>' : '') + '</li>';
    };
    var calcula = function () {
      if (!dados) return;
      var v = campo.value;
      var dt = v.length === 10 && B.lerData ? B.lerData(v) : null;
      var invalida = v.length === 10 && !dt;
      if (ajuda) {
        if (invalida) { ajuda.textContent = 'Confira a data: use dia, mês e ano, como 05/10/2026.'; ajuda.classList.add('erro'); }
        else { ajuda.innerHTML = ajudaPadrao; ajuda.classList.remove('erro'); }
      }
      if (invalida) campo.setAttribute('aria-invalid', 'true'); else campo.removeAttribute('aria-invalid');
      if (!dt) { lista.hidden = true; lista.innerHTML = ''; if (vazio) vazio.hidden = false; return; }
      var h = '';
      (dados.carencias || []).forEach(function (c) {
        var quando;
        if (c.unidade === 'horas') quando = 'a partir de <b>' + esc(escreve(somaDias(dt, 1))) + '</b> (sem a hora exata do início, o dia seguinte)';
        else quando = 'termina ao fim de <b>' + esc(escreve(somaDias(dt, c.prazo))) + '</b>';
        h += linha(c.tipo, c.prazo + ' ' + c.unidade, quando, c.base_legal, c.observacao);
      });
      var cpt = dados.cobertura_parcial_temporaria;
      if (cpt) h += linha(cpt.tipo, cpt.prazo_maximo + ' ' + cpt.unidade + ', no máximo', 'termina em <b>' + esc(escreve(somaMeses(dt, cpt.prazo_maximo))) + '</b>', cpt.base_legal, cpt.observacao);
      lista.innerHTML = h;
      lista.hidden = false;
      if (vazio) vazio.hidden = true;
    };
    if (B.ligaMascaraData) B.ligaMascaraData(campo, calcula);
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); calcula(); });
    fetch(raiz.getAttribute('data-fonte') || '/borelli-site-previa/assets/data/carencia.json', { credentials: 'same-origin' })
      .then(function (r) { if (!r.ok) throw new Error('carencia ' + r.status); return r.json(); })
      .then(function (d) { dados = d; calcula(); })
      .catch(function () { if (vazio) vazio.textContent = 'A conta não carregou agora. Os prazos da lei estão descritos neste guia.'; });
    raiz.classList.add('ferr-pronta');
  });
})();
