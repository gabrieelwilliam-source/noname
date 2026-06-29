// v104 — Motor Comercial: score e funil. Hotfix: perguntas objetivas (pet, docs, disponibilidade, detalhes) NÃO viram handoff/CRM.
function safeNodeJson(nodeName, fallback = {}) {
  try { const data = $items(nodeName, 0, 0); return data?.[0]?.json || fallback; } catch (e) { return fallback; }
}
function parseObj(v) { if (!v) return {}; if (typeof v === 'string') { try { return JSON.parse(v) || {}; } catch(e) { return {}; } } return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
function normalize(v) { return String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9/@:.?=&%+\-\s]/g,' ').replace(/\s+/g,' ').trim(); }
function first(...values) { for (const v of values) { if (v === undefined || v === null) continue; if (typeof v === 'string' && !v.trim()) continue; return v; } return null; }
function num(v, fallback=0) { const n = Number(v); return Number.isFinite(n) ? n : fallback; }
function bool(v) { if (v === true) return true; if (v === false) return false; return ['1','true','sim','yes','on'].includes(normalize(v)); }
function hasAny(text, words) { const t = normalize(text); return words.some(w => t.includes(normalize(w))); }
function isoPlusMinutes(min) { return new Date(Date.now() + num(min,0)*60000).toISOString(); }
function compact(obj) { const out={}; for (const [k,v] of Object.entries(obj||{})) { if (v===undefined || v===null) continue; if (typeof v==='string' && !v.trim()) continue; if (Array.isArray(v) && !v.length) continue; out[k]=v; } return out; }

const current = $json || {};
const cfg = safeNodeJson('05.03 Consolidar Configuração Runtime', safeNodeJson('05.01 Carregar Configuração da Imobiliária', {}));
const orch = safeNodeJson('07.10 Orquestrar Próxima Ação', {});
const gov = safeNodeJson('07.095 Governança de Conversa e CRM v52', {});
const item = { ...orch, ...gov, ...current };
const inbound = normalize(first(item.canonical_text, item.inbound_text, item.original_text, ''));
const action = normalize(first(item.action, 'ASK'));
const intent = normalize(first(item.last_intent, item.inferred_intent, item.intent, ''));
const stageRaw = normalize(first(item.stage, item.status, 'novo_lead'));
const mediaType = normalize(first(item.media_type, 'text'));
const hasValidPhone = String(first(item.phone_e164, item.customer_phone, item.contact_id, '') || '').replace(/\D/g,'').length >= 11;
const hasListing = Boolean(first(item.favorite_listing, item.service_key, item.selected_listing, item.site_property_code, item.site_property_url, null));
const cameFromSiteProperty = Boolean(item.site_form_entry || item.entry_type === 'property_interest' || hasListing);
const proposal = item.proposal_intent === true || ['proposal','negotiation_proposal'].includes(intent) || hasAny(inbound, ['proposta','desconto','negociar','reservar','sinal','fechar','quero esse','contrato']);
const visit = item.visit_interest === true || ['visit_booking','visit_reschedule','visit_confirm'].includes(intent) || hasAny(inbound, ['visita','visitar','agendar','amanha','amanhã','hoje a tarde','à tarde','a tarde','horario','horário','conhecer']);
const human = item.explicit_human_intent === true || intent === 'human_handoff' || hasAny(inbound, ['corretor','corretora','humano','consultor','consultora','me chama','me ligue','falar com','atendente']);
const availability = item.availability_intent === true || intent === 'faq_availability' || hasAny(inbound, ['disponivel','disponível','disponibilidade','ainda tem','ja vendeu','já vendeu','ja alugou','já alugou']);
const docs = ['documents','faq_documents','rental_guarantees'].includes(intent) || hasAny(inbound, ['documentos','fiador','caucao','caução','seguro fianca','seguro fiança','financiamento','fgts','comprovar renda','renda']);
const pet = item.pet_policy_intent === true || intent === 'faq_pet_policy' || hasAny(inbound, ['aceita pet','aceitam pet','permite pet','permitem pet','aceita animais','aceitam animais','permite animais','pet friendly','cachorro','gato','animal de estimacao','animal de estimação','animais']);
const details = item.asks_only_info === true || ['faq_property_details','property_details','property_info'].includes(intent) || hasAny(inbound, ['mais detalhes','mais informacoes','mais informações','detalhes','saber mais','me passa detalhes','caracteristicas','características','diferenciais']);
const similar = ['similar_properties','alternatives','property_options'].includes(intent) || hasAny(inbound, ['opcoes parecidas','opções parecidas','parecido','parecida','semelhante','semelhantes','outras opcoes','outras opções','mais opcoes','mais opções','ampliar busca']);
const objectiveInfoOnly = (pet || availability || docs || details || similar || item.asks_only_info === true) && !proposal && !visit && !human && !owner;
const owner = bool(cfg.OwnerCaptureEnabled) && (item.owner_intent === true || ['owner_capture','property_valuation','seller_lead'].includes(intent) || hasAny(inbound, ['quero vender meu','quero alugar meu','tenho um imovel','tenho um imóvel','sou proprietario','sou proprietário','avaliar meu imovel','avaliar meu imóvel','captacao','captação','anunciar meu']));
const passiveAck = /^(?:ok|okay|certo|beleza|blz|obrigad[oa]?|valeu|show|perfeito|combinado|aguardo|fico no aguardo|vou aguardar)[\s!.]*$/.test(inbound);
const priceResearch = hasAny(inbound, ['valor','preco','preço','quanto custa','aluguel']) && !proposal && !visit;

