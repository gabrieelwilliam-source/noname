Lais Imob v48 — Conversa consultiva + CRM por marcos reais

O que foi corrigido:

1) O contexto de site não sequestra mais a conversa.
   Antes, mensagens posteriores como "quero confirmar disponibilidade" podiam voltar para a saudação inicial do imóvel.

2) "Mais detalhes" e "mais informações" ficam na automação.
   Não viram CRM, corretor ou handoff automático.

3) "Confirmar disponibilidade" é tratado como disponibilidade, não como visita.
   A automação responde que no catálogo/demo consta disponível e só aciona corretor se o lead pedir confirmação oficial/humano/visita.

4) O CRM interno foi reforçado para bloquear disponibilidade e pedido de informações.
   Continua enviando quando houver corretor explícito, proposta, negociação, visita real, captação de proprietário ou lead muito quente com marco comercial real.

5) As respostas foram ajustadas para parecerem mais consultivas e menos repetitivas.

Arquivo para importar no n8n:
workflow-n8n-lais-imob-v48-conversa-consultiva.json

Teste recomendado:
- "Mais informações" -> responde detalhes, sem CRM.
- "Quero confirmar disponibilidade" -> responde disponibilidade, sem CRM/visita.
- "Pode acionar o corretor para confirmar oficialmente" -> envia CRM.
- "Quero agendar uma visita" -> envia CRM/agenda conforme o fluxo.
- "Quero fazer proposta" -> envia CRM.
