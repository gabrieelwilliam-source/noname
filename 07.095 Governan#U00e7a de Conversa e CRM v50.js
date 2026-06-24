
function safeNodeJson(nodeName, fallback = null) {
  try {
    const data = $items(nodeName, 0, 0);
    if (!data || !data.length) return fallback;
    return data[0]?.json ?? fallback;
  } catch (e) { return fallback; }
}
function parseObj(value) {
  if (!value) return {};
  if (typeof value === 'string') { try { return JSON.parse(value) || {}; } catch (e) { return {}; } }
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
function normalize(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}
function money(value, suffix = '') {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) return 'valor sob consulta';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }) + suffix;
}
function first(...values) {
  for (const v of values) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'string' && !v.trim()) continue;
    return v;
  }
  return null;
}
function compact(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'string' && !v.trim()) continue;
    if (Array.isArray(v) && !v.length) continue;
    out[k] = v;
  }
  return out;
}
function arr(v) { return Array.isArray(v) ? v : (v ? [v] : []); }
function listingKey(svc, key) { return String(first(svc?.listingCode, svc?.listingId, svc?.internalCode, key, '') || '').toUpperCase(); }
function listingLabel(svc, key) { return first(svc?.label, svc?.title, listingKey(svc, key), 'imóvel selecionado'); }
function listingPrice(svc) {
  if (!svc) return 'valor sob consulta';
  if (svc.purpose === 'locacao') return money(svc.rentValue || svc.priceFrom, '/mês');
  return money(svc.salePrice || svc.priceFrom || 0);
}
function totalRent(svc) {
  if (!svc || svc.purpose !== 'locacao') return null;
  const total = Number(svc.rentValue || svc.priceFrom || 0) + Number(svc.condoFee || 0) + Number(svc.iptu || 0);
  return total > 0 ? money(total, '/mês') : null;
}
function serviceByKey(services, key) {
  const k = String(key || '').toUpperCase();
  if (!k) return null;
  if (services[k]) return services[k];
  return Object.values(services || {}).find(s => String(first(s.listingCode, s.listingId, s.internalCode, '') || '').toUpperCase() === k) || null;
}
function serviceKeyByObject(services, svc) {
  if (!svc) return null;
  const code = listingKey(svc, '');
  for (const [k, v] of Object.entries(services || {})) {
    if (v === svc || listingKey(v, k) === code) return k;
  }
  return code || null;
}
function findSelectedListing(item, services) {
  let svc = item.selected_listing_object || item.favorite_listing_object || item.service || null;
  if (svc && typeof svc === 'object') return { key: serviceKeyByObject(services, svc), svc };
  const key = first(item.favorite_listing, item.service_key, item.site_property_code, item.site_listing_key, item.selected_listing, item.pending_context?.favorite_listing, item.pending_context?.service_key);
  svc = serviceByKey(services, key);
  return { key: key || (svc ? serviceKeyByObject(services, svc) : null), svc };
}
function scoreSimilar(base, svc) {
  if (!base || !svc || listingKey(base) === listingKey(svc)) return -999;
  let score = 0;
  if (base.purpose && svc.purpose === base.purpose) score += 45;
  if (base.category && normalize(svc.category) === normalize(base.category)) score += 28;
  if (base.city && normalize(svc.city) === normalize(base.city)) score += 12;
  if (base.neighborhood && normalize(svc.neighborhood) === normalize(base.neighborhood)) score += 18;
  if (Number(base.bedrooms || 0) && Number(svc.bedrooms || 0) === Number(base.bedrooms || 0)) score += 18;
  if (Number(base.parkingSpots || 0) && Number(svc.parkingSpots || 0) >= Number(base.parkingSpots || 0)) score += 6;
  const basePrice = Number(base.purpose === 'locacao' ? (base.rentValue || base.priceFrom || 0) : (base.salePrice || base.priceFrom || 0));
  const svcPrice = Number(svc.purpose === 'locacao' ? (svc.rentValue || svc.priceFrom || 0) : (svc.salePrice || svc.priceFrom || 0));
  if (basePrice && svcPrice) {
    const ratio = Math.abs(svcPrice - basePrice) / basePrice;
    if (ratio <= 0.2) score += 18;
    else if (ratio <= 0.5) score += 9;
    else if (ratio <= 0.9) score += 3;
  }
  return score;
}
function similarListings(base, services, broaden = false) {
  const rows = Object.entries(services || {}).map(([key, svc]) => ({ key, svc, score: scoreSimilar(base, svc) }))
    .filter(x => x.score > (broaden ? 35 : 55))
    .sort((a, b) => b.score - a.score)
    .slice(0, broaden ? 5 : 3);
  return rows;
}
function formatListingLine(row, idx) {
  const s = row.svc;
  const code = listingKey(s, row.key);
  const meta = [s.neighborhood, s.city].filter(Boolean).join(', ');
  const details = [s.bedrooms ? `${s.bedrooms} quarto${Number(s.bedrooms) === 1 ? '' : 's'}` : '', s.parkingSpots ? `${s.parkingSpots} vaga${Number(s.parkingSpots) === 1 ? '' : 's'}` : '', s.areaM2 ? `${s.areaM2} m²` : ''].filter(Boolean).join(' • ');
  return `*${idx + 1}) ${code} — ${listingLabel(s, row.key)}*\n${meta ? meta + ' • ' : ''}${listingPrice(s)}${s.purpose === 'locacao' && totalRent(s) ? ` • total aprox. ${totalRent(s)}` : ''}\n${details}${s.highlight ? `\n${s.highlight}` : ''}\n🔗 ${s.listingUrl || ''}`.trim();
}
function choiceIndex(text) {
  const t = normalize(text);
  const m = t.match(/\b(?:opcao|opção|numero|número)?\s*([1-5])\b/);
  if (m) return Number(m[1]) - 1;
  if (/\bprimeir[ao]\b/.test(t)) return 0;
  if (/\bsegund[ao]\b/.test(t)) return 1;
  if (/\bterceir[ao]\b/.test(t)) return 2;
  return null;
}
function setAsk(item, response, pendingPatch = {}, stage = 'qualificacao') {
  const pending = compact({ ...(item.pending_context || {}), ...pendingPatch, last_bot_text: response, last_response_at: new Date().toISOString() });
  item.action = 'ASK';
  item.stage = stage;
  item.status = 'awaiting_customer';
  item.handoff_reason = null;
  item.visit_interest = false;
  item.wants_visit = false;
  item.response_text = response;
  item.outbound_text = response;
  item.customer_response_text = response;
  item.next_best_action = pendingPatch.next_best_action || item.next_best_action || 'continuar_atendimento_automatico';
  item.pending_context = pending;
  item.crm_notify_intent = false;
  item.broker_notify_should_send = false;
  item.broker_notify_policy_reason = 'bloqueado_por_conversa_automatica_v50';
  item.message_contract = {
    ...(item.message_contract || {}),
    customer: { audience: 'customer', text: response },
    broker: { audience: 'broker', text: item.seller_summary || null, reason: null },
    admin: { audience: 'admin', trace_id: item.trace_id || null }
  };
  return item;
}
function setHandoff(item, response, reason, priority = 70) {
  item.action = 'HANDOFF';
  item.stage = 'handoff';
  item.status = 'awaiting_seller';
  item.handoff_reason = reason;
  item.response_text = response;
  item.outbound_text = response;
  item.customer_response_text = response;
  item.next_best_action = 'corretor_assumir_contato';
  item.pending_context = compact({ ...(item.pending_context || {}), handoff_requested: true, handoff_reason: reason, handoff_requested_at: new Date().toISOString() });
  item.crm_notify_intent = true;
  item.broker_notify_should_send = true;
  item.broker_notify_priority = priority;
  return item;
}

