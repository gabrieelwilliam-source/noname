# Checklist de teste v75

1. Importar `Automacao_Imobiliaria_v75_CRM_Unico_Imovel_Correto_Final.json` no n8n como novo workflow.
2. Desativar temporariamente v73/v74 para não receber webhooks duplicados no mesmo path.
3. Enviar lead do site/imóvel V10008.
4. Confirmar que chega somente 1 CRM interno.
5. Confirmar que o CRM mostra `V10008 — Apartamento 2 quartos no Anita Garibaldi`.
6. Confirmar que a última mensagem está limpa e não contém `messageContextInfo` ou `deviceListMetadata`.
7. Confirmar que a resposta ao cliente pergunta se deve acionar o corretor.
8. Repetir com V10009 para garantir que o imóvel não fica preso no contexto anterior.
