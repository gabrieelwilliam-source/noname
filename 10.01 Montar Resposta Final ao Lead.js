function safeNodeJson(nodeName, fallback = {}) {
  try {
    const data = $items(nodeName, 0, 0);
    if (!data || !data.length) return fallback;
    return data[0]?.json || fallback;
  } catch (e) {
    return fallback;
  }
}
function isNonEmptyObject(v) {
  return !!v && typeof v === 'object' && Object.keys(v).length > 0;
}
function explicitFailure(obj) {
  if (!isNonEmptyObject(obj)) return false;
  const statusCode = Number(obj.statusCode || obj.status || 0);
  if (statusCode >= 400) return true;
  if (obj.ok === false || obj.success === false) return true;
  if (obj.error || obj.errorMessage || obj.name === 'NodeApiError') return true;
  if (typeof obj.message === 'string' && /(erro|error|falha|failed)/i.test(obj.message) && !obj.id && !obj.eventId && !obj.event_id && !obj.appointment_id) {
    return true;
  }
  return false;
}
function pickText(...values) {
  for (const v of values) {
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}
function firstValue(values, fallback = null) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && !value.trim()) continue;
    return value;
  }
  return fallback;
}
function compactObject(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'string' && !v.trim()) continue;
    out[k] = v;
  }
  return out;
}
function normalizeText(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}
function pickListingCode(...values) {
  for (const value of values) {
    const s = String(value || '').toUpperCase();
    if (!s.trim()) continue;
    const urlMatch = s.match(/[?&]CODIGO=([A-Z]{1,3}\d{3,8})\b/);
    if (urlMatch) return urlMatch[1];
    const codeMatch = s.match(/\b([A-Z]{1,3}\d{3,8})\b/);
    if (codeMatch) return codeMatch[1];
  }
  return null;
}
function resolveServiceLabel(cfg, serviceKey, fallbackLabel, serviceObj) {
  if (serviceKey && cfg.Services?.[serviceKey]?.label) return cfg.Services[serviceKey].label;
  if (serviceKey && cfg.Services?.[serviceKey]?.title) return cfg.Services[serviceKey].title;
  return fallbackLabel || serviceObj?.label || serviceObj?.title || serviceKey || null;
}
function parseListingLabelFromText(code, ...texts) {
  const k = String(code || '').toUpperCase();
  if (!k) return null;
  for (const value of texts) {
    const raw = String(value || '');
    if (!raw) continue;
    const re = new RegExp('\\b' + k.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&') + '\\b\\s*(?:[-–—:]|\\|)\\s*([^\\n\\r.]+)', 'i');
    const m = raw.match(re);
    if (m && m[1]) {
      const title = m[1]
        .replace(/^(?:imovel|imóvel)\\s*/i, '')
        .replace(/^(?:pagina|página|mensagem)\\s*:?/i, '')
        .replace(/\\s*(?:pagina|página|mensagem|e-mail|email|whatsapp|meu whatsapp).*$/i, '')
        .trim();
      if (title && !/^https?:/i.test(title)) return title;
    }
  }
  return null;
}
function objectCodeMatchesKey(obj, key) {
  if (!obj || typeof obj !== 'object') return false;
  const k = String(key || '').toUpperCase();
  if (!k) return true;
  const objCode = pickListingCode(obj.listingCode, obj.listing_code, obj.code, obj.codigo, obj.internalCode, obj.listingId, obj.listingUrl, obj.url);
  return !objCode || objCode === k;
}
function formatProtocol(value) {
  return String(value || '').trim();
}
function sanitizeCustomerText(text) {
  const raw = String(text || '').trim();
  if (!raw) return '';
  const internalMarkers = /(LEAD QUENTE PARA ATENDIMENTO|LEAD MORNO PARA ACOMPANHAMENTO|LEAD EM QUALIFICAÇÃO|Próxima ação recomendada|SLA: assumir|CRM: lead:|🧠 Última mensagem do lead)/i;
  if (internalMarkers.test(raw)) return '';
  return raw;
}
function polishFinalCustomerText(text) {
  return String(text || '')
    .replace('✅ *Seu horário foi reservado com sucesso*', '✅ *Visita combinada!*')
    .replace('✅ *Seu reagendamento foi confirmado*', '✅ *Reagendamento combinado!*')
    .replace('✅ *Visita confirmada com sucesso*', '✅ *Visita confirmada!*')
    .replace('✅ *Cancelamento concluído*', '✅ *Cancelamento feito!*')
    .replace('Se precisar ajustar o horário depois, é só me chamar por aqui', 'Se precisar ajustar depois, é só me chamar por aqui')
    .replace('Será um prazer te ajudar.', 'Combinado, vou deixar tudo organizado por aqui.')
    .replace('Como posso te ajudar por aqui?', 'Me conta o que você está buscando que eu te direciono por aqui.')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const cfg = safeNodeJson('05.03 Consolidar Configuração Runtime', safeNodeJson('05.01 Carregar Configuração da Imobiliária', {}));
const base = safeNodeJson('07.10 Orquestrar Próxima Ação', {});
const slots = safeNodeJson('08.03 Gerar Horários Disponíveis', {});
const lock = safeNodeJson('08.06 Reservar Slot em Memória', {});
const bookGc = safeNodeJson('08.08 Criar Visita no Google Calendar', {});
const bookCommit = safeNodeJson('08.10 Confirmar Visita no Banco', {});
const resGc = safeNodeJson('08.11 Criar Novo Evento de Reagendamento', {});
const deleteOld = safeNodeJson('08.14 Normalizar Remoção do Evento Antigo', {});
const resCommit = safeNodeJson('08.15 Confirmar Reagendamento no Banco', {});
const cancelNorm = safeNodeJson('08.17 Normalizar Cancelamento', {});
const cancelCommit = safeNodeJson('08.18 Confirmar Cancelamento no Banco', {});
const confirmGc = safeNodeJson('08.19 Atualizar Confirmação da Visita', {});
const handoff = safeNodeJson('09.01 Registrar Handoff para Corretor', {});
const current = $json || {};
const traceId = firstValue([
  current.trace_id,
  base.trace_id,
  safeNodeJson('06.20 Consolidar Mensagem Canônica', {}).trace_id,
  safeNodeJson('03.02 Normalizar Mensagem do Lead', {}).trace_id
], null);
const messageUid = firstValue([
  current.message_uid,
  base.message_uid,
  safeNodeJson('06.20 Consolidar Mensagem Canônica', {}).message_uid,
  safeNodeJson('03.02 Normalizar Mensagem do Lead', {}).message_uid
], null);


const providerBookEventId = bookGc.id || bookGc.eventId || bookGc.event_id || null;
const providerResEventId = resGc.id || resGc.eventId || resGc.event_id || null;
const providerConfirmEventId = confirmGc.id || confirmGc.eventId || confirmGc.event_id || null;
const bookCommitFailed = explicitFailure(bookCommit);
const resCommitFailed = explicitFailure(resCommit);
const cancelCommitFailed = explicitFailure(cancelCommit);
const confirmFailed = explicitFailure(confirmGc);
const handoffFailed = explicitFailure(handoff);
const lockBusy = lock.ok === false;

const baseAction = String(base.action || '').trim().toUpperCase();
const currentAction = String(current.action || '').trim().toUpperCase();
const slotsAction = String(slots.action || '').trim().toUpperCase();
let finalAction = baseAction === 'HANDOFF'
  ? 'HANDOFF'
  : (currentAction || baseAction || slotsAction || 'ASK');
const basePending = base.pending_context && typeof base.pending_context === 'object' ? base.pending_context : {};
const currentPending = current.pending_context && typeof current.pending_context === 'object' ? current.pending_context : {};
const inboundForPolicy = normalizeText(base.canonical_text || base.original_text || current.inbound_text || current.canonical_text || '');
const infoQuestionNow = /(aceita pet|aceitam pet|permite pet|permitem pet|aceita animais|aceitam animais|permite animais|pet friendly|cachorro|gato|animal de estimacao|animal de estimação|animais|mais detalhes|mais informacoes|mais informações|detalhes|saber mais|disponibilidade|disponivel|disponível|opcoes parecidas|opções parecidas|parecid|semelhant|documentacao|documentação|documentos|garantia|garantias|financiamento|financiar|entrada|simulacao|simulação)/.test(inboundForPolicy);
const persistentHandoff = Boolean(
  !infoQuestionNow && (
    baseAction === 'HANDOFF' ||
    base.status === 'awaiting_seller' ||
    basePending.handoff_requested === true ||
    basePending.handoff_sent === true ||
    basePending.handoff_status === 'queued' ||
    basePending.automation_paused_reason === 'aguardando_corretor' ||
    basePending.catalog_suppressed_after_handoff === true
  )
);

// v104: pergunta objetiva do cliente não pode herdar HANDOFF antigo do orquestrador.
// Ex.: cliente pergunta “aceita pet?” após um contexto quente; o fluxo deve responder a dúvida, não disparar CRM.
if (infoQuestionNow && finalAction === 'HANDOFF') {
  finalAction = 'ASK';
}

let finalStage = persistentHandoff ? 'handoff' : (base.stage || current.stage || 'abertura');
let finalStatus = persistentHandoff ? 'awaiting_seller' : (base.status || current.status || 'ok');
let pendingContext = {
  ...currentPending,
  ...basePending,
  ...(persistentHandoff ? {
    handoff_requested: true,
    handoff_sent: true,
    handoff_status: 'queued',
    automation_paused_reason: 'aguardando_corretor',
    catalog_suppressed_after_handoff: true,
    stage: 'handoff'
  } : {})
};
let outbound = '';

const explicitServiceKey = pickListingCode(
  current.codigo_imovel, current.property_code, current.listing_code, current.site_property_code, current.site_listing_key, current.url_imovel, current.property_url, current.listing_url,
  base.codigo_imovel, base.property_code, base.listing_code, base.site_property_code, base.site_listing_key, base.url_imovel, base.property_url, base.listing_url,
  pendingContext.favorite_listing, pendingContext.selected_listing, pendingContext.service_key, inboundForPolicy
);
let serviceKey = firstValue([
  explicitServiceKey,
  current.service_key,
  base.service_key,
  slots.service_key,
  pendingContext.favorite_listing,
  pendingContext.selected_listing,
  pendingContext.service_key
], null);
const selectedServiceObj = [
  current.selected_listing_object,
  base.selected_listing_object,
  current.favorite_listing_object,
  base.favorite_listing_object,
  serviceKey && cfg.Services?.[serviceKey]
].find((obj) => objectCodeMatchesKey(obj, serviceKey)) || null;
const parsedListingLabel = parseListingLabelFromText(
  serviceKey,
  base.original_text, base.canonical_text, base.inbound_text,
  current.original_text, current.canonical_text, current.inbound_text, current.ai_input_text
);
let serviceName = resolveServiceLabel(cfg, serviceKey, firstValue([
  parsedListingLabel,
  current.titulo_imovel,
  current.listing_title,
  current.property_title,
  base.titulo_imovel,
  base.listing_title,
  base.property_title,
  // Labels de contexto antigo ficam por último para evitar trocar L10112 por V10001.
  current.service_name,
  current.service_label,
  base.service_name,
  base.service_label,
  slots.service_name,
  slots.service_label
], null), selectedServiceObj);
let serviceDurationMin = Number(firstValue([
  current.service_duration_min,
  base.service_duration_min,
  current.duration_min,
  base.duration_min,
  cfg.Services?.[serviceKey]?.durationMin
], 0)) || null;
let servicePriceFrom = Number(firstValue([
  current.service_price_from,
  base.service_price_from,
  cfg.Services?.[serviceKey]?.priceFrom
], 0)) || null;
let requestedDate = firstValue([
  current.requested_date,
  current.date_br,
  base.requested_date,
  base.date_br,
  slots.requested_date,
  slots.date_br
], null);
let requestedTime = firstValue([
  current.requested_time,
  current.time_hhmm,
  base.requested_time,
  base.time_hhmm,
  slots.requested_time,
  slots.time_hhmm
], null);
let protocol = formatProtocol(firstValue([
  current.protocol,
  base.protocol,
  providerBookEventId,
  providerResEventId,
  bookCommit.appointment_id,
  resCommit.appointment_id,
  cancelCommit.appointment_id,
  base.old_event_id
], '')) || null;
const customerPhone = current.customer_phone || base.customer_phone || base.snapshot?.customer_phone || null;
const customerName = current.customer_name || base.customer_name || base.snapshot?.customer_name || base.snapshot?.customer?.name || null;
const channel = firstValue([current.channel, base.channel, base.provider, 'whatsapp'], 'whatsapp');
const contactId = firstValue([current.contact_id, base.contact_id, customerPhone], customerPhone);
const inboundText = String(base.canonical_text || base.original_text || current.inbound_text || '').trim();
const activeAppointments = Array.isArray(current.active_appointments) ? current.active_appointments : (Array.isArray(base.active_appointments) ? base.active_appointments : []);
let lastIntent = firstValue([
  base.last_intent,
  current.last_intent,
  pendingContext.last_intent
], finalAction === 'HANDOFF' ? 'handoff' : finalAction.toLowerCase());

if (finalAction === 'HANDOFF') {
  finalStage = base.stage || current.stage || 'handoff';
  pendingContext = base.pending_context || current.pending_context || pendingContext || {};
  const sellerName = firstValue([
    base.assigned_seller?.name,
    current.assigned_seller?.name,
    pendingContext.assigned_seller
  ], null);
  const selectedLabel = serviceName || base.service_label || current.service_label || null;
  outbound = pickText(
    base.response_text,
    current.response_text,
    selectedLabel
      ? `Perfeito. Registrei seu pedido para ${sellerName ? `*${sellerName}*` : 'um corretor da equipe'}, mantendo o imóvel escolhido: *${selectedLabel}*.\n\nO contexto e a próxima ação recomendada foram encaminhados para você não precisar repetir tudo.`
      : `Perfeito. Registrei seu pedido para ${sellerName ? `*${sellerName}*` : 'um corretor da equipe'} com o resumo do atendimento para acelerar o próximo passo.`
  );
  finalStatus = 'awaiting_seller';
}
else if (finalAction === 'ASK') {
  finalStage = base.stage || current.stage || finalStage;
  pendingContext = base.pending_context || current.pending_context || pendingContext || {};
  outbound = pickText(
    current.response_text,
    base.response_text,
    slots.response_text,
    'Como posso te ajudar por aqui?'
  );
  const preserveAwaitingSeller = Boolean(
    !infoQuestionNow && (
      ['awaiting_seller', 'handoff', 'human_active'].includes(String(base.status || current.status || '').toLowerCase()) ||
      pendingContext.handoff_requested === true ||
      pendingContext.handoff_sent === true ||
      pendingContext.handoff_status === 'queued' ||
      pendingContext.automation_paused_reason === 'aguardando_corretor' ||
      pendingContext.catalog_suppressed_after_handoff === true
    )
  );
  if (preserveAwaitingSeller) {
    finalStage = 'handoff';
    finalStatus = 'awaiting_seller';
    pendingContext = {
      ...pendingContext,
      handoff_requested: true,
      handoff_sent: true,
      handoff_status: 'queued',
      automation_paused_reason: 'aguardando_corretor',
      catalog_suppressed_after_handoff: true,
      stage: 'handoff'
    };
  } else {
    finalStatus = 'awaiting_customer';
  }
}
else if (finalAction === 'CHECK') {
  finalStage = slots.stage || base.stage || current.stage || finalStage;
  outbound = pickText(
    slots.response_text,
    base.response_text,
    current.response_text,
    'Consultei a agenda, mas ainda preciso de mais alguns detalhes para te mostrar as melhores opções.'
  );
  pendingContext = slots.pending_context || base.pending_context || current.pending_context || {};
  finalStatus = 'awaiting_customer';
}
else if (finalAction === 'BOOK') {
  if (providerBookEventId) {
    protocol = formatProtocol(bookCommit.appointment_id || providerBookEventId || protocol);
    const crmSyncOk = !bookCommitFailed;
    outbound =
      `✅ *Seu horário foi reservado com sucesso*\n\n` +
      `Imóvel: *${serviceName || 'Atendimento'}*\n` +
      (requestedDate ? `Data: *${requestedDate}*\n` : '') +
      (requestedTime ? `Horário: *${requestedTime}*\n` : '') +
      (protocol ? `Protocolo: *${protocol}*\n` : '') +
      `Local: ${cfg.Address}\n📍 ${cfg.MapsUrl}\n\n` +
      `Se precisar ajustar o horário depois, é só me chamar por aqui${protocol ? ` e me enviar o protocolo *${protocol}*` : ''}. Será um prazer te ajudar.` +
      (crmSyncOk ? '' : `\n\nObs.: sua reserva já está garantida. Se houver atraso na atualização interna, nossa equipe ajusta o CRM sem impactar seu horário.`);
    finalStage = 'agendamento_confirmado';
    finalStatus = crmSyncOk ? 'booked' : 'booked_attention';
    pendingContext = compactObject({
      protocol,
      recent_appointment: compactObject({
        protocol,
        calendar_event_id: providerBookEventId || null,
        event_id: providerBookEventId || null,
        service_key: serviceKey,
        service_label: serviceName,
        scheduled_date: requestedDate,
        scheduled_time: requestedTime,
      }),
      hidden_appointment_refs: [],
    });
  } else if (lockBusy || current.slot_not_available === true) {
    outbound = pickText(
      current.response_text,
      slots.response_text,
      lock.response_text,
      'Esse horário acabou de ficar indisponível. Posso te mostrar outras opções próximas.'
    );
    finalStatus = 'slot_unavailable';
    pendingContext = slots.pending_context || current.pending_context || lock.pending_context || base.pending_context || {};
  } else {
    outbound =
      `Recebi sua solicitação de visita e já registrei o horário escolhido para a equipe comercial validar manualmente.

` +
      (serviceName ? `Imóvel: *${serviceName}*
` : '') +
      (requestedDate ? `Data solicitada: *${requestedDate}*
` : '') +
      (requestedTime ? `Horário solicitado: *${requestedTime}*
` : '') +
      `
Tive uma instabilidade ao confirmar automaticamente na agenda, então acionei o corretor para confirmar disponibilidade e seguir com você sem precisar reiniciar o atendimento.`;
    finalStage = 'agendamento_fallback';
    finalStatus = 'visit_request_registered';
    pendingContext = {
      ...(slots.pending_context || base.pending_context || {}),
      visit_request_registered: true,
      calendar_fallback: true,
      handoff_reason: 'fallback_agendamento_calendar_ou_crm',
      requested_date: requestedDate || (slots.pending_context || {}).requested_date || null,
      requested_time: requestedTime || (slots.pending_context || {}).requested_time || null,
      selected_listing: serviceKey || (base.pending_context || {}).selected_listing || null,
      favorite_listing: serviceKey || (base.pending_context || {}).favorite_listing || null,
    };
  }
}
else if (finalAction === 'RESCHEDULE') {
  if (providerResEventId) {
    protocol = formatProtocol(resCommit.appointment_id || providerResEventId || protocol);
    const deleteOldSuccess = deleteOld.delete_old_success === true || !base.old_event_id;
    const crmSyncOk = !resCommitFailed;
    outbound =
      `✅ *Seu reagendamento foi confirmado*\n\n` +
      `Imóvel: *${serviceName || 'Atendimento'}*\n` +
      (requestedDate ? `Nova data: *${requestedDate}*\n` : '') +
      (requestedTime ? `Novo horário: *${requestedTime}*\n` : '') +
      (protocol ? `Protocolo: *${protocol}*\n` : '') +
      `Local: ${cfg.Address}\n📍 ${cfg.MapsUrl}\n\n` +
      `Se precisar de um novo ajuste, é só me chamar por aqui${protocol ? ` e me enviar o protocolo *${protocol}*` : ''}.\n\n` +
      (deleteOldSuccess
        ? 'Perfeito. Considere apenas este novo horário como válido.'
        : 'Seu novo horário já está reservado. Se você recebeu a confirmação anterior, considere apenas esta atualização como válida.') +
      (crmSyncOk ? '' : `\n\nObs.: o novo horário já foi reservado. Se a atualização interna atrasar, nossa equipe ajusta o CRM sem impactar seu reagendamento.`);
    finalStage = 'reagendamento_confirmado';
    finalStatus = deleteOldSuccess && crmSyncOk ? 'rescheduled' : 'rescheduled_attention';
    pendingContext = compactObject({
      protocol,
      recent_appointment: compactObject({
        protocol,
        calendar_event_id: providerResEventId || null,
        event_id: providerResEventId || null,
        service_key: serviceKey,
        service_label: serviceName,
        scheduled_date: requestedDate,
        scheduled_time: requestedTime,
      }),
      hidden_appointment_refs: [base.old_event_id, protocol].filter(Boolean),
    });
  } else if (lockBusy || current.slot_not_available === true) {
    outbound = pickText(
      current.response_text,
      slots.response_text,
      'Esse horário não está mais disponível para reagendamento. Posso te mostrar outras opções?'
    );
    finalStatus = 'slot_unavailable';
    pendingContext = slots.pending_context || current.pending_context || base.pending_context || {};
  } else {
    outbound =
      `Recebi sua solicitação de reagendamento e já registrei o novo horário para validação da equipe comercial.

` +
      (serviceName ? `Imóvel: *${serviceName}*
` : '') +
      (requestedDate ? `Nova data solicitada: *${requestedDate}*
` : '') +
      (requestedTime ? `Novo horário solicitado: *${requestedTime}*
` : '') +
      `
Tive uma instabilidade ao confirmar automaticamente na agenda, então acionei o corretor para validar e seguir com você.`;
    finalStage = 'reagendamento_fallback';
    finalStatus = 'reschedule_request_registered';
    pendingContext = {
      ...(slots.pending_context || base.pending_context || {}),
      reschedule_request_registered: true,
      calendar_fallback: true,
      handoff_reason: 'fallback_reagendamento_calendar_ou_crm',
      requested_date: requestedDate || (slots.pending_context || {}).requested_date || null,
      requested_time: requestedTime || (slots.pending_context || {}).requested_time || null,
      selected_listing: serviceKey || (base.pending_context || {}).selected_listing || null,
      favorite_listing: serviceKey || (base.pending_context || {}).favorite_listing || null,
    };
  }
}
else if (finalAction === 'CONFIRM') {
  const confirmedOk = !confirmFailed;
  outbound =
    `✅ *Visita confirmada com sucesso*\n\n` +
    (serviceName ? `Atendimento: *${serviceName}*\n` : '') +
    (requestedDate ? `Data: *${requestedDate}*\n` : '') +
    (requestedTime ? `Horário: *${requestedTime}*\n` : '') +
    (protocol ? `Protocolo: *${protocol}*\n\n` : '\n') +
    `Se precisar, você pode responder por aqui para *reagendar* ou *cancelar*.` +
    (confirmedOk ? '' : `\n\nObs.: registrei sua confirmação no CRM e, se a agenda não refletir na hora, nossa equipe conclui o ajuste automaticamente.`);
  finalStage = 'visita_confirmada_24h';
  finalStatus = confirmedOk ? 'confirmed_24h' : 'confirmed_24h_attention';
  pendingContext = compactObject({
    protocol,
    recent_appointment: compactObject({
      protocol,
      calendar_event_id: providerConfirmEventId || current.calendar_event_id || base.old_event_id || null,
      event_id: providerConfirmEventId || current.calendar_event_id || base.old_event_id || null,
      service_key: serviceKey,
      service_label: serviceName,
      scheduled_date: requestedDate,
      scheduled_time: requestedTime,
      confirmation_status: 'confirmed_24h',
    })
  });
}
else if (finalAction === 'CANCEL') {
  const providerDeleted = cancelNorm.provider_deleted === true;
  if (providerDeleted) {
    protocol = formatProtocol(cancelCommit.appointment_id || base.old_event_id || protocol);
    const crmSyncOk = !cancelCommitFailed;
    outbound =
      `✅ *Cancelamento concluído*\n\n` +
      (serviceName ? `Atendimento: *${serviceName}*\n` : '') +
      (protocol ? `Protocolo: *${protocol}*\n\n` : '\n') +
      `Quando quiser, posso verificar novos horários para você por aqui.` +
      (crmSyncOk ? '' : `\n\nObs.: o cancelamento já foi aplicado na agenda. Se a baixa interna atrasar, nossa equipe ajusta o CRM sem impactar você.`);
    finalStage = 'cancelamento_concluido';
    finalStatus = crmSyncOk ? 'cancelled' : 'cancelled_attention';
    pendingContext = compactObject({
      hidden_appointment_refs: [base.old_event_id, protocol].filter(Boolean),
    });
  } else {
    outbound = pickText(
      current.response_text,
      cancelCommit.response_text,
      'Não consegui concluir o cancelamento agora. Se preferir, posso encaminhar sua solicitação para a equipe humana.'
    );
    finalStatus = 'retry';
  }
}
else if (finalAction === 'HANDOFF') {
  outbound = pickText(
    current.response_text,
    base.response_text,
    'Vou encaminhar sua conversa para a equipe humana continuar por aqui.'
  );
  finalStage = base.stage || current.stage || 'handoff_humano';
  finalStatus = handoffFailed ? 'handoff_retry' : 'handoff';
  // HOTFIX MEMORIA HANDOFF FINAL:
  // Nunca zerar pendingContext em HANDOFF. O lead pode pedir "mais detalhes", "visita" ou "condicoes"
  // logo depois que o CRM foi enviado ao corretor. Se o contexto for apagado aqui, a proxima mensagem
  // volta para a qualificacao inicial (compra/aluguel/investimento).
  pendingContext = {
    ...(base.pending_context || current.pending_context || pendingContext || {}),
    handoff_sent: true,
    handoff_status: handoffFailed ? 'retry' : 'queued',
    handoff_reason: base.handoff_reason || current.handoff_reason || pendingContext.handoff_reason || 'handoff',
    favorite_listing: base.favorite_listing || current.favorite_listing || pendingContext.favorite_listing || base.service_key || current.service_key || null,
    selected_listing: base.favorite_listing || current.favorite_listing || pendingContext.selected_listing || pendingContext.favorite_listing || base.service_key || current.service_key || null,
    last_presented_listings: Array.isArray(base.pending_context?.last_presented_listings) && base.pending_context.last_presented_listings.length
      ? base.pending_context.last_presented_listings
      : (Array.isArray(current.pending_context?.last_presented_listings) ? current.pending_context.last_presented_listings : (Array.isArray(pendingContext.last_presented_listings) ? pendingContext.last_presented_listings : [])),
    last_handoff_at: new Date().toISOString(),
  };
}
else {
  outbound = pickText(
    current.response_text,
    base.response_text,
    'Como posso te ajudar por aqui?'
  );
}

if (pendingContext && serviceKey && !pendingContext.pending_service && finalStatus === 'awaiting_customer') {
  pendingContext = {
    ...pendingContext,
    pending_service: serviceKey,
    service_key: serviceKey,
    service_name: serviceName,
  };
}
if (pendingContext && requestedDate && !pendingContext.requested_date && finalStatus === 'awaiting_customer') {
  pendingContext = {
    ...pendingContext,
    requested_date: requestedDate,
    pending_date: pendingContext.pending_date || requestedDate,
  };
}
if (pendingContext && requestedTime && !pendingContext.requested_time && finalStatus === 'awaiting_customer') {
  pendingContext = {
    ...pendingContext,
    requested_time: requestedTime,
    pending_time: pendingContext.pending_time || requestedTime,
  };
}
if (pendingContext && lastIntent && !pendingContext.last_intent) {
  pendingContext = { ...pendingContext, last_intent: lastIntent };
}


// v50: guardião final contra respostas repetidas e reinício de conversa.
try {
  const lastBotTextV50 = String((pendingContext && pendingContext.last_bot_text) || (base.pending_context && base.pending_context.last_bot_text) || '');
  const outboundNormV50 = String(outbound || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  const lastNormV50 = String(lastBotTextV50 || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  const listingNameV50 = serviceName || (pendingContext && pendingContext.service_name) || 'esse imóvel';
  if (outboundNormV50 && lastNormV50 && outboundNormV50 === lastNormV50 && finalAction === 'ASK') {
    outbound = `Para não te repetir as mesmas informações de *${listingNameV50}*, me diga qual próximo passo você prefere:\n\n1) confirmar disponibilidade oficial;\n2) ver opções parecidas;\n3) entender garantias/documentos;\n4) organizar uma visita.`;
    pendingContext = { ...(pendingContext || {}), awaiting_choice_type: 'next_step_after_repeat', last_response_topic: 'anti_loop_final_v50' };
  }
  if (/Olá,.*vi que você se interessou pelo imóvel/i.test(String(outbound || '')) && (pendingContext && pendingContext.last_intent)) {
    outbound = String(outbound).replace(/Olá,\s*([^!,.]+)[!,.]?\s*Vi que você se interessou pelo imóvel[^\n]+\n\n/i, '');
  }
} catch (e) {}

outbound = polishFinalCustomerText(sanitizeCustomerText(outbound) || sanitizeCustomerText(base.customer_response_text) || 'Me conta o que você está buscando que eu te direciono por aqui.');

const statePayload = compactObject({
  customer_name: customerName,
  customer_phone: customerPhone,
  phone_e164: firstValue([current.phone_e164, base.phone_e164], null),
  channel,
  contact_id: contactId,
  contact_key: base.contact_key || `${channel}:${contactId || customerPhone || ""}`,
  provider_message_id: base.provider_message_id || null,
  service_key: serviceKey,
  service_name: serviceName,
  service_duration_min: serviceDurationMin,
  service_price_from: servicePriceFrom,
  requested_date: requestedDate,
  requested_time: requestedTime,
  pending_context: pendingContext,
  stage: finalStage,
  action: finalAction,
  status: finalStatus,
  last_intent: lastIntent,
  last_inbound_text: inboundText,
  last_outbound_text: outbound,
  protocol,
  appointment_id:
    bookCommit.appointment_id ||
    resCommit.appointment_id ||
    cancelCommit.appointment_id ||
    current.appointment_id ||
    null,
  calendar_event_id:
    providerBookEventId ||
    providerResEventId ||
    providerConfirmEventId ||
    current.calendar_event_id ||
    null,
  last_event_id: providerResEventId || providerBookEventId || providerConfirmEventId || null,
  active_appointments: activeAppointments,
});

const explicitErrorCode = firstValue([
  current.error_code,
  current.media_guardrail_reason,
  lock.lock_release_review_needed ? 'lock_release_not_confirmed' : null,
  bookCommitFailed ? 'commit_book_failed' : null,
  resCommitFailed ? 'commit_reschedule_failed' : null,
  cancelCommitFailed ? 'commit_cancel_failed' : null,
  confirmFailed ? 'confirm_update_failed' : null,
  handoffFailed ? 'handoff_enqueue_failed' : null,
  lockBusy ? 'slot_lock_busy' : null
], null);
const retryLane = firstValue([
  explicitErrorCode && /send/i.test(String(explicitErrorCode)) ? 'send' : null,
  explicitErrorCode && /commit|calendar|slot|lock/i.test(String(explicitErrorCode)) ? 'agenda' : null,
  explicitErrorCode && /crm|customer|snapshot/i.test(String(explicitErrorCode)) ? 'crm' : null,
  explicitErrorCode && /audio|image|media/i.test(String(explicitErrorCode)) ? 'media' : null,
  null
], null);

const calendarStatus = explicitErrorCode && /calendar|agenda|slot|lock|commit_book|reschedule|cancel|confirm/i.test(String(explicitErrorCode))
  ? 'error'
  : (providerBookEventId || providerResEventId || providerConfirmEventId ? 'ok' : (finalAction === 'BOOK' || finalAction === 'RESCHEDULE' || finalAction === 'CANCEL' ? 'pending' : 'not_applicable'));
const crmStatus = explicitErrorCode && /crm|customer|snapshot/i.test(String(explicitErrorCode)) ? 'error' : 'pending_or_ok';
const bookingStatus = lockBusy ? 'slot_busy' : (providerBookEventId || providerResEventId ? 'event_created' : (finalStatus || null));
const diagnosticPayload = compactObject({
  trace_id: traceId,
  message_uid: messageUid,
  contact_key: base.contact_key || `${channel}:${contactId || customerPhone || ""}`,
  channel,
  provider: base.provider || current.provider || null,
  current_stage: finalStage,
  selected_action: finalAction,
  lead_intent: lastIntent || base.desired_purpose || current.desired_purpose || null,
  selected_listing: serviceKey || null,
  booking_status: bookingStatus,
  crm_status: crmStatus,
  calendar_status: calendarStatus,
  send_status: 'pending',
  errors: explicitErrorCode ? [explicitErrorCode] : [],
  warnings: [
    lock.lock_release_review_needed ? 'lock_release_review_needed' : null,
    handoffFailed ? 'handoff_enqueue_failed' : null,
    retryLane ? `retry_lane_${retryLane}` : null,
  ].filter(Boolean),
  demo_mode: cfg.DemoMode ?? cfg.DEMO_MODE ?? null,
  catalog_source: cfg.CATALOG_SOURCE || cfg.ListingSource || null,
});

return [{
  json: {
    trace_id: traceId,
    message_uid: messageUid,
    error_code: explicitErrorCode,
    retry_lane: retryLane,
    diagnostics: diagnosticPayload,
    observability: {
      ...diagnosticPayload,
      trace_id: traceId,
      message_uid: messageUid,
      source_node: '10.01 Montar Resposta Final ao Lead',
      error_code: explicitErrorCode,
      retry_lane: retryLane,
    },
    ok: true,
    action: finalAction,
    stage: finalStage,
    status: finalStatus,
    response_text: outbound,
    outbound_text: outbound,
    customer_response_text: outbound,
    response_audience: 'customer',
    broker_message_text: base.broker_message_text || base.seller_summary || null,
    broker_audience: 'broker',
    message_contract: {
      customer: { audience: 'customer', text: outbound },
      broker: { audience: 'broker', text: base.broker_message_text || base.seller_summary || null, reason: base.handoff_reason || null },
      admin: { audience: 'admin', trace_id: traceId }
    },
    channel,
    contact_id: contactId,
    contact_key: base.contact_key || `${channel}:${contactId || customerPhone || ""}`,
    provider_message_id: base.provider_message_id || null,
    pending_context: pendingContext,
    state: statePayload,
    customer_phone: customerPhone,
    phone_e164: firstValue([current.phone_e164, base.phone_e164], null),
    customer_name: customerName,
    inbound_text: inboundText,
    service_key: serviceKey,
    service_name: serviceName,
    service_duration_min: serviceDurationMin,
    service_price_from: servicePriceFrom,
    requested_date: requestedDate,
    requested_time: requestedTime,
    protocol,
    active_appointments: activeAppointments,
    last_intent: lastIntent,
    slot_options: current.slot_options || slots.slot_options || [],
    slot_decision: current.slot_decision || slots.slot_decision || null,
    appointment_id:
      bookCommit.appointment_id ||
      resCommit.appointment_id ||
      cancelCommit.appointment_id ||
      current.appointment_id ||
      null,
    calendar_event_id:
      providerBookEventId ||
      providerResEventId ||
      current.calendar_event_id ||
      null,
    meta: {
      source_node: '10.01 Montar Resposta Final ao Lead',
      timezone: cfg.Timezone || 'America/Sao_Paulo',
      operational: {
        lock_ok: !lockBusy,
        book_commit_failed: bookCommitFailed,
        reschedule_commit_failed: resCommitFailed,
        cancel_commit_failed: cancelCommitFailed,
        handoff_failed: handoffFailed
      }
    }
  }
}];