const cfg = safeNodeJson('05.03 Consolidar Configuração Runtime', safeNodeJson('05.01 Carregar Configuração da Imobiliária', {})) || {};
const snapshot = safeNodeJson('07.02 Recuperar Contexto do Lead', {}) || {};
const prevState = parseObj(snapshot.state || snapshot.customer_state || snapshot.state_json || snapshot.runtime_state || {});
const item = { ...($json || {}) };
const services = cfg.Services || cfg.Inventory || item.Services || {};
const pending = compact({ ...parseObj(prevState.pending_context), ...parseObj(snapshot.pending_context), ...parseObj(item.pending_context) });
item.pending_context = pending;

const rawText = String(first(item.canonical_text, item.original_text, item.inbound_text, item.ai_input_text, '') || '');
const t = normalize(rawText);
const aiIntent = normalize(first(item.last_intent, item.intent, item.ai_intent, item.micro_intent, item.intent_name, '') || '');
const { key: selectedKey, svc: selectedListing } = findSelectedListing(item, services);
if (selectedListing) {
  item.selected_listing_object = item.selected_listing_object || selectedListing;
  item.favorite_listing_object = item.favorite_listing_object || selectedListing;
  item.favorite_listing = first(item.favorite_listing, selectedKey, listingKey(selectedListing, selectedKey));
  item.service_key = first(item.service_key, selectedKey, listingKey(selectedListing, selectedKey));
  item.service_label = first(item.service_label, listingLabel(selectedListing, selectedKey));
}

