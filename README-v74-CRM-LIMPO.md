# v74 — CRM limpo e lead único

Esta versão corrige o comportamento observado no teste real de lead vindo do site:

1. O CRM não deve chegar duplicado para o mesmo lead/mensagem.
2. A última mensagem do cliente não deve exibir JSON técnico do WhatsApp/Baileys.
3. Quando o lead do site chega em formato de mensagem, a automação extrai nome, e-mail, WhatsApp, página, código e título do imóvel.
4. A resposta ao cliente fica mais consultiva e com uma pergunta principal.

## Teste recomendado

Envie pelo site um lead no imóvel V10009. O corretor/CRM deve receber apenas uma mensagem, com última mensagem legível, score, funil, imóvel, página e comandos de aceite.

## Exemplo esperado no CRM

🚨 CRM HORIZONTE PRIME — CONFIRMAR DISPONIBILIDADE
Nome: Gabriel William Brososki
Score comercial: 100/100 (urgente)
Funil: Confirmar disponibilidade
WhatsApp do cliente: +5547988927391
E-mail: gabrieelwilliam@gmail.com
Código do imóvel: V10009
Imóvel: Casa em condomínio em Pirabeiraba
Última mensagem do cliente:
Tenho interesse no imóvel V10009 - Casa em condomínio em Pirabeiraba. Gostaria de mais informações e disponibilidade.

## Observação

Não foram alterados webhooks, URLs, credenciais, tokens, telefones ou endpoints existentes.
