Lais Imob v49 — Correção de conversa contextual

O que foi corrigido:

1) "Confirmar disponibilidade" agora é tratado como consulta de disponibilidade, não como visita e não como detalhes do imóvel.
2) "Ok, pode fazer" depois de a automação oferecer ampliar a busca agora continua o contexto e apresenta opções ampliadas.
3) O contexto de lead vindo do site não sequestra mais respostas comuns da conversa.
4) A busca por imóveis parecidos ficou menos rígida: se não houver opção no mesmo bairro/faixa, a automação abre bairro, faixa e tipo de imóvel de forma controlada.
5) Pedidos de custos/garantias continuam na automação e não viram CRM automaticamente.
6) O SLA deixa de virar P1 só porque o lead tem score alto quando ele está apenas pedindo informações ou disponibilidade.

Testes sugeridos:
- "Quero confirmar a disponibilidade" => responde disponibilidade e não CRM.
- "Posso ver outras opções parecidas?" => tenta parecidas.
- Se não houver match e a automação perguntar se pode ampliar, responder "Ok, pode fazer" => deve apresentar opções ampliadas, não repetir o imóvel original.
- "Quero falar com o corretor" => envia CRM.
- "Quero agendar visita" => segue para agendamento/CRM.

Importe no n8n:
workflow-n8n-lais-imob-v49-conversa-contextual.json
