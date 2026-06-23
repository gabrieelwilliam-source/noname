(function () {
  'use strict';
  var cfg = window.SITE_CONFIG || {};
  var phone = String(cfg.whatsappNumber || '5547999762742').replace(/\D/g, '');
  var message = cfg.salesWhatsappMessage || 'Olá, vi a demonstração da automação para imobiliárias e quero entender como isso funcionaria na minha imobiliária.';
  var url = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message);
  document.querySelectorAll('.sales-whatsapp').forEach(function (el) {
    el.setAttribute('href', url);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });
  var year = document.getElementById('current-year');
  if (year) year.textContent = new Date().getFullYear();
  var btn = document.querySelector('.menu-toggle');
  var nav = document.getElementById('main-nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
})();
