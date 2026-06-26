// Configurações principais do site — pacote v73 Comercial.
// As credenciais, telefones e URLs existentes foram mantidos. Para ativar POST direto no n8n,
// informe a URL pública completa do webhook em webhookUrl e altere useWebhook para true.
window.SITE_CONFIG = {
  businessName: 'Horizonte Prime Imóveis',
  businessShortName: 'Horizonte Prime',
  city: 'Joinville',
  state: 'SC',
  whatsappNumber: '5547999762742',
  email: 'atendimento@horizonteprime.com.br',
  address: 'Joinville - SC',
  openingHours: 'Segunda a sábado, das 8h às 19h',

  // Integração de atendimento.
  // false = formulário prepara atendimento real no WhatsApp.
  // true  = formulário envia o lead por POST para o webhook e só usa WhatsApp como contingência.
  // Para demo ponta a ponta: preencha a URL pública do webhook POST do n8n (/webhook/lais-imob-site-lead).
  // Também aceita window.IMOB_N8N_SITE_WEBHOOK_URL ou localStorage.IMOB_N8N_SITE_WEBHOOK_URL.
  useWebhook: true,
  webhookUrl: (window.IMOB_N8N_SITE_WEBHOOK_URL || (window.localStorage && localStorage.getItem('IMOB_N8N_SITE_WEBHOOK_URL')) || ''),
  n8nSiteWebhookPath: 'lais-imob-site-lead',
  leadDestinationLabel: 'equipe comercial',
  resultTitle: 'Lead estruturado recebido',
  salesWhatsappMessage: 'Olá, quero entender como essa automação pode atender, qualificar e organizar os leads da minha imobiliária.',

  // Campos comerciais usados no payload do lead.
  tenantId: 'horizonte-prime',
  leadSchemaVersion: 'site_lead_v73',
  privacyUrl: 'privacidade.html',
  termsUrl: 'termos.html'
};
