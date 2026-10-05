/* =====================================================================
   BORELLI ADVOCACIA · protótipo B · PERCURSO · app.js
   JavaScript puro, sem dependências. As formas da casa vêm de
   /assets/js/bforms.js (carregado antes, com defer).
   Módulos, cada um só roda se a página tiver o bloco:
     1. cabeçalho fixo que encolhe ao rolar
     2. painel Atuação (computador)
     3. menu do celular (diálogo com foco preso, Esc fecha)
     4. seletor "Onde você está agora?"
     5. carta de negativa anotada
     6. prazos máximos da ANS (RN 566/2022 e RN 623/2024)
     7. glossário do processo
     8. índice "Nesta página" (página de área)
     9. pílulas dos procedimentos (página de área)
    10. lista de documentos: marca, guarda no navegador, imprime, copia
    11. perguntas abertas pelo endereço (#pergunta)
   Nada do que a pessoa escolhe ou digita sai do navegador.
   ===================================================================== */
(function () {
  'use strict';

  var doc = document;
  var html = doc.documentElement;

  function $(sel, raiz) { return (raiz || doc).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || doc).querySelectorAll(sel)); }
  function mq(q) {
    if (window.matchMedia) return window.matchMedia(q);
    return { matches: false, addEventListener: function () {}, addListener: function () {} };
  }
  function aoMudar(m, fn) {
    if (m.addEventListener) m.addEventListener('change', fn);
    else if (m.addListener) m.addListener(fn);
  }
  var poucoMovimento = mq('(prefers-reduced-motion: reduce)');
  function rolagem() { return poucoMovimento.matches ? 'auto' : 'smooth'; }
  function espera(fn, ms) {
    var t = 0;
    return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }
  /* altura do cabeçalho fixo, para não esconder o que acabou de abrir */
  function alturaCab() {
    var cab = $('[data-cab]');
    return cab ? cab.getBoundingClientRect().height : 0;
  }
  function garanteVisivel(el, folga) {
    if (!el) return;
    var r = el.getBoundingClientRect();
    var topo = alturaCab() + (folga || 16);
    var extra = $('.nesta-movel');
    if (extra && extra.offsetParent !== null) topo += extra.getBoundingClientRect().height;
    if (r.top < topo) {
      window.scrollBy({ top: r.top - topo, behavior: rolagem() });
    } else if (r.bottom > window.innerHeight - 16) {
      var desce = Math.min(r.bottom - window.innerHeight + 24, r.top - topo);
      if (desce > 0) window.scrollBy({ top: desce, behavior: rolagem() });
    }
  }
  function foca(el) {
    if (!el) return;
    try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
  }

  /* ---------- 1. Cabeçalho fixo: 96 px, 72 px depois de rolar ---------- */
  function cabecalho() {
    if (!$('[data-cab]')) return;
    var ultimo = null, pedido = false;
    function mede() {
      pedido = false;
      var rolou = (window.pageYOffset || html.scrollTop) > 24;
      if (rolou !== ultimo) { html.classList.toggle('rolou', rolou); ultimo = rolou; }
    }
    window.addEventListener('scroll', function () {
      if (!pedido) { pedido = true; window.requestAnimationFrame(mede); }
    }, { passive: true });
    mede();
  }

  /* ---------- 2. Painel Atuação (computador) ---------- */
  function painelAtuacao() {
    var btn = $('.nav-atuacao');
    if (!btn) return;
    var painel = doc.getElementById(btn.getAttribute('aria-controls'));
    var item = btn.closest('li');
    if (!painel || !item) return;
    function aberto() { return !painel.hidden; }
    function abre(focarPrimeiro) {
      painel.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      html.classList.add('painel-aberto');
      if (focarPrimeiro) foca($('a', painel));
    }
    function fecha(voltar) {
      if (!aberto()) return;
      painel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      html.classList.remove('painel-aberto');
      if (voltar) foca(btn);
    }
    btn.addEventListener('click', function () { if (aberto()) fecha(false); else abre(false); });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); abre(true); }
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && aberto()) { e.preventDefault(); fecha(item.contains(doc.activeElement)); }
    });
    doc.addEventListener('click', function (e) { if (aberto() && !item.contains(e.target)) fecha(false); });
    item.addEventListener('focusout', function (e) {
      if (e.relatedTarget && !item.contains(e.relatedTarget)) fecha(false);
    });
    painel.addEventListener('click', function (e) { if (e.target.closest('a')) fecha(false); });
    var estreito = mq('(max-width: 1180px)');
    aoMudar(estreito, function () { if (estreito.matches) fecha(false); });
  }

  /* ---------- 3. Menu do celular ---------- */
  function menuMovel() {
    var abrir = $('.site-menu');
    if (!abrir) return;
    var menu = doc.getElementById(abrir.getAttribute('aria-controls'));
    if (!menu) return;
    var fechar = $('.menu-fechar', menu);
    var fora = $$('body > header, body > main, body > footer, body > .pular');
    var antes = null;
    function focaveis() {
      return $$('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', menu)
        .filter(function (el) { return el.getClientRects().length > 0; });
    }
    function abre() {
      antes = doc.activeElement;
      menu.hidden = false;
      menu.scrollTop = 0;
      abrir.setAttribute('aria-expanded', 'true');
      html.classList.add('menu-aberto');
      fora.forEach(function (el) { el.setAttribute('inert', ''); });
      foca(fechar || focaveis()[0]);
    }
    function fecha(voltar) {
      if (menu.hidden) return;
      menu.hidden = true;
      abrir.setAttribute('aria-expanded', 'false');
      html.classList.remove('menu-aberto');
      fora.forEach(function (el) { el.removeAttribute('inert'); });
      if (voltar !== false) foca(antes && doc.contains(antes) && antes !== doc.body ? antes : abrir);
    }
    abrir.addEventListener('click', abre);
    if (fechar) fechar.addEventListener('click', function () { fecha(); });
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); fecha(); return; }
      if (e.key !== 'Tab') return;
      var lista = focaveis();
      if (!lista.length) return;
      var primeiro = lista[0], ultimo = lista[lista.length - 1];
      if (e.shiftKey && (doc.activeElement === primeiro || !menu.contains(doc.activeElement))) { e.preventDefault(); foca(ultimo); }
      else if (!e.shiftKey && doc.activeElement === ultimo) { e.preventDefault(); foca(primeiro); }
    });
    /* um link para outra parte desta página fecha o menu antes de rolar */
    menu.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a) return;
      var alvo = a.getAttribute('href');
      if (alvo.charAt(0) === '#') fecha(false);
    });
    /* Atuação dentro do menu: abre as áreas no lugar */
    $$('.mm-atuacao-btn', menu).forEach(function (b) {
      var areas = doc.getElementById(b.getAttribute('aria-controls'));
      if (!areas) return;
      b.addEventListener('click', function () {
        var vai = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', vai ? 'true' : 'false');
        areas.hidden = !vai;
      });
    });
    var largo = mq('(min-width: 1181px)');
    aoMudar(largo, function () { if (largo.matches) fecha(false); });
  }

  /* ---------- 4. Seletor "Onde você está agora?" ----------
     No computador, um caminho sempre aberto ao lado do trilho (como abas).
     No celular, o caminho abre logo abaixo da situação escolhida (como sanfona). */
  function seletor() {
    var raiz = $('[data-seletor]');
    if (!raiz) return;
    var btns = $$('.sit-btn', raiz);
    if (!btns.length) return;
    var computador = mq('(min-width: 1025px)');
    var padrao = btns.filter(function (b) { return b.getAttribute('aria-expanded') === 'true'; })[0] || btns[0];
    function regiao(b) { return doc.getElementById(b.getAttribute('aria-controls')); }
    function define(b, aberto) {
      b.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      var r = regiao(b);
      if (r) r.hidden = !aberto;
    }
    function abertos() { return btns.filter(function (b) { return b.getAttribute('aria-expanded') === 'true'; }); }
    function so(b) { btns.forEach(function (o) { define(o, o === b); }); }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        var aberto = b.getAttribute('aria-expanded') === 'true';
        if (computador.matches) {
          if (!aberto) so(b);
          return;
        }
        if (aberto) { define(b, false); return; }
        so(b);
        garanteVisivel(b, 8);
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
    function arruma() {
      var a = abertos();
      if (computador.matches && a.length !== 1) so(a[0] || padrao);
    }
    /* endereço com #cam-... abre o caminho certo (links de outras páginas) */
    var pedido = location.hash ? btns.filter(function (b) { return '#' + b.getAttribute('aria-controls') === location.hash; })[0] : null;
    if (pedido) so(pedido);
    else if (computador.matches) so(padrao);
    else btns.forEach(function (b) { define(b, false); });
    aoMudar(computador, arruma);
    html.classList.add('sel-pronto');
  }

  /* ---------- 5. Carta de negativa anotada ---------- */
  function carta() {
    var raiz = $('[data-carta]');
    if (!raiz) return;
    var grifos = $$('.grifo-btn', raiz);
    var notas = grifos.map(function (g) { return doc.getElementById(g.getAttribute('aria-controls')); });
    if (!grifos.length || notas.some(function (n) { return !n; })) return;
    var dica = $('[data-carta-dica]', raiz);
    var status = $('[data-carta-status]');
    var atual = -1;
    function titulo(n) { return $('.nota-t', n); }
    function fio(i) {
      var g = grifos[i], n = notas[i];
      var r = g.getClientRects()[0] || g.getBoundingClientRect();
      var rn = n.getBoundingClientRect();
      var y = r.top + r.height / 2 - rn.top;
      y = Math.max(20, Math.min(y, rn.height - 24));
      n.style.setProperty('--fio-y', Math.round(y) + 'px');
    }
    function diz(txt) { if (status) status.textContent = txt; }
    function abre(i, focar) {
      if (i < 0 || i >= notas.length) return;
      notas.forEach(function (n, k) {
        var este = k === i;
        n.hidden = !este;
        grifos[k].setAttribute('aria-expanded', este ? 'true' : 'false');
      });
      atual = i;
      if (dica) dica.hidden = true;
      raiz.classList.add('tem-nota');
      fio(i);
      diz('Nota ' + (i + 1) + ' de ' + notas.length + ': ' + titulo(notas[i]).textContent + '.');
      if (focar) {
        foca(titulo(notas[i]));
        garanteVisivel(notas[i]);
      }
    }
    function fecha(voltar) {
      if (atual < 0) return;
      var i = atual;
      notas[i].hidden = true;
      grifos[i].setAttribute('aria-expanded', 'false');
      atual = -1;
      if (dica) dica.hidden = false;
      raiz.classList.remove('tem-nota');
      diz('Nota fechada.');
      if (voltar) foca(grifos[i]);
    }
    /* o grifo é um span com papel de botão (assim ele quebra linha como o texto da carta):
       Enter e Espaço funcionam como num botão */
    grifos.forEach(function (g, i) {
      g.addEventListener('click', function () { if (atual === i) fecha(true); else abre(i, true); });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); g.click(); }
      });
    });
    notas.forEach(function (n, i) {
      var f = $('.nota-fechar', n), a = $('.nota-ant', n), p = $('.nota-prox', n);
      if (f) f.addEventListener('click', function () { fecha(true); });
      if (a) a.addEventListener('click', function () { abre(i - 1, true); });
      if (p) p.addEventListener('click', function () { abre(i + 1, true); });
    });
    raiz.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && atual >= 0) { e.preventDefault(); fecha(true); }
    });
    var comecar = $('[data-carta-comecar]', raiz);
    if (comecar) comecar.addEventListener('click', function () { abre(0, true); });
    window.addEventListener('resize', espera(function () { if (atual >= 0) fio(atual); }, 120));
  }

  /* ---------- 6. Prazos máximos da ANS ----------
     Atendimento: RN 566/2022, art. 3º (o dia do pedido conta, segundo a FAQ da ANS, item 18).
     Resposta ao pedido de autorização: RN 623/2024, art. 12 (conta a partir do dia útil
     seguinte ao pedido; se o prazo de atendimento for menor, vale o menor, § 1º).
     Dias úteis: sem sábados, domingos e feriados nacionais. Feriados locais podem mudar a conta. */
  var PRAZOS = {
    'consulta-basica': { d: 7, inc: 'I', o: 'a consulta básica', r: 5 },
    'consulta-outras': { d: 14, inc: 'II', o: 'a consulta com médico das demais especialidades', r: 5 },
    'sessao': { d: 10, inc: 'III a VII', o: 'a consulta ou sessão com esse profissional', r: 5 },
    'dentista': { d: 7, inc: 'IX', o: 'a consulta ou o procedimento com o dentista', r: 5 },
    'laboratorio': { d: 3, inc: 'X', o: 'o exame de laboratório', r: 5 },
    'exames': { d: 10, inc: 'XI', o: 'o exame ou a terapia', r: 5 },
    'hospital-dia': { d: 10, inc: 'XIV', o: 'o atendimento em hospital-dia', r: 5 },
    'quimio-oral': { d: 10, inc: 'XV', o: 'a entrega do remédio oral contra o câncer', r: 5 },
    'alta': { d: 21, inc: 'XII', o: 'o procedimento de alta complexidade', r: 10 },
    'internacao': { d: 21, inc: 'XIII', o: 'a internação eletiva', r: 10 },
    'urgencia': { imediato: true, inc: 'XVII', o: 'o atendimento de urgência e emergência' }
  };
  var FERIADOS = ['01-01', '04-21', '05-01', '09-07', '10-12', '11-02', '11-15', '11-20', '12-25'];
  function doisDig(n) { return (n < 10 ? '0' : '') + n; }
  function util(dt) {
    var s = dt.getDay();
    if (s === 0 || s === 6) return false;
    return FERIADOS.indexOf(doisDig(dt.getMonth() + 1) + '-' + doisDig(dt.getDate())) < 0;
  }
  function soma(dt, dias) { var n = new Date(dt.getTime()); n.setDate(n.getDate() + dias); return n; }
  /* o n-ésimo dia útil, contando o próprio dia de início quando ele é útil */
  function enesimoUtil(inicio, n) {
    var dt = new Date(inicio.getTime()), conta = 0, guarda = 0;
    while (guarda++ < 400) {
      if (util(dt)) { conta++; if (conta === n) return dt; }
      dt = soma(dt, 1);
    }
    return dt;
  }
  function lerData(v) {
    if (!v) return null;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v) || null, a, me, d;
    if (m) { a = +m[1]; me = +m[2]; d = +m[3]; }
    else {
      m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(v.trim());
      if (!m) return null;
      d = +m[1]; me = +m[2]; a = +m[3];
    }
    var dt = new Date(a, me - 1, d, 12);
    if (dt.getMonth() !== me - 1 || a < 2000 || a > 2100) return null;
    return dt;
  }
  var fmtData = null;
  try { fmtData = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { fmtData = null; }
  function escreve(dt) {
    if (fmtData) return fmtData.format(dt);
    return doisDig(dt.getDate()) + '/' + doisDig(dt.getMonth() + 1) + '/' + dt.getFullYear();
  }
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var SEMANA = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
  function chave(dt) { return dt.getFullYear() * 10000 + (dt.getMonth() + 1) * 100 + dt.getDate(); }
  function feriado(dt) { return FERIADOS.indexOf(doisDig(dt.getMonth() + 1) + '-' + doisDig(dt.getDate())) >= 0; }
  function hoje() { var h = new Date(); return new Date(h.getFullYear(), h.getMonth(), h.getDate(), 12); }
  function iso(dt) { return dt.getFullYear() + '-' + doisDig(dt.getMonth() + 1) + '-' + doisDig(dt.getDate()); }
  /* o calendário de dias úteis: semanas de segunda a domingo, do pedido à data-limite */
  function calendario(d0, resposta, limite) {
    var ini = soma(d0, -((d0.getDay() + 6) % 7));
    var fim = soma(limite, 6 - ((limite.getDay() + 6) % 7));
    var k0 = chave(d0), kr = chave(resposta), kl = chave(limite);
    var h = '<p class="cal-cab">Calendário do prazo</p><div class="cal-sem">' +
      SEMANA.map(function (s) { return '<span>' + s + '</span>'; }).join('') + '</div><div class="cal-grade">';
    var guarda = 0;
    for (var dt = ini; chave(dt) <= chave(fim) && guarda++ < 120; dt = soma(dt, 1)) {
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
    return h + '</div><p class="cal-nota">Em branco, sábados, domingos e feriados nacionais. O losango marca o feriado.</p>';
  }
  function prazos() {
    var form = $('[data-prazos]');
    if (!form) return;
    var tipo = $('select', form), data = $('input[type="date"], input[name="data"]', form);
    var num = $('[data-prazos-num]'), oQue = $('[data-prazos-o-que]'), norma = $('[data-prazos-norma]');
    var resp = $('[data-prazos-resposta]'), lista = $('[data-prazos-data]'), cal = $('[data-prazos-cal]');
    if (!tipo || !num) return;
    /* a conta começa hoje; a pessoa troca pela data do protocolo */
    if (data && !data.value) data.value = iso(hoje());
    function item(classe, rotulo, dt) {
      return '<li><span class="cal-amostra ' + classe + '" aria-hidden="true"></span><span>' + rotulo + ' <b>' + escreve(dt) + '</b></span></li>';
    }
    function calcula() {
      var p = PRAZOS[tipo.value];
      if (!p) return;
      if (p.imediato) {
        num.className = 'kpi-num kpi-num--palavra';
        num.textContent = 'Imediato';
        oQue.textContent = 'Urgência e emergência não esperam contagem de dias.';
        norma.textContent = 'RN ANS 566/2022, art. 3º, XVII';
        resp.textContent = 'Resposta ao pedido: imediata (RN ANS 623/2024, art. 12, I). Na urgência e na emergência, a carência não passa de 24 horas (Lei 9.656/1998, art. 12, V, c).';
        if (lista) lista.hidden = true;
        if (cal) { cal.hidden = true; cal.innerHTML = ''; }
        return;
      }
      var r = Math.min(p.r, p.d);
      num.className = 'kpi-num';
      num.innerHTML = p.d + '<span class="un">dias úteis</span>';
      oQue.textContent = 'Prazo máximo para ' + p.o + ' acontecer, contado do pedido.';
      norma.textContent = 'RN ANS 566/2022, art. 3º, ' + p.inc;
      resp.textContent = 'Quando o plano exige autorização, a resposta ao pedido vem em até ' + r + ' dias úteis' +
        (r < p.r ? ', porque o prazo de atendimento é menor (RN ANS 623/2024, art. 12, § 1º).' :
          ' (RN ANS 623/2024, art. 12, II, ' + (p.r === 10 ? 'b' : 'a') + ').');
      var dt = data ? lerData(data.value) : null;
      if (!dt) {
        if (lista) { lista.hidden = true; lista.innerHTML = ''; }
        if (cal) { cal.hidden = true; cal.innerHTML = ''; }
        return;
      }
      var limite = enesimoUtil(dt, p.d);
      var resposta = enesimoUtil(soma(dt, 1), r);
      if (lista) {
        lista.innerHTML = item('cal-pedido', 'Pedido:', dt) + item('cal-resposta', 'Resposta até', resposta) + item('cal-limite', 'Atendimento até', limite);
        lista.hidden = false;
      }
      if (cal) { cal.innerHTML = calendario(dt, resposta, limite); cal.hidden = false; }
    }
    tipo.addEventListener('change', calcula);
    if (data) { data.addEventListener('change', calcula); data.addEventListener('input', calcula); }
    calcula();
  }

  /* ---------- 7. Glossário do processo ---------- */
  var GLOSSARIO = [["Concluso","O processo foi entregue ao juiz para ele se manifestar (CPC, art. 228). Ainda não há decisão.","Em regra, o próximo passo é do juiz. Se surgir um fato novo, como um novo relatório médico, avise o advogado responsável."],["Concluso para decisão","O processo está com o juiz para ele decidir uma questão, como um pedido de liminar. Também aparecem “concluso para despacho” (uma ordem de andamento) e “concluso para sentença” (a decisão que encerra a primeira fase).","O registro diz o tipo de manifestação esperada do juiz. Não diz qual será a decisão."],["Decurso de prazo","Registro automático de que um prazo terminou, também escrito como “decorrido prazo”. Pode ser o prazo de qualquer uma das partes, inclusive da operadora, ou um prazo em que não havia nada obrigatório a fazer.","Sozinho, o registro não quer dizer que alguém perdeu um prazo. Leia de quem era o prazo: o nome costuma vir no próprio registro. Na dúvida, pergunte ao advogado responsável."],["Juntada","Um documento foi anexado ao processo: uma petição, um laudo, um comprovante (CPC, art. 203, § 4º).","O que importa é o documento juntado, não o registro da juntada."],["Liminar","Decisão provisória que pode ser dada no começo do processo, às vezes antes de ouvir a outra parte, quando há urgência (CPC, art. 9º, parágrafo único, I, e art. 300, § 2º). Pode ser mantida, modificada ou revogada (art. 296).","Vale enquanto o processo segue. Não é a decisão final."],["Intimação","Aviso oficial de um ato do processo, para alguém saber ou fazer alguma coisa (CPC, art. 269). Na maior parte das vezes é dirigida ao advogado, pelo Diário de Justiça Eletrônico Nacional ou pelo sistema do processo.","Muitas intimações abrem prazo para o advogado e não pedem nada de você. Quando a intimação é para você, pessoalmente, ela chega por meio eletrônico, pelo correio ou por oficial de justiça."],["Citação","O ato que chama o réu para fazer parte do processo e apresentar a defesa (CPC, art. 238). É feita de preferência por meio eletrônico (art. 246). Em regra, as empresas são obrigadas a manter cadastro no Domicílio Judicial Eletrônico, do Conselho Nacional de Justiça, e a citação eletrônica é feita por ele (Resolução CNJ 455/2022, arts. 16 e 18). Se a empresa não confirmar o recebimento em 3 dias úteis, a citação é feita por outro meio, como o correio ou o oficial de justiça (CPC, art. 246, § 1º-A).","Nos processos contra o plano, é a operadora sendo chamada oficialmente. O prazo da defesa começa em datas que a lei define: em geral, a partir da audiência de conciliação, do pedido do réu para cancelá-la ou, nos demais casos, da data ligada à forma da citação (CPC, arts. 231 e 335)."],["Contestação","A defesa do réu, nos processos de saúde em geral a operadora, apresentada em 15 dias úteis (CPC, arts. 335 e 219).","É comum a contestação discordar de todos os pedidos. Ela é a versão da outra parte, não uma decisão."],["Réplica","A resposta do autor à contestação, em 15 dias úteis, quando a defesa traz fatos novos ou questões processuais (CPC, arts. 350 e 351).","É o seu advogado rebatendo a defesa da outra parte. Em geral não depende de você, salvo se faltar algum documento."],["Perícia","Exame feito por um profissional nomeado pelo juiz, o perito, para responder a perguntas técnicas (CPC, arts. 464 e 465). Nos processos de saúde, em geral um médico. As partes podem indicar um assistente técnico e apresentar perguntas, os quesitos, em 15 dias (art. 465, § 1º).","Se a perícia incluir um exame seu, leve na data marcada os exames, os relatórios e os documentos médicos."],["Laudo pericial","O relatório escrito do perito, com as respostas às perguntas do processo (CPC, art. 473). As partes têm 15 dias para se manifestar sobre ele (art. 477, § 1º). O juiz não fica preso às conclusões, mas precisa explicar por que as aceitou ou não (art. 479).","O laudo é uma prova importante. Ele não é a sentença."],["Despacho","Uma ordem do juiz para o processo andar, como “cite-se” ou “intime-se” (CPC, art. 203, § 3º). Não decide o pedido.","Em geral, só leva o processo para a próxima etapa."],["Deferido","O juiz aceitou o pedido. “Deferido em parte” quer dizer que aceitou uma parte dele.","O que importa é saber o que foi aceito e qual é o próximo passo, como a operadora ser intimada para cumprir."],["Indeferido","O juiz não aceitou o pedido, naquele momento.","Um pedido indeferido, como uma liminar, não encerra o processo. Em regra ele segue, e a decisão pode ser revista em recurso."],["Sentença","A decisão do juiz que encerra a primeira fase do processo (CPC, art. 203, § 1º).","Pode caber recurso. Se a sentença confirma, concede ou revoga uma liminar, em regra ela produz efeitos logo depois de publicada, mesmo com apelação. O tribunal pode suspender esses efeitos a pedido de quem recorreu (art. 1.012, § 1º, V, e §§ 3º e 4º)."],["Trânsito em julgado","Não cabe mais nenhum recurso: a decisão ficou definitiva (CPC, art. 502). A decisão de mérito só pode ser desfeita em hipóteses excepcionais, por ação rescisória, em regra em até 2 anos (arts. 966 e 975).","Costuma aparecer como “certidão de trânsito em julgado”. Depois dele, o que foi decidido pode ser exigido em caráter definitivo, na fase de cumprimento de sentença."],["Tutela de urgência","Decisão provisória pedida quando há urgência. O juiz a concede quando há elementos que mostram a probabilidade do direito e o perigo de dano ou o risco ao resultado do processo (CPC, art. 300). Ele pode exigir uma caução, uma garantia (como depósito, bem ou fiança) que cubra eventual prejuízo da outra parte, e pode dispensá-la de quem não tem condições de oferecê-la (art. 300, § 1º).","“Tutela de urgência”, “tutela antecipada” e “liminar” aparecem muitas vezes juntas. As três são decisões provisórias."],["Agravo de instrumento","Recurso ao tribunal contra certas decisões tomadas no meio do processo, como a que concede ou nega uma liminar (CPC, art. 1.015, I). O prazo é de 15 dias úteis (art. 1.003, § 5º).","Se a operadora recorrer de uma liminar, o tribunal reexamina a decisão provisória, e o processo continua na vara. Ao receber o agravo, o relator pode suspender a liminar ou conceder o que foi negado, até o julgamento do recurso (CPC, art. 1.019, I)."],["Apelação","Recurso contra a sentença, julgado pelo tribunal, com prazo de 15 dias úteis (CPC, arts. 1.009 e 1.003, § 5º). Em regra, suspende os efeitos da sentença (art. 1.012).","Há exceções. A sentença que confirma, concede ou revoga uma liminar produz efeitos desde a publicação, salvo se o tribunal suspender esses efeitos a pedido de quem recorreu (art. 1.012, § 1º, V, e §§ 3º e 4º)."],["Embargos de declaração","Pedido ao próprio juiz ou tribunal para esclarecer uma decisão obscura ou contraditória, suprir uma omissão ou corrigir um erro material (CPC, art. 1.022). O prazo é de 5 dias úteis (art. 1.023).","Eles interrompem o prazo dos outros recursos, que recomeça do zero depois do julgamento dos embargos (art. 1.026)."],["Sobrestado","O processo está suspenso, à espera de outra coisa: por exemplo, do julgamento de um tema repetitivo no Superior Tribunal de Justiça ou no Supremo Tribunal Federal sobre a mesma questão (CPC, art. 1.037, II), ou do resultado de outro processo (art. 313, V).","O processo volta a andar quando o motivo da suspensão termina."],["Arquivado","O processo foi guardado no sistema e não tem mais andamento. “Arquivado definitivamente” costuma indicar que ele terminou. “Arquivado provisoriamente” indica que está parado à espera de alguma coisa e pode voltar a andar.","Veja qual das duas formas aparece. Se ainda havia algo pendente no seu processo, pergunte ao advogado responsável o motivo do arquivamento."],["Ato ordinatório","Registro feito pelo servidor da vara, sem precisar do juiz, para o processo andar: juntar um documento ou abrir prazo para uma das partes se manifestar, a chamada “vista” (CPC, arts. 152, VI, e 203, § 4º).","É rotina e não é decisão do juiz. Às vezes abre um prazo, que em geral é do advogado."],["Remessa","Os autos, o conjunto dos documentos do processo, foram enviados de um setor ou órgão para outro: da vara para o tribunal depois de um recurso, para a contadoria fazer cálculos, para o Ministério Público dar parecer.","É um deslocamento do processo, não uma decisão."],["Prazo em dias úteis","Os prazos processuais contados em dias consideram só os dias úteis (CPC, art. 219; nos Juizados, Lei 9.099/1995, art. 12-A). De 20 de dezembro a 20 de janeiro, esses prazos ficam suspensos (CPC, art. 220), mas os juízes seguem trabalhando e pedidos urgentes continuam a ser analisados (arts. 220, § 1º, e 214, II).","Um prazo de 15 dias costuma levar três semanas ou mais no calendário."],["Segredo de justiça","Só as partes e seus advogados consultam o processo e pedem certidões (CPC, art. 189, § 1º). A lei já prevê o segredo nos processos de família, como divórcio, alimentos e guarda (art. 189, II), e também nos processos em que há dados protegidos pela intimidade (art. 189, III), o que pode incluir informações de saúde.","Nos processos de saúde, é o juiz quem verifica se é o caso de segredo."],["Alvará","Ordem do juiz que autoriza retirar um valor depositado em conta judicial, também chamada de mandado de levantamento. Pode ser substituída por transferência eletrônica para a conta indicada (CPC, art. 906, parágrafo único).","Valor depositado em juízo só é liberado com ordem do juiz. Mensagem que promete liberar valor do seu processo mediante pagamento é sinal do golpe do falso advogado. Antes de responder, confirme pelos canais oficiais do escritório que cuida do seu processo ou consulte o processo no site do tribunal."],["Audiência de conciliação","Encontro, presencial ou por vídeo, para as partes tentarem um acordo com a ajuda de um conciliador (CPC, art. 334, § 7º). Ela não acontece se as duas partes disserem expressamente que não querem acordo (art. 334, § 4º, I).","Se for marcada, confirme com o seu advogado se você precisa participar e de que forma. Faltar sem justificativa pode gerar multa de até 2% do valor da causa ou do valor pedido no processo (art. 334, § 8º). No Juizado Especial Cível, a falta do autor a qualquer audiência encerra o processo sem julgar o pedido, e ele só pode ficar isento das custas se provar que a falta decorreu de força maior (Lei 9.099/1995, art. 51, I e § 2º)."],["Mandado","Ordem escrita do juiz cumprida por um oficial de justiça, como o mandado para intimar a operadora a cumprir uma liminar.","“Mandado expedido” quer dizer que a ordem foi emitida. “Juntada de mandado cumprido” quer dizer que ela foi entregue, e alguns prazos começam a contar dessa data (CPC, art. 231, II)."]];
  function semAcento(s) {
    return String(s).toLowerCase().normalize ? String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : String(s).toLowerCase();
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function marca(texto, busca) {
    if (!busca) return esc(texto);
    var base = semAcento(texto), i = base.indexOf(busca);
    if (i < 0) return esc(texto);
    return esc(texto.slice(0, i)) + '<mark>' + esc(texto.slice(i, i + busca.length)) + '</mark>' + esc(texto.slice(i + busca.length));
  }
  function glossario() {
    var campo = $('#gl-busca'), lista = $('[data-gl-lista]'), status = $('[data-gl-status]');
    if (!campo || !lista) return;
    var inicial = lista.innerHTML, inicialStatus = status ? status.textContent : '';
    function termo(t, busca) {
      return '<div class="gl-termo"><dt>' + marca(t[0], busca) + '</dt><dd><p>' + esc(t[1]) + '</p>' +
        (t[2] ? '<p class="gl-voce"><b>Para você:</b> ' + esc(t[2]) + '</p>' : '') + '</dd></div>';
    }
    function filtra() {
      var b = semAcento(campo.value.trim());
      if (b.length < 2) { lista.innerHTML = inicial; if (status) status.textContent = inicialStatus; return; }
      var porNome = GLOSSARIO.filter(function (t) { return semAcento(t[0]).indexOf(b) >= 0; });
      var porTexto = GLOSSARIO.filter(function (t) { return porNome.indexOf(t) < 0 && semAcento(t[1] + ' ' + t[2]).indexOf(b) >= 0; });
      var achados = porNome.concat(porTexto).slice(0, 6);
      lista.innerHTML = achados.map(function (t) { return termo(t, b); }).join('');
      if (status) {
        var total = porNome.length + porTexto.length;
        status.textContent = !total ? 'Nenhum termo com essa palavra neste resumo. O glossário completo tem 60 termos.'
          : total === 1 ? '1 termo encontrado.'
          : total > 6 ? total + ' termos encontrados. Mostrando os 6 primeiros.'
          : total + ' termos encontrados.';
      }
    }
    campo.addEventListener('input', espera(filtra, 120));
    campo.addEventListener('keydown', function (e) { if (e.key === 'Escape' && campo.value) { campo.value = ''; filtra(); } });
  }

  /* ---------- 8. Índice "Nesta página": a parte atual, o que já passou e o progresso ---------- */
  function indice() {
    var listas = $$('.nesta-lista');
    if (!listas.length) return;
    var ids = [];
    $$('a[href^="#"]', listas[0]).forEach(function (a) { ids.push(a.getAttribute('href').slice(1)); });
    var secoes = ids.map(function (id) { return doc.getElementById(id); }).filter(Boolean);
    if (!secoes.length) return;
    var movel = $('.nesta-movel'), atualTxt = movel ? $('.nesta-atual', movel) : null;
    var corpo = $('.tema') || doc.body;
    var ultimo = -2, pedido = false;
    function nome(i) {
      var a = $('a[href="#' + ids[i] + '"] .nesta-nome', listas[0]);
      return a ? a.textContent : '';
    }
    function mede() {
      pedido = false;
      var linha = alturaCab() + window.innerHeight * 0.28;
      var idx = -1;
      secoes.forEach(function (s, i) { if (s.getBoundingClientRect().top <= linha) idx = i; });
      if ((window.innerHeight + (window.pageYOffset || html.scrollTop)) >= html.scrollHeight - 4) idx = secoes.length - 1;
      if (idx !== ultimo) {
        ultimo = idx;
        listas.forEach(function (l) {
          $$('li', l).forEach(function (li, i) {
            li.classList.toggle('atual', i === idx);
            li.classList.toggle('passou', i < idx);
            var a = $('a', li);
            if (a) { if (i === idx) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); }
          });
        });
        if (atualTxt) atualTxt.textContent = idx >= 0 ? nome(idx) : 'O que é';
      }
      if (movel) {
        var r = corpo.getBoundingClientRect();
        var p = (linha - r.top) / Math.max(1, r.height);
        movel.style.setProperty('--progresso', Math.max(0, Math.min(1, p)).toFixed(3));
      }
    }
    window.addEventListener('scroll', function () { if (!pedido) { pedido = true; window.requestAnimationFrame(mede); } }, { passive: true });
    window.addEventListener('resize', espera(mede, 120));
    if (movel) {
      movel.addEventListener('click', function (e) { if (e.target.closest('a[href^="#"]')) movel.open = false; });
      doc.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && movel.open) { movel.open = false; foca($('summary', movel)); }
      });
      doc.addEventListener('click', function (e) { if (movel.open && !movel.contains(e.target)) movel.open = false; });
    }
    mede();
  }

  /* ---------- 9. Pílulas dos procedimentos: tocar mostra o que cada cirurgia é ---------- */
  function procedimentos() {
    var btns = $$('.proc[data-def]');
    var def = $('[data-proc-def]');
    if (!btns.length || !def) return;
    var original = def.innerHTML;
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var ativo = b.getAttribute('aria-pressed') === 'true';
        btns.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        if (ativo) { def.innerHTML = original; return; }
        b.setAttribute('aria-pressed', 'true');
        def.innerHTML = '<b>' + esc(b.textContent) + ':</b> ' + esc(b.getAttribute('data-def'));
      });
    });
  }

  /* ---------- 10. Lista de documentos ---------- */
  function documentos() {
    var raiz = $('[data-docs]');
    if (!raiz) return;
    var chave = 'borelli-docs:' + raiz.getAttribute('data-docs');
    var caixas = $$('input[type="checkbox"]', raiz);
    var conta = $('[data-docs-conta]', raiz), msg = $('[data-docs-msg]', raiz);
    var guarda = $('[data-docs-guarda]', raiz);
    var podeGuardar = true;
    function le() {
      try { var v = window.localStorage.getItem(chave); return v ? JSON.parse(v) : []; }
      catch (e) { podeGuardar = false; return []; }
    }
    function grava() {
      try {
        window.localStorage.setItem(chave, JSON.stringify(caixas.filter(function (c) { return c.checked; }).map(function (c) { return c.value; })));
        return true;
      } catch (e) { podeGuardar = false; return false; }
    }
    function diz(t) { if (msg) msg.textContent = t; }
    function atualiza() {
      var n = caixas.filter(function (c) { return c.checked; }).length;
      if (conta) conta.textContent = n;
      raiz.classList.toggle('docs-completa', n === caixas.length);
    }
    var salvos = le();
    if (Array.isArray(salvos)) caixas.forEach(function (c) { c.checked = salvos.indexOf(c.value) >= 0; });
    atualiza();
    if (!podeGuardar && guarda) guarda.textContent = 'Este navegador não deixa guardar a lista. Ela vale só enquanto a página estiver aberta.';
    caixas.forEach(function (c) {
      c.addEventListener('change', function () {
        atualiza();
        var ok = grava();
        var n = caixas.filter(function (x) { return x.checked; }).length;
        diz(n + ' de ' + caixas.length + ' reunidos.' + (ok ? ' A lista ficou guardada neste navegador.' : ''));
      });
    });
    function texto() {
      var titulo = raiz.getAttribute('data-docs-titulo') || 'Documentos';
      var linhas = [titulo, ''];
      $$('[data-docs-grupo]', raiz).forEach(function (g) {
        linhas.push(g.getAttribute('data-docs-grupo'));
        $$('input[type="checkbox"]', g).forEach(function (c) {
          var t = $('.doc-txt', c.closest('.doc'));
          linhas.push((c.checked ? '[x] ' : '[ ] ') + (t ? t.textContent.replace(/\s+/g, ' ').trim() : c.value));
        });
        linhas.push('');
      });
      linhas.push('Não envie documentos de saúde pelo formulário do site.');
      linhas.push('Borelli Advocacia · Caico Borelli Sociedade Individual de Advocacia');
      return linhas.join('\n');
    }
    var limpar = $('[data-docs-limpar]', raiz);
    if (limpar) limpar.addEventListener('click', function () {
      caixas.forEach(function (c) { c.checked = false; });
      atualiza();
      grava();
      diz('Lista limpa.');
    });
    var copiar = $('[data-docs-copiar]', raiz);
    if (copiar) copiar.addEventListener('click', function () {
      var t = texto();
      function reserva() {
        var area = doc.createElement('textarea');
        area.value = t;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed'; area.style.top = '0'; area.style.left = '0'; area.style.opacity = '0';
        doc.body.appendChild(area);
        area.select();
        var ok = false;
        try { ok = doc.execCommand('copy'); } catch (e) { ok = false; }
        doc.body.removeChild(area);
        diz(ok ? 'Lista copiada. Cole onde quiser guardar.' : 'Não foi possível copiar. Use o botão Imprimir.');
        foca(copiar);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(t).then(function () { diz('Lista copiada. Cole onde quiser guardar.'); }, reserva);
      } else reserva();
    });
    var imprimir = $('[data-docs-imprimir]', raiz), folha = $('.impressao');
    function montaFolha() {
      if (!folha) return;
      var partes = ['<p class="imp-marca">Borelli Advocacia</p>', '<h1>' + esc(raiz.getAttribute('data-docs-titulo') || 'Documentos') + '</h1>',
        '<p class="imp-sub">Lista para reunir, por escrito. Marque o que já tem.</p>'];
      $$('[data-docs-grupo]', raiz).forEach(function (g) {
        partes.push('<h2>' + esc(g.getAttribute('data-docs-grupo')) + '</h2><ol>');
        $$('input[type="checkbox"]', g).forEach(function (c) {
          var t = $('.doc-txt', c.closest('.doc'));
          partes.push('<li class="' + (c.checked ? 'tem' : '') + '"><span class="caixa"></span><span>' + esc(t ? t.textContent.replace(/\s+/g, ' ').trim() : c.value) + '</span></li>');
        });
        partes.push('</ol>');
      });
      partes.push('<p class="imp-nota">Sigilo: não envie documentos, fotos ou detalhes do seu caso pelo formulário do site.</p>');
      partes.push('<p class="imp-id">Caico Borelli Sociedade Individual de Advocacia · Registro OAB/CE [nº] · Responsável: Caico Borelli · OAB/CE 24.895</p>');
      partes.push('<p class="imp-aviso">Conteúdo informativo. Não constitui promessa de resultado, prazo ou valor. Cada caso é analisado individualmente.</p>');
      folha.innerHTML = partes.join('');
    }
    function fimImpressao() { html.classList.remove('imprime-docs'); }
    window.addEventListener('afterprint', fimImpressao);
    if (imprimir) imprimir.addEventListener('click', function () {
      montaFolha();
      html.classList.add('imprime-docs');
      diz('Abrindo a impressão da lista.');
      window.setTimeout(function () {
        try { window.print(); } catch (e) { /* sem impressão disponível */ }
        window.setTimeout(fimImpressao, 1000);
      }, 30);
    });
  }

  /* ---------- 11. Pergunta aberta pelo endereço (#faq-...) ---------- */
  function perguntaDoEndereco() {
    function abre() {
      if (!location.hash) return;
      var alvo = null;
      try { alvo = doc.querySelector(location.hash); } catch (e) { alvo = null; }
      if (alvo && alvo.tagName === 'DETAILS') {
        alvo.open = true;
        window.setTimeout(function () { garanteVisivel(alvo); foca($('summary', alvo)); }, 60);
      }
    }
    window.addEventListener('hashchange', abre);
    doc.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#faq-"]');
      if (!a) return;
      var alvo = doc.getElementById(a.getAttribute('href').slice(1));
      if (alvo && alvo.tagName === 'DETAILS') alvo.open = true;
    });
    abre();
  }

  function inicia() {
    cabecalho();
    painelAtuacao();
    menuMovel();
    seletor();
    carta();
    prazos();
    glossario();
    indice();
    procedimentos();
    documentos();
    perguntaDoEndereco();
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', inicia);
  else inicia();
})();
