// Configurações principais do site.
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
  useWebhook: false,
  webhookUrl: '',
  n8nSiteWebhookPath: 'lais-imob-site-lead',
  leadDestinationLabel: 'equipe comercial',
  resultTitle: 'Lead estruturado recebido',
  salesWhatsappMessage: 'Olá, vi a demonstração da automação para imobiliárias. Quero entender como ela pode atender, qualificar e organizar os leads da minha imobiliária.',

  // Campos comerciais usados no payload do lead.
  tenantId: 'horizonte-prime',
  leadSchemaVersion: 'site_lead_v53',
  privacyUrl: 'privacidade.html',
  termsUrl: 'termos.html'
};
