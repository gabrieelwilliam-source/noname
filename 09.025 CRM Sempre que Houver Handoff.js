function normalize(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}
function hash32(input) {
  const s = String(input || '');
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
function safeNodeJson(nodeName, fallback = {}) {
  try {
    const data = $items(nodeName, 0, 0);
    return data?.[0]?.json || fallback;
  } catch (e) {
    return fallback;
  }
}
function num(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function hasAny(t, words) {
  return words.some((w) => t.includes(normalize(w)));
}

const current = $json || {};
const fromOrchestrator = safeNodeJson('07.10 Orquestrar Próxima Ação', {});
const fromSla = safeNodeJson('07.08 Definir SLA e Roteamento Comercial', {});
const fromRules = safeNodeJson('07.09 Aplicar Regras Imobiliárias Avançadas', {});
const cfg = safeNodeJson('05.03 Consolidar Configuração Runtime', safeNodeJson('05.01 Carregar Configuração da Imobiliária', {}));
const item = { ...fromOrchestrator, ...fromSla, ...fromRules, ...current };

const store = $getWorkflowStaticData('global');
store._brokerNotifyV49 ??= {};
const now = Date.now();
const ttlHours = num(cfg.BrokerNotifyThrottleHours || $env.BROKER_NOTIFY_THROTTLE_HOURS, 6);
const ttlMs = ttlHours * 60 * 60 * 1000;
for (const [key, rec] of Object.entries(store._brokerNotifyV49)) {
  const ts = typeof rec === 'object' ? Number(rec.ts || 0) : Number(rec || 0);
  if (!Number.isFinite(ts) || now - ts > Math.max(ttlMs, 60 * 60 * 1000)) delete store._brokerNotifyV49[key];
}

const action = normalize(item.action || '');
const intent = normalize(item.last_intent || item.inferred_intent || item.intent || '');
const stage = normalize(item.stage || '');
const reason = normalize(item.handoff_reason || item.message_contract?.broker?.reason || '');
const inbound = normalize(item.canonical_text || item.inbound_text || item.original_text || '');
const selected = String(item.favorite_listing || item.service_key || item.selected_listing || item.site_property_code || '').trim();
const contactKey = String(item.contact_key || item.phone_e164 || item.customer_phone || item.contact_id || '').trim() || 'unknown';
const score = num(item.lead_score, 0);
const brokerNotifyHotScore = num(item.broker_notify_score_threshold || cfg.BrokerNotifyHotScore || cfg.SLAConfig?.broker_notify_hot_score || $env.BROKER_NOTIFY_HOT_SCORE, 90);

const explicitHuman =
  intent === 'human_handoff' ||
  item.explicit_human_intent === true ||
  hasAny(inbound + ' ' + reason, ['corretor','corretora','consultor','consultora','humano','atendente','falar com','conversar com','me ligue','me chama','quero contato','passa para','encaminha para']);
const proposalSignal =
  item.proposal_intent === true ||
  intent === 'negotiation_proposal' ||
  hasAny(inbound + ' ' + reason, ['proposta','fechar','sinal','reservar','contrato','quero esse','quero fechar','documentacao','documentação','valor que faria sentido']);
const appointmentSignal =
  item.visit_interest === true ||
  ['visit_booking','visit_reschedule','visit_confirm','visit_cancel'].includes(intent) ||
  hasAny(inbound + ' ' + reason + ' ' + stage, ['visita','visitar','agendar','agenda','horario','horário','conhecer o imovel','conhecer o imóvel']);
const ownerSignal =
  item.owner_intent === true ||
  item.lead_journey === 'captacao_proprietario' ||
  ['owner_capture','property_valuation'].includes(intent) ||
  hasAny(inbound + ' ' + reason, ['captacao','captação','avaliacao','avaliação','proprietario','proprietário','vender meu','meu imovel','meu imóvel','anunciar']);
const passiveAck = /^(?:ok|okay|certo|beleza|blz|obrigad[oa]?|valeu|show|perfeito|combinado|aguardo|vou aguardar|fico aguardando)[\s!.]*$/.test(inbound);
const availabilitySignal = item.availability_intent === true || intent === 'faq_availability' || hasAny(inbound, ['disponivel','disponível','disponibilidade','ainda tem','ainda esta disponivel','ainda está disponível','esta livre','está livre','confirmar se esta','confirmar se está','pode confirmar','ja alugou','já alugou','ja vendeu','já vendeu']);
const asksOnlyInfo = item.asks_only_info === true || availabilitySignal || hasAny(inbound, ['mais detalhes','mais informacoes','mais informações','detalhes','saber mais','me passa detalhes']);
const superHot = (item.super_hot_lead === true || score >= brokerNotifyHotScore) && !asksOnlyInfo && Boolean(selected || item.budget_max || item.monthly_income || item.down_payment || item.payment_mode);

let policyReason = null;
let priority = 0;
if (explicitHuman) { policyReason = 'pedido_explicito_de_corretor'; priority = 60; }
else if (proposalSignal) { policyReason = 'proposta_ou_negociacao'; priority = 55; }
else if (!availabilitySignal && appointmentSignal) { policyReason = 'visita_ou_agendamento'; priority = 50; }
else if (ownerSignal) { policyReason = 'captacao_ou_avaliacao_de_imovel'; priority = 50; }
else if (superHot) { policyReason = `lead_muito_quente_score_${score}`; priority = 40; }
else if (action === 'handoff' && !asksOnlyInfo && !passiveAck) { policyReason = reason ? `handoff_${reason}` : 'handoff_sem_motivo_especifico'; priority = 20; }

let shouldSend = priority > 0;
if (passiveAck) { shouldSend = false; policyReason = 'bloqueado_por_resposta_passiva'; priority = 0; }
if (availabilitySignal && !explicitHuman && !proposalSignal && !ownerSignal) {
  shouldSend = false;
  policyReason = 'bloqueado_por_consulta_de_disponibilidade';
  priority = 0;
}

const availabilityOnlyV50 = /\b(disponibilidade|disponivel|disponível|ainda tem|esta livre|está livre|confirmar se|confirmar disponibilidade)\b/.test(t) && !explicitHuman && !proposalSignal && !appointmentSignal && !ownerSignal;
const similarOnlyV50 = /\b(parecid|semelhant|outras opcoes|outras opções|mais opcoes|mais opções|ampliar busca)\b/.test(t) && !explicitHuman && !proposalSignal && !appointmentSignal && !ownerSignal;
if (availabilityOnlyV50) {
  shouldSend = false;
  policyReason = 'bloqueado_por_disponibilidade_v50';
  priority = 0;
}
if (similarOnlyV50) {
  shouldSend = false;
  policyReason = 'bloqueado_por_busca_similar_v50';
  priority = 0;
}

if (asksOnlyInfo && !explicitHuman && !proposalSignal && !appointmentSignal && !ownerSignal && !superHot) {
  shouldSend = false;
  policyReason = 'bloqueado_por_pedido_de_informacoes';
  priority = 0;
}

// Anti-spam comercial: para o mesmo cliente + imóvel, só reenvia dentro da janela se o novo marco for mais forte.
const scope = [contactKey, selected || 'sem_imovel'].join('|');
const dedupKey = `broker_notify_v49:${hash32(scope)}`;
const previous = store._brokerNotifyV49[dedupKey];
if (shouldSend && previous && typeof previous === 'object') {
  const elapsed = now - Number(previous.ts || 0);
  const prevPriority = Number(previous.priority || 0);
  if (elapsed < ttlMs && priority <= prevPriority) {
    shouldSend = false;
    policyReason = `bloqueado_por_throttle_${ttlHours}h_ja_notificado`;
  }
}
if (shouldSend) {
  store._brokerNotifyV49[dedupKey] = { ts: now, priority, policyReason, selected, contactKey };
}

let headline = 'LEAD PARA CORRETOR';
if (policyReason === 'pedido_explicito_de_corretor') headline = 'LEAD PEDIU CORRETOR';
else if (policyReason === 'proposta_ou_negociacao') headline = 'LEAD PEDIU PROPOSTA/NEGOCIAÇÃO';
else if (policyReason === 'visita_ou_agendamento') headline = 'LEAD PEDIU VISITA';
else if (policyReason === 'captacao_ou_avaliacao_de_imovel') headline = 'PROPRIETÁRIO/CAPTAÇÃO';
else if (String(policyReason || '').startsWith('lead_muito_quente')) headline = 'LEAD MUITO QUENTE';

return [{
  json: {
    ...fromOrchestrator,
    ...fromSla,
    ...fromRules,
    ...current,
    action: item.action || fromOrchestrator.action || 'HANDOFF',
    stage: item.stage || fromOrchestrator.stage || 'handoff',
    status: item.status || fromOrchestrator.status || 'awaiting_seller',
    canonical_text: item.canonical_text || fromOrchestrator.canonical_text || item.original_text || '',
    inbound_text: item.inbound_text || fromOrchestrator.inbound_text || item.canonical_text || '',
    favorite_listing: item.favorite_listing || fromOrchestrator.favorite_listing || item.service_key || item.site_property_code || selected || null,
    service_key: item.service_key || fromOrchestrator.service_key || selected || null,
    selected_listing_object: item.selected_listing_object || fromOrchestrator.selected_listing_object || fromRules.selected_listing_object || item.service || null,
    favorite_listing_object: item.favorite_listing_object || fromOrchestrator.favorite_listing_object || fromRules.favorite_listing_object || null,
    broker_notify_should_send: shouldSend,
    broker_notify_policy_reason: policyReason,
    broker_notify_priority: priority,
    broker_notify_dedup_key: dedupKey,
    broker_notify_scope: scope,
    broker_notify_throttle_hours: ttlHours,
    broker_notify_mode: 'crm_marcos_comerciais_v50',
    broker_notify_headline: headline,
    seller_summary: item.seller_summary || fromOrchestrator.seller_summary || fromRules.seller_summary || 'Lead atingiu marco comercial para atendimento humano.'
  }
}];