const scoring = parseObj(cfg.CommercialScoringPolicy);
let score = Math.max(num(item.lead_score, 0), 0);
const reasons = [];
function add(points, reason) { const p = num(points,0); if (p>0) { score += p; reasons.push(`${reason}+${p}`); } }
if (cameFromSiteProperty) add(scoring.site_property ?? 25, 'imovel_especifico');
if (hasValidPhone) add(scoring.valid_phone ?? 20, 'telefone_valido');
if (visit) add(scoring.visit_request ?? 35, 'pedido_visita');
if (proposal) add(scoring.proposal_request ?? 40, 'proposta_negociacao');
if (human) add(scoring.human_request ?? 35, 'pedido_corretor');
if (docs) add(scoring.financing_docs ?? 20, 'documentos_financiamento_garantias');
if (owner) add(scoring.owner_capture ?? 45, 'captacao_proprietario');
if (['audio','image'].includes(mediaType)) add(scoring.audio_or_image ?? 10, 'midia_enviada');
if (item.followup_context || stageRaw.includes('follow')) add(scoring.followup_response ?? 15, 'resposta_followup');
if (priceResearch) add(scoring.generic_price_research ?? 5, 'pesquisa_preco');
if (passiveAck) add(scoring.passive_waiting_ack ?? 0, 'ack_passivo');
score = Math.max(0, Math.min(100, Math.round(score)));
// Dúvida objetiva pode ter imóvel + telefone, mas não deve virar lead urgente só por isso.
// Ex.: “aceita pet?” depois do formulário do site.
if (objectiveInfoOnly) score = Math.min(score, num(first(cfg.InfoOnlyMaxScore, $env.INFO_ONLY_MAX_SCORE), 55));

const hotThreshold = num(first(cfg.HotLeadNotifyScore, $env.HOT_LEAD_NOTIFY_SCORE), 70);
const urgentThreshold = num(first(cfg.UrgentLeadNotifyScore, $env.URGENT_LEAD_NOTIFY_SCORE), 90);
let temperature = score >= urgentThreshold ? 'urgente' : score >= hotThreshold ? 'quente' : score >= 40 ? 'morno' : 'frio';
if (proposal || human || owner) temperature = score >= urgentThreshold ? 'urgente' : 'quente';

