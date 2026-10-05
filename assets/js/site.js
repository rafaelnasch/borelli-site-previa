/* =====================================================================
   BORELLI ADVOCACIA · site.js · os comportamentos comuns do site
   JavaScript puro, sem dependências, carregado com defer em todas as páginas.
   Cada módulo só liga se a página tiver o elemento (atributos data-*), então as
   partes (src/partes/) e as páginas escolhem o que usam. As ferramentas ficam em
   módulos próprios (assets/js/ferramentas/*.js), carregados só onde são usadas.

    1. Cabeçalho fixo que encolhe ao rolar e publica a altura em --cab-h
    2. Menu Atuação no computador (painel com os três grupos; Esc e clique fora fecham)
    3. Menu do celular (foco preso, Esc fecha, aria-label "Fechar o menu", resto inerte)
    4. Busca em todo o site (botão do cabeçalho e tecla "/"; lê /busca.json)
    5. Aviso de cookies (só com site.json medicao.ativa = true) e eventos neutros
    6. Formulário de contato (assunto e origem do endereço, máscara, validação que
       ensina, envio a /api/contato/ e, se falhar, a reserva na tela, com o foco nela:
       o WhatsApp como botão de um toque, com a mensagem neutra, e o e-mail)
    7. Sanfona: a pergunta do endereço (#faq-...) abre sozinha
    8. Índice "Nesta página": a parte atual destacada, a barra recolhível no celular
    9. Lista de documentos: marca, guarda no navegador, imprime e copia
   10. Pílulas dos procedimentos (o que cada cirurgia é)
   11. Regras numeradas da parte 02: recolhíveis no celular (a primeira aberta)
   12. Lista de guias: filtro por tema
   13. Modelo de mensagem: botão "Copiar texto"
   14. window.borelliAtualiza(raiz) e window.Borelli (utilitários para as ferramentas)

   Nada aqui manda dado para terceiros. A medição só existe depois da escolha
   "Aceitar medição", e os eventos têm nomes neutros (contato_enviado,
   whatsapp_clicado, guia_lido): o tema da página nunca entra.
   ===================================================================== */