const genericText = t.replace(/[,.!?;:]+/g, ' ').replace(/\s+/g, ' ').trim();
const genericYes = /^(sim|ok|okay|certo|beleza|blz|pode|pode sim|pode fazer|ok pode fazer|claro|isso|isso mesmo|quero sim|manda|mande|mostra|mostre|vamos|bora|perfeito)$/.test(genericText);
const asksMoreInfo = /(mais informacoes|mais informações|mais detalhes|detalhes|saber mais|me fala mais|me passe mais|me passa mais|informacoes sobre|informações sobre)/.test(t) || aiIntent === 'faq_property_details';
const asksAvailability = /(disponibilidade|disponivel|disponível|ainda tem|esta livre|está livre|esta disponivel|está disponível|pode confirmar se|confirmar se esta|confirmar se está|confirmar disponibilidade)/.test(t) || aiIntent === 'faq_availability';
const asksSimilar = /(parecid|semelhant|outras opcoes|outras opções|mais opcoes|mais opções|opcoes parecidas|opções parecidas|ampliar|bairros vizinhos|outros imoveis|outros imóveis)/.test(t) || aiIntent === 'similar_properties';
const explicitHuman = /(corretor|consultor|humano|atendente|responsavel|responsável|alguem da equipe|alguém da equipe|falar com|me liga|ligacao|ligação|whatsapp do corretor|acionar a equipe|aciona a equipe|equipe para confirmar|confirmacao oficial|confirmação oficial)/.test(t);
const visitIntent = /(visita|visitar|agendar|agenda|horario|horário|conhecer pessoalmente|ver pessoalmente|ir no imovel|ir no imóvel)/.test(t);
const proposalIntent = /(proposta|negociar|negociacao|negociação|reservar|reserva|fechar|contrato|sinal|entrada para fechar|quanto aceita|dou de entrada)/.test(t);
const ownerIntent = /(tenho um imovel|tenho um imóvel|quero anunciar|avaliar meu imovel|avaliar meu imóvel|vender meu imovel|vender meu imóvel|alugar meu imovel|alugar meu imóvel|captacao|captação|sou proprietario|sou proprietário)/.test(t) || ['owner_capture','property_valuation'].includes(aiIntent);
const availabilityOnly = asksAvailability && !explicitHuman && !visitIntent && !proposalIntent;
const infoOnly = asksMoreInfo && !explicitHuman && !visitIntent && !proposalIntent;
const pendingBroaden = ['broaden_similar','ampliar_busca_similares'].includes(String(pending.awaiting_choice_type || pending.pending_action || pending.next_conversation_focus || '')) || normalize(pending.last_bot_text).includes('posso ampliar');
const pendingAvailabilityChoice = String(pending.awaiting_choice_type || '') === 'availability_next_step';

