(function () {
  'use strict';
  var scenarios = {
    comprador: {
      type: 'buyer', scenario: 'comprador_qualificado', title: 'Quero comprar um imóvel',
      description: 'Informe seu perfil de compra para a equipe separar opções compatíveis.',
      message: 'Olá, quero comprar um apartamento em Joinville. Procuro 2 ou 3 quartos, até R$ 900 mil, com vaga e boa localização.'
    },
    aluguel: {
      type: 'rent', scenario: 'cliente_locacao', title: 'Quero alugar um imóvel',
      description: 'Informe sua necessidade de locação para receber orientação sobre opções, valores e garantias.',
      message: 'Olá, procuro imóvel para alugar em Joinville, preferência por 2 quartos, aceita pet e até R$ 3.500 por mês.'
    },
    proprietario: {
      type: 'owner', scenario: 'captacao_proprietario', title: 'Tenho um imóvel para avaliar',
      description: 'Informe os dados iniciais para avaliação de venda ou locação.',
      message: 'Olá, tenho um imóvel em Joinville e gostaria de avaliar para venda ou locação com a imobiliária.'
    },
    visita: {
      type: 'property', scenario: 'agendamento_visita', code: 'V10001', propertyTitle: 'Apartamento 3 quartos em Atiradores', url: new URL('imovel.html?codigo=V10001', location.href).href,
      title: 'Tenho interesse em visitar', description: 'Envie seus dados para confirmar disponibilidade e combinar próximos passos sobre este imóvel.',
      message: 'Olá, tenho interesse no imóvel V10001 - Apartamento 3 quartos em Atiradores. Quero verificar disponibilidade e agendar uma visita.'
    },
    investimento: {
      type: 'investment', scenario: 'investidor', code: 'I10005', propertyTitle: 'Studio mobiliado no Centro', url: new URL('imovel.html?codigo=I10005', location.href).href,
      title: 'Quero investir em imóvel', description: 'Informe seu objetivo para analisar opções com potencial de renda e liquidez.',
      message: 'Olá, tenho interesse no imóvel I10005 - Studio mobiliado no Centro. Quero entender potencial de renda, condomínio e condições de negociação.'
    }
  };

  function runScenario(key) {
    var data = scenarios[key] || scenarios.comprador;
    if (typeof window.openLeadModal === 'function') {
      window.openLeadModal(data);
      return;
    }
    try { localStorage.setItem('iana_imob_journey', key); } catch (e) {}
    location.href = 'index.html#teste-fluxo';
  }

  function bootFromStorage() {
    var key = '';
    try { key = localStorage.getItem('iana_imob_journey') || ''; localStorage.removeItem('iana_imob_journey'); } catch (e) {}
    if (key && typeof window.openLeadModal === 'function') {
      setTimeout(function () { runScenario(key); }, 500);
    }
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-journey]');
    if (!btn) return;
    e.preventDefault();
    runScenario(btn.getAttribute('data-journey'));
  });

  document.addEventListener('DOMContentLoaded', bootFromStorage);
  window.HorizonteAtendimento = { runScenario: runScenario, scenarios: scenarios };
})();