(function () {
  'use strict';

  var doc = document;
  var html = doc.documentElement;
  html.classList.add('js');

  function $(sel, raiz) { return (raiz || doc).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || doc).querySelectorAll(sel)); }
  function semAcento(t) {
    return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }
  function ler(chave) { try { return window.localStorage.getItem(chave); } catch (e) { return null; } }
  function guardar(chave, valor) { try { window.localStorage.setItem(chave, valor); return true; } catch (e) { return false; } }
  function adiar(fn, ms) {
    var t = null;
    return function () { var args = arguments, eu = this; clearTimeout(t); t = setTimeout(function () { fn.apply(eu, args); }, ms); };
  }
  function midia(q) {
    return window.matchMedia ? window.matchMedia(q) : { matches: false, addEventListener: function () {} };
  }
  function aoMudar(m, fn) {
    if (m.addEventListener) m.addEventListener('change', fn);
    else if (m.addListener) m.addListener(fn);
  }
  var poucoMovimento = midia('(prefers-reduced-motion: reduce)');
  /* Troca o texto de uma região aria-live (esvazia antes, para o leitor de tela anunciar de novo) */
  function anunciar(alvo, texto) {
    if (!alvo) return;
    clearTimeout(alvo.__anuncio);
    alvo.textContent = '';
    alvo.__anuncio = setTimeout(function () { alvo.textContent = texto; }, 30);
  }
  function foca(el) {
    if (!el) return;
    try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
  }
  function alturaTopo() {
    var t = $('[data-topo]');
    return t ? Math.max(0, t.getBoundingClientRect().bottom) : 0;
  }
  /* Rola até deixar o elemento visível abaixo do cabeçalho (e de uma barra presa, se houver) */
  function garanteVisivel(el, extraTopo) {
    if (!el) return;
    var r = el.getBoundingClientRect();
    var topo = alturaTopo() + 16 + (extraTopo || 0);
    var comportamento = poucoMovimento.matches || html.classList.contains('automatizado') ? 'auto' : 'smooth';
    if (r.top < topo) window.scrollBy({ top: r.top - topo, behavior: comportamento });
    else if (r.bottom > window.innerHeight - 16) {
      var desce = Math.min(r.bottom - window.innerHeight + 24, r.top - topo);
      if (desce > 0) window.scrollBy({ top: desce, behavior: comportamento });
    }
  }
  /* Data dd/mm/aaaa: máscara enquanto digita e leitura segura (as ferramentas usam) */
  function mascaraData(v) {
    var d = String(v || '').replace(/\D/g, '').slice(0, 8);
    if (d.length > 4) return d.slice(0, 2) + '/' + d.slice(2, 4) + '/' + d.slice(4);
    if (d.length > 2) return d.slice(0, 2) + '/' + d.slice(2);
    return d;
  }
  function lerData(v) {
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(v || '').trim());
    if (!m) return null;
    var d = +m[1], me = +m[2], a = +m[3];
    var dt = new Date(a, me - 1, d, 12);
    if (dt.getMonth() !== me - 1 || dt.getDate() !== d || a < 1990 || a > 2100) return null;
    return dt;
  }
  function ligaMascaraData(campo, aoMudarFn) {
    if (!campo) return;
    campo.addEventListener('input', function () {
      var pos = campo.selectionStart, antes = campo.value.length;
      campo.value = mascaraData(campo.value);
      if (pos === antes) campo.setSelectionRange(campo.value.length, campo.value.length);
      if (aoMudarFn) aoMudarFn();
    });
    campo.addEventListener('blur', function () { if (aoMudarFn) aoMudarFn(); });
  }

  /* ---------- 1. Cabeçalho fixo que encolhe ---------- */
  var topo = $('[data-topo]');
  function medirTopo() {
    if (topo) html.style.setProperty('--cab-h', Math.round(topo.getBoundingClientRect().height) + 'px');
  }
  if (topo) {
    var agendado = false;
    var aoRolar = function () {
      agendado = false;
      var encolher = (window.scrollY || window.pageYOffset) > 24;
      if (encolher !== topo.hasAttribute('data-encolhido')) {
        if (encolher) topo.setAttribute('data-encolhido', '');
        else topo.removeAttribute('data-encolhido');
        setTimeout(medirTopo, 180);   /* depois da transição de 150 ms */
      }
    };
    window.addEventListener('scroll', function () {
      if (!agendado) { agendado = true; window.requestAnimationFrame(aoRolar); }
    }, { passive: true });
    window.addEventListener('resize', adiar(medirTopo, 100));
    aoRolar();
    medirTopo();
  }

  /* ---------- 2. Menu Atuação no computador ----------
     Sem JavaScript, "Atuação" é o link para /atuacao/. Com ele, abre o painel no lugar
     (clique, Enter, Espaço ou seta para baixo); Esc, clique fora ou sair com o Tab fecham. */
  var gatilhoAtuacao = $('[data-atuacao-abrir]');
  var painelAtuacao = $('[data-atuacao-painel]');
  if (gatilhoAtuacao && painelAtuacao) {
    var itemAtuacao = gatilhoAtuacao.parentNode;
    gatilhoAtuacao.setAttribute('role', 'button');
    gatilhoAtuacao.setAttribute('aria-expanded', 'false');
    var painelAberto = function () { return !painelAtuacao.hidden; };
    var abrePainel = function (focarPrimeiro) {
      medirTopo();
      painelAtuacao.hidden = false;
      gatilhoAtuacao.setAttribute('aria-expanded', 'true');
      html.classList.add('painel-aberto');
      if (focarPrimeiro) foca($('a[href]', painelAtuacao));
    };
    var fechaPainel = function (voltar) {
      if (!painelAberto()) return;
      painelAtuacao.hidden = true;
      gatilhoAtuacao.setAttribute('aria-expanded', 'false');
      html.classList.remove('painel-aberto');
      if (voltar) foca(gatilhoAtuacao);
    };
    gatilhoAtuacao.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;   /* abrir em outra aba continua valendo */
      e.preventDefault();
      if (painelAberto()) fechaPainel(false); else abrePainel(false);
    });
    gatilhoAtuacao.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); if (painelAberto()) fechaPainel(false); else abrePainel(true); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); abrePainel(true); }
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && painelAberto()) { e.preventDefault(); fechaPainel(itemAtuacao.contains(doc.activeElement)); }
    });
    doc.addEventListener('click', function (e) { if (painelAberto() && !itemAtuacao.contains(e.target)) fechaPainel(false); });
    itemAtuacao.addEventListener('focusout', function (e) {
      if (e.relatedTarget && !itemAtuacao.contains(e.relatedTarget)) fechaPainel(false);
    });
    painelAtuacao.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a[href]')) fechaPainel(false); });
    aoMudar(midia('(max-width: 1024px)'), function (m) { if (m.matches) fechaPainel(false); });
  }

  /* ---------- 3. Menu do celular ---------- */
  var botaoMenu = $('[data-menu-abrir]');
  var menu = $('[data-menu-movel]');
  if (botaoMenu && menu) {
    var fundo = $$('body > main, body > footer, body > .pular');
    var focaveisMenu = function () {
      return [botaoMenu].concat($$('a[href], button:not([disabled])', menu).filter(function (el) { return el.getClientRects().length > 0; }));
    };
    var tecladoMenu = function (e) {
      if (e.key === 'Escape') { e.preventDefault(); fecharMenu(true); return; }
      if (e.key !== 'Tab') return;
      /* o foco circula entre o botão de fechar e os itens do menu */
      var lista = focaveisMenu();
      var i = lista.indexOf(doc.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); lista[lista.length - 1].focus(); }
      else if (!e.shiftKey && (i === lista.length - 1 || i === -1)) { e.preventDefault(); lista[0].focus(); }
    };
    var abrirMenu = function () {
      medirTopo();
      menu.hidden = false;
      menu.scrollTop = 0;
      botaoMenu.setAttribute('aria-expanded', 'true');
      botaoMenu.setAttribute('aria-label', 'Fechar o menu');
      html.classList.add('menu-aberto');
      fundo.forEach(function (el) { el.setAttribute('inert', ''); });
      doc.addEventListener('keydown', tecladoMenu);
      foca($('a[href], button', menu));
    };
    var fecharMenu = function (devolverFoco) {
      if (menu.hidden) return;
      menu.hidden = true;
      botaoMenu.setAttribute('aria-expanded', 'false');
      botaoMenu.setAttribute('aria-label', 'Abrir o menu');
      html.classList.remove('menu-aberto');
      fundo.forEach(function (el) { el.removeAttribute('inert'); });
      doc.removeEventListener('keydown', tecladoMenu);
      if (devolverFoco) botaoMenu.focus();
    };
    botaoMenu.addEventListener('click', function () {
      if (menu.hidden) abrirMenu(); else fecharMenu(false);
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest && (e.target.closest('a[href]') || e.target.closest('[data-busca-abrir]'))) fecharMenu(false);
    });
    /* "Atuação" dentro do menu abre as áreas no lugar; já vem aberto numa página de área */
    $$('[data-menu-sub]', menu).forEach(function (b) {
      var areas = doc.getElementById(b.getAttribute('aria-controls'));
      if (!areas) return;
      var marca = function (abre) { b.setAttribute('aria-expanded', abre ? 'true' : 'false'); areas.hidden = !abre; };
      if ($('[aria-current]', areas) || /^\/atuacao\//.test(window.location.pathname)) { b.classList.add('atual'); }
      b.addEventListener('click', function () { marca(b.getAttribute('aria-expanded') !== 'true'); });
    });
    aoMudar(midia('(min-width: 1025px)'), function (m) { if (m.matches) fecharMenu(false); });
  }

  /* ---------- 4. Busca ---------- */
  var dialogo = $('[data-busca]');
  if (dialogo && typeof dialogo.showModal === 'function') {
    var campoBusca = $('[data-busca-campo]', dialogo);
    var listaBusca = $('[data-busca-resultados]', dialogo);
    var situacaoBusca = $('[data-busca-situacao]', dialogo);
    var indiceBusca = null;
    var carregando = null;
    var focoAntes = null;

    var preparar = function (item) {
      return { item: item, t: semAcento(item.t), k: semAcento((item.k || []).join(' ')), h: semAcento((item.h || []).join(' ')), d: semAcento(item.d) };
    };
    var carregar = function () {
      if (indiceBusca) return Promise.resolve(indiceBusca);
      if (!carregando) {
        carregando = fetch('/borelli-site-previa/busca.json', { credentials: 'same-origin' })
          .then(function (r) { if (!r.ok) throw new Error('busca ' + r.status); return r.json(); })
          .then(function (dados) { indiceBusca = (Array.isArray(dados) ? dados : []).map(preparar); return indiceBusca; })
          .catch(function (e) { carregando = null; throw e; });
      }
      return carregando;
    };
    var itemBusca = function (href, rotulo, titulo, desc) {
      var li = doc.createElement('li');
      var a = doc.createElement('a');
      a.href = href;
      if (rotulo) { var r = doc.createElement('span'); r.className = 'rotulo'; r.textContent = rotulo; a.appendChild(r); }
      var t = doc.createElement('span'); t.className = 'busca-titulo'; t.textContent = titulo; a.appendChild(t);
      if (desc) { var d = doc.createElement('span'); d.className = 'busca-desc'; d.textContent = desc; a.appendChild(d); }
      li.appendChild(a);
      return li;
    };
    var buscar = function () {
      if (!indiceBusca) return;
      var q = semAcento(campoBusca.value).replace(/\s+/g, ' ').trim();
      listaBusca.textContent = '';
      if (q.length < 2) { anunciar(situacaoBusca, q ? 'Digite pelo menos duas letras.' : ''); return; }
      var termos = q.split(' ');
      var achados = [];
      indiceBusca.forEach(function (e) {
        var pontos = 0;
        for (var i = 0; i < termos.length; i++) {
          var t = termos[i];
          var p = (e.t.indexOf(t) > -1 ? 6 : 0) + (e.k.indexOf(t) > -1 ? 4 : 0) + (e.h.indexOf(t) > -1 ? 2 : 0) + (e.d.indexOf(t) > -1 ? 1 : 0);
          if (!p) return;   /* todas as palavras precisam aparecer */
          pontos += p;
        }
        achados.push({ e: e, p: pontos });
      });
      achados.sort(function (a, b) { return b.p - a.p || a.e.item.t.localeCompare(b.e.item.t, 'pt-BR'); });
      achados.slice(0, 10).forEach(function (a) { var it = a.e.item; listaBusca.appendChild(itemBusca(it.u, it.r, it.t, it.d)); });
      if (achados.length) {
        anunciar(situacaoBusca, achados.length === 1 ? '1 página encontrada.' : achados.length + ' páginas encontradas.');
      } else {
        anunciar(situacaoBusca, 'Nenhuma página encontrada. Tente outra palavra ou siga por um dos atalhos.');
        listaBusca.appendChild(itemBusca('/borelli-site-previa/guias/', 'Atalho', 'Todos os guias', ''));
        listaBusca.appendChild(itemBusca('/borelli-site-previa/atuacao/', 'Atalho', 'Atuação do escritório', ''));
      }
    };
    var abrirBusca = function () {
      if (dialogo.open) return;
      focoAntes = doc.activeElement;
      dialogo.showModal();
      campoBusca.focus();
      carregar().then(buscar).catch(function () { anunciar(situacaoBusca, 'A busca não carregou agora. Os guias estão em /guias/.'); });
    };
    $$('[data-busca-abrir]').forEach(function (b) { b.hidden = false; b.addEventListener('click', abrirBusca); });
    campoBusca.addEventListener('input', adiar(buscar, 120));
    campoBusca.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { var primeiro = $('a', listaBusca); if (primeiro) { e.preventDefault(); primeiro.focus(); } }
    });
    listaBusca.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      var links = $$('a', listaBusca);
      var i = links.indexOf(doc.activeElement);
      if (i < 0) return;
      e.preventDefault();
      if (e.key === 'ArrowDown' && i < links.length - 1) links[i + 1].focus();
      else if (e.key === 'ArrowUp') (i > 0 ? links[i - 1] : campoBusca).focus();
    });
    var fecharBusca = $('[data-busca-fechar]', dialogo);
    if (fecharBusca) fecharBusca.addEventListener('click', function () { dialogo.close(); });
    /* Esc fecha de primeira, mesmo com texto no campo */
    dialogo.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); dialogo.close(); } });
    dialogo.addEventListener('click', function (e) { if (e.target === dialogo) dialogo.close(); });
    /* ao fechar, o foco volta para quem abriu; se quem abriu sumiu (o botão "Buscar no site" do menu
       do celular, que fecha ao abrir a busca), volta para o botão do menu */
    dialogo.addEventListener('close', function () {
      var volta = (focoAntes && focoAntes.getClientRects && focoAntes.getClientRects().length) ? focoAntes : $('[data-menu-abrir]');
      if (volta && volta.focus) volta.focus();
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || dialogo.open) return;
      var alvo = e.target || {};
      var tag = (alvo.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || alvo.isContentEditable) return;
      e.preventDefault();
      abrirBusca();
    });
  }

  /* ---------- 5. Cookies e eventos neutros ---------- */
  var avisoCookies = $('[data-cookies]');
  var CHAVE_COOKIES = 'borelli-cookies';
  var medicaoLigada = !!(avisoCookies && avisoCookies.getAttribute('data-medicao') === 'true');
  var escolhaCookies = function () { var v = ler(CHAVE_COOKIES); return v === 'medicao' || v === 'necessarios' ? v : null; };
  var medicaoAceita = function () { return medicaoLigada && escolhaCookies() === 'medicao'; };
  var evento = function (nome) {
    /* só um aviso para quem for medir depois; nenhum dado sai daqui */
    if (!medicaoAceita()) return;
    doc.dispatchEvent(new CustomEvent('borelli:evento', { detail: { nome: String(nome) } }));
  };
  if (avisoCookies && medicaoLigada) {
    if (!escolhaCookies()) avisoCookies.hidden = false;
    $$('[data-cookies-escolha]', avisoCookies).forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-cookies-escolha') === 'medicao' ? 'medicao' : 'necessarios';
        guardar(CHAVE_COOKIES, v);
        avisoCookies.hidden = true;
        doc.dispatchEvent(new CustomEvent('borelli:medicao', { detail: { aceita: v === 'medicao' } }));
      });
    });
  }
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="https://wa.me/"]');
    if (a) evento('whatsapp_clicado');
  });
  var guiaLeitura = $('article.guia');
  if (guiaLeitura && medicaoLigada) {
    var lido = false;
    window.addEventListener('scroll', adiar(function () {
      if (lido) return;
      var r = guiaLeitura.getBoundingClientRect();
      if (r.height > 0 && (window.innerHeight - r.top) / r.height >= 0.6) { lido = true; evento('guia_lido'); }
    }, 200), { passive: true });
  }

  /* ---------- 6. Formulário de contato ---------- */
  /* DDDs válidos no Brasil (a função /api/contato confere a mesma lista) */
  var DDDS = ('11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 ' +
    '51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 ' +
    '91 92 93 94 95 96 97 98 99').split(' ');
  var digitosTelefone = function (v) {
    var d = String(v || '').replace(/\D/g, '');
    if (d.length >= 12 && d.indexOf('55') === 0) d = d.slice(2);
    return d;
  };
  var telefoneValido = function (v) {
    var d = digitosTelefone(v);
    if (d.length !== 10 && d.length !== 11) return false;
    if (DDDS.indexOf(d.slice(0, 2)) < 0) return false;
    return d.length === 11 ? d.charAt(2) === '9' : /[2-9]/.test(d.charAt(2));
  };
  var mascaraTelefone = function (v) {
    var d = digitosTelefone(v).slice(0, 11);
    if (!d) return '';
    if (d.length <= 2) return '(' + d;
    var ddd = '(' + d.slice(0, 2) + ') ';
    var n = d.slice(2);
    if (n.length <= 4) return ddd + n;
    var corte = n.length === 9 ? 5 : 4;
    return ddd + n.slice(0, corte) + '-' + n.slice(corte);
  };

  var montarFormulario = function (form) {
    form.noValidate = true;
    var botao = $('button[type="submit"]', form);
    var situacao = $('[data-contato-situacao]', form);
    var el = form.elements;

    /* Assunto e origem que vieram do botão "Fale com o escritório" (?assunto=...&origem=...). Sem assunto
       no endereço, vale o assunto do próprio formulário (data-assunto: a landing page de um tema já sabe
       o assunto geral); a pessoa pode trocar */
    var params = new URLSearchParams(window.location.search);
    var assuntoUrl = params.get('assunto');
    var assunto = assuntoUrl || form.getAttribute('data-assunto');
    var origem = params.get('origem');
    if (assunto && el.assunto) {
      Array.prototype.forEach.call(el.assunto.options, function (o) { if (o.value === assunto) el.assunto.value = assunto; });
    }
    if (origem && /^[a-z0-9-]{1,80}$/.test(origem) && el.pagina) el.pagina.value = origem;
    if ((assuntoUrl || origem) && window.history && window.history.replaceState) {
      /* o assunto e a origem saem do endereço: não ficam no histórico nem num link copiado */
      params.delete('assunto');
      params.delete('origem');
      var resto = params.toString();
      window.history.replaceState(null, '', window.location.pathname + (resto ? '?' + resto : '') + window.location.hash);
    }

    var mostrarErro = function (campo, mensagem) {
      var bloco = campo.closest('.campo-form');
      var p = bloco && $('.campo-erro', bloco);
      if (!bloco || !p) return;
      if (mensagem) {
        bloco.classList.add('tem-erro');
        campo.setAttribute('aria-invalid', 'true');
        p.textContent = mensagem;
        p.hidden = false;
      } else {
        bloco.classList.remove('tem-erro');
        campo.removeAttribute('aria-invalid');
        p.textContent = '';
        p.hidden = true;
      }
    };
    var validarCampo = function (campo) {
      var v = String(campo.value || '').trim();
      var ok;
      switch (campo.name) {
        case 'nome':
          if (/[<>]/.test(v)) { mostrarErro(campo, 'Escreva o nome sem os sinais < e >.'); return false; }
          ok = v.length >= 2 && v.length <= 80 && /[A-Za-zÀ-ÿ]/.test(v);
          break;
        case 'whatsapp': ok = telefoneValido(v); break;
        case 'assunto': ok = !!v; break;
        case 'mensagem': ok = v.length <= 1000; break;
        case 'consentimento': ok = campo.checked; break;
        default: return true;
      }
      mostrarErro(campo, ok ? '' : (campo.getAttribute('data-erro') || 'Confira este campo.'));
      return ok;
    };

    if (el.whatsapp) {
      el.whatsapp.addEventListener('input', function () {
        var c = el.whatsapp;
        if (c.selectionStart === c.value.length) c.value = mascaraTelefone(c.value);
      });
      el.whatsapp.addEventListener('blur', function () { if (el.whatsapp.value) el.whatsapp.value = mascaraTelefone(el.whatsapp.value); });
    }
    var revalidar = function (e) {
      var bloco = e.target.closest && e.target.closest('.campo-form');
      if (bloco && bloco.classList.contains('tem-erro')) validarCampo(e.target);
    };
    form.addEventListener('input', revalidar);
    form.addEventListener('change', revalidar);

    var textoBotao = botao ? botao.textContent : '';
    var restaurar = function () {
      form.__enviando = false;
      if (!botao) return;
      botao.disabled = false;
      botao.removeAttribute('aria-busy');
      botao.textContent = textoBotao;
      botao.style.minWidth = '';
    };
    /* Ícone Lucide message-circle (o WhatsApp da casa: o ícone com a palavra, nunca o logotipo verde) */
    var ICONE_CONVERSA = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>';
    var canais = function (motivo) {
      /* A reserva quando o envio falha: os canais oficiais, com o WhatsApp como botão de um toque (com a
         mensagem neutra) e o e-mail embaixo. Sem o CRM configurado (503), tentar de novo não adianta:
         a frase manda direto para os canais. */
      var frag = doc.createDocumentFragment();
      var frase = doc.createElement('span');
      frase.className = 'contato-reserva-texto';
      frase.textContent = motivo === 'crm-nao-configurado'
        ? 'O envio pelo site não está disponível agora. Fale com o escritório pelos canais oficiais:'
        : 'A mensagem não foi enviada. Tente de novo em instantes ou fale com o escritório pelos canais oficiais:';
      frag.appendChild(frase);
      var numero = form.getAttribute('data-whatsapp') || '';
      var linkZap = form.getAttribute('data-whatsapp-link') || '';
      if (numero && linkZap && numero.indexOf('[') < 0) {
        var a = doc.createElement('a');
        a.href = linkZap;
        a.className = 'btn btn--cheio btn--bloco';
        a.innerHTML = ICONE_CONVERSA;
        a.appendChild(doc.createTextNode('WhatsApp ' + numero));
        frag.appendChild(a);
      } else if (numero) {
        var z = doc.createElement('span'); z.className = 'contato-reserva-linha'; z.textContent = 'WhatsApp ' + numero; frag.appendChild(z);
      }
      var email = form.getAttribute('data-email');
      if (email) {
        var linha = doc.createElement('span');
        linha.className = 'contato-reserva-linha';
        linha.appendChild(doc.createTextNode('E-mail: '));
        var m = doc.createElement('a'); m.href = 'mailto:' + email; m.textContent = email; linha.appendChild(m);
        frag.appendChild(linha);
      }
      return frag;
    };
    var falhou = function (motivo) {
      restaurar();
      if (!situacao) return;
      clearTimeout(situacao.__anuncio);   /* o "Enviando" que ainda ia entrar não apaga a reserva */
      situacao.textContent = '';
      situacao.appendChild(canais(motivo));
      /* a reserva fica abaixo do botão: leva até ela e põe o foco nela (o botão desativado perdeu o foco) */
      situacao.setAttribute('tabindex', '-1');
      garanteVisivel(situacao);
      foca(situacao);
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.__enviando) return;
      var primeiro = null;
      ['nome', 'whatsapp', 'assunto', 'mensagem', 'consentimento'].forEach(function (n) {
        if (el[n] && !validarCampo(el[n]) && !primeiro) primeiro = el[n];
      });
      if (primeiro) {
        if (situacao) anunciar(situacao, 'Confira os campos marcados.');
        primeiro.focus();
        return;
      }
      var dados = {
        nome: el.nome.value.trim(),
        whatsapp: el.whatsapp.value.trim(),
        assunto: el.assunto.value,
        mensagem: el.mensagem ? el.mensagem.value.trim() : '',
        como_conheceu: el.como_conheceu ? el.como_conheceu.value : '',
        pagina: el.pagina ? el.pagina.value : window.location.pathname,
        consentimento: !!(el.consentimento && el.consentimento.checked),
        isca: el.isca ? el.isca.value : ''
      };
      form.__enviando = true;
      if (botao) {
        botao.style.minWidth = botao.offsetWidth + 'px';
        botao.disabled = true;
        botao.setAttribute('aria-busy', 'true');
        botao.textContent = 'Enviando';
      }
      if (situacao) anunciar(situacao, 'Enviando a sua mensagem.');
      var controle = typeof AbortController === 'function' ? new AbortController() : null;
      /* 20 s: mais que o limite da função (15 s), para o navegador nunca desistir de um envio que gravou */
      var limite = setTimeout(function () { if (controle) controle.abort(); }, 20000);
      fetch(form.getAttribute('action') || '/borelli-site-previa/api/contato/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(dados),
        credentials: 'same-origin',
        signal: controle ? controle.signal : undefined
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, j: j || {} }; });
      }).then(function (res) {
        clearTimeout(limite);
        if (res.status >= 200 && res.status < 300 && res.j.ok) {
          evento('contato_enviado');
          window.location.assign(form.getAttribute('data-obrigado') || '/borelli-site-previa/obrigado/');
          return;
        }
        if (res.status === 400 && Array.isArray(res.j.campos) && res.j.campos.length) {
          restaurar();
          var foco = null;
          res.j.campos.forEach(function (n) {
            var c = el[n];
            if (c && c.getAttribute) { mostrarErro(c, c.getAttribute('data-erro') || 'Confira este campo.'); foco = foco || c; }
          });
          if (situacao) anunciar(situacao, 'Confira os campos marcados.');
          if (foco) foco.focus();
          return;
        }
        falhou(res.status === 503 ? 'crm-nao-configurado' : res.j.motivo);
      }).catch(function () {
        clearTimeout(limite);
        falhou();
      });
    });
  };
  $$('form[data-contato]').forEach(montarFormulario);

  /* ---------- 7. Sanfona: a pergunta do endereço abre sozinha ----------
     Um link para "#faq-junta" (ou o endereço com esse final) abre a pergunta e leva até ela. */
  var abrirDoEndereco = function (hash, focar) {
    if (!hash || hash.length < 2) return;
    var alvo = null;
    try { alvo = doc.getElementById(decodeURIComponent(hash.slice(1))); } catch (e) { alvo = null; }
    if (!alvo) return;
    var det = alvo.tagName === 'DETAILS' ? alvo : alvo.closest && alvo.closest('details');
    if (det && !det.open) det.open = true;
    if (det && focar) setTimeout(function () { garanteVisivel(det, extraIndice()); foca($('summary', det)); }, 60);
  };
  window.addEventListener('hashchange', function () { abrirDoEndereco(window.location.hash, true); });
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (a) abrirDoEndereco(a.getAttribute('href'), false);
  });
  abrirDoEndereco(window.location.hash, true);

  /* ---------- 8. Índice "Nesta página" ----------
     Destaca a parte em leitura (aria-current="location"); no celular, o índice da página de área
     vira uma barra presa abaixo do cabeçalho, com a parte atual escrita e a lista por cima do texto. */
  function extraIndice() {
    var barra = $('[data-indice-botao]');
    return barra && barra.offsetParent !== null ? barra.getBoundingClientRect().height : 0;
  }
  $$('[data-indice]').forEach(function (nav) {
    var links = $$('a[href^="#"]', nav);
    var alvos = links.map(function (a) { return doc.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))); });
    if (!links.length) return;
    var botao = $('[data-indice-botao]', nav);
    var atual = $('[data-indice-atual]', nav);
    var barra = $('[data-indice-barra]', nav);
    var corpo = nav.closest('[data-indice-corpo]') || nav.parentNode;
    var ultimo = -2, pedido = false;
    var nome = function (a) { return a.textContent.replace(/\s+/g, ' ').trim(); };
    var mede = function () {
      pedido = false;
      var linha = alturaTopo() + window.innerHeight * 0.28;
      var idx = -1;
      alvos.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= linha) idx = i; });
      if ((window.innerHeight + (window.pageYOffset || html.scrollTop)) >= html.scrollHeight - 4) {
        for (var k = alvos.length - 1; k >= 0; k--) { if (alvos[k]) { idx = k; break; } }
      }
      if (idx !== ultimo) {
        ultimo = idx;
        links.forEach(function (a, i) { if (i === idx) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
        if (atual) atual.textContent = nome(links[Math.max(0, idx)]);
      }
      if (barra) {
        var r = corpo.getBoundingClientRect();
        var p = (linha - r.top) / Math.max(1, r.height);
        barra.style.transform = 'scaleX(' + Math.max(0, Math.min(1, p)).toFixed(3) + ')';
      }
    };
    window.addEventListener('scroll', function () { if (!pedido) { pedido = true; window.requestAnimationFrame(mede); } }, { passive: true });
    window.addEventListener('resize', adiar(mede, 120));
    if (botao) {
      var lista = doc.getElementById(botao.getAttribute('aria-controls'));
      var fecha = function (voltar) {
        if (!nav.classList.contains('indice-aberto')) return;
        nav.classList.remove('indice-aberto');
        botao.setAttribute('aria-expanded', 'false');
        if (voltar) botao.focus();
      };
      botao.addEventListener('click', function () {
        var abre = !nav.classList.contains('indice-aberto');
        nav.classList.toggle('indice-aberto', abre);
        botao.setAttribute('aria-expanded', abre ? 'true' : 'false');
        if (abre && lista) foca($('a', lista));
      });
      links.forEach(function (a) { a.addEventListener('click', function () { fecha(false); }); });
      doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') fecha(true); });
      doc.addEventListener('click', function (e) { if (!nav.contains(e.target)) fecha(false); });
    }
    mede();
  });

  /* ---------- 9. Lista de documentos ----------
     Marca e desmarca; guarda as marcas no próprio navegador (localStorage, com try/catch: em
     navegação privada a lista funciona e avisa que não ficou guardada); imprime só a lista numa
     folha própria (marca em Azul Borelli, sem metal, com a identificação e o aviso); copia em texto. */
  $$('[data-documentos]').forEach(function (raiz) {
    var chave = 'borelli-docs:' + (raiz.getAttribute('data-documentos') || window.location.pathname);
    var titulo = raiz.getAttribute('data-titulo') || 'Documentos';
    var caixas = $$('input[type="checkbox"]', raiz);
    if (!caixas.length) return;
    var contagem = $('[data-documentos-contagem]', raiz);
    var progresso = $('[data-documentos-progresso]', raiz);
    var aviso = $('[data-documentos-aviso]', raiz);
    var podeGuardar = true;
    var marcadas = function () { return caixas.filter(function (c) { return c.checked; }); };
    var atualiza = function () {
      var n = marcadas().length;
      if (contagem) contagem.textContent = n + ' de ' + caixas.length + (caixas.length === 1 ? ' documento marcado' : ' documentos marcados');
      if (progresso) progresso.parentNode.style.setProperty('--progresso', (n / caixas.length).toFixed(3));
      caixas.forEach(function (c) { var item = c.closest('.doc-item'); if (item) item.classList.toggle('marcado', c.checked); });
    };
    var grava = function () {
      var ok = guardar(chave, JSON.stringify(marcadas().map(function (c) { return c.value; })));
      if (!ok) podeGuardar = false;
      return ok;
    };
    var salvos = null;
    try { salvos = JSON.parse(window.localStorage.getItem(chave) || '[]'); } catch (e) { podeGuardar = false; salvos = []; }
    if (Array.isArray(salvos)) caixas.forEach(function (c) { c.checked = salvos.indexOf(c.value) >= 0; });
    atualiza();
    if (!podeGuardar && aviso) aviso.textContent = 'Este navegador não deixa guardar a lista. Ela vale enquanto a página estiver aberta.';
    caixas.forEach(function (c) {
      c.addEventListener('change', function () {
        atualiza();
        var ok = grava();
        var n = marcadas().length;
        anunciar(aviso, n + ' de ' + caixas.length + ' marcados.' + (ok ? ' A lista ficou guardada neste navegador.' : ' Este navegador não deixa guardar a lista.'));
      });
    });
    var textoDe = function (c) {
      var item = c.closest('.doc-item');
      var t = item && $('.doc-t', item);
      return t ? t.textContent.replace(/\s+/g, ' ').trim() : c.value;
    };
    var descDe = function (c) {
      var item = c.closest('.doc-item');
      var d = item && $('.doc-d', item);
      return d ? d.textContent.replace(/\s+/g, ' ').trim() : '';
    };
    var grupos = function () {
      var gs = $$('.docs-grupo', raiz);
      if (!gs.length) gs = [raiz];
      return gs.map(function (g) {
        var leg = $('legend', g);
        return { nome: leg ? leg.textContent.trim() : '', caixas: $$('input[type="checkbox"]', g) };
      });
    };
    var identificacao = function () {
      var id = $('.site-rodape .id-oab');
      if (!id) return '';
      return $$('span', id).map(function (s) { return s.textContent.trim(); }).join(' · ');
    };
    var avisoPub = function () { var a = $('.site-rodape .aviso-pub'); return a ? a.textContent.trim() : ''; };
    var copiar = $('[data-documentos-copiar]', raiz);
    if (copiar) copiar.addEventListener('click', function () {
      var linhas = [titulo, ''];
      grupos().forEach(function (g) {
        if (g.nome) linhas.push(g.nome);
        g.caixas.forEach(function (c) { linhas.push((c.checked ? '[x] ' : '[ ] ') + textoDe(c)); });
        linhas.push('');
      });
      linhas.push('Não envie documentos de saúde pelo formulário do site.');
      var id = identificacao();
      if (id) linhas.push(id);
      var texto = linhas.join('\n');
      var reserva = function () {
        var area = doc.createElement('textarea');
        area.value = texto; area.setAttribute('readonly', '');
        area.style.position = 'fixed'; area.style.top = '0'; area.style.left = '0'; area.style.opacity = '0';
        doc.body.appendChild(area); area.select();
        var ok = false;
        try { ok = doc.execCommand('copy'); } catch (e) { ok = false; }
        doc.body.removeChild(area);
        anunciar(aviso, ok ? 'Lista copiada. Cole onde quiser guardar.' : 'Não foi possível copiar. Use o botão Imprimir a lista.');
        foca(copiar);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(texto).then(function () { anunciar(aviso, 'Lista copiada. Cole onde quiser guardar.'); }, reserva);
      } else reserva();
    });
    var limpar = $('[data-documentos-limpar]', raiz);
    if (limpar) limpar.addEventListener('click', function () {
      caixas.forEach(function (c) { c.checked = false; });
      atualiza(); grava();
      anunciar(aviso, 'Lista desmarcada.');
    });
    var imprimir = $('[data-documentos-imprimir]', raiz);
    if (imprimir) imprimir.addEventListener('click', function () {
      var folha = $('.impressao-lista');
      if (!folha) { folha = doc.createElement('div'); folha.className = 'impressao-lista'; folha.setAttribute('aria-hidden', 'true'); doc.body.appendChild(folha); }
      folha.textContent = '';
      var cab = doc.createElement('div'); cab.className = 'impressao-cab';
      var marca = doc.createElement('img'); marca.src = '/borelli-site-previa/assets/img/marca/borelli-horizontal-sem-apoio-marinho.svg'; marca.alt = 'Borelli Advocacia'; marca.width = 166; marca.height = 36;
      var data = doc.createElement('p'); data.textContent = new Date().toLocaleDateString('pt-BR');
      cab.appendChild(marca); cab.appendChild(data); folha.appendChild(cab);
      var h = doc.createElement('p'); h.className = 'impressao-titulo'; h.textContent = titulo; folha.appendChild(h);
      grupos().forEach(function (g) {
        if (g.nome) { var gn = doc.createElement('p'); gn.className = 'impressao-grupo'; gn.textContent = g.nome; folha.appendChild(gn); }
        var ul = doc.createElement('ul');
        g.caixas.forEach(function (c) {
          var li = doc.createElement('li'); if (c.checked) li.className = 'marcado';
          var cx = doc.createElement('span'); cx.className = 'caixa'; li.appendChild(cx);
          var tx = doc.createElement('span'); var b = doc.createElement('b'); b.textContent = textoDe(c); tx.appendChild(b);
          var dd = descDe(c); if (dd) { var sd = doc.createElement('span'); sd.className = 'd'; sd.textContent = dd; tx.appendChild(sd); }
          li.appendChild(tx); ul.appendChild(li);
        });
        folha.appendChild(ul);
      });
      var nota = doc.createElement('p'); nota.className = 'impressao-nota'; nota.textContent = 'Sigilo: não envie documentos, fotos ou detalhes do seu caso pelo formulário do site.'; folha.appendChild(nota);
      var id = doc.createElement('p'); id.className = 'impressao-id'; id.textContent = identificacao(); folha.appendChild(id);
      var av = doc.createElement('p'); av.className = 'impressao-aviso'; av.textContent = avisoPub(); folha.appendChild(av);
      html.classList.add('imprimindo-lista');
      anunciar(aviso, 'Abrindo a impressão da lista.');
      setTimeout(function () {
        try { window.print(); } catch (e) { /* sem impressão disponível */ }
        setTimeout(function () { html.classList.remove('imprimindo-lista'); }, 600);
      }, 60);
    });
    window.addEventListener('afterprint', function () { html.classList.remove('imprimindo-lista'); });
  });

  /* ---------- 10. Pílulas dos procedimentos ----------
     Sem JavaScript, a lista inteira com a descrição de cada cirurgia; com ele, as pílulas e uma
     descrição por vez (a primeira já aberta). */
  $$('[data-procedimentos]').forEach(function (grupo) {
    var pilulas = $('[data-proc-pilulas]', grupo);
    var botoes = $$('[data-proc]', grupo);
    if (!pilulas || !botoes.length) return;
    pilulas.hidden = false;
    var mostra = function (b) {
      botoes.forEach(function (o) {
        var item = doc.getElementById(o.getAttribute('data-proc'));
        var sim = o === b;
        o.setAttribute('aria-pressed', sim ? 'true' : 'false');
        if (item) item.classList.toggle('ativo', sim);
      });
    };
    botoes.forEach(function (b, i) {
      b.addEventListener('click', function () { mostra(b); });
      b.addEventListener('keydown', function (e) {
        var alvo = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') alvo = botoes[(i + 1) % botoes.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') alvo = botoes[(i - 1 + botoes.length) % botoes.length];
        if (alvo) { e.preventDefault(); alvo.focus(); mostra(alvo); }
      });
    });
    mostra(botoes.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })[0] || botoes[0]);
    grupo.classList.add('proc-pronto');
  });

  /* ---------- 11. Regras numeradas (parte 02 da área): recolhíveis no celular ----------
     Até 640 px, o título de cada regra vira um botão que abre e fecha o texto dela (a primeira fica
     aberta); "Onde está" continua à vista. No computador, e sem JavaScript, tudo aberto, como no
     desenho do protótipo A. O texto continua inteiro na página (busca, impressão, assistentes de IA). */
  var celular = midia('(max-width: 640px)');
  var regras = [];
  $$('ol.regras').forEach(function (lista, l) {
    $$('li.regra', lista).forEach(function (li, i) {
      if (li.parentNode !== lista) return;
      var t = $('.regra-t', li);
      var corpo = $('.regra-corpo', li);
      if (!t || !corpo) return;
      if (!corpo.id) corpo.id = 'regra-' + (l + 1) + '-' + (i + 1);
      regras.push({ li: li, t: t, corpo: corpo, aberta: i === 0, botao: null });
    });
  });
  var mostraRegra = function (r) {
    Array.prototype.forEach.call(r.corpo.children, function (el) {
      if (el.classList.contains('regra-onde')) return;
      if (r.aberta) { el.hidden = false; el.removeAttribute('data-regra-oculta'); }
      else { el.hidden = true; el.setAttribute('data-regra-oculta', ''); }
    });
    r.botao.setAttribute('aria-expanded', r.aberta ? 'true' : 'false');
    r.li.classList.toggle('regra--fechada', !r.aberta);
  };
  var ligaRegra = function (r) {
    if (r.botao) return;
    var b = doc.createElement('button');
    b.type = 'button';
    b.className = 'regra-botao';
    b.setAttribute('aria-controls', r.corpo.id);
    while (r.t.firstChild) b.appendChild(r.t.firstChild);
    r.t.appendChild(b);
    r.t.classList.add('regra-t--botao');
    b.addEventListener('click', function () { r.aberta = !r.aberta; mostraRegra(r); });
    r.botao = b;
    mostraRegra(r);
  };
  var desligaRegra = function (r) {
    if (!r.botao) return;
    while (r.botao.firstChild) r.t.insertBefore(r.botao.firstChild, r.botao);
    r.t.removeChild(r.botao);
    r.t.classList.remove('regra-t--botao');
    r.botao = null;
    $$('[data-regra-oculta]', r.corpo).forEach(function (el) { el.hidden = false; el.removeAttribute('data-regra-oculta'); });
    r.li.classList.remove('regra--fechada');
  };
  var aplicaRegras = function () {
    regras.forEach(function (r) { if (celular.matches) ligaRegra(r); else desligaRegra(r); });
  };
  if (regras.length) {
    aplicaRegras();
    aoMudar(celular, aplicaRegras);
    /* a impressão sai com tudo aberto, mesmo no celular */
    window.addEventListener('beforeprint', function () { regras.forEach(function (r) { if (r.botao && !r.aberta) { r.aberta = true; mostraRegra(r); } }); });
  }

  /* ---------- 12. Lista de guias: filtro por tema ---------- */
  $$('[data-filtro-temas]').forEach(function (grupo) {
    var raiz = grupo.parentNode;
    var lista = $('[data-guias-lista]', raiz);
    var vazio = $('[data-guias-vazio]', raiz);
    if (!lista) return;
    var aviso = doc.createElement('p');
    aviso.className = 'visualmente-oculto';
    aviso.setAttribute('role', 'status');
    grupo.parentNode.insertBefore(aviso, grupo.nextSibling);
    var filtrar = function (botao, anunciarContagem) {
      var tema = botao.getAttribute('data-tema');
      $$('[data-tema]', grupo).forEach(function (b) { b.setAttribute('aria-pressed', b === botao ? 'true' : 'false'); });
      var n = 0;
      $$(':scope > li', lista).forEach(function (li) {
        var mostra = !tema || li.getAttribute('data-tema') === tema;
        li.hidden = !mostra;
        if (mostra) n += 1;
      });
      if (vazio) vazio.hidden = n > 0;
      if (anunciarContagem) anunciar(aviso, n === 1 ? '1 guia neste tema.' : n + ' guias neste tema.');
    };
    grupo.hidden = false;
    grupo.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-tema]');
      if (b) filtrar(b, true);
    });
    var pedidoTema = new URLSearchParams(window.location.search).get('tema');
    var inicial = pedidoTema && $$('[data-tema]', grupo).filter(function (b) { return b.getAttribute('data-tema') === pedidoTema; })[0];
    if (inicial) filtrar(inicial, false);
  });

  /* ---------- 13. Modelo de mensagem: copiar o texto ---------- */
  $$('.modelo').forEach(function (m) {
    var botao = $('.copiar', m);
    var texto = $('.modelo-texto', m);
    if (!botao || !texto || !navigator.clipboard || !window.isSecureContext) return;
    var aviso = doc.createElement('span');
    aviso.className = 'visualmente-oculto';
    aviso.setAttribute('role', 'status');
    m.appendChild(aviso);
    var rotulo = botao.textContent;
    botao.hidden = false;
    botao.addEventListener('click', function () {
      navigator.clipboard.writeText(texto.innerText.trim()).then(function () {
        botao.setAttribute('data-copiado', '');
        botao.textContent = 'Texto copiado';
        anunciar(aviso, 'Texto copiado. Troque o que está marcado antes de enviar.');
        setTimeout(function () { botao.removeAttribute('data-copiado'); botao.textContent = rotulo; }, 2400);
      }).catch(function () { anunciar(aviso, 'Não deu para copiar. Selecione o texto e copie.'); });
    });
  });

  /* ---------- 14. Para conteúdo criado depois e para as ferramentas ---------- */
  window.borelliAtualiza = function (raiz) {
    raiz = raiz || doc;
    if (window.borelliMobile) window.borelliMobile(raiz);
    if (window.bviz && window.bviz.montar) window.bviz.montar(raiz);
    if (window.bforms && window.bforms.montar) window.bforms.montar(raiz);
  };
  window.Borelli = {
    evento: evento,
    medicaoAceita: medicaoAceita,
    mascaraTelefone: mascaraTelefone,
    telefoneValido: telefoneValido,
    digitosTelefone: digitosTelefone,
    mascaraData: mascaraData,
    lerData: lerData,
    ligaMascaraData: ligaMascaraData,
    semAcento: semAcento,
    anunciar: anunciar,
    foca: foca,
    garanteVisivel: garanteVisivel,
    alturaTopo: alturaTopo,
    midia: midia,
    aoMudar: aoMudar,
    poucoMovimento: function () { return poucoMovimento.matches; },
    atualizar: window.borelliAtualiza
  };
  doc.dispatchEvent(new CustomEvent('borelli:pronto'));
})();
