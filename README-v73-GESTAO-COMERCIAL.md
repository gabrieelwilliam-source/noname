# v73 — Gestão Comercial e Leads Quentes

Esta versão adiciona uma camada comercial sobre a automação imobiliária: o foco deixa de ser apenas responder leads e passa a ser controlar o funil, priorizar oportunidades e entregar leads quentes para vendedores com SLA.

## O que mudou

- Motor Comercial v73 após a governança de conversa.
- Score comercial de 0 a 100.
- Temperatura: frio, morno, quente e urgente.
- Estágio do funil: qualificação, visita solicitada, proposta/negociação, captação de proprietário, corretor solicitado, aguardando corretor etc.
- Handoff/CRM paralelo para lead quente.
- Mensagem interna ao corretor com score, temperatura, imóvel, última mensagem, SLA e comandos.
- Comandos do corretor por WhatsApp: ACEITAR, SEM PERFIL, EM ATENDIMENTO, VISITA MARCADA, PROPOSTA ENVIADA, FECHADO e PERDIDO.
- Alerta periódico de leads quentes sem aceite.
- Fluxo específico para proprietário/captação.

## Regra principal

Lead quente não espera. Se o cliente pedir visita, proposta, corretor, disponibilidade de imóvel específico ou captação, o sistema aciona a área comercial imediatamente, sem depender de uma conversa longa da IA.

## Preservação

Não foram alterados caminhos de webhook, URLs, endpoints, credenciais, tokens, IDs de credenciais, telefones ou integrações existentes. A v73 foi exportada como nova cópia, sem id/versionId principal, para evitar sobrescrever a v71/v72.
