(() => {
  "use strict";

  const Site = window.ImobSite;
  if (!Site) return;

  let property = null;

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    const code = Site.getQueryParam("codigo") || Site.getQueryParam("slug");
    if (!code) {
      showError();
      return;
    }

    try {
      property = await Site.getProperty(code);
      if (!property) {
        showError();
        return;
      }
      renderProperty(property);
    } catch (error) {
      console.error(error);
      showError();
    }
  }

  function renderProperty(item) {
    document.getElementById("property-loading").classList.add("hidden");
    document.getElementById("property-detail").classList.remove("hidden");

    document.title = `${item.title} | ${Site.config.BUSINESS_NAME || "Horizonte Prime Imóveis"}`;
    const meta = document.getElementById("meta-description");
    if (meta) meta.content = item.description || item.highlight || item.title;

    setText("breadcrumb-current", item.title);
    setText("property-purpose", Site.formatPurpose(item.purpose));
    setText("property-code", `Código ${item.listingCode}`);
    setText("property-title", item.title);
    setText("property-location", `${item.neighborhood}, ${item.city} - ${item.stateCode || "SC"}`);
    setText("property-description", item.description || "Consulte nossa equipe para mais informações.");
    setText("property-highlight", item.highlight || "");

    renderGallery(item);
    renderFacts(item);
    renderAmenities(item);
    renderCosts(item);
    renderSidebar(item);

    document.getElementById("property-interest-button")?.addEventListener("click", () => {
      Site.openLeadModal(item);
    });

    document.getElementById("copy-link-button")?.addEventListener("click", async (event) => {
      try {
        await navigator.clipboard.writeText(location.href);
        event.currentTarget.title = "Link copiado";
      } catch {
        event.currentTarget.title = "Não foi possível copiar";
      }
    });
  }

  function renderGallery(item) {
    const gallery = document.getElementById("property-gallery");
    const images = Array.isArray(item.images) && item.images.length
      ? item.images
      : [{ url: item.imageUrl, alt: item.title }];

    gallery.innerHTML = "";

    images.slice(0, 3).forEach((image, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "gallery-item";
      const img = document.createElement("img");
      img.src = Site.normalizeAssetPath(image.url);
      img.alt = image.alt || `${item.title} — foto ${index + 1}`;
      if (index > 0) img.loading = "lazy";
      img.addEventListener("error", () => { img.src = "assets/property-fallback.jpg"; }, { once: true });
      wrapper.appendChild(img);
      gallery.appendChild(wrapper);
    });
  }

  function renderFacts(item) {
    const facts = [
      [item.bedrooms ?? 0, Number(item.bedrooms) === 1 ? "Quarto" : "Quartos"],
      [item.suites ?? 0, Number(item.suites) === 1 ? "Suíte" : "Suítes"],
      [item.bathrooms ?? 0, Number(item.bathrooms) === 1 ? "Banheiro" : "Banheiros"],
      [item.parkingSpots ?? 0, Number(item.parkingSpots) === 1 ? "Vaga" : "Vagas"],
      [item.areaM2 ? `${item.areaM2} m²` : "—", "Área privativa"]
    ];

    const container = document.getElementById("property-facts");
    container.innerHTML = facts.map(([value, label]) => `
      <div class="property-fact"><strong>${Site.escapeHtml(value)}</strong><span>${Site.escapeHtml(label)}</span></div>
    `).join("");
  }

  function renderAmenities(item) {
    const amenities = Array.isArray(item.amenities) ? item.amenities : [];
    const section = document.getElementById("amenities-section");
    const container = document.getElementById("property-amenities");

    if (!amenities.length) {
      section.classList.add("hidden");
      return;
    }

    container.innerHTML = amenities.map((amenity) => `
      <div class="amenity-item">✓ ${Site.escapeHtml(Site.capitalize(amenity))}</div>
    `).join("");
  }

  function renderCosts(item) {
    const rows = [];
    const primaryPrice = Site.getEffectivePrice(item);

    rows.push([
      item.purpose === "locacao" ? "Aluguel" : "Valor do imóvel",
      Site.formatCurrency(primaryPrice)
    ]);

    if (Number(item.condoFee) > 0) rows.push(["Condomínio", Site.formatCurrency(item.condoFee)]);
    if (Number(item.iptu) > 0) rows.push(["IPTU", Site.formatCurrency(item.iptu)]);
    if (item.minDownPaymentPct) rows.push(["Entrada estimada", `${item.minDownPaymentPct}%`]);
    if (item.financingAllowed) rows.push(["Financiamento", "Permitido"]);
    if (item.fgtsAllowed) rows.push(["Uso de FGTS", "Permitido"]);

    document.getElementById("property-costs").innerHTML = rows.map(([label, value]) => `
      <div class="cost-row"><span>${Site.escapeHtml(label)}</span><strong>${Site.escapeHtml(value)}</strong></div>
    `).join("");
  }

  function renderSidebar(item) {
    const price = Site.getEffectivePrice(item);
    setText("price-label", item.purpose === "locacao" ? "Aluguel mensal" : "Valor do imóvel");
    setText("property-price", Site.formatCurrency(price));

    const fees = [];
    if (Number(item.condoFee) > 0) fees.push(`Condomínio ${Site.formatCurrency(item.condoFee)}`);
    if (Number(item.iptu) > 0) fees.push(`IPTU ${Site.formatCurrency(item.iptu)}`);
    setText("property-fees", fees.join(" • "));

    const whatsapp = document.getElementById("property-whatsapp-button");
    whatsapp.href = Site.buildWhatsappUrl(item);

    document.getElementById("lead-listing-code").value = item.listingCode || "";
    document.getElementById("lead-listing-url").value = location.href;
    document.getElementById("lead-message").value = `Tenho interesse no imóvel ${item.listingCode} — ${item.title}.`;
  }

  function showError() {
    document.getElementById("property-loading")?.classList.add("hidden");
    document.getElementById("property-detail")?.classList.add("hidden");
    document.getElementById("property-error")?.classList.remove("hidden");
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value ?? "";
  }
})();