let funnelStage = 'qualificacao';
if (owner) funnelStage = 'captacao_proprietario';
else if (proposal) funnelStage = 'proposta_negociacao';
else if (visit && ['book','reschedule','confirm'].includes(action)) funnelStage = 'visita_em_andamento';
else if (visit) funnelStage = 'visita_solicitada';
else if (human) funnelStage = 'corretor_solicitado';
else if (pet && hasListing) funnelStage = 'faq_pet_policy';
else if (docs && hasListing) funnelStage = 'faq_documentos_financiamento';
else if (availability && hasListing) funnelStage = 'faq_disponibilidade';
else if (details && hasListing) funnelStage = 'faq_detalhes_imovel';
else if (similar && hasListing) funnelStage = 'faq_opcoes_parecidas';
else if (temperature === 'quente' || temperature === 'urgente') funnelStage = 'lead_quente';
else if (passiveAck && normalize(item.status).includes('seller')) funnelStage = 'aguardando_corretor';
else if (stageRaw) funnelStage = stageRaw.replace(/\s+/g,'_');

const noWait = bool(first(cfg.NoWaitHotLead, true));
let nextAction = first(item.next_best_action, 'continuar qualificação consultiva');
let brokerRequired = false;
let hotReason = null;
if (objectiveInfoOnly) {
  brokerRequired = false;
  hotReason = null;
  nextAction = pet ? 'responder política de pet sem acionar corretor'
    : docs ? 'responder documentação/financiamento sem acionar corretor'
    : availability ? 'responder disponibilidade cadastrada sem acionar corretor'
    : similar ? 'mostrar opções parecidas sem acionar corretor'
    : 'responder dúvida objetiva sem acionar corretor';
}
else if (owner) { brokerRequired = true; hotReason = 'captacao_de_proprietario'; nextAction = 'acionar captador/corretor responsável por captação'; }
else if (proposal) { brokerRequired = true; hotReason = 'proposta_ou_negociacao'; nextAction = 'corretor assumir e conduzir proposta'; }
else if (human) { brokerRequired = true; hotReason = 'lead_pediu_humano'; nextAction = 'corretor assumir atendimento'; }
else if (visit) { brokerRequired = true; hotReason = 'pedido_de_visita'; nextAction = 'confirmar agenda e corretor assumir rapidamente'; }
else if ((temperature === 'quente' || temperature === 'urgente') && hasListing && !objectiveInfoOnly) { brokerRequired = true; hotReason = 'score_comercial_quente'; nextAction = 'corretor assumir lead quente'; }

let finalAction = objectiveInfoOnly ? 'ASK' : (item.action || 'ASK');
// Não interrompe agenda quando o fluxo já tem BOOK/RESCHEDULE/CANCEL/CONFIRM, mas aciona CRM paralelo pelo broker_notify_should_send.
// Hotfix v104: pergunta objetiva nunca entra no caminho HANDOFF.
if (!objectiveInfoOnly && noWait && brokerRequired && !['BOOK','RESCHEDULE','CANCEL','CONFIRM'].includes(String(finalAction || '').toUpperCase())) finalAction = 'HANDOFF';

const slaMin = num(first(cfg.BrokerAcceptanceSlaMin, $env.BROKER_ACCEPTANCE_SLA_MIN), 5);
const reassignMin = num(first(cfg.BrokerReassignAfterMin, $env.BROKER_REASSIGN_AFTER_MIN), 10);
const acceptanceRequired = !objectiveInfoOnly && brokerRequired && !passiveAck;
const acceptanceDeadline = acceptanceRequired ? isoPlusMinutes(slaMin) : null;
const reassignmentAt = acceptanceRequired ? isoPlusMinutes(reassignMin) : null;
const urgencyLabel = temperature === 'urgente' ? 'urgente' : (temperature === 'quente' ? 'alta' : (temperature === 'morno' ? 'média' : 'baixa'));
const sellerCommandHint = acceptanceRequired ? 'Responder: ACEITAR, SEM PERFIL, EM ATENDIMENTO, VISITA MARCADA, PROPOSTA ENVIADA, FECHADO ou PERDIDO.' : null;

