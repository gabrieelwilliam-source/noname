# Checklist de Testes v73

## Lead quente

- [ ] Site com imóvel V10001: gera score maior que lead genérico.
- [ ] Mensagem “Quero visitar”: marca visita_solicitada e broker_acceptance_required.
- [ ] Mensagem “Quero fazer proposta”: action HANDOFF e headline de proposta.
- [ ] Mensagem “Quero falar com corretor”: aciona corretor imediatamente.
- [ ] Mensagem “Está disponível?” em imóvel específico: aciona confirmação de disponibilidade.

## Corretor

- [ ] Corretor recebe mensagem com score, funil, imóvel, última mensagem e comandos.
- [ ] Corretor responde ACEITAR e recebe confirmação.
- [ ] Corretor responde VISITA MARCADA e recebe orientação.
- [ ] Corretor responde PROPOSTA ENVIADA e recebe orientação de follow-up.
- [ ] Corretor responde FECHADO/PERDIDO e recebe confirmação.

## Dono/Gestor

- [ ] Resumo diário mostra leads quentes, visitas, captações, handoffs sem aceite e SLA.
- [ ] Alerta de lead quente sem aceite funciona quando houver pendência no backend.
- [ ] Fila admin continua separada do atendimento comum.

## Captação

- [ ] “Quero vender meu imóvel” entra em owner_capture_flow.
- [ ] Sistema solicita ou registra tipo, bairro, valor esperado, fotos, ocupação e urgência.
- [ ] Handoff vai para responsável/captador.