// Escolha por número depois de apresentar alternativas
const chIdx = choiceIndex(t);
const presented = arr(pending.last_presented_listings);
if (chIdx !== null && presented[chIdx]) {
  const chosenKey = presented[chIdx];
  const chosen = serviceByKey(services, chosenKey);
  if (chosen) {
    const response = `Boa escolha. A opção *${listingKey(chosen, chosenKey)} — ${listingLabel(chosen, chosenKey)}* fica em ${chosen.neighborhood || 'região informada'}, ${chosen.city || cfg.Address || ''}.\n\n` +
      `Valor: *${listingPrice(chosen)}*${chosen.purpose === 'locacao' && totalRent(chosen) ? ` • total aprox. *${totalRent(chosen)}*` : ''}\n` +
      [chosen.bedrooms ? `${chosen.bedrooms} quarto${Number(chosen.bedrooms) === 1 ? '' : 's'}` : '', chosen.bathrooms ? `${chosen.bathrooms} banheiro${Number(chosen.bathrooms) === 1 ? '' : 's'}` : '', chosen.parkingSpots ? `${chosen.parkingSpots} vaga${Number(chosen.parkingSpots) === 1 ? '' : 's'}` : '', chosen.areaM2 ? `${chosen.areaM2} m²` : ''].filter(Boolean).join(' • ') +
      (chosen.highlight ? `\n${chosen.highlight}` : '') +
      (chosen.listingUrl ? `\n🔗 ${chosen.listingUrl}` : '') +
      `\n\nQuer que eu aprofunde nessa opção, compare com o imóvel anterior ou acione a equipe para confirmação oficial?`;
    item.service_key = chosenKey;
    item.favorite_listing = chosenKey;
    item.selected_listing_object = chosen;
    item.favorite_listing_object = chosen;
    return [{ json: setAsk(item, response, { awaiting_choice_type: 'listing_next_step', selected_listing: chosenKey, favorite_listing: chosenKey, last_presented_listings: presented, last_intent: 'listing_choice', last_response_topic: 'listing_choice' }, 'opcao_escolhida') }];
  }
}

// Handoff verdadeiro: humano explícito, proposta/negociação, ou visita real. Disponibilidade simples não entra aqui.
if ((explicitHuman && !availabilityOnly) || proposalIntent) {
  const label = selectedListing ? `*${listingKey(selectedListing, selectedKey)} — ${listingLabel(selectedListing, selectedKey)}*` : 'o atendimento atual';
  const reason = proposalIntent ? 'proposta_ou_negociacao' : 'pedido_explicito_corretor';
  const text = proposalIntent
    ? `Perfeito. Vou encaminhar sua intenção de proposta/negociação para a equipe com o contexto de ${label}. Assim eles conseguem te responder com segurança, sem você precisar repetir tudo.`
    : `Perfeito. Vou acionar a equipe responsável e enviar o contexto de ${label}. Enquanto o corretor assume, posso continuar te ajudando por aqui se surgir alguma dúvida.`;
  return [{ json: setHandoff(item, text, reason, proposalIntent ? 90 : 75) }];
}
if (ownerIntent) {
  const hasEnoughOwnerData = /(bairro|cidade|venda|vender|aluguel|alugar|casa|apartamento|terreno|valor|m2|m²)/.test(t) && rawText.length > 60;
  if (hasEnoughOwnerData || explicitHuman) {
    return [{ json: setHandoff(item, 'Recebi os dados iniciais do imóvel. Vou encaminhar para a equipe de captação/avaliação para seguir com uma análise mais precisa e combinar o próximo passo.', 'captacao_ou_avaliacao_de_imovel', 80) }];
  }
  return [{ json: setAsk(item, 'Ótimo. Para iniciar a avaliação do seu imóvel, me diga por favor: *tipo do imóvel*, *bairro/cidade* e se a ideia é *vender ou alugar*. Com isso eu já encaminho a captação com contexto.', { awaiting_choice_type: 'owner_capture_data', last_intent: 'owner_capture', last_response_topic: 'owner_capture' }, 'captacao_proprietario') }];
}
if (visitIntent && !asksAvailability) {
  // Deixa o roteamento de agenda seguir quando já houver data/hora. Se for pedido genérico, pergunta uma coisa por vez.
  const hasDateOrPeriod = /(hoje|amanha|amanhã|segunda|terca|terça|quarta|quinta|sexta|sabado|sábado|domingo|manha|manhã|tarde|noite|\d{1,2}:\d{2}|\d{1,2}h|\d{1,2}\/\d{1,2})/.test(t);
  if (!hasDateOrPeriod) {
    const label = selectedListing ? ` para *${listingLabel(selectedListing, selectedKey)}*` : '';
    return [{ json: setAsk(item, `Consigo organizar isso${label}. Qual dia ou período fica melhor para você: manhã, tarde ou fim do dia?`, { awaiting_choice_type: 'visit_period', last_intent: 'visit_booking', favorite_listing: selectedKey || item.favorite_listing, last_response_topic: 'visit_booking' }, 'visita_pendente') }];
  }
  // Quando tem data/período, mantém ação do fluxo para consultar agenda/check.
}

