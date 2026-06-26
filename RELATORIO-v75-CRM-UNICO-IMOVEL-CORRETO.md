RELATÓRIO v75 — CRM ÚNICO + IMÓVEL CORRETO

Problemas observados no teste real:
1. O CRM interno enviou duas mensagens para o mesmo lead.
2. A última mensagem do cliente entrou como JSON técnico do WhatsApp/Baileys.
3. O CRM usou o código correto V10008, mas herdou o objeto/título de outro imóvel anterior, V10009.
4. A resposta ao cliente ainda estava com menu longo, em vez de uma pergunta comercial direta.

Correções aplicadas no workflow v75:
- Removida conexão paralela do Motor Comercial direto para CRM interno/externo.
- O CRM interno agora passa pelo caminho de handoff/CRM único, evitando duas notificações para o mesmo lead.
- O nó de CRM resolve o imóvel sempre pelo código atual recebido no lead/site/URL antes de usar objeto herdado de contexto.
- Reforçada limpeza de JSON técnico: messageContextInfo, deviceListMetadata, senderKeyHash, recipientKeyHash e senderTimestamp não entram mais como última mensagem.
- Melhorada extração de rawText/messageText quando o provedor WhatsApp manda estruturas diferentes.
- A resposta para imóvel específico agora pergunta diretamente se deve acionar corretor para confirmar disponibilidade/visita.

Resultado esperado no teste V10008:
- Apenas um CRM interno.
- Imóvel correto: Apartamento 2 quartos no Anita Garibaldi.
- Última mensagem limpa, sem JSON técnico.
- Resposta ao cliente sem menu longo.

Credenciais, URLs, webhooks, paths, telefones e endpoints foram preservados.
