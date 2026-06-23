CORREÇÃO CRM V47 — NOTIFICAÇÃO APENAS EM MARCOS COMERCIAIS

Problema corrigido:
- O fluxo estava enviando CRM interno a cada mensagem porque lead quente/score alto virava HANDOFF automaticamente.
- A notificação também usava deduplicação baseada no texto da mensagem, então cada nova frase do lead virava novo alerta.
- Mensagens como “quero mais detalhes” eram tratadas como necessidade de corretor.

O que mudou:
1. Lead quente comum continua sendo qualificado, mas não vira CRM interno automaticamente.
2. CRM interno só é enviado quando houver um destes marcos:
   - pedido explícito de corretor/humano/consultor;
   - proposta, negociação, reserva, contrato ou fechamento;
   - visita/agendamento;
   - proprietário/captação/avaliação;
   - lead MUITO quente, por padrão score >= 90 e com contexto comercial forte.
3. Pedidos de informação, como “mais detalhes”, “saber mais” e “mais informações”, ficam na automação.
4. Foi adicionada trava anti-spam por cliente + imóvel, com janela padrão de 6 horas.
5. A mensagem interna do CRM agora muda o título conforme o motivo: LEAD PEDIU CORRETOR, LEAD PEDIU VISITA, LEAD MUITO QUENTE etc.
6. Foi corrigido o risco de aparecer [object Object] na última mensagem do cliente.

Como ajustar o limite de lead muito quente:
- Use BROKER_NOTIFY_HOT_SCORE=90 nas variáveis de ambiente, ou ajuste SLAConfig.broker_notify_hot_score.

Como ajustar a janela anti-spam:
- Use BROKER_NOTIFY_THROTTLE_HOURS=6 nas variáveis de ambiente.

Arquivo principal alterado:
- workflow-n8n-lais-imob-v47-crm-inteligente.json

Importante:
- URLs e credenciais foram preservadas conforme solicitado.
