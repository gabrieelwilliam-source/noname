(function () {
  'use strict';
  var cfg = window.SITE_CONFIG || {};
  var businessName = cfg.businessName || 'Horizonte Prime Imóveis';
  var phone = String(cfg.whatsappNumber || '5547999762742').replace(/\D/g, '');

  function $(selector, root) { return (root || document).querySelector(selector); }
  function $$(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function normalize(v) { return String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function money(v) { return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); }
  function purposeLabel(p) { p = String(p || '').toLowerCase(); return p === 'locacao' ? 'Aluguel' : p === 'investimento' ? 'Investimento' : 'Venda'; }
  function propertyPrice(p) { return p && p.purpose === 'locacao' ? money(p.rentValue || p.priceFrom) + '/mês' : money((p && (p.salePrice || p.priceFrom)) || 0); }
  function imgPath(v) {
    v = String(v || '').trim();
    var m = v.match(/(?:^|\/)(?:demo\/imoveis|assets)\/([^/?#]+\.(?:jpg|jpeg|png|webp|svg))/i);
    return m ? m[1] : v;
  }
  function catalog() {
    var arr = window.DEMO_PROPERTIES || window.PROPERTIES || window.DEMO_CATALOG || (window.IMOB_DEMO_DATA && (window.IMOB_DEMO_DATA.properties || window.IMOB_DEMO_DATA.listings)) || [];
    return Array.isArray(arr) ? arr.slice() : [];
  }
  function buildWhatsappUrl(message) {
    return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message || 'Olá, gostaria de atendimento imobiliário.');
  }
  function defaultMessage() {
    return 'Olá, vim pelo site da ' + businessName + ' e gostaria de atendimento.';
  }

  function applyConfig() {
    $$('[data-business-name]').forEach(function (el) { el.textContent = cfg.businessShortName || businessName; });
    $$('[data-site-address]').forEach(function (el) { el.textContent = cfg.address || 'Joinville - SC'; });
    $$('[data-site-hours]').forEach(function (el) { el.textContent = cfg.openingHours || 'Segunda a sábado'; });
    $$('[data-whatsapp-link]').forEach(function (el) { el.setAttribute('href', buildWhatsappUrl(defaultMessage())); el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener'); });
    var year = $('#current-year'); if (year) year.textContent = new Date().getFullYear();
  }

  function setupMenu() {
    var btn = $('.menu-toggle'); var nav = $('#main-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('#main-nav a, #main-nav button').forEach(function (item) { item.addEventListener('click', function () { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }); });
  }

  function setupModal() {
    var dialog = $('#lead-modal'); var form = $('#lead-form');
    if (!dialog || !form) return;
    var close = $('.modal-close', dialog);
    if (close) close.addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });

    function openLead(options) {
      options = options || {};
      $('#lead-modal-title').textContent = options.title || 'Conte o que você procura';
      $('#lead-modal-description').textContent = options.description || 'Preencha seus dados para iniciar o atendimento pelo WhatsApp comercial.';
      $('#lead-listing-code').value = options.code || '';
      $('#lead-listing-title').value = options.propertyTitle || '';
      $('#lead-listing-url').value = options.url || location.href;
      $('#lead-form-type').value = options.type || 'buyer';
      var msg = $('#lead-message');
      if (msg && options.message) msg.value = options.message;
      var feedback = $('#lead-feedback'); if (feedback) { feedback.className = 'form-feedback hidden'; feedback.textContent = ''; }
      $$('.field-error', form).forEach(function (e) { e.textContent = ''; });
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', 'open');
    }

    window.openLeadModal = openLead;

    $$('.open-generic-lead').forEach(function (btn) {
      btn.addEventListener('click', function () { openLead({ type: 'buyer', message: 'Olá, estou procurando um imóvel e gostaria de receber opções compatíveis.' }); });
    });
    $$('.open-owner-lead').forEach(function (btn) {
      btn.addEventListener('click', function () { openLead({ title: 'Cadastre seu imóvel', description: 'Envie os dados iniciais para avaliação comercial.', type: 'owner', message: 'Olá, tenho um imóvel e gostaria de avaliar para venda ou locação.' }); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = {
        name: $('#lead-name'), phone: $('#lead-phone'), email: $('#lead-email'), message: $('#lead-message'), consent: $('#lead-consent')
      };
      var ok = true;
      function setError(input, msg) { var holder = input && input.closest('.form-field'); var small = holder && $('.field-error', holder); if (small) small.textContent = msg || ''; }
      ['name', 'phone', 'message'].forEach(function (key) { setError(fields[key], ''); if (!fields[key].value.trim()) { setError(fields[key], 'Campo obrigatório.'); ok = false; } });
      if (!fields.consent.checked) ok = false;
      var feedback = $('#lead-feedback');
      if (!ok) { if (feedback) { feedback.className = 'form-feedback error'; feedback.textContent = 'Confira os campos obrigatórios e aceite o contato pelo WhatsApp.'; } return; }

      var code = $('#lead-listing-code').value.trim();
      var title = $('#lead-listing-title').value.trim();
      var type = $('#lead-form-type').value.trim();
      var url = $('#lead-listing-url').value.trim();
      var text = 'Novo contato pelo site ' + businessName + '\n\n' +
        'Tipo: ' + (type === 'owner' ? 'Cadastro de proprietário' : code ? 'Interesse em imóvel' : 'Busca de imóvel') + '\n' +
        'Nome: ' + fields.name.value.trim() + '\n' +
        'WhatsApp do cliente: ' + fields.phone.value.trim() + '\n' +
        (fields.email.value.trim() ? 'E-mail: ' + fields.email.value.trim() + '\n' : '') +
        (code ? 'Código do imóvel: ' + code + '\n' : '') +
        (title ? 'Imóvel: ' + title + '\n' : '') +
        (url ? 'Página: ' + url + '\n' : '') +
        '\nMensagem do cliente:\n' + fields.message.value.trim();

      if (cfg.useWebhook && cfg.webhookUrl) {
        fetch(cfg.webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: fields.name.value.trim(), phone: fields.phone.value.trim(), email: fields.email.value.trim(), message: fields.message.value.trim(), listingCode: code, listingTitle: title, url: url, type: type }) })
          .then(function () { if (feedback) { feedback.className = 'form-feedback success'; feedback.textContent = 'Mensagem enviada. O atendimento entrará em contato.'; } })
          .catch(function () { window.open(buildWhatsappUrl(text), '_blank', 'noopener'); if (feedback) { feedback.className = 'form-feedback success'; feedback.textContent = 'Abrimos o WhatsApp com sua mensagem pronta.'; } });
      } else {
        window.open(buildWhatsappUrl(text), '_blank', 'noopener');
        if (feedback) { feedback.className = 'form-feedback success'; feedback.textContent = 'Pronto! O WhatsApp comercial foi aberto com a mensagem.'; }
      }
    });
  }

  window.ImobUtils = { $, $$, esc, normalize, money, purposeLabel, propertyPrice, imgPath, catalog, buildWhatsappUrl };
  document.addEventListener('DOMContentLoaded', function () { applyConfig(); setupMenu(); setupModal(); });
})();
