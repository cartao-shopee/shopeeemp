(function () {
  // manda pro ping.php que está na mesma pasta deste script, no domínio x
  var END = new URL('ping.php', document.currentScript.src).href;

  function rid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
  var sid;
  try { sid = localStorage.getItem('_lv_sid') || rid(); localStorage.setItem('_lv_sid', sid); } catch (e) { sid = rid(); }

  var last = null;
  function ping() {
    var slug = location.pathname, view = slug !== last;
    last = slug;
    // text/plain evita o preflight de CORS
    fetch(END, {
      method: 'POST', keepalive: true, headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ sid: sid, domain: location.hostname, slug: slug, view: view })
    }).catch(function () {});
  }

  ping();
  setInterval(ping, 30000); // "ao vivo" = sinal nos últimos 90s
  addEventListener('popstate', ping);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) ping(); });
})();
