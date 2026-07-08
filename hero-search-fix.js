(function () {
  'use strict';

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setValue(id, value) {
    var el = document.getElementById(id);
    if (!el) return;
    el.value = value || '';
    el.dispatchEvent(new Event(id === 'filter-query' ? 'input' : 'change', { bubbles: true }));
  }

  function setActivePurpose(purpose) {
    var form = $('#hero-search-form');
    if (!form) return;
    $$('.search-tab', form).forEach(function (tab) {
      var active = (tab.getAttribute('data-purpose') || '') === (purpose || '');
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function smoothToCatalog() {
    var catalog = document.getElementById('catalogo');
    if (catalog && typeof catalog.scrollIntoView === 'function') {
      catalog.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      location.hash = '#catalogo';
    }
  }

  function applyHeroSearch(options) {
    options = options || {};
    var form = $('#hero-search-form');
    if (!form) return;

    var activeTab = $('.search-tab.active', form);
    var purpose = options.purpose !== undefined
      ? options.purpose
      : (activeTab ? (activeTab.getAttribute('data-purpose') || '') : '');

    setActivePurpose(purpose);
    setValue('filter-purpose', purpose);

    if (options.includeFields) {
      setValue('filter-query', ($('#hero-query', form) || {}).value || '');
      setValue('filter-category', ($('#hero-category', form) || {}).value || '');
    }

    if (options.scroll) smoothToCatalog();
  }

  function syncHeroFromCatalogFilters() {
    var purposeSelect = $('#filter-purpose');
    if (purposeSelect) setActivePurpose(purposeSelect.value || '');
  }

  function setupHeroButtons() {
    var form = $('#hero-search-form');
    if (!form || form.dataset.heroSearchFixReady === '1') return;
    form.dataset.heroSearchFixReady = '1';

    $$('.search-tab', form).forEach(function (tab) {
      tab.addEventListener('click', function () {
        var purpose = tab.getAttribute('data-purpose') || '';
        applyHeroSearch({ purpose: purpose, includeFields: false, scroll: false });
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      applyHeroSearch({ includeFields: true, scroll: true });
    });

    var category = $('#hero-category', form);
    if (category) {
      category.addEventListener('change', function () {
        setValue('filter-category', category.value || '');
      });
    }

    var query = $('#hero-query', form);
    if (query) {
      query.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          applyHeroSearch({ includeFields: true, scroll: true });
        }
      });
    }
  }

  function setupFooterPurposeLinks() {
    $$('[data-footer-purpose]').forEach(function (link) {
      if (link.dataset.heroSearchFooterFixReady === '1') return;
      link.dataset.heroSearchFooterFixReady = '1';
      link.addEventListener('click', function () {
        var purpose = link.getAttribute('data-footer-purpose') || '';
        setTimeout(function () {
          setValue('filter-purpose', purpose);
          setActivePurpose(purpose);
          smoothToCatalog();
        }, 0);
      });
    });
  }

  function setupCatalogSync() {
    var purposeSelect = $('#filter-purpose');
    if (purposeSelect && purposeSelect.dataset.heroSearchSyncReady !== '1') {
      purposeSelect.dataset.heroSearchSyncReady = '1';
      purposeSelect.addEventListener('change', syncHeroFromCatalogFilters);
    }

    var clear = $('.clear-filters');
    if (clear && clear.dataset.heroSearchClearSyncReady !== '1') {
      clear.dataset.heroSearchClearSyncReady = '1';
      clear.addEventListener('click', function () {
        setTimeout(function () { setActivePurpose(''); }, 0);
      });
    }
  }

  function boot() {
    setupHeroButtons();
    setupFooterPurposeLinks();
    setupCatalogSync();
    syncHeroFromCatalogFilters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