// Disponibilidade simples: não chamar corretor e não repetir todo o imóvel.
if (availabilityOnly && selectedListing) {
  const available = normalize(first(selectedListing.availabilityStatus, selectedListing.commercialStatus, selectedListing.status, 'disponível'));
  const label = `*${listingKey(selectedListing, selectedKey)} — ${listingLabel(selectedListing, selectedKey)}*`;
  const statusText = available.includes('indis') || available.includes('vend') || available.includes('alug') || available.includes('reserv')
    ? `No catálogo, esse imóvel aparece como *${first(selectedListing.availabilityStatus, selectedListing.commercialStatus, selectedListing.status)}*.`
    : `No catálogo, o ${label} aparece como *disponível para atendimento*.`;
  const response = `${statusText}\n\nComo disponibilidade pode mudar rápido, a confirmação oficial fica com a equipe antes de visita ou proposta.\n\nVocê prefere que eu *acione a equipe para confirmação oficial*, te mostre *opções parecidas* ou explique *garantias/documentos*?`;
  return [{ json: setAsk(item, response, { awaiting_choice_type: 'availability_next_step', favorite_listing: selectedKey || item.favorite_listing, last_intent: 'faq_availability', last_response_topic: 'availability', next_best_action: 'aguardar_escolha_disponibilidade' }, 'consulta_disponibilidade') }];
}

// Se o usuário respondeu "ok" depois de uma pergunta com múltiplos caminhos, pedir esclarecimento em vez de reiniciar.
if (genericYes && pendingAvailabilityChoice) {
  const response = 'Perfeito. Só me confirma qual caminho você prefere agora:\n\n1) acionar a equipe para confirmação oficial de disponibilidade;\n2) ver opções parecidas;\n3) entender garantias/documentos e custos para avançar.';
  return [{ json: setAsk(item, response, { awaiting_choice_type: 'availability_next_step', last_intent: 'clarify_next_step', last_response_topic: 'clarification' }, 'escolha_proximo_passo') }];
}


// Resposta genérica depois de listar opções: pedir escolha, não repetir o imóvel original.
if (genericYes && String(pending.awaiting_choice_type || '') === 'choose_listing_or_handoff' && presented.length) {
  const labels = presented.slice(0, 5).map((key, idx) => {
    const svc = serviceByKey(services, key);
    return `${idx + 1}) ${svc ? `${listingKey(svc, key)} — ${listingLabel(svc, key)}` : key}`;
  }).join('\n');
  const response = `Perfeito. Me diga qual opção você quer aprofundar:\n\n${labels}\n\nVocê também pode responder “acionar corretor” se quiser que a equipe siga com você.`;
  return [{ json: setAsk(item, response, { awaiting_choice_type: 'choose_listing_or_handoff', last_presented_listings: presented, favorite_listing: selectedKey || item.favorite_listing, last_intent: 'choose_listing_prompt', last_response_topic: 'choose_listing_prompt' }, 'escolha_de_opcao') }];
}

