# Riscos Restantes — v72

1. Credenciais preservadas dentro do workflow por solicitação: para cliente real, migrar para credenciais/variáveis do n8n antes de compartilhar.
2. Deduplicação persistente depende de tabela/constraint no Supabase; fallback local funciona, mas não é ideal para múltiplas instâncias.
3. Agenda real depende do calendário configurado e permissões da credencial Google Calendar.
4. BrokerNotificationTestMode deve ser desligado em produção para não concentrar todos os handoffs no telefone de teste.
5. O catálogo demo deve ser substituído por fonte real da imobiliária antes de vender como produção.
6. Regras comerciais de proposta, pet, garantia e financiamento precisam de aprovação da imobiliária cliente.
7. Testes de áudio e imagem dependem da disponibilidade real de mídia/URL/base64 no provedor.
