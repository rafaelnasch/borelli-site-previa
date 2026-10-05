/* =====================================================================
   BORELLI ADVOCACIA · ferramentas/prazos.js · prazos máximos de atendimento
   (RN 566/2022, art. 3º) e de resposta ao pedido (RN 623/2024, art. 12), com o
   calendário de dias úteis do protótipo B. Parte: src/partes/ferramenta-prazos.html.
   Dados: /assets/data/prazos.json (bloco G do dossiê guia-prazos-maximos-ans.md).
   Contagem (FAQ da ANS, item 18): no prazo de atendimento o dia do pedido conta;
   na resposta ao pedido, a conta começa no dia útil seguinte. Se o prazo de
   atendimento for menor que o de resposta, vale o menor (RN 623/2024, art. 12,
   § 1º). Dias úteis: sem sábados, domingos e os nove feriados nacionais fixos de
   lei federal; feriados locais podem mudar a conta (o aviso fixo diz isso).
   A data é texto com máscara dd/mm/aaaa. Nada do que a pessoa escolhe sai daqui.
   ===================================================================== */
(function () {
  'use strict';
  var doc = document;
  var B = window.Borelli || {};
  function $(sel, raiz) { return (raiz || doc).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || doc).querySelectorAll(sel)); }
  function dois(n) { return (n < 10 ? '0' : '') + n; }

  /* Resposta ao pedido (RN 623/2024, art. 12): imediata na urgência e na emergência (I); até 10 dias
     úteis para procedimento de alta complexidade e internação eletiva (II, b); até 5 nos demais (II, a) */
  var RESPOSTA = { 'urgencia-emergencia': 0, 'alta-complexidade': 10, 'internacao-eletiva': 10 };
  var FERIADOS = ['01-01', '04-21', '05-01', '09-07', '10-12', '11-02', '11-15', '11-20', '12-25'];
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var SEMANA = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
  var fmt = null;
  try { fmt = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { fmt = null; }
  /* data por extenso, com o ordinal do primeiro dia do mês ("1º de novembro"), como no resto do site */
  function escreve(dt) { return fmt ? fmt.format(dt).replace(/(^|\s)1 de /, '$11\u00ba de ') : dois(dt.getDate()) + '/' + dois(dt.getMonth() + 1) + '/' + dt.getFullYear(); }
  function feriado(dt) { return FERIADOS.indexOf(dois(dt.getMonth() + 1) + '-' + dois(dt.getDate())) >= 0; }
  function util(dt) { var s = dt.getDay(); return s !== 0 && s !== 6 && !feriado(dt); }
  function soma(dt, dias) { var n = new Date(dt.getTime()); n.setDate(n.getDate() + dias); return n; }
  function chave(dt) { return dt.getFullYear() * 10000 + (dt.getMonth() + 1) * 100 + dt.getDate(); }
  /* o n-ésimo dia útil, contando o próprio dia de início quando ele é útil */
  function enesimoUtil(inicio, n) {
    var dt = new Date(inicio.getTime()), conta = 0, guarda = 0;
    while (guarda++ < 500) {
      if (util(dt)) { conta++; if (conta === n) return dt; }
      dt = soma(dt, 1);
    }
    return dt;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  /* o calendário: semanas de segunda a domingo, do pedido à data-limite */
  function calendario(d0, resposta, limite) {
    var ini = soma(d0, -((d0.getDay() + 6) % 7));
    var fim = soma(limite, 6 - ((limite.getDay() + 6) % 7));
    var k0 = chave(d0), kr = resposta ? chave(resposta) : -1, kl = chave(limite);
    var h = '<p class="cal-cab">Calendário do prazo</p><div class="cal-sem">' +
      SEMANA.map(function (s) { return '<span>' + s + '</span>'; }).join('') + '</div><div class="cal-grade">';
    var guarda = 0;
    for (var dt = ini; chave(dt) <= chave(fim) && guarda++ < 140; dt = soma(dt, 1)) {
      var k = chave(dt), cls = 'cal-dia';
      if (k < k0 || k > kl) cls += ' cal-fora';
      else if (util(dt)) cls += ' cal-util';
      else cls += ' cal-livre';
      if (feriado(dt)) cls += ' cal-feriado';
      if (k === k0) cls += ' cal-pedido';
      if (k === kr) cls += ' cal-resposta';
      if (k === kl) cls += ' cal-limite';
      var mes = (dt.getDate() === 1 || k === chave(ini)) ? '<small>' + MESES[dt.getMonth()] + '</small>' : '';
      h += '<span class="' + cls + '">' + dt.getDate() + mes + '</span>';
    }
    return h + '</div><p class="cal-nota">Em branco, sábados, domingos e feriados nacionais. O losango embaixo do dia marca o feriado.</p>';
  }

  $$('[data-prazos]').forEach(function (raiz) {
    var tipo = $('[data-prazos-tipo]', raiz);
    var data = $('[data-prazos-data]', raiz);
    var ajuda = $('[data-prazos-ajuda]', raiz);
    var num = $('[data-prazos-num]', raiz), oQue = $('[data-prazos-o-que]', raiz), norma = $('[data-prazos-norma]', raiz);
    var obs = $('[data-prazos-obs]', raiz), resp = $('[data-prazos-resposta]', raiz);
    var datas = $('[data-prazos-datas]', raiz), cal = $('[data-prazos-cal]', raiz), res = $('[data-prazos-res]', raiz);
    var form = $('[data-prazos-form]', raiz);
    if (!tipo || !num) return;
    var ajudaPadrao = ajuda ? ajuda.textContent : '';
    var itens = {};
    var item = function (classe, rotulo, dt) {
      return '<li><span class="cal-amostra ' + classe + '" aria-hidden="true"></span><span>' + esc(rotulo) + ' <b>' + esc(escreve(dt)) + '</b></span></li>';
    };
    var limpaData = function () {
      if (datas) { datas.hidden = true; datas.innerHTML = ''; }
      if (cal) { cal.hidden = true; cal.innerHTML = ''; }
      if (res) res.classList.remove('com-calendario');
    };
    var calcula = function () {
      var p = itens[tipo.value];
      if (!p) return;
      var ref = p.referencia || '';
      oQue.textContent = p.rotulo;
      if (obs) { obs.hidden = !p.observacao; obs.textContent = p.observacao || ''; }
      var dt = null;
      if (data && data.value) {
        dt = B.lerData ? B.lerData(data.value) : null;
        var invalida = !dt && data.value.length >= 10;
        if (ajuda) {
          ajuda.textContent = invalida ? 'Confira a data: use dia, mês e ano, como 05/10/2026.' : ajudaPadrao;
          ajuda.classList.toggle('erro', invalida);
        }
        if (invalida) data.setAttribute('aria-invalid', 'true'); else data.removeAttribute('aria-invalid');
      } else {
        if (ajuda) { ajuda.textContent = ajudaPadrao; ajuda.classList.remove('erro'); }
        if (data) data.removeAttribute('aria-invalid');
      }
      if (p.imediato) {
        num.className = 'kpi-num kpi-num--palavra';
        num.textContent = 'Imediato';
        norma.textContent = ref;
        resp.textContent = 'Resposta ao pedido de autorização: imediata (RN 623/2024, art. 12, I).';
        limpaData();
        return;
      }
      if (p.teto_dias_corridos) {
        num.className = 'kpi-num';
        num.innerHTML = p.teto_dias_corridos + '<span class="un">dias corridos, no máximo</span>';
        norma.textContent = ref;
        resp.textContent = 'Vale o prazo do atendimento (consulta, procedimento ou internação), sem passar de 30 dias corridos do pedido.';
        limpaData();
        if (dt && datas) {
          datas.innerHTML = item('cal-pedido', 'Pedido:', dt) + item('cal-limite', 'Até, no máximo:', soma(dt, p.teto_dias_corridos));
          datas.hidden = false;
        }
        return;
      }
      var r = RESPOSTA.hasOwnProperty(p.id) ? RESPOSTA[p.id] : 5;
      var menor = p.prazo_dias_uteis < r;
      var rr = menor ? p.prazo_dias_uteis : r;
      num.className = 'kpi-num';
      num.innerHTML = p.prazo_dias_uteis + '<span class="un">dias úteis</span>';
      norma.textContent = 'Prazo máximo para o atendimento acontecer, contado do pedido · ' + ref;
      resp.textContent = 'Quando o plano precisa autorizar, a resposta ao pedido tem prazo de até ' + rr + ' dias úteis, contados do dia útil seguinte ao pedido' +
        (menor ? ', porque o prazo de atendimento é menor (RN 623/2024, art. 12, § 1º).' : ' (RN 623/2024, art. 12, II, ' + (r === 10 ? 'b' : 'a') + ').');
      if (!dt) { limpaData(); return; }
      var limite = enesimoUtil(dt, p.prazo_dias_uteis);
      var resposta = enesimoUtil(soma(dt, 1), rr);
      if (datas) {
        datas.innerHTML = item('cal-pedido', 'Pedido:', dt) + item('cal-resposta', 'Resposta até', resposta) +
          item('cal-limite', 'Atendimento até', limite);
        datas.hidden = false;
      }
      if (cal) { cal.innerHTML = calendario(dt, resposta, limite); cal.hidden = false; }
      if (res) res.classList.add('com-calendario');
    };
    var carregar = function () {
      var fonte = raiz.getAttribute('data-fonte') || '/borelli-site-previa/assets/data/prazos.json';
      return fetch(fonte, { credentials: 'same-origin' }).then(function (r) {
        if (!r.ok) throw new Error('prazos ' + r.status);
        return r.json();
      }).then(function (d) {
        (d.itens || []).forEach(function (it) { itens[it.id] = it; });
        calcula();
      }).catch(function () {
        if (resp) resp.textContent = 'A conta não carregou agora. Os prazos estão na tabela deste guia.';
      });
    };
    tipo.addEventListener('change', calcula);
    if (data && B.ligaMascaraData) B.ligaMascaraData(data, calcula);
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); calcula(); });
    raiz.classList.add('ferr-pronta');
    carregar();
  });
})();