// Resposta genérica depois de detalhes/disponibilidade: esclarecer o próximo caminho.
if (genericYes && ['property_details_next_step','property_next_step','next_step_after_repeat','listing_next_step'].includes(String(pending.awaiting_choice_type || ''))) {
  const response = 'Perfeito. Só me confirma o próximo passo que você prefere:\n\n1) confirmar disponibilidade oficial;\n2) ver opções parecidas;\n3) entender garantias/documentos;\n4) organizar visita;\n5) falar com corretor.';
  return [{ json: setAsk(item, response, { awaiting_choice_type: 'property_next_step', last_intent: 'clarify_next_step', last_response_topic: 'clarification' }, 'escolha_proximo_passo') }];
}

// Opções parecidas / ampliar busca.
if ((asksSimilar || (genericYes && pendingBroaden)) && selectedListing) {
  const broaden = genericYes && pendingBroaden;
  const rows = similarListings(selectedListing, services, broaden);
  if (rows.length) {
    const intro = broaden
      ? `Perfeito. Ampliei a busca além dos critérios iniciais de *${listingLabel(selectedListing, selectedKey)}* e encontrei estas opções para comparar:`
      : `Consigo sim. Comparando com *${listingLabel(selectedListing, selectedKey)}*, estas são as opções mais próximas no catálogo:`;
    const response = `${intro}\n\n${rows.map(formatListingLine).join('\n\n')}\n\nMe diga o número da opção que você quer aprofundar, ou peça para eu acionar a equipe se quiser confirmação oficial.`;
    return [{ json: setAsk(item, response, { awaiting_choice_type: 'choose_listing_or_handoff', last_presented_listings: rows.map(x => x.key), favorite_listing: selectedKey || item.favorite_listing, last_intent: 'similar_properties', last_response_topic: 'similar_options', next_best_action: 'aguardar_escolha_opcao' }, 'apresentando_opcoes') }];
  }
  const response = `No catálogo atual não encontrei uma alternativa realmente próxima de *${listingLabel(selectedListing, selectedKey)}* usando os mesmos critérios. Posso ampliar por bairro, faixa de valor ou tipo de imóvel para tentar encontrar algo compatível.`;
  return [{ json: setAsk(item, response, { awaiting_choice_type: 'broaden_similar', pending_action: 'ampliar_busca_similares', favorite_listing: selectedKey || item.favorite_listing, last_intent: 'similar_properties', last_response_topic: 'similar_no_match' }, 'sem_opcoes_proximas') }];
}

