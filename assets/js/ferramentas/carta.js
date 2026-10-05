/* =====================================================================
   BORELLI ADVOCACIA · ferramentas/carta.js · a carta de negativa anotada
   ("Grifo nosso"), da parte src/partes/ferramenta-carta.html.
   Sem JavaScript: cada grifo é um link para a nota (#nota-N) e as seis notas
   aparecem em lista ao lado (computador) ou abaixo da carta (celular).
   Com este módulo:
   · computador (a partir de 1025 px): página dupla; uma nota por vez no painel,
     abas 01 a 06, Anterior e Próximo; tocar num grifo mostra a nota dele;
   · celular: tocar num grifo abre a nota numa folha que sobe da base; X, Esc e
     toque fora fecham e o foco volta ao trecho; sair da folha com o Tab também
     fecha (o foco nunca fica escondido atrás dela); Anterior e Próximo ficam
     presos no pé da folha; a barra "Toque num trecho grifado" fica presa
     embaixo enquanto a carta está na tela.
   Depende de window.Borelli (site.js, carregado antes). Nada sai do navegador.
   ===================================================================== */
(function () {
  'use strict';
  var doc = document;
  var B = window.Borelli || {};
  function $(sel, raiz) { return (raiz || doc).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || doc).querySelectorAll(sel)); }
  function dois(n) { return (n < 10 ? '0' : '') + n; }
  var midia = B.midia || function (q) { return window.matchMedia(q); };
  var aoMudar = B.aoMudar || function (m, fn) { if (m.addEventListener) m.addEventListener('change', fn); };
  var foca = B.foca || function (el) { if (el) el.focus(); };
  var computador = midia('(min-width: 1025px)');

  $$('[data-carta]').forEach(function (carta) {
    var grifos = $$('.carta-grifo[data-nota]', carta);
    var notas = $$('.carta-nota[data-nota]', carta);
    var abas = $$('.carta-aba[data-nota]', carta);
    var painel = $('[data-carta-painel]', carta);
    var fechar = $('[data-carta-fechar]', carta);
    var contagem = $('[data-carta-atual]', carta);
    var anterior = $('.carta-passo[data-passo="-1"]', carta);
    var proximo = $('.carta-passo[data-passo="1"]', carta);
    var doca = $('[data-carta-doca]', carta);
    var docaAbrir = $('[data-carta-doca-abrir]', carta);
    var anuncio = $('[data-carta-anuncio]', carta);
    var folha = $('.carta-folha', carta);
    if (!grifos.length || !notas.length || !painel) return;
    var total = notas.length;
    var atual = 1;
    var origem = null;

    carta.classList.add('carta--js');
    if (fechar) fechar.hidden = false;
    if (doca) doca.hidden = false;

    var nomeNota = function (n) {
      var t = $('.carta-nota-t', notas[n - 1]);
      return t ? t.textContent.replace(/^\s*\d+\s*/, '').trim() : '';
    };
    var folhaAberta = function () { return carta.classList.contains('carta--aberta'); };
    var ativa = function (n, anunciar) {
      atual = Math.max(1, Math.min(total, n));
      notas.forEach(function (nota) {
        var sim = +nota.getAttribute('data-nota') === atual;
        nota.classList.toggle('ativa', sim);
        nota.classList.toggle('inativa', !sim);
        if (sim) nota.removeAttribute('aria-hidden'); else nota.setAttribute('aria-hidden', 'true');
      });
      abas.forEach(function (aba) { aba.setAttribute('aria-pressed', +aba.getAttribute('data-nota') === atual ? 'true' : 'false'); });
      var mostra = computador.matches || folhaAberta();
      grifos.forEach(function (g) {
        var sim = mostra && +g.getAttribute('data-nota') === atual;
        g.classList.toggle('ativo', sim);
        if (sim) g.setAttribute('aria-current', 'true'); else g.removeAttribute('aria-current');
      });
      if (contagem) contagem.textContent = dois(atual);
      if (anterior) anterior.disabled = atual <= 1;
      if (proximo) proximo.disabled = atual >= total;
      if (docaAbrir) docaAbrir.textContent = 'Ler a nota ' + dois(atual);
      if (anuncio && anunciar !== false) anuncio.textContent = 'Nota ' + dois(atual) + ' de ' + dois(total) + ': ' + nomeNota(atual) + '.';
    };
    /* o trecho grifado continua à vista, acima da folha do celular ou ao lado do painel */
    var trechoNaTela = function (n) {
      var g = grifos[n - 1];
      if (!g) return;
      var r = g.getBoundingClientRect();
      var cima = (B.alturaTopo ? B.alturaTopo() : 0) + 16;
      var baixo = window.innerHeight - (folhaAberta() ? painel.offsetHeight : 0) - 16;
      if (r.top < cima || r.bottom > baixo) {
        var alvo = window.pageYOffset + r.top - cima - 8;
        window.scrollTo({ top: Math.max(0, alvo), behavior: (B.poucoMovimento && B.poucoMovimento()) || doc.documentElement.classList.contains('automatizado') ? 'auto' : 'smooth' });
      }
    };
    var notaNaTela = function () {
      if (computador.matches && B.garanteVisivel) B.garanteVisivel(notas[atual - 1]);
    };
    var foraDaFolha = function (e) {
      if (!folhaAberta()) return;
      if (e.target.closest && (e.target.closest('[data-carta-painel]') || e.target.closest('.carta-grifo') || e.target.closest('[data-carta-doca]'))) return;
      fechaFolha(false);
    };
    var teclaFolha = function (e) {
      if (e.key === 'Escape' && folhaAberta()) { e.preventDefault(); fechaFolha(true); }
    };
    /* A folha não prende o foco (a pessoa continua rolando a carta), mas o Tab nunca chega a um
       elemento escondido atrás dela: sair da folha para a página fecha a folha; voltar para um trecho
       grifado mantém a folha e traz o trecho para cima dela (WCAG 2.4.11) */
    var aoSairDaFolha = function (e) {
      var alvo = e.relatedTarget;
      if (!folhaAberta() || !alvo || painel.contains(alvo)) return;
      var g = alvo.closest && alvo.closest('.carta-grifo');
      if (g && carta.contains(g)) { window.requestAnimationFrame(function () { trechoNaTela(+g.getAttribute('data-nota')); }); return; }
      fechaFolha(false);
    };
    var abreNota = function (n, quem) {
      if (computador.matches) {
        ativa(n);
        notaNaTela();
        return;
      }
      var jaAberta = folhaAberta();
      carta.classList.add('carta--aberta');
      if (quem) origem = quem;
      ativa(n);
      if (!jaAberta) {
        doc.addEventListener('keydown', teclaFolha);
        doc.addEventListener('click', foraDaFolha, true);
        painel.addEventListener('focusout', aoSairDaFolha);
      }
      foca(notas[atual - 1]);
      window.requestAnimationFrame(function () { trechoNaTela(atual); });
    };
    var fechaFolha = function (devolveFoco) {
      if (!folhaAberta()) return;
      carta.classList.remove('carta--aberta');
      doc.removeEventListener('keydown', teclaFolha);
      doc.removeEventListener('click', foraDaFolha, true);
      painel.removeEventListener('focusout', aoSairDaFolha);
      grifos.forEach(function (g) { g.classList.remove('ativo'); g.removeAttribute('aria-current'); });
      if (anuncio) anuncio.textContent = 'Nota fechada.';
      if (devolveFoco && origem) foca(origem);
      origem = null;
    };

    grifos.forEach(function (g) {
      g.addEventListener('click', function (e) {
        e.preventDefault();   /* o link #nota-N vale sem JavaScript; com ele, a nota abre no lugar */
        abreNota(+g.getAttribute('data-nota'), g);
      });
    });
    abas.forEach(function (aba, i) {
      aba.addEventListener('click', function () { ativa(+aba.getAttribute('data-nota')); trechoNaTela(atual); });
      aba.addEventListener('keydown', function (e) {
        var alvo = null;
        if (e.key === 'ArrowRight') alvo = abas[Math.min(abas.length - 1, i + 1)];
        else if (e.key === 'ArrowLeft') alvo = abas[Math.max(0, i - 1)];
        else if (e.key === 'Home') alvo = abas[0];
        else if (e.key === 'End') alvo = abas[abas.length - 1];
        if (alvo) { e.preventDefault(); alvo.focus(); alvo.click(); }
      });
    });
    [anterior, proximo].forEach(function (b) {
      if (!b) return;
      b.addEventListener('click', function () {
        ativa(atual + (+b.getAttribute('data-passo')));
        trechoNaTela(atual);
        if (b.disabled) foca(b === anterior ? proximo : anterior);
      });
    });
    if (fechar) fechar.addEventListener('click', function () { fechaFolha(true); });
    if (docaAbrir) docaAbrir.addEventListener('click', function () { abreNota(atual, docaAbrir); });
    /* a barra do celular só aparece com a carta na tela */
    if (folha && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (en) { carta.classList.toggle('carta--na-tela', en.isIntersecting); });
      }, { rootMargin: '-30% 0px -20% 0px', threshold: 0 }).observe(folha);
    }
    aoMudar(computador, function () { if (computador.matches) fechaFolha(false); ativa(atual, false); });
    /* o endereço #nota-3 abre a nota 3 */
    var pedida = /^#nota-(\d+)$/.exec(window.location.hash || '');
    ativa(pedida ? +pedida[1] : 1, false);
  });
})();
