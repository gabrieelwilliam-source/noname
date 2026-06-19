(() => {
  "use strict";

  const Site = window.ImobSite;
  if (!Site) return;

  const ui = {};
  let allProperties = [];
  let heroPurpose = "";

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    cacheUi();
    bindEvents();
    await loadProperties();
  }

  function cacheUi() {
    ui.featuredGrid = document.getElementById("featured-grid");
    ui.catalogGrid = document.getElementById("catalog-grid");
    ui.catalogSummary = document.getElementById("catalog-summary");
    ui.catalogEmpty = document.getElementById("catalog-empty");
    ui.activeFilters = document.getElementById("active-filters");
    ui.query = document.getElementById("filter-query");
    ui.purpose = document.getElementById("filter-purpose");
    ui.category = document.getElementById("filter-category");
    ui.neighborhood = document.getElementById("filter-neighborhood");
    ui.bedrooms = document.getElementById("filter-bedrooms");
    ui.parking = document.getElementById("filter-parking");
    ui.price = document.getElementById("filter-price");
    ui.pet = document.getElementById("filter-pet");
    ui.sort = document.getElementById("sort-properties");
    ui.filtersPanel = document.getElementById("catalog-filters");
  }

  function bindEvents() {
    document.querySelectorAll(".search-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".search-tab").forEach((item) => {
          item.classList.toggle("active", item === tab);
          item.setAttribute("aria-selected", String(item === tab));
        });
        heroPurpose = tab.dataset.purpose || "";
      });
    });

    document.getElementById("hero-search-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      ui.query.value = document.getElementById("hero-query").value;
      ui.category.value = document.getElementById("hero-category").value;
      ui.purpose.value = heroPurpose;
      applyFilters();
      document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
    });

    [ui.query, ui.purpose, ui.category, ui.neighborhood, ui.bedrooms, ui.parking, ui.price, ui.pet]
      .forEach((element) => {
        const eventName = element?.type === "search" ? "input" : "change";
        element?.addEventListener(eventName, debounce(applyFilters, 120));
      });

    ui.sort?.addEventListener("change", applyFilters);

    document.querySelector(".clear-filters")?.addEventListener("click", clearFilters);

    document.querySelector(".filter-toggle")?.addEventListener("click", (event) => {
      const open = ui.filtersPanel.classList.toggle("open");
      event.currentTarget.setAttribute("aria-expanded", String(open));
    });

    document.querySelectorAll("[data-footer-purpose]").forEach((link) => {
      link.addEventListener("click", () => {
        ui.purpose.value = link.dataset.footerPurpose;
        applyFilters();
      });
    });
  }

  async function loadProperties() {
    try {
      const result = await Site.searchProperties({
        city: Site.config.BUSINESS_CITY || "Joinville",
        limit: 100
      });
      allProperties = result.items || [];
      populateNeighborhoods(allProperties);
      renderFeatured(allProperties.filter((property) => property.isFeatured).slice(0, 3));
      applyFilters();
    } catch (error) {
      console.error(error);
      ui.featuredGrid.innerHTML = `<p>Não foi possível carregar os imóveis.</p>`;
      ui.catalogSummary.textContent = "Não foi possível carregar o catálogo.";
    }
  }

  function populateNeighborhoods(properties) {
    const neighborhoods = [...new Set(properties.map((p) => p.neighborhood).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "pt-BR"));
    neighborhoods.forEach((neighborhood) => {
      const option = document.createElement("option");
      option.value = neighborhood;
      option.textContent = neighborhood;
      ui.neighborhood.appendChild(option);
    });
  }

  function renderFeatured(properties) {
    ui.featuredGrid.innerHTML = "";
    const items = properties.length ? properties : allProperties.slice(0, 3);
    items.forEach((property) => ui.featuredGrid.appendChild(Site.createPropertyCard(property)));
  }

  function getFilterValues() {
    return {
      query: ui.query.value.trim(),
      purpose: ui.purpose.value,
      category: ui.category.value,
      neighborhood: ui.neighborhood.value,
      bedrooms: ui.bedrooms.value,
      parking: ui.parking.value,
      priceMax: ui.price.value,
      acceptsPet: ui.pet.checked
    };
  }

  function applyFilters() {
    const filters = getFilterValues();
    let properties = [...allProperties];

    if (filters.query) {
      const query = normalize(filters.query);
      properties = properties.filter((property) =>
        normalize([
          property.title,
          property.neighborhood,
          property.city,
          property.listingCode,
          ...(property.tags || []),
          ...(property.aliases || [])
        ].join(" ")).includes(query)
      );
    }
    if (filters.purpose) properties = properties.filter((p) => p.purpose === filters.purpose);
    if (filters.category) properties = properties.filter((p) => p.category === filters.category);
    if (filters.neighborhood) properties = properties.filter((p) => p.neighborhood === filters.neighborhood);
    if (filters.bedrooms) properties = properties.filter((p) => Number(p.bedrooms || 0) >= Number(filters.bedrooms));
    if (filters.parking) properties = properties.filter((p) => Number(p.parkingSpots || 0) >= Number(filters.parking));
    if (filters.priceMax) properties = properties.filter((p) => Site.getEffectivePrice(p) <= Number(filters.priceMax));
    if (filters.acceptsPet) properties = properties.filter((p) => p.acceptsPet === true);

    properties.sort(sorter(ui.sort.value));
    renderCatalog(properties, filters);
  }

  function sorter(value) {
    if (value === "price-asc") return (a, b) => Site.getEffectivePrice(a) - Site.getEffectivePrice(b);
    if (value === "price-desc") return (a, b) => Site.getEffectivePrice(b) - Site.getEffectivePrice(a);
    if (value === "area-desc") return (a, b) => Number(b.areaM2 || 0) - Number(a.areaM2 || 0);
    return (a, b) => Number(b.isFeatured) - Number(a.isFeatured);
  }

  function renderCatalog(properties, filters) {
    ui.catalogGrid.innerHTML = "";
    ui.catalogSummary.textContent = `${properties.length} ${properties.length === 1 ? "imóvel encontrado" : "imóveis encontrados"} em Joinville.`;
    ui.catalogEmpty.classList.toggle("hidden", properties.length > 0);
    ui.catalogGrid.classList.toggle("hidden", properties.length === 0);

    properties.forEach((property) => ui.catalogGrid.appendChild(Site.createPropertyCard(property)));
    renderActiveFilters(filters);
  }

  function renderActiveFilters(filters) {
    ui.activeFilters.innerHTML = "";
    const labels = [];
    if (filters.query) labels.push(`Busca: ${filters.query}`);
    if (filters.purpose) labels.push(Site.formatPurpose(filters.purpose));
    if (filters.category) labels.push(Site.capitalize(filters.category));
    if (filters.neighborhood) labels.push(filters.neighborhood);
    if (filters.bedrooms) labels.push(`${filters.bedrooms}+ quartos`);
    if (filters.parking) labels.push(`${filters.parking}+ vagas`);
    if (filters.priceMax) labels.push(`Até ${Site.formatCurrency(filters.priceMax)}`);
    if (filters.acceptsPet) labels.push("Aceita pet");

    labels.forEach((label) => {
      const chip = document.createElement("span");
      chip.className = "filter-chip";
      chip.textContent = label;
      ui.activeFilters.appendChild(chip);
    });
  }

  function clearFilters() {
    [ui.query, ui.purpose, ui.category, ui.neighborhood, ui.bedrooms, ui.parking, ui.price]
      .forEach((element) => { element.value = ""; });
    ui.pet.checked = false;
    ui.sort.value = "featured";
    applyFilters();
  }

  function normalize(value = "") {
    return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }
})();
