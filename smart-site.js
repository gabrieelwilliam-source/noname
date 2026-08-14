(function () {
  'use strict';

  var U = window.ImobUtils;
  var cfg = window.SITE_CONFIG || {};
  if (!U) return;

  var STORAGE_FAV = 'hp_favoritos_v2';
  var STORAGE_COMPARE = 'hp_comparar_v2';
  var STORAGE_RECENT = 'hp_visitados_v2';
  var properties = U.catalog();

  function $(selector, root) { return (root || document).querySelector(selector); }
  function $$(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function getCode(p) { return String((p && p.listingCode) || '').toUpperCase(); }
  function byCode(code) { code = String(code || '').toUpperCase(); return properties.find(function (p) { return getCode(p) === code; }); }
  function money(v) { return U.money(Number(v || 0)); }
  function price(p) { return Number((p && (p.priceFrom || p.salePrice || p.rentValue)) || 0); }
  function propUrl(p) { return (p && (p.listingUrl || ('imovel.html?codigo=' + encodeURIComponent(p.listingCode)))) || 'index.html#catalogo'; }
  function img(p) { return U.imgPath((p && (p.imageUrl || (p.images && p.images[0] && p.images[0].url))) || 'property-fallback.jpg'); }
  function load(key) { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; } }
  function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }
  function unique(arr) { return Array.from(new Set(arr.filter(Boolean))); }

  var favorites = unique(load(STORAGE_FAV));
  var compare = unique(load(STORAGE_COMPARE)).slice(0, 3);

  function toast(message) {
    var box = $('#smart-toast');
    if (!box) {
      box = document.createElement('div');
      box.id = 'smart-toast';
      box.className = 'smart-toast';
      document.body.appendChild(box);
    }
    box.textContent = message;
    box.classList.add('show');
    clearTimeout(box._timer);
    box._timer = setTimeout(function () { box.classList.remove('show'); }, 2400);
  }

  function currentFilters() {
    return {
      query: ($('#filter-query') || {}).value || '',
      purpose: ($('#filter-purpose') || {}).value || '',
      category: ($('#filter-category') || {}).value || '',
      neighborhood: ($('#filter-neighborhood') || {}).value || '',
      bedrooms: Number((($('#filter-bedrooms') || {}).value) || 0),
      parking: Number((($('#filter-parking') || {}).value) || 0),
      price: Number((($('#filter-price') || {}).value) || 0),
      pet: !!(($('#filter-pet') || {}).checked)
    };
  }

  function scoreProperty(p) {
    var f = currentFilters();
    var score = 54;
    if (p.isFeatured) score += 8;
    if (Array.isArray(p.images) && p.images.length >= 4) score += 6;
    if (p.areaM2 >= 100) score += 5;
    if (p.acceptsPet) score += 3;
    if (f.purpose && p.purpose === f.purpose) score += 10;
    if (f.category && p.category === f.category) score += 10;
    if (f.neighborhood && p.neighborhood === f.neighborhood) score += 13;
    if (f.bedrooms && Number(p.bedrooms || 0) >= f.bedrooms) score += 8;
    if (f.parking && Number(p.parkingSpots || 0) >= f.parking) score += 6;
    if (f.price && price(p) <= f.price) score += 8;
    if (f.pet && p.acceptsPet) score += 8;
    if (!f.purpose && !f.category && !f.neighborhood && !f.bedrooms && !f.parking && !f.price && !f.pet && !f.query) {
      score += p.purpose === 'investimento' ? 8 : 0;
    }
    return Math.max(62, Math.min(98, score));
  }

  function insight(p) {
    if (p.purpose === 'investimento') return 'Potencial para renda e liquidez';
    if (p.category === 'casa' || p.category === 'sobrado') return 'Boa opção para família';
    if (p.purpose === 'locacao') return 'Ideal para mudança rápida';
    if (p.areaM2 >= 110) return 'Planta ampla e confortável';
    return 'Perfil equilibrado para negociação';
  }

  function setFilter(id, value) {
    var el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = !!value; else el.value = value || '';
    el.dispatchEvent(new Event(el.type === 'search' ? 'input' : 'change', { bubbles: true }));
  }

  function applySmartProfile(profile) {
    var presets = {
      familia: { purpose: 'compra', category: '', bedrooms: '3', parking: '2', pet: false, price: '' },
      aluguel: { purpose: 'locacao', category: '', bedrooms: '2', parking: '1', pet: false, price: '4000' },
      investimento: { purpose: 'investimento', category: '', bedrooms: '', parking: '', pet: false, price: '600000' },
      pet: { purpose: '', category: '', bedrooms: '', parking: '', pet: true, price: '' },
      premium: { purpose: 'compra', category: '', bedrooms: '3', parking: '2', pet: false, price: '1500000' }
    };
    var p = presets[profile] || {};
    setFilter('filter-purpose', p.purpose || '');
    setFilter('filter-category', p.category || '');
    setFilter('filter-bedrooms', p.bedrooms || '');
    setFilter('filter-parking', p.parking || '');
    setFilter('filter-price', p.price || '');
    setFilter('filter-pet', !!p.pet);
    var catalog = $('#catalogo');
    if (catalog) catalog.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(function () { decorateCards(); renderSmartPanel(); }, 120);
  }

  function favoriteToggle(code) {
    code = String(code || '').toUpperCase();
    if (!code) return;
    if (favorites.indexOf(code) >= 0) {
      favorites = favorites.filter(function (x) { return x !== code; });
      toast('Removido dos favoritos.');
    } else {
      favorites.push(code);
      toast('Imóvel salvo nos favoritos.');
    }
    favorites = unique(favorites);
    save(STORAGE_FAV, favorites);
    decorateCards();
    renderSmartPanel();
  }

  function compareToggle(code) {
    code = String(code || '').toUpperCase();
    if (!code) return;
    if (compare.indexOf(code) >= 0) {
      compare = compare.filter(function (x) { return x !== code; });
      toast('Removido da comparação.');
    } else {
      if (compare.length >= 3) {
        toast('Você pode comparar até 3 imóveis por vez.');
        return;
      }
      compare.push(code);
      toast('Adicionado à comparação.');
    }
    compare = unique(compare).slice(0, 3);
    save(STORAGE_COMPARE, compare);
    decorateCards();
    renderCompareTray();
  }

  function decorateCards() {
    $$('.property-card[data-code]').forEach(function (card) {
      var code = String(card.getAttribute('data-code') || '').toUpperCase();
      var p = byCode(code);
      if (!p) return;
      card.dataset.smartDecorated = '1';

      var imageBox = $('.property-image', card);
      if (cfg.enableFavorites !== false && imageBox && !$('.favorite-card', imageBox)) {
        var fav = document.createElement('button');
        fav.type = 'button';
        fav.className = 'favorite-card';
        fav.setAttribute('aria-label', 'Salvar imóvel nos favoritos');
        fav.innerHTML = '<span>♡</span>';
        fav.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); favoriteToggle(code); });
        imageBox.appendChild(fav);
      }

      var favBtn = $('.favorite-card', card);
      if (cfg.enableFavorites !== false && favBtn) {
        favBtn.classList.toggle('active', favorites.indexOf(code) >= 0);
        favBtn.innerHTML = favorites.indexOf(code) >= 0 ? '<span>♥</span>' : '<span>♡</span>';
      }

      var content = $('.card-content', card);
      if (cfg.enableMatchScore === true && content && !$('.match-meter', content)) {
        var meter = document.createElement('div');
        meter.className = 'match-meter';
        content.insertBefore(meter, content.children[2] || null);
      }
      var meterEl = $('.match-meter', content || card);
      if (cfg.enableMatchScore === true && meterEl) {
        var score = scoreProperty(p);
        meterEl.innerHTML = '<div><strong>' + score + '% match</strong><span>' + U.esc(insight(p)) + '</span></div><i style="width:' + score + '%"></i>';
      }

      var actions = $('.card-actions', card);
      if (cfg.enableCompare !== false && actions && !$('.compare-card', actions)) {
        var cmp = document.createElement('button');
        cmp.type = 'button';
        cmp.className = 'button button-secondary compare-card';
        cmp.setAttribute('data-code', code);
        cmp.textContent = 'Comparar';
        cmp.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); compareToggle(code); });
        actions.appendChild(cmp);
      }
      var cmpBtn = $('.compare-card', actions || card);
      if (cfg.enableCompare !== false && cmpBtn) {
        cmpBtn.classList.toggle('active', compare.indexOf(code) >= 0);
        cmpBtn.textContent = compare.indexOf(code) >= 0 ? 'Selecionado' : 'Comparar';
      }
    });
  }

  function renderSmartPanel() {
    if (cfg.enableMatchScore !== true) return;
    var root = $('#smart-recommendations');
    if (!root) return;
    var favCount = favorites.length;
    var filtered = properties.slice().sort(function (a, b) { return scoreProperty(b) - scoreProperty(a); }).slice(0, 3);
    root.innerHTML = filtered.map(function (p, idx) {
      return '<article class="smart-rec-card">' +
        '<span>Indicação ' + (idx + 1) + '</span>' +
        '<strong>' + U.esc(p.title) + '</strong>' +
        '<small>' + scoreProperty(p) + '% compatível • ' + U.esc(p.neighborhood) + '</small>' +
        '<a href="' + U.esc(propUrl(p)) + '">Ver imóvel</a>' +
      '</article>';
    }).join('') + '<div class="smart-rec-foot"><b>' + favCount + '</b> favoritos salvos neste navegador</div>';
  }

  function renderCompareTray() {
    if (cfg.enableCompare === false) return;
    var tray = $('#compare-tray');
    if (!tray) {
      tray = document.createElement('div');
      tray.id = 'compare-tray';
      tray.className = 'compare-tray';
      document.body.appendChild(tray);
    }
    if (!compare.length) {
      tray.classList.remove('show');
      tray.innerHTML = '';
      return;
    }
    tray.classList.add('show');
    tray.innerHTML = '<div><strong>' + compare.length + ' imóvel' + (compare.length > 1 ? 'is' : '') + ' para comparar</strong><span>Selecione até 3 opções.</span></div><button class="button button-primary" type="button" id="open-compare">Comparar agora</button><button class="compare-clear" type="button" id="clear-compare">Limpar</button>';
    $('#open-compare', tray).addEventListener('click', openCompareModal);
    $('#clear-compare', tray).addEventListener('click', function () { compare = []; save(STORAGE_COMPARE, compare); renderCompareTray(); decorateCards(); });
  }

  function openCompareModal() {
    var selected = compare.map(byCode).filter(Boolean);
    var modal = $('#compare-modal');
    if (!modal) {
      modal = document.createElement('dialog');
      modal.id = 'compare-modal';
      modal.className = 'compare-modal';
      document.body.appendChild(modal);
    }
    if (!selected.length) return;
    modal.innerHTML = '<button class="modal-close compare-close" type="button" aria-label="Fechar">×</button><div class="modal-heading"><span class="eyebrow dark">Comparação</span><h2>Compare os imóveis selecionados</h2><p>Veja preço, área, quartos e diferenças lado a lado.</p></div>' +
      '<div class="compare-table-wrap"><table class="compare-table"><thead><tr><th>Critério</th>' + selected.map(function (p) { return '<th>' + U.esc(p.listingCode) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      row('Imóvel', selected.map(function (p) { return '<a href="' + U.esc(propUrl(p)) + '">' + U.esc(p.title) + '</a>'; })) +
      row('Finalidade', selected.map(function (p) { return U.esc(U.purposeLabel(p.purpose)); })) +
      row('Valor', selected.map(function (p) { return U.esc(U.propertyPrice(p)); })) +
      row('Bairro', selected.map(function (p) { return U.esc(p.neighborhood); })) +
      row('Quartos', selected.map(function (p) { return U.esc(p.bedrooms || 0); })) +
      row('Vagas', selected.map(function (p) { return U.esc(p.parkingSpots || 0); })) +
      row('Área', selected.map(function (p) { return U.esc((p.areaM2 || 0) + ' m²'); })) +
      row('Diferencial', selected.map(function (p) { return U.esc(insight(p)); })) +
      '</tbody></table></div>' +
      '<div style="display:flex;justify-content:flex-end;margin-top:18px"><button class="button button-primary" type="button" id="compare-with-iana">Perguntar à Iana sobre estes imóveis</button></div>';
    $('.compare-close', modal).addEventListener('click', function () { modal.close(); });
    var askIana = $('#compare-with-iana', modal);
    if (askIana) askIana.addEventListener('click', function () {
      var codes = selected.map(function (p) { return p.listingCode; });
      var titles = selected.map(function (p) { return p.listingCode + ' — ' + p.title; });
      var ctxText = U.searchSummary ? U.searchSummary(U.currentSearchContext ? U.currentSearchContext() : {}) : '';
      var message = 'Estou comparando estes imóveis: ' + titles.join(' | ') + '. ' + (ctxText ? 'Minha busca no site está assim: ' + ctxText + '. ' : '') + 'Quero entender as principais diferenças e qual faz mais sentido para o que eu procuro.';
      if (typeof modal.close === 'function') modal.close();
      if (typeof window.openLeadModal === 'function') {
        window.openLeadModal({ type: selected[0] && selected[0].purpose === 'locacao' ? 'rent' : (selected[0] && selected[0].purpose === 'investimento' ? 'investment' : 'buyer'), scenario: 'comparacao_imoveis', title: 'Comparar com a Iana', description: 'Os imóveis selecionados e os filtros da sua busca serão enviados junto.', message: message, comparisonCodes: codes });
      }
    });
    if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', 'open');
  }

  function row(label, cells) {
    return '<tr><th>' + U.esc(label) + '</th>' + cells.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
  }

  function setupSmartProfiles() {
    $$('[data-smart-profile]').forEach(function (btn) {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', function () { applySmartProfile(btn.getAttribute('data-smart-profile')); });
    });
  }

  function setupCalculator() {
    var root = $('#finance-calculator');
    if (!root) return;
    var value = $('#calc-value');
    var down = $('#calc-down');
    var years = $('#calc-years');
    var rate = $('#calc-rate');
    var result = $('#calc-result');
    var firstSale = properties.find(function (p) { return p.purpose !== 'locacao' && price(p); }) || properties[0];
    if (value && !value.value) value.value = price(firstSale) || 600000;
    if (down && !down.value) down.value = Math.round((price(firstSale) || 600000) * 0.2);

    function calc() {
      var principal = Math.max(0, Number(value.value || 0) - Number(down.value || 0));
      var months = Math.max(1, Number(years.value || 30) * 12);
      var monthlyRate = Number(rate.value || 10.5) / 100 / 12;
      var payment = monthlyRate ? principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months)) : principal / months;
      if (result) result.innerHTML = '<span>Parcela estimada</span><strong>' + money(payment) + '</strong><small>Simulação aproximada. Taxas, renda e aprovação dependem da instituição financeira.</small>';
    }
    [value, down, years, rate].forEach(function (el) { if (el) el.addEventListener('input', calc); });
    calc();
  }

  function saveRecentProperty() {
    if (!document.body.classList.contains('property-page')) return;
    var params = new URLSearchParams(location.search);
    var code = String(params.get('codigo') || '').toUpperCase();
    if (!code) return;
    var recent = load(STORAGE_RECENT).filter(function (x) { return x !== code; });
    recent.unshift(code);
    save(STORAGE_RECENT, recent.slice(0, 8));
  }

  function enhancePropertyPage() {
    if (cfg.enableMatchScore !== true) return;
    if (!document.body.classList.contains('property-page')) return;
    var params = new URLSearchParams(location.search);
    var code = String(params.get('codigo') || '').toUpperCase();
    var p = byCode(code);
    if (!p) return;

    setTimeout(function () {
      var priceCard = $('.price-card');
      if (priceCard && !$('.property-smart-score', priceCard)) {
        var score = document.createElement('div');
        score.className = 'property-smart-score';
        var s = scoreProperty(p);
        score.innerHTML = '<span>Análise automática</span><strong>' + s + '% de atratividade</strong><i><b style="width:' + s + '%"></b></i><small>' + U.esc(insight(p)) + '</small>';
        priceCard.insertBefore(score, priceCard.querySelector('.button'));
      }
      var gallery = $('.gallery-pro');
      if (gallery && !$('.gallery-tip', gallery)) {
        var tip = document.createElement('div');
        tip.className = 'gallery-tip';
        tip.textContent = 'Clique nas miniaturas para navegar pelas fotos do imóvel';
        gallery.appendChild(tip);
      }
    }, 250);
  }

  function observeCards() {
    var targets = ['#catalog-grid', '#featured-grid', '.related-grid'].map(function (s) { return $(s); }).filter(Boolean);
    targets.forEach(function (target) {
      var obs = new MutationObserver(function () {
        decorateCards();
        renderSmartPanel();
      });
      obs.observe(target, { childList: true, subtree: true });
    });
  }

  function boot() {
    setupSmartProfiles();
    setupCalculator();
    observeCards();
    saveRecentProperty();
    enhancePropertyPage();
    setTimeout(function () { decorateCards(); renderSmartPanel(); renderCompareTray(); }, 350);
    document.addEventListener('change', function (e) {
      if (e.target && /^filter-/.test(e.target.id || '')) setTimeout(function () { decorateCards(); renderSmartPanel(); }, 80);
    });
    document.addEventListener('input', function (e) {
      if (e.target && e.target.id === 'filter-query') setTimeout(function () { decorateCards(); renderSmartPanel(); }, 80);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
