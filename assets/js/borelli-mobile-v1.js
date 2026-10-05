/* Arquivo do Mobile System v1 da Borelli: o conteúdo do <script data-borelli-responsive="v1">
   copiado sem mudança do brand book (brand-book.html, linhas 19060 a 19126). Não edite aqui.
   O <head> do site carrega este arquivo com o atributo data-borelli-responsive="v1". */
/* Mobile System v1 da Borelli (copie literal, não reescreva).
   1. Tabela de consulta (table.consulta): cada célula ganha data-label com o texto do
      cabeçalho; no celular (até 640 px) cada linha vira um cartão e a primeira célula vira
      o título. Tabela sem cabeçalho e com duas colunas vira chave e valor.
   2. Matriz (.table-wrap.matriz), carrossel e fita: rolagem local visível, tabindex="0",
      rótulo acessível e a dica "Deslize para ver..." logo acima (herda as classes mt-*).
   Não esconde o estouro lateral da página: cada contêiner cuida do seu.
   window.borelliMobile(raiz) roda de novo sobre conteúdo criado depois. */
(function(){
  var seta = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
  function todos(raiz, sel){
    var lista = Array.prototype.slice.call(raiz.querySelectorAll ? raiz.querySelectorAll(sel) : []);
    if (raiz.matches && raiz.matches(sel)) lista.unshift(raiz);
    return lista;
  }
  function dica(el, texto){
    var antes = el.previousElementSibling;
    if (antes && antes.classList.contains('matriz-dica')) return;
    var d = document.createElement('p');
    d.className = 'matriz-dica';
    Array.prototype.forEach.call(el.classList, function(c){ if (/^mt-\d$/.test(c)) d.classList.add(c); });
    d.innerHTML = texto + ' ' + seta;
    el.parentNode.insertBefore(d, el);
  }
  function rolagem(el, rotulo){
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    if (!el.hasAttribute('role')) el.setAttribute('role', 'region');
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', rotulo);
  }
  function borelliMobile(raiz){
    raiz = raiz || document;
    todos(raiz, 'table.consulta').forEach(function(tabela){
      if (tabela.closest('.table-wrap.matriz') || tabela.__borelli) return;
      tabela.__borelli = 1;
      var cab = Array.prototype.map.call(tabela.querySelectorAll('thead th'), function(th, i){
        return th.textContent.replace(/\s+/g, ' ').trim() || ('Coluna ' + (i + 1));
      });
      var linhas = Array.prototype.slice.call(tabela.querySelectorAll('tbody tr'));
      if (!cab.length) {
        var chaveValor = linhas.length && linhas.every(function(tr){ return tr.querySelectorAll(':scope > td, :scope > th').length === 2; });
        if (chaveValor) tabela.classList.add('vira-cartao', 'chave-valor');
        return;
      }
      tabela.classList.add('vira-cartao');
      linhas.forEach(function(tr){
        var i = 0;
        Array.prototype.forEach.call(tr.children, function(celula){
          if (!celula.matches('td, th')) return;
          if (!celula.hasAttribute('data-label')) celula.setAttribute('data-label', cab[i] || 'Informação');
          i += Number(celula.getAttribute('colspan') || 1);
        });
      });
    });
    todos(raiz, '.table-wrap.matriz').forEach(function(wrap){
      var cap = wrap.querySelector('caption');
      rolagem(wrap, cap ? cap.textContent.trim() : 'Tabela com rolagem lateral');
      dica(wrap, 'Deslize para ver a tabela inteira');
    });
    todos(raiz, '.carrossel, .fita').forEach(function(faixa){
      rolagem(faixa, faixa.getAttribute('data-rotulo') || (faixa.classList.contains('fita') ? 'Quadros do vídeo, com rolagem lateral' : 'Lâminas do carrossel, com rolagem lateral'));
      dica(faixa, faixa.classList.contains('fita') ? 'Deslize para ver todos os quadros' : 'Deslize para ver todas as lâminas');
    });
  }
  window.borelliMobile = borelliMobile;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ borelliMobile(document); });
  else borelliMobile(document);
})();
