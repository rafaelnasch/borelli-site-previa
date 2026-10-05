/* =====================================================================
   BORELLI ADVOCACIA · ferramentas/canais.js · o verificador de canais oficiais
   (BRIEF 7.7), contra o golpe do falso advogado. Parte:
   src/partes/ferramenta-canais.html. Os canais oficiais vêm do site.json pelos
   atributos data-whatsapp, data-email, data-site e data-instagram da parte.
   Enquanto o WhatsApp oficial estiver pendente (entre colchetes no site.json), a
   ferramenta diz que a lista oficial será publicada e mostra os canais já
   confirmados. Nada do que a pessoa digita é guardado ou enviado.
   ===================================================================== */
(function () {
  'use strict';
  var doc = document;
  var B = window.Borelli || {};
  function $(sel, raiz) { return (raiz || doc).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || doc).querySelectorAll(sel)); }
  function pendente(v) { return !v || /\[[^\]]*[A-Za-zÀ-ÿ][^\]]*\]/.test(v); }
  function digitos(v) {
    var d = String(v || '').replace(/\D/g, '');
    if (d.length >= 12 && d.indexOf('55') === 0) d = d.slice(2);
    return d;
  }
  function el(tag, classe, texto) {
    var e = doc.createElement(tag);
    if (classe) e.className = classe;
    if (texto != null) e.textContent = texto;
    return e;
  }

  $$('[data-canais]').forEach(function (raiz) {
    var form = $('[data-canais-form]', raiz);
    var campo = $('[data-canais-campo]', raiz);
    var res = $('[data-canais-res]', raiz);
    if (!form || !campo || !res) return;
    var oficial = {
      whatsapp: raiz.getAttribute('data-whatsapp') || '',
      whatsappTexto: raiz.getAttribute('data-whatsapp-texto') || '',
      email: (raiz.getAttribute('data-email') || '').toLowerCase(),
      site: (raiz.getAttribute('data-site') || '').toLowerCase(),
      instagram: (raiz.getAttribute('data-instagram') || '').toLowerCase().replace(/^@/, '')
    };
    var whatsappPendente = pendente(oficial.whatsapp);
    var confirmados = function () {
      var ul = el('ul', 'canais-res-lista');
      if (!whatsappPendente) ul.appendChild(el('li', null, 'WhatsApp ' + oficial.whatsappTexto));
      if (oficial.email) ul.appendChild(el('li', null, 'E-mail ' + oficial.email));
      if (oficial.site) ul.appendChild(el('li', null, 'Site ' + oficial.site));
      if (oficial.instagram) ul.appendChild(el('li', null, 'Instagram @' + oficial.instagram));
      return ul;
    };
    var mostra = function (tipo, titulo, texto, lista) {
      res.textContent = '';
      res.className = 'canais-res canais-res--' + tipo;
      res.appendChild(el('p', 'canais-res-t', titulo));
      if (texto) res.appendChild(el('p', 'canais-res-d', texto));
      if (lista) res.appendChild(confirmados());
      if (tipo !== 'ok') res.appendChild(el('p', 'canais-res-golpe', 'O escritório não pede pagamento para liberar valor de processo. Recebeu mensagem de outro número? Não responda e confirme por um dos canais oficiais.'));
      else res.appendChild(el('p', 'canais-res-d', 'Mesmo num canal oficial, o escritório não pede pagamento para liberar valor de processo.'));
    };
    var confere = function () {
      var v = campo.value.trim();
      if (!v) { mostra('aviso', 'Digite o número, o e-mail ou o perfil que mandou a mensagem.', '', false); campo.focus(); return; }
      var minusculo = v.toLowerCase();
      /* e-mail */
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(minusculo)) {
        if (minusculo === oficial.email) mostra('ok', 'Este é um canal oficial da Borelli Advocacia.', 'O e-mail ' + oficial.email + ' está na lista de canais oficiais.', false);
        else mostra('nao', 'Este e-mail não está na lista de canais oficiais.', 'Os canais oficiais da Borelli Advocacia são estes:', true);
        return;
      }
      /* site (advborelli.com.br, com ou sem https:// e www.): antes do perfil, porque o perfil aceita
         pontos e capturaria o domínio. Conta como site o que veio com https:// ou www., com caminho
         depois do domínio ou terminado num domínio de topo comum; o @ no começo é sempre perfil */
      var semProtocolo = minusculo.replace(/^https?:\/\//, '').replace(/^www\./, '');
      var dominio = semProtocolo.replace(/[\/?#].*$/, '');
      var siteOficial = oficial.site.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/[\/?#].*$/, '');
      var ehInstagram = /^instagram\.com$/.test(dominio);
      var pareceSite = v.charAt(0) !== '@' && !ehInstagram && /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(dominio) &&
        (/^(https?:\/\/|www\.)/.test(minusculo) || /[\/?#]/.test(semProtocolo) || /\.(com|net|org|br|adv|jus|gov|app|site|online|info|io)$/.test(dominio));
      if (siteOficial && dominio === siteOficial && !ehInstagram && v.charAt(0) !== '@') {
        mostra('ok', 'Este é o site oficial da Borelli Advocacia.', 'O endereço ' + siteOficial + ' está na lista de canais oficiais.', false);
        return;
      }
      if (pareceSite) {
        mostra('nao', 'Este site não está na lista de canais oficiais.', 'Os canais oficiais da Borelli Advocacia são estes:', true);
        return;
      }
      /* perfil (@nome ou endereço do Instagram) */
      var perfil = /^@?([a-z0-9._]{2,30})$/.exec(minusculo.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/.*$/, ''));
      if (perfil && /[a-z]/.test(perfil[1]) && !/^\d+$/.test(perfil[1].replace(/\./g, ''))) {
        if (perfil[1] === oficial.instagram) mostra('ok', 'Este é o perfil oficial da Borelli Advocacia.', 'O perfil @' + oficial.instagram + ' está na lista de canais oficiais.', false);
        else mostra('nao', 'Este perfil não está na lista de canais oficiais.', 'Os canais oficiais da Borelli Advocacia são estes:', true);
        return;
      }
      /* número */
      var d = digitos(v);
      if (d.length < 10 || d.length > 11) {
        mostra('aviso', 'Confira o que você digitou.', 'Use o número com DDD, como (85) 99999-0000, um e-mail ou um perfil, como @nome.', false);
        return;
      }
      if (whatsappPendente) {
        mostra('aviso', 'A lista oficial de números será publicada aqui.', 'Até lá, confirme qualquer mensagem pelos canais oficiais já confirmados:', true);
        return;
      }
      if (d === digitos(oficial.whatsapp)) mostra('ok', 'Este é o WhatsApp oficial da Borelli Advocacia.', 'O número ' + oficial.whatsappTexto + ' está na lista de canais oficiais.', false);
      else mostra('nao', 'Este número não está na lista de canais oficiais.', 'Os canais oficiais da Borelli Advocacia são estes:', true);
    };
    form.addEventListener('submit', function (e) { e.preventDefault(); confere(); });
    raiz.classList.add('ferr-pronta');
  });
})();
