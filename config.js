// Horizonte Prime — reparo seguro v184.
// Mantém o comportamento estável do site. O atendimento continua pelo WhatsApp;
// a rota direta do webhook da Iana fica registrada, porém desativada nesta versão.
(function () {
  'use strict';
  function safeStoredWebhook() {
    try { return window.localStorage ? (localStorage.getItem('IMOB_N8N_SITE_WEBHOOK_URL') || '') : ''; }
    catch (e) { return ''; }
  }
  window.SITE_CONFIG = {
    businessName: 'Horizonte Prime Imóveis',
    businessShortName: 'Horizonte Prime',
    whatsappNumber: '5547999762742',
    city: 'Joinville',
    stateCode: 'SC',
    address: 'Joinville - SC',
    openingHours: 'Segunda a sábado, das 8h às 19h',

    // SAFE MODE: não faz POST cross-origin durante a recuperação do site.
    // O lead entra pelo WhatsApp, que já é atendido pela Iana.
    useWebhook: false,
    webhookUrl: window.IMOB_N8N_SITE_WEBHOOK_URL || safeStoredWebhook() || 'https://app.vps7376.panel.icontainer.cloud/webhook/iana-imob-site-lead',
    n8nSiteWebhookPath: 'iana-imob-site-lead',
    leadDestinationLabel: 'Iana',
    resultTitle: 'Atendimento iniciado',
    salesWhatsappMessage: 'Olá, quero atendimento imobiliário.',

    tenantId: 'horizonte-prime',
    leadSchemaVersion: 'site_lead_v184_safe',
    privacyUrl: 'privacidade.html',
    termsUrl: 'termos.html'
  };
})();
