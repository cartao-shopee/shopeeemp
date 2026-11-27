/* ============================================================
   PERSISTENCIA UNIVERSAL DE PARAMETROS DE URL (UTMs, xcod, sck,
   fbclid, gclid, click IDs e qualquer coisa que a rede de trafego
   mandar). Preserva TUDO do inicio do funil ate o checkout.
   ============================================================ */
(function () {
  var STORE_KEY = 'funnelParams';

  // Chaves de dados do usuario que tambem queremos propagar quando existirem
  var USER_KEYS = ['nome', 'name', 'cpf', 'document', 'email', 'telephone', 'phone'];

  function readStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (e) { return {}; }
  }

  function writeStore(obj) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(obj)); } catch (e) {}
    // Mantem compatibilidade com paginas antigas que leem 'urlParams'
    try { localStorage.setItem('urlParams', JSON.stringify(obj)); } catch (e) {}
  }

  // 1) Mescla os params da URL atual dentro do store (valores novos vencem)
  function capture() {
    var store = readStore();
    var current = new URLSearchParams(window.location.search);
    current.forEach(function (value, key) {
      if (value !== '' && value != null) store[key] = value;
    });
    // Puxa dados de usuario salvos avulsos, se ainda nao estiverem no store
    USER_KEYS.forEach(function (k) {
      if (!store[k]) {
        var v = localStorage.getItem(k);
        if (v) store[k] = v;
      }
    });
    writeStore(store);
    return store;
  }

  // 2) Retorna todos os params (URL atual mesclada com o que esta salvo)
  function getParams() {
    return capture();
  }

  // 3) Anexa todos os params a qualquer URL (sem duplicar chaves)
  function appendParams(baseUrl) {
    var params = getParams();
    var url = new URL(baseUrl, window.location.href);
    Object.keys(params).forEach(function (key) {
      if (params[key] !== '' && params[key] != null) {
        url.searchParams.set(key, params[key]);
      }
    });
    return url.toString();
  }

  // 4) Redireciona para o checkout ja com todos os params
  function checkoutRedirect(baseUrl) {
    window.location.href = appendParams(baseUrl);
  }

  // Captura assim que o script carrega
  capture();

  // Expoe globalmente
  window.funnelParams = {
    get: getParams,
    append: appendParams,
    checkout: checkoutRedirect
  };
  window.appendFunnelParams = appendParams;
  window.checkoutRedirect = checkoutRedirect;

  // 5) Decora automaticamente qualquer link/botao de checkout no DOM
  function decorate() {
    var CHECKOUT_HOSTS = /checkout\.|pay\.|finalizarliberacao|creditoparavoce|liberarcreditodigital/i;
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href && CHECKOUT_HOSTS.test(href) && /^https?:/i.test(href)) {
        a.setAttribute('href', appendParams(href));
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', decorate);
  } else {
    decorate();
  }
})();
