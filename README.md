# Automação Imobiliária — pacote comercial e demo funcional

Site estático + material comercial + workflow n8n para demonstrar e vender automação de atendimento para imobiliárias.

## Objetivo do pacote

A solução foi posicionada para vender **automação de atendimento imobiliário**, não apenas site.

Promessa principal:

> A imobiliária recebe leads com contexto, intenção, imóvel de interesse, resumo e próxima ação para o corretor.

## Comece por aqui

Abra:

```text
COMECE-AQUI.html
```

Essa página mostra a ordem correta para navegar e apresentar o pacote.

## Páginas principais

- `para-imobiliarias.html`: landing comercial para donos de imobiliárias.
- `index.html`: vitrine demonstrativa da imobiliária.
- `imovel.html?codigo=V10001`: exemplo de imóvel específico.
- `painel-demo.html`: prova visual do que chega para corretor/gestor.
- `roteiro-demo.html`: roteiro de apresentação.
- `checklist-implantacao.html`: checklist visual para implantação.

## Documentos internos

- `README-ENTREGA-COMERCIAL.md`
- `PROPOSTA-COMERCIAL.md`
- `PLAYBOOK-VENDAS-IMOBILIARIAS.md`
- `MODELO-BRIEFING-CLIENTE.md`
- `CHECKLIST-IMPLANTACAO-CLIENTE.md`
- `ESCOPO-SERVICO-E-CONTRATO.md`
- `MENSAGENS-PRONTAS.md`
- `MAPA-TECNICO-IMPLANTACAO.md`
- `ENV-CLIENTE-TEMPLATE.txt`

## Configuração do site

Arquivo principal:

```text
config.js
```

Campos importantes:

- `businessName`
- `businessShortName`
- `city`
- `state`
- `whatsappNumber`
- `email`
- `address`
- `openingHours`
- `useWebhook`
- `webhookUrl`
- `tenantId`

## Modo de demonstração

Por padrão, o site usa:

```js
useWebhook: false
```

Nesse modo, o formulário prepara a mensagem estruturada e abre o WhatsApp.

## Modo conectado ao n8n

Para enviar lead por POST ao n8n:

```js
useWebhook: true,
webhookUrl: 'URL_PUBLICA_DO_WEBHOOK'
```

O payload enviado pelo site inclui origem, dados do lead, código do imóvel, URL, consentimento, cenário e tenant.

## Workflow n8n

Arquivo incluído:

```text
workflow-n8n-produto-comercial-v58.json
```

As credenciais e URLs existentes foram preservadas conforme solicitado. Ao vender para um cliente, duplique o workflow e ajuste a cópia.

## Rodar localmente

Não abra apenas pelo `file://`. Use servidor local:

```bash
python -m http.server 8080
```

Depois acesse:

```text
http://localhost:8080/COMECE-AQUI.html
```

## Publicar

Como o projeto é estático, pode ser publicado em:

- Vercel;
- Netlify;
- Cloudflare Pages;
- GitHub Pages.

## Cuidados antes de cliente real

- Revisar política de privacidade e termos.
- Ajustar CRECI, CNPJ e dados legais.
- Validar dados dos imóveis.
- Confirmar regras de disponibilidade, preço e agendamento.
- Trocar dados, telefones, credenciais e integrações na cópia do cliente.
- Testar todos os cenários de ponta a ponta.
