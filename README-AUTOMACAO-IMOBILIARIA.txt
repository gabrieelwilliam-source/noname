# Pacote comercial — Automação Imobiliária + Site Demo

O produto principal agora está posicionado como AUTOMAÇÃO DE ATENDIMENTO PARA IMOBILIÁRIAS.
O site é uma vitrine demonstrativa para provar o fluxo funcionando antes do WhatsApp.

Arquivos principais:
- para-imobiliarias.html: página comercial para enviar às imobiliárias.
- index.html: site/vitrine demonstrativa com seção de simulação do fluxo.
- imovel.html: página de imóvel específico com formulário integrado.
- config.js: configurações de nome, telefone e webhook.
- automation-demo.js: cenários de simulação.
- site.js: monta payload estruturado para o n8n e usa WhatsApp como fallback.
- workflow-n8n-lais-imob-v46-ajustado.json: fluxo n8n revisado para entrada de site/formulário.

Como apresentar:
1. Envie para a imobiliária o link da página para-imobiliarias.html.
2. Mostre o problema: leads chegam incompletos e espalhados.
3. Clique em “Ver demonstração funcionando”.
4. Simule comprador, aluguel, proprietário ou visita.
5. Mostre que o lead chega com origem, intenção, código do imóvel e próxima ação.

Integração com n8n:
O fluxo já tem o webhook de site com path:
/webhook/lais-imob-site-lead

No config.js, quando quiser enviar diretamente ao n8n pelo site, preencha:
useWebhook: true,
webhookUrl: 'SUA_URL_PUBLICA_DO_WEBHOOK_AQUI'

Enquanto webhookUrl estiver vazio, o site funciona em modo demonstração e abre WhatsApp com a mensagem estruturada.

Importante:
As credenciais/URLs do fluxo n8n foram preservadas conforme solicitado. Antes de entregar para cliente real, recomenda-se migrar segredos para credentials/variáveis de ambiente e usar uma cópia por tenant/imobiliária.
