# Mapa técnico da automação imobiliária

## Visão geral

O projeto é composto por:

1. site/vitrine demonstrativa;
2. formulário de lead;
3. payload padronizado;
4. webhook n8n;
5. normalização do contato;
6. deduplicação;
7. identificação de mídia;
8. transcrição ou análise quando necessário;
9. memória/conversa;
10. IA de qualificação;
11. CRM/handoff;
12. resposta ao cliente;
13. follow-up;
14. resumo administrativo.

## Entrada de lead pelo site

O site monta um payload com campos como:

- nome;
- telefone;
- e-mail;
- mensagem;
- código do imóvel;
- título do imóvel;
- URL do imóvel;
- origem;
- finalidade;
- cenário;
- consentimento;
- tenant.

Quando `useWebhook` estiver `false`, o site abre WhatsApp como fallback demonstrativo.

Quando `useWebhook` estiver `true`, o site envia POST para o webhook configurado em `config.js`.

## Arquivos mais importantes

- `config.js`: dados da empresa, WhatsApp, webhook e modo de envio.
- `site.js`: modal, payload e envio/fallback.
- `atendimento.js`: cenários de entrada do site.
- `automation-demo.js`: cenários comerciais da página de venda.
- `imoveis-data.js`: catálogo local.
- `property.js`: página individual do imóvel.
- `home.js`: filtros e cards da vitrine.
- `para-imobiliarias.html`: landing de venda.
- `painel-demo.html`: prova de valor para o gestor/corretor.

## Workflow n8n

Principais blocos:

- entrada por webhook;
- filtro de eventos inválidos;
- normalização de mensagem;
- deduplicação;
- carregamento da configuração da imobiliária;
- roteamento por texto, áudio e imagem;
- IA e qualificação;
- CRM/handoff;
- agenda;
- resposta final;
- follow-up;
- relatórios.

## Como transformar em multi-cliente

O ideal é cada cliente ter:

- `TenantId` próprio;
- credenciais próprias;
- WhatsApp próprio;
- agenda própria;
- CRM próprio;
- catálogo próprio;
- prompt de tom de voz próprio.

Você pode manter um workflow base e duplicar por cliente no começo. Quando tiver muitos clientes, evolua para banco multi-tenant.

## Guardrails recomendados

A automação não deve:

- garantir disponibilidade sem confirmação;
- inventar preço;
- prometer aprovação de financiamento;
- dar aconselhamento jurídico;
- confirmar visita sem regra definida;
- enviar dados internos ao cliente;
- expor resumo interno do CRM;
- continuar insistindo se o cliente pedir para parar.

## Teste de ponta a ponta

Antes de entregar:

1. enviar lead pelo site;
2. enviar lead pelo WhatsApp;
3. enviar áudio;
4. enviar imagem;
5. pedir imóvel por código;
6. pedir visita;
7. pedir corretor;
8. simular duplicidade;
9. simular fora de horário;
10. verificar CRM;
11. verificar notificação do corretor;
12. verificar resposta ao cliente.