const commercialSummary = [
  `Score ${score}/100 (${temperature})`,
  `Funil: ${funnelStage}`,
  hotReason ? `Motivo: ${hotReason}` : '',
  nextAction ? `Próxima ação: ${nextAction}` : '',
  acceptanceRequired ? `SLA aceite: ${slaMin} min; redistribuir/alertar em ${reassignMin} min sem aceite.` : ''
].filter(Boolean).join(' | ');

return [{
  json: compact({
    ...item,
    action: finalAction,
    lead_score: score,
    commercial_score: score,
    lead_temperature: temperature,
    commercial_temperature: temperature,
    funnel_stage: funnelStage,
    commercial_stage: funnelStage,
    commercial_score_reasons: reasons,
    commercial_hot_reason: objectiveInfoOnly ? null : hotReason,
    broker_acceptance_required: objectiveInfoOnly ? false : acceptanceRequired,
    broker_acceptance_status: acceptanceRequired ? 'pending_acceptance' : first(item.broker_acceptance_status, null),
    broker_acceptance_deadline_at: acceptanceDeadline,
    broker_reassignment_at: reassignmentAt,
    broker_reassign_after_min: reassignMin,
    urgency: first(item.urgency, urgencyLabel),
    sla_priority: urgencyLabel,
    no_wait_hot_lead: noWait,
    broker_notify_should_send: objectiveInfoOnly ? false : (brokerRequired || item.broker_notify_should_send === true),
    broker_notify_headline: objectiveInfoOnly ? null : (owner ? 'PROPRIETÁRIO/CAPTAÇÃO' : (proposal ? 'LEAD PEDIU PROPOSTA/NEGOCIAÇÃO' : (visit ? 'LEAD PEDIU VISITA' : (human ? 'LEAD PEDIU CORRETOR' : (temperature === 'urgente' ? 'LEAD URGENTE' : 'LEAD QUENTE'))))),
    broker_notify_policy_reason: objectiveInfoOnly ? 'bloqueado_por_duvida_objetiva_sem_handoff_v104' : (hotReason || item.broker_notify_policy_reason),
    next_best_action: nextAction,
    seller_command_hint: sellerCommandHint,
    owner_capture_flow: owner,
    owner_capture_fields_needed: owner ? ['tipo_imovel','bairro','valor_esperado','fotos','ocupado','urgencia'] : null,
    lead_journey: owner ? 'captacao_proprietario' : first(item.lead_journey, item.desired_purpose, null),
    seller_summary: [first(item.seller_summary, item.conversation_summary, ''), commercialSummary].filter(Boolean).join('\n'),
    conversation_summary: first(item.conversation_summary, commercialSummary),
    crm_stage_payload: {
      stage: funnelStage,
      temperature,
      score,
      score_reasons: reasons,
      broker_acceptance_required: objectiveInfoOnly ? false : acceptanceRequired,
      broker_acceptance_deadline_at: acceptanceDeadline,
      broker_reassignment_at: reassignmentAt,
      next_best_action: nextAction
    },
    pending_context: {
      ...(parseObj(item.pending_context)),
      funnel_stage: funnelStage,
      lead_temperature: temperature,
      commercial_score: score,
      broker_acceptance_required: objectiveInfoOnly ? false : acceptanceRequired,
      broker_acceptance_deadline_at: acceptanceDeadline,
      broker_reassignment_at: reassignmentAt,
      owner_capture_flow: owner,
      no_wait_hot_lead: noWait
    }
  })
}];
