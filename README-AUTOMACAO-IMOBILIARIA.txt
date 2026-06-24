# Pacote comercial — Automação Imobiliária

O produto está posicionado como AUTOMAÇÃO DE ATENDIMENTO PARA IMOBILIÁRIAS.
O site é a vitrine de demonstração. O valor principal está na qualificação, organização, CRM, handoff, agenda e follow-up.

Arquivos principais:
- COMECE-AQUI.html: central para navegar pelo pacote.
- para-imobiliarias.html: página comercial para enviar às imobiliárias.
- index.html: site/vitrine demonstrativa.
- imovel.html: página de imóvel específico com formulário.
- painel-demo.html: prova visual para corretor/gestor.
- roteiro-demo.html: roteiro de apresentação em reunião.
- checklist-implantacao.html: checklist visual de implantação.
- config.js: configurações de nome, telefone e webhook.
- workflow-n8n-produto-comercial-v58.json: workflow n8n preservado e renomeado como base comercial.

Como apresentar:
1. Abra COMECE-AQUI.html.
2. Abra para-imobiliarias.html.
3. Mostre o problema: leads chegam incompletos e espalhados.
4. Abra index.html e simule um comprador, aluguel, proprietário ou visita.
5. Abra painel-demo.html e mostre o lead estruturado para corretor.
6. Explique que o cliente receberá isso com os próprios imóveis, canais e equipe.

Integração com n8n:
No config.js, quando quiser enviar diretamente ao n8n pelo site:
useWebhook: true,
webhookUrl: 'SUA_URL_PUBLICA_DO_WEBHOOK_AQUI'

Enquanto useWebhook estiver false, o site funciona em modo demonstração e abre WhatsApp com mensagem estruturada.

Importante:
As credenciais/URLs existentes foram preservadas conforme solicitado. Antes de entregar para cliente real, duplique o pacote e ajuste dados, credenciais, política de privacidade, CRECI/CNPJ, corretores e catálogo da imobiliária na cópia do cliente.
