// Correção automática dos caminhos de imagem do site imobiliário.
// Coloque este arquivo na raiz do projeto, junto com index.html e imovel.html.
// Ele corrige caminhos como /demo/imoveis/NOME.jpg e assets/NOME.jpg para NOME.jpg.
(function () {
  function corrigirCaminhoImagem(valor) {
    if (!valor || typeof valor !== 'string') return valor;

    var texto = valor.trim();

    // Não altera imagens externas.
    if (/^https?:\/\//i.test(texto) && !/\/demo\/imoveis\//i.test(texto) && !/\/assets\//i.test(texto)) {
      return valor;
    }

    var partes = texto.match(/(?:^|\/)(?:demo\/imoveis|assets)\/([^/?#]+\.(?:jpg|jpeg|png|webp|svg))(?:[?#].*)?$/i);
    if (partes && partes[1]) return partes[1];

    return valor;
  }

  function corrigirObjeto(objeto, visitados) {
    if (!objeto || typeof objeto !== 'object') return;
    visitados = visitados || new WeakSet();
    if (visitados.has(objeto)) return;
    visitados.add(objeto);

    if (Array.isArray(objeto)) {
      objeto.forEach(function (item) { corrigirObjeto(item, visitados); });
      return;
    }

    Object.keys(objeto).forEach(function (chave) {
      var valor = objeto[chave];
      if (typeof valor === 'string') {
        objeto[chave] = corrigirCaminhoImagem(valor);
      } else if (valor && typeof valor === 'object') {
        corrigirObjeto(valor, visitados);
      }
    });
  }

  function corrigirDadosGlobais() {
    [
      'DEMO_PROPERTIES',
      'DEMO_PROPERTIES_BY_CODE',
      'DEMO_DATA',
      'DEMO_CATALOG',
      'PROPERTY_DATA',
      'PROPERTIES',
      'IMOB_DEMO_DATA',
      '__IMOB_DEMO__'
    ].forEach(function (nome) {
      try {
        if (window[nome]) corrigirObjeto(window[nome]);
      } catch (erro) {}
    });
  }

  function corrigirImagemNoHtml(img) {
    if (!img || !img.getAttribute) return;

    var srcOriginal = img.getAttribute('src') || '';
    var srcCorrigido = corrigirCaminhoImagem(srcOriginal || img.src || '');
    if (srcCorrigido && srcCorrigido !== srcOriginal) img.setAttribute('src', srcCorrigido);

    var srcsetOriginal = img.getAttribute('srcset') || '';
    if (srcsetOriginal) {
      var srcsetCorrigido = srcsetOriginal.replace(/(?:^|\s|,)(?:\/?demo\/imoveis\/|\/?assets\/)([^\s,]+\.(?:jpg|jpeg|png|webp|svg))/gi, function (match, nomeArquivo) {
        var prefixo = match.charAt(0) === ',' ? ', ' : match.charAt(0) === ' ' ? ' ' : '';
        return prefixo + nomeArquivo;
      });
      if (srcsetCorrigido !== srcsetOriginal) img.setAttribute('srcset', srcsetCorrigido);
    }
  }

  function corrigirTodasAsImagens() {
    document.querySelectorAll('img').forEach(corrigirImagemNoHtml);
  }

  corrigirDadosGlobais();

  document.addEventListener('error', function (evento) {
    if (evento.target && evento.target.tagName === 'IMG') corrigirImagemNoHtml(evento.target);
  }, true);

  document.addEventListener('DOMContentLoaded', function () {
    corrigirDadosGlobais();
    corrigirTodasAsImagens();
  });

  window.addEventListener('load', function () {
    corrigirDadosGlobais();
    corrigirTodasAsImagens();
  });

  // Alguns cards são montados depois por JavaScript; observa novas imagens.
  try {
    var observer = new MutationObserver(function () {
      corrigirDadosGlobais();
      corrigirTodasAsImagens();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  } catch (erro) {}
})();
