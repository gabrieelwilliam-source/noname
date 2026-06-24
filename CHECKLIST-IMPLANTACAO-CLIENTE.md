# Checklist de implantação — Cliente real

## 1. Preparar ambiente

- Duplicar pasta do projeto.
- Duplicar workflow n8n.
- Definir `TenantId` do cliente.
- Conferir URL pública do n8n.
- Conferir domínio ou subdomínio do site.
- Conferir provedor de WhatsApp/API.
- Conferir banco/CRM/planilha.

## 2. Configurar site

Arquivos principais:

- `config.js`;
- `imoveis-data.js`;
- `privacidade.html`;
- `termos.html`;
- imagens dos imóveis.

Ajustar:

- nome da imobiliária;
- cidade;
- telefone;
- e-mail;
- endereço;
- horários;
- WhatsApp;
- textos comerciais;
- links;
- CRECI/CNPJ se aplicável.

## 3. Configurar imóveis

Validar para cada imóvel:

- código;
- status;
- preço;
- finalidade;
- bairro;
- fotos;
- descrição;
- responsável;
- link;
- regras de disponibilidade.

## 4. Configurar automação n8n

- Importar `workflow-n8n-produto-comercial-v58.json`.
- Trocar nome do workflow para o cliente.
- Ajustar node de configuração da imobiliária.
- Ajustar telefone dos corretores.
- Ajustar credenciais/API.
- Ajustar agenda.
- Ajustar CRM.
- Ajustar mensagens de follow-up.
- Testar webhook de entrada.

## 5. Testes obrigatórios

Teste estes cenários:

- comprador genérico;
- aluguel genérico;
- investidor;
- proprietário querendo anunciar;
- imóvel específico por código;
- pedido de visita;
- pedido de corretor humano;
- pergunta sobre disponibilidade;
- mensagem de áudio;
- mensagem duplicada;
- mensagem fora do horário;
- lead sem telefone;
- follow-up após inatividade;
- notificação para corretor;
- resumo para gestor.

## 6. Validação com cliente

Pedir aprovação de:

- tom das respostas;
- dados da empresa;
- regras comerciais;
- dados dos imóveis;
- horários;
- mensagens de follow-up;
- handoff para humano;
- política de privacidade.

## 7. Entrega

Entregar:

- link do site;
- link de teste;
- explicação para equipe;
- lista de cenários testados;
- canais conectados;
- contato de suporte;
- regras de manutenção mensal.

## 8. Manutenção mensal

- Revisar falhas.
- Revisar leads perdidos.
- Ajustar perguntas.
- Ajustar mensagens.
- Atualizar imóveis.
- Ajustar follow-up.
- Medir volume de leads e handoffs.
