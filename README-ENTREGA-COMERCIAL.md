# Pacote pronto para oferecer automação para imobiliárias

Este pacote foi reorganizado para você vender como serviço recorrente de automação imobiliária, e não apenas como site.

## O que vender

**Produto principal:** Automação de Atendimento Imobiliário 24h.

A promessa comercial é simples:

> A imobiliária deixa de receber mensagens soltas e passa a receber leads com origem, intenção, imóvel de interesse, resumo, status e próxima ação para o corretor.

## Páginas para apresentação

- `COMECE-AQUI.html` — central de navegação do pacote.
- `para-imobiliarias.html` — página comercial para enviar ao dono da imobiliária.
- `index.html` — vitrine demonstrativa do cliente final.
- `imovel.html?codigo=V10001` — exemplo de imóvel específico.
- `painel-demo.html` — prova visual do que chega para a equipe.
- `roteiro-demo.html` — roteiro de apresentação de 7 minutos.
- `checklist-implantacao.html` — checklist visual de implantação.

## Documentos internos para você

- `PROPOSTA-COMERCIAL.md` — posicionamento, planos, preços sugeridos e argumentos.
- `PLAYBOOK-VENDAS-IMOBILIARIAS.md` — como abordar e conduzir a venda.
- `MODELO-BRIEFING-CLIENTE.md` — perguntas para coletar dados da imobiliária.
- `CHECKLIST-IMPLANTACAO-CLIENTE.md` — passo a passo técnico e operacional.
- `ESCOPO-SERVICO-E-CONTRATO.md` — modelo de escopo para proposta/contrato.
- `MENSAGENS-PRONTAS.md` — mensagens de WhatsApp, follow-up e abordagem.
- `MAPA-TECNICO-IMPLANTACAO.md` — visão técnica da automação.
- `ENV-CLIENTE-TEMPLATE.txt` — lista de variáveis para copiar por cliente.

## Workflow n8n

- `workflow-n8n-produto-comercial-v58.json` — versão comercial replicável do workflow enviado.

As URLs e credenciais existentes foram preservadas conforme solicitado. Quando vender para uma imobiliária, duplique o projeto e troque os dados do cliente na cópia.

## Ordem certa para apresentar

1. Abra `para-imobiliarias.html`.
2. Mostre a dor: lead perdido, mensagem solta, corretor sem contexto.
3. Abra `index.html` e simule um cliente escolhendo imóvel.
4. Abra `painel-demo.html` e mostre o que a equipe recebe.
5. Feche com a frase: “Isso aqui pode estar conectado ao WhatsApp, site, Instagram e corretores da sua imobiliária.”

## Ordem certa para implantar em cliente real

1. Coletar briefing com `MODELO-BRIEFING-CLIENTE.md`.
2. Duplicar o pacote e renomear para o cliente.
3. Ajustar `config.js` com nome, telefone, cidade e textos.
4. Ajustar imóveis em `imoveis-data.js` ou integrar com CRM/Supabase.
5. Importar `workflow-n8n-produto-comercial-v58.json` no n8n.
6. Trocar credenciais, telefones, webhooks, CRM e agenda.
7. Fazer teste de ponta a ponta.
8. Entregar com treinamento rápido para a equipe.

## Observação importante

O pacote está preparado para demonstração e venda. Para cliente real, revise política de privacidade, termos, CRECI/CNPJ, consentimento LGPD, disponibilidade dos imóveis, autorização de mensagens e regras de atendimento humano.
