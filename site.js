(() => {
  "use strict";

  const config = window.IMOB_CONFIG || {};
  const demoProperties = Array.isArray(window.IMOB_DEMO_PROPERTIES) ? window.IMOB_DEMO_PROPERTIES : [];

  const state = {
    dataSource: "demo"
  };

  const hasSupabaseConfig = () => {
    return Boolean(
      config.SUPABASE_URL &&
      config.SUPABASE_ANON_KEY &&
      !String(config.SUPABASE_URL).includes("COLE_AQUI") &&
      !String(config.SUPABASE_ANON_KEY).includes("COLE_AQUI")
    );
  };

  const shouldUseSupabase = () => {
    if (config.DATA_MODE === "demo") return false;
    if (config.DATA_MODE === "supabase") return true;
    return hasSupabaseConfig();
  };

  const cleanBaseUrl = (value = "") => String(value).replace(/\/+$/, "");

  async function callSupabaseRpc(functionName, payload) {
    if (!hasSupabaseConfig()) {
      throw new Error("Supabase não configurado em config.js.");
    }

    const response = await fetch(
      `${cleanBaseUrl(config.SUPABASE_URL)}/rest/v1/rpc/${functionName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: config.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${config.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const message = data?.message || data?.hint || `Erro HTTP ${response.status}`;
      throw new Error(message);
    }

    return data;
  }

  function normalizeAssetPath(path = "") {
    if (!path) return "assets/property-fallback.jpg";
    if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
    return String(path).replace(/^\/+/, "");
  }

  function getEffectivePrice(property) {
    if (property.purpose === "locacao") {
      return Number(property.rentValue ?? property.priceFrom ?? 0);
    }
    return Number(property.salePrice ?? property.priceFrom ?? 0);
  }

  function formatCurrency(value, options = {}) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "Consulte";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: options.decimals ? 2 : 0
    }).format(number);
  }

  function formatPurpose(value) {
    const labels = {
      compra: "Venda",
      locacao: "Aluguel",
      investimento: "Investimento"
    };
    return labels[value] || "Imóvel";
  }

  function capitalize(value = "") {
    return String(value)
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function propertyPageUrl(property) {
    return `imovel.html?codigo=${encodeURIComponent(property.listingCode || property.listingId || property.slug)}`;
  }

  function buildWhatsappUrl(property = null) {
    const number = String(config.WHATSAPP_NUMBER || "").replace(/\D/g, "");
    const base = "https://wa.me/";
    const text = property
      ? `Olá! Tenho interesse no imóvel ${property.listingCode}: ${property.title}. ${location.href}`
      : "Olá! Quero ajuda para encontrar um imóvel.";
    return `${base}${number}?text=${encodeURIComponent(text)}`;
  }

  function createPropertyCard(property) {
    const card = document.createElement("article");
    card.className = "property-card";
    card.dataset.code = property.listingCode || "";
    const price = getEffectivePrice(property);
    const priceSuffix = property.purpose === "locacao" ? "/mês" : "";
    const bedroomText = property.category === "comercial"
      ? `${property.bathrooms || 0} banheiro`
      : `${property.bedrooms || 0} quarto${Number(property.bedrooms) === 1 ? "" : "s"}`;

    card.innerHTML = `
      <a class="property-card-media" href="${propertyPageUrl(property)}" aria-label="Ver ${escapeHtml(property.title)}">
        <img src="${escapeAttribute(normalizeAssetPath(property.imageUrl))}" alt="${escapeAttribute(property.title)}" loading="lazy">
        <span class="property-badge">${escapeHtml(formatPurpose(property.purpose))}</span>
        ${property.isFeatured ? `
          <span class="favorite-badge" title="Imóvel em destaque" aria-label="Imóvel em destaque">
            <svg viewBox="0 0 24 24"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/></svg>
          </span>` : ""}
      </a>
      <div class="property-card-body">
        <p class="property-card-location">${escapeHtml(property.neighborhood)}, ${escapeHtml(property.city)}</p>
        <h3><a href="${propertyPageUrl(property)}">${escapeHtml(property.title)}</a></h3>
        <div class="property-card-facts">
          <span>${escapeHtml(bedroomText)}</span>
          <span>${Number(property.parkingSpots || 0)} vaga${Number(property.parkingSpots) === 1 ? "" : "s"}</span>
          <span>${Number(property.areaM2 || 0)} m²</span>
        </div>
        <div class="property-card-bottom">
          <div class="property-card-price">
            <small>${property.purpose === "locacao" ? "Aluguel" : "Valor"}</small>
            <strong>${formatCurrency(price)}${priceSuffix}</strong>
          </div>
          <a class="property-card-link" href="${propertyPageUrl(property)}">Ver detalhes <span>→</span></a>
        </div>
      </div>
    `;

    const image = card.querySelector("img");
    image.addEventListener("error", () => {
      image.src = "assets/property-fallback.jpg";
    }, { once: true });

    return card;
  }

  async function searchProperties(filters = {}) {
    if (shouldUseSupabase()) {
      try {
        const result = await callSupabaseRpc(
          "imobagent_20260504_ready_public_search_properties",
          {
            p_tenant_id: config.TENANT_ID || "default",
            p_purpose: filters.purpose || null,
            p_category: filters.category || null,
            p_city: filters.city || null,
            p_neighborhood: filters.neighborhood || null,
            p_bedrooms_min: filters.bedrooms ? Number(filters.bedrooms) : null,
            p_parking_min: filters.parking ? Number(filters.parking) : null,
            p_price_min: filters.priceMin ? Number(filters.priceMin) : null,
            p_price_max: filters.priceMax ? Number(filters.priceMax) : null,
            p_accepts_pet: filters.acceptsPet === true ? true : null,
            p_featured_only: Boolean(filters.featuredOnly),
            p_query: filters.query || null,
            p_limit: filters.limit || 100,
            p_offset: filters.offset || 0
          }
        );
        state.dataSource = "supabase";
        return {
          ok: result?.ok !== false,
          items: Array.isArray(result?.items) ? result.items : [],
          total: Number(result?.total || 0)
        };
      } catch (error) {
        console.warn("Falha ao consultar Supabase; usando dados locais.", error);
        if (config.DATA_MODE === "supabase") throw error;
      }
    }

    state.dataSource = "demo";
    let items = [...demoProperties];

    if (filters.purpose) items = items.filter((p) => p.purpose === filters.purpose);
    if (filters.category) items = items.filter((p) => p.category === filters.category);
    if (filters.city) items = items.filter((p) => normalize(p.city) === normalize(filters.city));
    if (filters.neighborhood) items = items.filter((p) => normalize(p.neighborhood).includes(normalize(filters.neighborhood)));
    if (filters.bedrooms) items = items.filter((p) => Number(p.bedrooms || 0) >= Number(filters.bedrooms));
    if (filters.parking) items = items.filter((p) => Number(p.parkingSpots || 0) >= Number(filters.parking));
    if (filters.priceMax) items = items.filter((p) => getEffectivePrice(p) <= Number(filters.priceMax));
    if (filters.acceptsPet === true) items = items.filter((p) => p.acceptsPet === true);
    if (filters.featuredOnly) items = items.filter((p) => p.isFeatured === true);

    if (filters.query) {
      const query = normalize(filters.query);
      items = items.filter((p) =>
        normalize([
          p.title,
          p.neighborhood,
          p.city,
          p.listingCode,
          ...(p.tags || []),
          ...(p.aliases || [])
        ].join(" ")).includes(query)
      );
    }

    return { ok: true, items, total: items.length };
  }

  async function getProperty(codeOrSlug) {
    if (shouldUseSupabase()) {
      try {
        const result = await callSupabaseRpc(
          "imobagent_20260504_ready_public_get_property",
          {
            p_listing_code: codeOrSlug,
            p_tenant_id: config.TENANT_ID || "default"
          }
        );
        if (result && result.ok !== false && result.listingCode) {
          state.dataSource = "supabase";
          return result;
        }
        if (config.DATA_MODE === "supabase") return null;
      } catch (error) {
        console.warn("Falha ao buscar imóvel no Supabase; usando dados locais.", error);
        if (config.DATA_MODE === "supabase") throw error;
      }
    }

    state.dataSource = "demo";
    return demoProperties.find((property) =>
      normalize(property.listingCode) === normalize(codeOrSlug) ||
      normalize(property.slug) === normalize(codeOrSlug)
    ) || null;
  }

  async function submitLead(values) {
    let contract;

    if (shouldUseSupabase()) {
      contract = await callSupabaseRpc(
        "imobagent_20260504_ready_submit_site_lead",
        {
          p_tenant_id: config.TENANT_ID || "default",
          p_customer_name: values.name,
          p_phone: values.phone,
          p_email: values.email || null,
          p_listing_code: values.listingCode || null,
          p_listing_url: values.listingUrl || null,
          p_message: values.message,
          p_origin: "site",
          p_utm_source: getQueryParam("utm_source"),
          p_utm_medium: getQueryParam("utm_medium"),
          p_utm_campaign: getQueryParam("utm_campaign"),
          p_utm_content: getQueryParam("utm_content"),
          p_utm_term: getQueryParam("utm_term"),
          p_referrer_url: document.referrer || null,
          p_idempotency_key: null,
          p_raw_payload: {
            page_url: location.href,
            user_agent: navigator.userAgent
          }
        }
      );

      if (contract?.ok === false) {
        throw new Error(contract.message || "Não foi possível registrar o contato.");
      }
    } else {
      contract = {
        ok: true,
        lead_id: crypto.randomUUID ? crypto.randomUUID() : `demo-${Date.now()}`,
        nome: values.name,
        telefone: String(values.phone).replace(/\D/g, ""),
        email: values.email || null,
        codigo_imovel: values.listingCode || null,
        url_imovel: values.listingUrl || null,
        mensagem: values.message,
        origem: "site",
        tipo_entrada: values.listingCode ? "property_interest" : "generic_search",
        entry_type: values.listingCode ? "property_interest" : "generic_search"
      };

      const saved = JSON.parse(localStorage.getItem("imob_demo_leads") || "[]");
      saved.unshift({ ...contract, created_at: new Date().toISOString() });
      localStorage.setItem("imob_demo_leads", JSON.stringify(saved.slice(0, 50)));
    }

    if (config.N8N_WEBHOOK_URL) {
      const response = await fetch(config.N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...contract,
          __entry_source: "lais-imob-site-lead",
          __source_webhook: "lais-imob-site-lead",
          provider_hint: "site_form",
          source: "site",
          origin: "site"
        })
      });

      if (!response.ok) {
        throw new Error(`Lead salvo, mas o webhook n8n respondeu ${response.status}.`);
      }
    }

    return contract;
  }

  function setupLeadModal() {
    const modal = document.getElementById("lead-modal");
    const form = document.getElementById("lead-form");
    if (!modal || !form) return;

    const closeButton = modal.querySelector(".modal-close");
    closeButton?.addEventListener("click", () => modal.close());

    modal.addEventListener("click", (event) => {
      if (event.target === modal) modal.close();
    });

    modal.addEventListener("close", () => {
      document.body.classList.remove("modal-open");
      const feedback = document.getElementById("lead-feedback");
      feedback?.classList.add("hidden");
    });

    document.querySelectorAll(".open-generic-lead").forEach((button) => {
      button.addEventListener("click", () => openLeadModal());
    });

    const phoneInput = document.getElementById("lead-phone");
    phoneInput?.addEventListener("input", () => {
      phoneInput.value = formatPhoneInput(phoneInput.value);
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearFormErrors(form);

      const values = {
        name: document.getElementById("lead-name")?.value.trim(),
        phone: document.getElementById("lead-phone")?.value.trim(),
        email: document.getElementById("lead-email")?.value.trim(),
        message: document.getElementById("lead-message")?.value.trim(),
        listingCode: document.getElementById("lead-listing-code")?.value.trim(),
        listingUrl: document.getElementById("lead-listing-url")?.value.trim()
      };

      const errors = validateLeadForm(values);
      const consent = document.getElementById("lead-consent");

      if (!consent?.checked) {
        errors.consent = "Confirme a autorização para receber o atendimento.";
      }

      if (Object.keys(errors).length) {
        showFormErrors(form, errors);
        return;
      }

      setLeadLoading(true);
      try {
        const result = await submitLead(values);
        showLeadFeedback(
          "success",
          config.N8N_WEBHOOK_URL
            ? "Solicitação enviada. O atendimento continuará pelo WhatsApp."
            : "Contato registrado com sucesso. Configure o webhook do n8n em config.js para disparar o WhatsApp automaticamente."
        );

        form.reset();
        document.getElementById("lead-listing-code").value = values.listingCode || "";
        document.getElementById("lead-listing-url").value = values.listingUrl || "";

        window.dispatchEvent(new CustomEvent("imob:leadSubmitted", { detail: result }));
      } catch (error) {
        console.error(error);
        showLeadFeedback("error", error.message || "Não foi possível enviar. Tente novamente.");
      } finally {
        setLeadLoading(false);
      }
    });
  }

  function openLeadModal(property = null) {
    const modal = document.getElementById("lead-modal");
    if (!modal) return;

    const codeInput = document.getElementById("lead-listing-code");
    const urlInput = document.getElementById("lead-listing-url");
    const messageInput = document.getElementById("lead-message");
    const title = document.getElementById("lead-modal-title");
    const description = document.getElementById("lead-modal-description");

    if (property) {
      codeInput.value = property.listingCode || "";
      urlInput.value = location.href;
      messageInput.value = `Tenho interesse no imóvel ${property.listingCode} — ${property.title}.`;
      title.textContent = "Quero saber mais sobre este imóvel";
      description.textContent = `${property.title}, ${property.neighborhood}.`;
    } else {
      codeInput.value = "";
      urlInput.value = "";
      messageInput.value = "";
      title.textContent = "Conte o que você procura";
      description.textContent = "Preencha seus dados para iniciar o atendimento pelo WhatsApp.";
    }

    document.body.classList.add("modal-open");
    modal.showModal();
    setTimeout(() => document.getElementById("lead-name")?.focus(), 60);
  }

  function validateLeadForm(values) {
    const errors = {};
    if (!values.name || values.name.length < 2) errors.name = "Informe seu nome.";
    const digits = String(values.phone || "").replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) errors.phone = "Informe um telefone com DDD.";
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Informe um e-mail válido.";
    if (!values.message || values.message.length < 5) errors.message = "Descreva brevemente sua solicitação.";
    return errors;
  }

  function clearFormErrors(form) {
    form.querySelectorAll(".form-field").forEach((field) => field.classList.remove("invalid"));
    form.querySelectorAll(".field-error").forEach((element) => element.textContent = "");
  }

  function showFormErrors(form, errors) {
    const mapping = {
      name: "lead-name",
      phone: "lead-phone",
      email: "lead-email",
      message: "lead-message"
    };

    Object.entries(errors).forEach(([key, message]) => {
      if (key === "consent") {
        showLeadFeedback("error", message);
        return;
      }
      const input = document.getElementById(mapping[key]);
      const field = input?.closest(".form-field");
      field?.classList.add("invalid");
      const errorElement = field?.querySelector(".field-error");
      if (errorElement) errorElement.textContent = message;
    });
  }

  function setLeadLoading(isLoading) {
    const button = document.getElementById("lead-submit");
    if (!button) return;
    button.disabled = isLoading;
    button.querySelector(".button-label")?.classList.toggle("hidden", isLoading);
    button.querySelector(".button-loading")?.classList.toggle("hidden", !isLoading);
  }

  function showLeadFeedback(type, message) {
    const feedback = document.getElementById("lead-feedback");
    if (!feedback) return;
    feedback.className = `form-feedback ${type}`;
    feedback.textContent = message;
  }

  function formatPhoneInput(value) {
    const digits = String(value).replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  }

  function setupGlobalUi() {
    document.querySelectorAll("[data-business-name]").forEach((element) => {
      element.textContent = config.BUSINESS_NAME || "Horizonte Prime Imóveis";
    });

    const year = document.getElementById("current-year");
    if (year) year.textContent = new Date().getFullYear();

    const whatsapp = document.getElementById("floating-whatsapp");
    if (whatsapp) whatsapp.href = buildWhatsappUrl();

    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.getElementById("main-nav");
    menuToggle?.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });

    nav?.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        menuToggle?.setAttribute("aria-expanded", "false");
      });
    });

    setupLeadModal();
  }

  function normalize(value = "") {
    return String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }

  function escapeAttribute(value = "") {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  function getQueryParam(name) {
    return new URLSearchParams(location.search).get(name);
  }

  window.ImobSite = {
    config,
    state,
    searchProperties,
    getProperty,
    submitLead,
    createPropertyCard,
    openLeadModal,
    normalizeAssetPath,
    getEffectivePrice,
    formatCurrency,
    formatPurpose,
    capitalize,
    propertyPageUrl,
    buildWhatsappUrl,
    escapeHtml,
    escapeAttribute,
    getQueryParam
  };

  document.addEventListener("DOMContentLoaded", setupGlobalUi);
})();
