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
  function findProperty(code) {
    code = String(code || '').toUpperCase();
    return catalog().find(function (p) { return String(p.listingCode || p.code || '').toUpperCase() === code; }) || null;
  }
  function purposeFromType(type, property) {
    if (property && property.purpose) return property.purpose;
    type = String(type || '').toLowerCase();
    if (type.indexOf('owner') >= 0) return 'captacao_proprietario';
    if (type.indexOf('rent') >= 0 || type.indexOf('loc') >= 0) return 'locacao';
    if (type.indexOf('invest') >= 0) return 'investimento';
    return 'compra';
  }
  function leadId() {
    return 'site_' + Date.now() + '_' + Math.random().toString(16).slice(2, 8);
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
    if (!btn || !nav || btn.dataset.siteMenuReady === '1') return;
    btn.dataset.siteMenuReady = '1';
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('#main-nav a, #main-nav button').forEach(function (item) { item.addEventListener('click', function () { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }); });
  }

  function buildLeadPayload(form) {
    var name = ($('#lead-name', form) || {}).value || '';
    var phoneValue = ($('#lead-phone', form) || {}).value || '';
    var email = ($('#lead-email', form) || {}).value || '';
    var message = ($('#lead-message', form) || {}).value || '';
    var code = ($('#lead-listing-code', form) || {}).value || '';
    var title = ($('#lead-listing-title', form) || {}).value || '';
    var url = ($('#lead-listing-url', form) || {}).value || location.href;
    var type = ($('#lead-form-type', form) || {}).value || 'buyer';
    var scenario = ($('#lead-scenario', form) || {}).value || type;
    var property = findProperty(code);
    var purpose = purposeFromType(type, property);
    var cleanPhone = String(phoneValue || '').replace(/\D/g, '');
    var lead = {
      lead_id: leadId(),
      nome: name.trim(),
      name: name.trim(),
      telefone: phoneValue.trim(),
      phone: phoneValue.trim(),
      whatsapp: cleanPhone,
      email: email.trim(),
      mensagem: message.trim(),
      message: message.trim(),
      codigo_imovel: String(code || '').trim().toUpperCase(),
      property_code: String(code || '').trim().toUpperCase(),
      listing_code: String(code || '').trim().toUpperCase(),
      titulo_imovel: title.trim(),
      listing_title: title.trim(),
      property_title: title.trim(),
      url_imovel: url,
      property_url: url,
      listing_url: url,
      origem: 'site',
      origin: 'site',
      source: 'site_form',
      lead_source: 'site_form',
      canal_entrada: 'site',
      provider_hint: 'site_form',
      tipo_interesse: purpose,
      finalidade: purpose,
      form_type: type,
      demo_scenario: scenario,
      city: cfg.city || 'Joinville',
      cidade: cfg.city || 'Joinville',
      state: cfg.state || 'SC',
      business_name: businessName,
      consentimento: true,
      consent: true,
      lgpd_consent: true,
      __entry_source: 'site_form',
      __source_webhook: 'lais-imob-site-lead',
      created_at: new Date().toISOString()
    };
    if (property) {
      lead.bairro = property.neighborhood || '';
      lead.neighborhood = property.neighborhood || '';
      lead.tipo_imovel = property.category || '';
      lead.property_category = property.category || '';
      lead.valor = property.salePrice || property.rentValue || property.priceFrom || null;
      lead.price = lead.valor;
      lead.quartos = property.bedrooms || null;
      lead.bedrooms = property.bedrooms || null;
      lead.vagas = property.parkingSpots || null;
      lead.broker_name = property.responsibleBroker || (property.broker && property.broker.name) || '';
      lead.broker_phone = property.responsibleBrokerPhone || (property.broker && property.broker.whatsapp) || '';
    }
    return lead;
  }

  function crmPreview(payload, sentMode) {
    var intent = payload.tipo_interesse === 'captacao_proprietario' ? 'Captação de proprietário' : (payload.codigo_imovel ? 'Interesse em imóvel específico' : 'Busca ativa de imóvel');
    var rows = [
      ['Origem', 'Site / formulário'],
      ['Lead', payload.nome || 'Cliente'],
      ['WhatsApp', payload.telefone || payload.whatsapp || 'informado'],
      ['Intenção', intent],
      ['Imóvel', payload.codigo_imovel ? (payload.codigo_imovel + ' — ' + (payload.titulo_imovel || 'imóvel selecionado')) : 'a definir pela qualificação'],
      ['Destino', sentMode === 'webhook' ? 'Webhook n8n' : 'Modo demonstração + WhatsApp']
    ];
    return '<div class="automation-result-card"><strong>' + esc(cfg.demoResultTitle || 'Lead recebido pela automação') + '</strong><p>O fluxo agora tem contexto suficiente para qualificar, registrar e encaminhar o contato.</p><div class="crm-mini-table">' + rows.map(function (r) { return '<span>' + esc(r[0]) + '</span><b>' + esc(r[1]) + '</b>'; }).join('') + '</div><small>Na operação real, o corretor recebe o lead já organizado, com imóvel, origem, intenção e próxima ação sugerida.</small></div>';
  }

  function whatsappTextFromPayload(p) {
    return 'Novo lead vindo do site ' + businessName + '\n\n' +
      'Origem: Site integrado à automação\n' +
      'Nome: ' + (p.nome || '') + '\n' +
      'WhatsApp do cliente: ' + (p.telefone || '') + '\n' +
      (p.email ? 'E-mail: ' + p.email + '\n' : '') +
      'Interesse: ' + (p.tipo_interesse || p.form_type || 'atendimento') + '\n' +
      (p.codigo_imovel ? 'Código do imóvel: ' + p.codigo_imovel + '\n' : '') +
      (p.titulo_imovel ? 'Imóvel: ' + p.titulo_imovel + '\n' : '') +
      (p.url_imovel ? 'Página: ' + p.url_imovel + '\n' : '') +
      '\nMensagem do cliente:\n' + (p.mensagem || '');
  }

  function endpointUrl() {
    return String(cfg.webhookUrl || cfg.n8nSiteWebhookUrl || '').trim();
  }

  function sendToWebhook(payload) {
    var url = endpointUrl();
    if (!cfg.useWebhook || !url) {
      return Promise.resolve({ ok: false, skipped: true, reason: 'webhook_not_configured' });
    }
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      return { ok: res.ok, status: res.status, response: res };
    });
  }

  function setupModal() {
    var dialog = $('#lead-modal'); var form = $('#lead-form');
    if (!dialog || !form) return;
    var close = $('.modal-close', dialog);
    if (close) close.addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });

    function ensureHidden(id, name) {
      var el = $('#' + id, form);
      if (!el) {
        el = document.createElement('input');
        el.type = 'hidden';
        el.id = id;
        el.name = name || id;
        form.insertBefore(el, form.firstChild);
      }
      return el;
    }
    ensureHidden('lead-scenario', 'lead_scenario');

    function openLead(options) {
      options = options || {};
      $('#lead-modal-title').textContent = options.title || 'Conte o que você procura';
      $('#lead-modal-description').textContent = options.description || 'Preencha seus dados para iniciar a automação de atendimento.';
      $('#lead-listing-code').value = options.code || '';
      $('#lead-listing-title').value = options.propertyTitle || '';
      $('#lead-listing-url').value = options.url || location.href;
      $('#lead-form-type').value = options.type || 'buyer';
      $('#lead-scenario').value = options.scenario || options.type || 'buyer';
      var msg = $('#lead-message');
      if (msg) msg.value = options.message || '';
      var feedback = $('#lead-feedback'); if (feedback) { feedback.className = 'form-feedback hidden'; feedback.textContent = ''; }
      $$('.field-error', form).forEach(function (e) { e.textContent = ''; });
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', 'open');
    }

    window.openLeadModal = openLead;

    $$('.open-generic-lead').forEach(function (btn) {
      btn.addEventListener('click', function () { openLead({ type: 'buyer', scenario: 'busca_imovel', title: 'Buscar imóvel com atendimento automático', description: 'A automação coleta o perfil e entrega o lead qualificado para a imobiliária.', message: 'Olá, estou procurando um imóvel e gostaria de receber opções compatíveis.' }); });
    });
    $$('.open-owner-lead').forEach(function (btn) {
      btn.addEventListener('click', function () { openLead({ title: 'Cadastrar imóvel para avaliação', description: 'A automação coleta os dados iniciais e encaminha o proprietário para captação.', type: 'owner', scenario: 'captacao_proprietario', message: 'Olá, tenho um imóvel e gostaria de avaliar para venda ou locação.' }); });
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

      var submit = $('#lead-submit');
      var label = $('.button-label', submit || document); var loading = $('.button-loading', submit || document);
      if (submit) submit.disabled = true;
      if (label) label.classList.add('hidden');
      if (loading) loading.classList.remove('hidden');

      var payload = buildLeadPayload(form);
      var fallbackText = whatsappTextFromPayload(payload);
      sendToWebhook(payload).then(function (result) {
        if (feedback) {
          feedback.className = 'form-feedback success';
          feedback.innerHTML = crmPreview(payload, result && result.ok ? 'webhook' : 'demo');
        }
        if (!result || !result.ok) {
          window.open(buildWhatsappUrl(fallbackText), '_blank', 'noopener');
        }
      }).catch(function () {
        window.open(buildWhatsappUrl(fallbackText), '_blank', 'noopener');
        if (feedback) { feedback.className = 'form-feedback success'; feedback.innerHTML = crmPreview(payload, 'demo'); }
      }).finally(function () {
        if (submit) submit.disabled = false;
        if (label) label.classList.remove('hidden');
        if (loading) loading.classList.add('hidden');
      });
    });
  }

  window.ImobUtils = { $, $$, esc, normalize, money, purposeLabel, propertyPrice, imgPath, catalog, buildWhatsappUrl, buildLeadPayload: buildLeadPayload };
  document.addEventListener('DOMContentLoaded', function () { applyConfig(); setupMenu(); setupModal(); });
})();
