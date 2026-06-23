# Lais Imob v50 — pacote produção/demo

Esta versão ajusta o site e o fluxo para apresentação comercial a donos de imobiliária.

## O que mudou no site
- Página comercial reposicionada: vende automação de atendimento, não “site”.
- Novo painel demo: `painel-demo.html` mostra o que o corretor/gestor recebe.
- Novo roteiro: `roteiro-demo.html` guia uma apresentação em 7 minutos.
- Novo checklist: `checklist-implantacao.html` lista o que precisa trocar em uma imobiliária real.
- Página inicial ganhou aviso claro de demonstração v50.

## O que mudou no fluxo n8n
- Novo nó `07.095 Governança de Conversa e CRM v50`.
- Memória de etapa para disponibilidade, detalhes, opções parecidas e escolhas por número.
- “Mais informações”, “confirmar disponibilidade” e “opções parecidas” não disparam CRM.
- `Ok, pode fazer` respeita o contexto anterior quando o bot perguntou se podia ampliar a busca.
- Proteção contra loops e respostas repetidas.
- CRM só deve disparar por marco comercial: corretor/humano, visita, proposta/negociação, captação ou lead realmente muito quente.

## Arquivo para importar no n8n
`workflow-n8n-lais-imob-v50-producao-demo.json`

## Demonstração recomendada
1. Abra `para-imobiliarias.html`.
2. Clique em “Testar fluxo como cliente”.
3. Envie interesse em um imóvel.
4. No WhatsApp, teste: “mais informações”, “está disponível?”, “opções parecidas”, “ok pode fazer”, “quero falar com corretor”.
5. Mostre `painel-demo.html` para explicar o valor para gestão.

## Produção real
Antes de vender implantação definitiva, trocar:
- Nome, CNPJ, CRECI, WhatsApp e dados da imobiliária.
- Catálogo demo por fonte real: CRM, planilha, Supabase ou API.
- Corretores e responsáveis.
- Agenda real.
- Política LGPD/privacidade.
- Webhook público e credenciais do cliente.
