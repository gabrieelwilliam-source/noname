(function () {
  'use strict';

  var PHONE = '5547988927391';
  var cfg = window.SITE_CONFIG || {};
  if (cfg.whatsappNumber) PHONE = String(cfg.whatsappNumber).replace(/\D/g, '') || PHONE;

  function $(selector, root) { return (root || document).querySelector(selector); }
  function $$(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function normalize(v) { return String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function money(v) { return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); }
  function catalog() {
    var arr = window.DEMO_PROPERTIES || window.PROPERTIES || window.DEMO_CATALOG || (window.IMOB_DEMO_DATA && (window.IMOB_DEMO_DATA.properties || window.IMOB_DEMO_DATA.listings)) || [];
    return Array.isArray(arr) ? arr : [];
  }
  function codeOf(p) { return String((p && (p.listingCode || p.code || p.listing_code)) || '').toUpperCase(); }
  function byCode(code) { code = String(code || '').toUpperCase(); return catalog().find(function (p) { return codeOf(p) === code; }); }
  function imgPath(v) {
    v = String(v || '').trim();
    var m = v.match(/(?:^|\/)(?:demo\/imoveis|assets)\/([^/?#]+\.(?:jpg|jpeg|png|webp|svg))/i);
    return (m && m[1]) ? m[1] : (v.replace(/^\/+/, '') || 'property-fallback.jpg');
  }
  function purposeLabel(value) {
    value = String(value || '').toLowerCase();
    return value === 'locacao' ? 'Aluguel' : value === 'investimento' ? 'Investimento' : 'Venda';
  }
  function priceOf(p) { return Number((p && (p.priceFrom || p.salePrice || p.rentValue || p.price)) || 0); }
  function priceLabel(p) { return p && p.purpose === 'locacao' ? money(p.rentValue || p.priceFrom) + '/mês' : money(p.salePrice || p.priceFrom); }
  function urlOf(p) { return (p && (p.listingUrl || ('imovel.html?codigo=' + encodeURIComponent(codeOf(p))))) || '#catalogo'; }
  function imageOf(p) { return imgPath((p && (p.imageUrl || (p.images && p.images[0] && (p.images[0].url || p.images[0].imageUrl))))) || 'property-fallback.jpg'; }
  function whatsappUrl(text) { return 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(text || 'Olá, gostaria de atendimento imobiliário.'); }

  var state = {
    query: '', purpose: '', category: '', neighborhood: '', bedrooms: '', parking: '', price: '', pet: false, sort: 'featured'
  };

  function readFilters() {
    state.query = ($('#filter-query') || {}).value || '';
    state.purpose = ($('#filter-purpose') || {}).value || '';
    state.category = ($('#filter-category') || {}).value || '';
    state.neighborhood = ($('#filter-neighborhood') || {}).value || '';
    state.bedrooms = ($('#filter-bedrooms') || {}).value || '';
    state.parking = ($('#filter-parking') || {}).value || '';
    state.price = ($('#filter-price') || {}).value || '';
    state.pet = !!(($('#filter-pet') || {}).checked);
    state.sort = ($('#sort-properties') || {}).value || 'featured';
  }

  function matches(p) {
    var hay = normalize([p.title, p.neighborhood, p.city, p.stateCode, codeOf(p), p.category, p.purpose, p.description, p.highlight, (p.amenities || []).join(' ')].join(' '));
    if (state.query && hay.indexOf(normalize(state.query)) < 0) return false;
    if (state.purpose && p.purpose !== state.purpose) return false;
    if (state.category && p.category !== state.category) return false;
    if (state.neighborhood && p.neighborhood !== state.neighborhood) return false;
    if (state.bedrooms && Number(p.bedrooms || 0) < Number(state.bedrooms)) return false;
    if (state.parking && Number(p.parkingSpots || p.parking_spots || 0) < Number(state.parking)) return false;
    if (state.price && priceOf(p) > Number(state.price)) return false;
    if (state.pet && !p.acceptsPet) return false;
    return true;
  }

  function sortList(list) {
    return list.slice().sort(function (a, b) {
      if (state.sort === 'price-asc') return priceOf(a) - priceOf(b);
      if (state.sort === 'price-desc') return priceOf(b) - priceOf(a);
      if (state.sort === 'area-desc') return Number(b.areaM2 || b.area_m2 || 0) - Number(a.areaM2 || a.area_m2 || 0);
      return Number(!!b.isFeatured) - Number(!!a.isFeatured) || priceOf(b) - priceOf(a);
    });
  }

  function card(p) {
    var code = codeOf(p);
    var url = urlOf(p);
    var features = [
      (p.bedrooms || 0) + ' quartos',
      (p.bathrooms || 0) + ' banh.',
      (p.parkingSpots || p.parking_spots || 0) + ' vagas',
      (p.areaM2 || p.area_m2 || 0) + 'm²'
    ];
    return '' +
      '<article class="property-card" data-code="' + esc(code) + '">' +
        '<a class="property-image" href="' + esc(url) + '" aria-label="Ver detalhes de ' + esc(p.title || 'imóvel') + '">' +
          '<img src="' + esc(imageOf(p)) + '" alt="' + esc(p.title || 'Foto do imóvel') + '" loading="lazy" onerror="this.onerror=null;this.src=\'property-fallback.jpg\'">' +
          '<div class="badge-stack"><span class="badge badge-dark">' + esc(purposeLabel(p.purpose)) + '</span>' + (p.isFeatured ? '<span class="badge badge-soft">Destaque</span>' : '') + '</div>' +
        '</a>' +
        '<div class="card-content">' +
          '<h3><a href="' + esc(url) + '">' + esc(p.title || 'Imóvel disponível') + '</a></h3>' +
          '<div class="card-location">' + esc([p.neighborhood, p.city, p.stateCode].filter(Boolean).join(', ').replace(', SC', ' - SC')) + '</div>' +
          '<div class="card-price">' + esc(priceLabel(p)) + '<small> ' + (p.purpose === 'locacao' ? 'locação' : 'venda') + '</small></div>' +
          '<div class="card-stats">' + features.map(function (f) { var parts = String(f).split(' '); return '<span><strong>' + esc(parts.shift() || '') + '</strong> ' + esc(parts.join(' ')) + '</span>'; }).join('') + '</div>' +
          '<div class="card-actions"><a class="button button-secondary" href="' + esc(url) + '">Ver detalhes</a><button class="button button-primary interest-btn" type="button" data-code="' + esc(code) + '">Tenho interesse</button></div>' +
        '</div>' +
      '</article>';
  }

  function fillNeighborhoods() {
    var select = $('#filter-neighborhood');
    if (!select || select.dataset.clickFixFilled === '1') return;
    var current = select.value;
    var names = Array.from(new Set(catalog().map(function (p) { return p.neighborhood; }).filter(Boolean))).sort();
    select.innerHTML = '<option value="">Todos os bairros</option>' + names.map(function (n) { return '<option value="' + esc(n) + '">' + esc(n) + '</option>'; }).join('');
    select.value = current;
    select.dataset.clickFixFilled = '1';
  }

  function renderStats() {
    var list = catalog();
    if ($('#stat-total')) $('#stat-total').textContent = list.length;
    if ($('#stat-sale')) $('#stat-sale').textContent = list.filter(function (p) { return p.purpose === 'compra' || p.purpose === 'investimento'; }).length;
    if ($('#stat-rent')) $('#stat-rent').textContent = list.filter(function (p) { return p.purpose === 'locacao'; }).length;
  }

  function renderFeatured() {
    var root = $('#featured-grid');
    if (!root) return;
    var list = catalog().filter(function (p) { return p.isFeatured; }).slice(0, 3);
    if (!list.length) list = catalog().slice(0, 3);
    root.innerHTML = list.map(card).join('');
  }

  function renderCatalog() {
    var root = $('#catalog-grid');
    var empty = $('#catalog-empty');
    var summary = $('#catalog-summary');
    if (!root) return;
    fillNeighborhoods();
    readFilters();
    var list = sortList(catalog().filter(matches));
    root.innerHTML = list.map(card).join('');
    if (summary) summary.textContent = list.length + ' ' + (list.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados') + ' em Joinville.';
    if (empty) empty.classList.toggle('hidden', list.length > 0);
    renderChips();
  }

  function renderChips() {
    var root = $('#active-filters');
    if (!root) return;
    var chips = [];
    if (state.query) chips.push('Busca: ' + state.query);
    if (state.purpose) chips.push(purposeLabel(state.purpose));
    if (state.category) chips.push(state.category);
    if (state.neighborhood) chips.push(state.neighborhood);
    if (state.bedrooms) chips.push(state.bedrooms + '+ quartos');
    if (state.parking) chips.push(state.parking + '+ vagas');
    if (state.price) chips.push('Até ' + money(state.price));
    if (state.pet) chips.push('Aceita animais');
    root.innerHTML = chips.map(function (c) { return '<span class="filter-chip">' + esc(c) + '</span>'; }).join('');
  }

  function setControl(id, value) {
    var el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = !!value; else el.value = value || '';
  }

  function openLead(options) {
    options = options || {};
    if (typeof window.openLeadModal === 'function') {
      window.openLeadModal(options);
      return;
    }
    var title = options.propertyTitle || options.title || '';
    var msg = options.message || ('Olá, gostaria de atendimento imobiliário.' + (title ? '\nImóvel: ' + title : ''));
    window.open(whatsappUrl(msg), '_blank', 'noopener');
  }

  function setupEvents() {
    document.addEventListener('click', function (e) {
      var navToggle = e.target.closest && e.target.closest('.menu-toggle');
      if (navToggle) {
        var nav = $('#main-nav');
        if (nav) {
          var open = nav.classList.toggle('open');
          navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
        return;
      }

      var anchor = e.target.closest && e.target.closest('a[href^="#"]');
      if (anchor && anchor.getAttribute('href') !== '#') {
        var target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', anchor.getAttribute('href'));
        }
      }

      var generic = e.target.closest && e.target.closest('.open-generic-lead');
      if (generic) {
        e.preventDefault();
        openLead({ type: 'buyer', title: 'Conte o que você procura', description: 'Preencha seus dados para iniciar o atendimento pelo WhatsApp comercial.', message: 'Olá, estou procurando um imóvel e gostaria de receber opções compatíveis.' });
        return;
      }

      var owner = e.target.closest && e.target.closest('.open-owner-lead');
      if (owner) {
        e.preventDefault();
        openLead({ type: 'owner', title: 'Cadastre seu imóvel', description: 'Envie os dados iniciais para avaliação comercial.', message: 'Olá, tenho um imóvel e gostaria de avaliar para venda ou locação.' });
        return;
      }

      var interest = e.target.closest && e.target.closest('.interest-btn,[data-interest-code]');
      if (interest) {
        e.preventDefault();
        e.stopPropagation();
        var p = byCode(interest.getAttribute('data-code') || interest.getAttribute('data-interest-code'));
        var code = p ? codeOf(p) : (interest.getAttribute('data-code') || '');
        openLead({ type: 'property', code: code, propertyTitle: p ? p.title : '', url: p ? new URL(urlOf(p), location.href).href : location.href, title: 'Tenho interesse neste imóvel', description: (p ? p.title : 'Imóvel selecionado') + (code ? ' • Código ' + code : ''), message: 'Olá, tenho interesse no imóvel ' + code + (p ? ' - ' + p.title : '') + '. Gostaria de mais informações.' });
        return;
      }

      var clear = e.target.closest && e.target.closest('.clear-filters');
      if (clear) {
        e.preventDefault();
        ['filter-query', 'filter-purpose', 'filter-category', 'filter-neighborhood', 'filter-bedrooms', 'filter-parking', 'filter-price'].forEach(function (id) { setControl(id, ''); });
        setControl('filter-pet', false);
        readFilters(); renderCatalog();
        return;
      }

      var toggle = e.target.closest && e.target.closest('.filter-toggle');
      if (toggle) {
        var panel = $('#catalog-filters');
        if (panel) {
          var opened = panel.classList.toggle('open');
          toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        }
      }

      var footerPurpose = e.target.closest && e.target.closest('[data-footer-purpose]');
      if (footerPurpose) {
        setControl('filter-purpose', footerPurpose.getAttribute('data-footer-purpose') || '');
        renderCatalog();
      }
    }, false);

    document.addEventListener('input', function (e) {
      if (e.target && e.target.id === 'filter-query') renderCatalog();
    });
    document.addEventListener('change', function (e) {
      if (e.target && (/^filter-/.test(e.target.id || '') || e.target.id === 'sort-properties')) renderCatalog();
    });

    var hero = $('#hero-search-form');
    if (hero && hero.dataset.clickFixForm !== '1') {
      hero.dataset.clickFixForm = '1';
      var purpose = '';
      $$('.search-tab', hero).forEach(function (tab) {
        tab.addEventListener('click', function () {
          purpose = tab.getAttribute('data-purpose') || '';
          $$('.search-tab', hero).forEach(function (t) { t.classList.toggle('active', t === tab); t.setAttribute('aria-selected', t === tab ? 'true' : 'false'); });
        });
      });
      hero.addEventListener('submit', function (e) {
        e.preventDefault();
        setControl('filter-query', ($('#hero-query') || {}).value || '');
        setControl('filter-category', ($('#hero-category') || {}).value || '');
        setControl('filter-purpose', purpose);
        renderCatalog();
        var catalogSection = $('#catalogo');
        if (catalogSection) catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    $$('.smart-profile-grid button,[data-smart-profile]').forEach(function (btn) {
      if (btn.dataset.clickFixProfile === '1') return;
      btn.dataset.clickFixProfile = '1';
      btn.addEventListener('click', function () {
        var profile = btn.getAttribute('data-smart-profile') || '';
        var presets = {
          familia: { purpose: 'compra', bedrooms: '3', parking: '2', price: '' },
          aluguel: { purpose: 'locacao', bedrooms: '2', parking: '1', price: '4000' },
          investimento: { purpose: 'investimento', bedrooms: '', parking: '', price: '600000' },
          pet: { purpose: '', bedrooms: '', parking: '', price: '', pet: true },
          premium: { purpose: 'compra', bedrooms: '3', parking: '2', price: '1500000' }
        };
        var p = presets[profile] || {};
        setControl('filter-purpose', p.purpose || '');
        setControl('filter-bedrooms', p.bedrooms || '');
        setControl('filter-parking', p.parking || '');
        setControl('filter-price', p.price || '');
        setControl('filter-pet', !!p.pet);
        renderCatalog();
        var catalogSection = $('#catalogo');
        if (catalogSection) catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function fixWhatsappLinks() {
    $$('[data-whatsapp-link],.floating-whatsapp').forEach(function (a) {
      a.setAttribute('href', whatsappUrl('Olá, vim pelo site Horizonte Prime Imóveis e gostaria de atendimento.'));
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    });
  }

  function boot() {
    renderStats();
    fillNeighborhoods();
    renderFeatured();
    renderCatalog();
    fixWhatsappLinks();
    setupEvents();
    document.body.classList.add('click-fix-ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
