# Checklist de Testes Ponta a Ponta — v72

Marque cada teste antes de considerar a automação pronta.

## Entrada e normalização
- [ ] Lead do site com imóvel `V10001` entra como `site_form` e `specific_property`.
- [ ] Lead do site com imóvel `L92502` entra como `site_form` e `specific_property`.
- [ ] Lead sem código buscando aluguel vira busca genérica e pergunta objetivo/faixa.
- [ ] Lead buscando compra com faixa de valor preserva finalidade e orçamento.
- [ ] Proprietário querendo vender/alugar vira intenção de captação.

## Conversa e contexto
- [ ] Cliente manda “Bom dia” depois de imóvel selecionado e o fluxo mantém o contexto.
- [ ] Cliente manda “Visita” e não recebe catálogo genérico.
- [ ] Cliente manda “Quero visitar amanhã à tarde” e a agenda sugere/confirma horário conforme disponibilidade.
- [ ] Cliente manda “Está disponível?” e recebe resposta sem promessa absoluta.
- [ ] Cliente manda “Documentos” e recebe orientação sem prometer aprovação.
- [ ] Cliente manda “Sim” depois de pergunta de handoff e o contexto anterior é respeitado.
- [ ] Cliente manda “Ok, fico no aguardo” depois do corretor ser acionado e o estado fica aguardando corretor.

## Handoff, CRM e corretor
- [ ] “Quero falar com corretor” gera handoff.
- [ ] “Quero fazer uma proposta” gera handoff e resumo interno.
- [ ] Resumo do corretor contém nome, telefone, origem, imóvel, código, finalidade, intenção, última mensagem, próxima ação e SLA.
- [ ] BrokerNotificationTestMode está documentado e testável.

## Mídias
- [ ] Cliente manda áudio e o texto transcrito vira mensagem canônica.
- [ ] Cliente manda imagem e a análise entra como contexto sem quebrar o fluxo.

## Agenda
- [ ] Reagendamento de visita cria novo evento e remove/atualiza o antigo conforme fluxo.
- [ ] Cancelamento de visita atualiza calendário/banco.
- [ ] Conflito de agenda sugere horários alternativos.
- [ ] Horário comercial, duração e buffer do imóvel são respeitados.

## Follow-up e admin
- [ ] Follow-up por inatividade não dispara se o lead respondeu recentemente ou pediu sair.
- [ ] Lembrete 24h antes da visita funciona.
- [ ] Confirmação no dia/pós-visita estão documentadas.
- [ ] Resumo diário admin funciona.
- [ ] Resumo semanal admin funciona.
- [ ] Comandos admin não se misturam ao atendimento comum.