// Mais detalhes: responder sem chamar corretor e sem reiniciar saudação do site.
if (infoOnly && selectedListing) {
  const alreadyDetailed = String(pending.last_response_topic || '') === 'property_details';
  const label = `*${listingKey(selectedListing, selectedKey)} — ${listingLabel(selectedListing, selectedKey)}*`;
  const rentParts = selectedListing.purpose === 'locacao'
    ? [`Aluguel: *${money(selectedListing.rentValue || selectedListing.priceFrom)}*`, selectedListing.condoFee ? `Condomínio: *${money(selectedListing.condoFee)}*` : '', selectedListing.iptu ? `IPTU: *${money(selectedListing.iptu)}*` : '', totalRent(selectedListing) ? `Total aprox.: *${totalRent(selectedListing)}*` : ''].filter(Boolean).join('\n')
    : [`Valor: *${listingPrice(selectedListing)}*`, selectedListing.condoFee ? `Condomínio: *${money(selectedListing.condoFee)}*` : '', selectedListing.iptu ? `IPTU: *${money(selectedListing.iptu)}*` : ''].filter(Boolean).join('\n');
  const details = [selectedListing.bedrooms ? `${selectedListing.bedrooms} quarto${Number(selectedListing.bedrooms) === 1 ? '' : 's'}` : '', selectedListing.bathrooms ? `${selectedListing.bathrooms} banheiro${Number(selectedListing.bathrooms) === 1 ? '' : 's'}` : '', selectedListing.parkingSpots ? `${selectedListing.parkingSpots} vaga${Number(selectedListing.parkingSpots) === 1 ? '' : 's'}` : '', selectedListing.areaM2 ? `${selectedListing.areaM2} m²` : ''].filter(Boolean).join(' • ');
  const response = alreadyDetailed
    ? `Já te passei os principais dados do ${label}. Para avançar melhor, posso seguir por um destes caminhos:\n\n1) confirmar disponibilidade oficial;\n2) explicar garantias/documentos;\n3) mostrar opções parecidas;\n4) organizar uma visita.`
    : `${label}\n${selectedListing.neighborhood || ''}${selectedListing.city ? ', ' + selectedListing.city : ''}\n${details}\n\n${rentParts}\n${selectedListing.highlight ? `\nDestaque: ${selectedListing.highlight}` : ''}\n${arr(selectedListing.rentalGuarantees).length ? `\nGarantias informadas: ${arr(selectedListing.rentalGuarantees).join(', ')}` : ''}\n${selectedListing.listingUrl ? `\n🔗 ${selectedListing.listingUrl}` : ''}\n\nQuer que eu confirme disponibilidade, explique garantias/documentos ou mostre opções parecidas?`;
  return [{ json: setAsk(item, response, { awaiting_choice_type: alreadyDetailed ? 'property_next_step' : 'property_details_next_step', favorite_listing: selectedKey || item.favorite_listing, last_intent: 'faq_property_details', last_response_topic: 'property_details' }, 'detalhes_imovel') }];
}

// Se a IA/score transformou disponibilidade/detalhes/similares em handoff, desfaz aqui.
if (item.action === 'HANDOFF' && (availabilityOnly || infoOnly || asksSimilar) && !explicitHuman && !proposalIntent && !visitIntent) {
  const fallback = selectedListing
    ? `Consigo continuar por aqui com o imóvel *${listingLabel(selectedListing, selectedKey)}*. Posso confirmar status no catálogo, explicar custos/garantias ou procurar opções parecidas.`
    : 'Consigo continuar por aqui. Me diga se você quer ver opções, tirar dúvidas de documentação/valores ou falar com um corretor.';
  return [{ json: setAsk(item, fallback, { awaiting_choice_type: 'auto_continue', favorite_listing: selectedKey || item.favorite_listing, last_intent: aiIntent || 'general', last_response_topic: 'auto_unhandoff' }, 'atendimento_automatico') }];
}

// Proteção contra loops: se a resposta final ficou igual à última, force uma pergunta de próximo passo.
const lastBot = normalize(pending.last_bot_text || snapshot.last_bot_text || prevState.last_bot_text || '');
const currentResponse = normalize(item.response_text || item.outbound_text || '');
if (currentResponse && lastBot && currentResponse === lastBot && selectedListing) {
  const response = `Para não te repetir as mesmas informações do *${listingLabel(selectedListing, selectedKey)}*, me diga qual próximo passo faz mais sentido:\n\n1) confirmar disponibilidade oficial;\n2) ver opções parecidas;\n3) entender garantias/documentos;\n4) organizar visita.`;
  return [{ json: setAsk(item, response, { awaiting_choice_type: 'next_step_after_repeat', favorite_listing: selectedKey || item.favorite_listing, last_intent: 'avoid_repeat', last_response_topic: 'anti_loop' }, 'escolha_proximo_passo') }];
}

// Marca versão e passa adiante.
item.conversation_governance_version = 'v50';
item.pending_context = compact({ ...(item.pending_context || {}), governance_version: 'v50', last_inbound_text: rawText, last_intent: item.last_intent || aiIntent || null });
return [{ json: item }];
