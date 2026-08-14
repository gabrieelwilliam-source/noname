(function () {
  'use strict';
  var scenarios = {
    comprador: {
      type: 'buyer', scenario: 'comprador_qualificado', title: 'Quero comprar um imóvel',
      description: 'Informe seu perfil de compra. A Iana continua a busca a partir do que você contar aqui.',
      message: 'Olá, quero comprar um apartamento em Joinville. Procuro 2 ou 3 quartos, até R$ 900 mil, com vaga e boa localização.'
    },
    aluguel: {
      type: 'rent', scenario: 'cliente_locacao', title: 'Quero alugar um imóvel',
      description: 'Informe sua necessidade de locação. A Iana usa esse contexto para continuar a busca sem repetir perguntas.',
      message: 'Olá, procuro imóvel para alugar em Joinville, preferência por 2 quartos, aceita pet e até R$ 3.500 por mês.'
    },
    proprietario: {
      type: 'owner', scenario: 'captacao_proprietario', title: 'Tenho um imóvel para avaliar',
      description: 'Informe os dados iniciais. A Iana organiza o contexto e encaminha para a equipe responsável quando necessário.',
      message: 'Olá, tenho um imóvel em Joinville e gostaria de avaliar para venda ou locação com a imobiliária.'
    },
    visita: {
      type: 'visit', scenario: 'agendamento_visita',
      title: 'Quero agendar uma visita', description: 'Se você já escolheu um imóvel, informe o código ou o nome na mensagem. Se ainda não escolheu, a Iana ajuda a encontrar uma opção primeiro.',
      message: 'Quero agendar uma visita. O imóvel que me interessou é: '
    },
    investimento: {
      type: 'investment', scenario: 'investidor', code: 'I10005', propertyTitle: 'Studio mobiliado no Centro', url: new URL('imovel.html?codigo=I10005', location.href).href,
      title: 'Quero investir em imóvel', description: 'Informe seu objetivo para analisar opções com potencial de renda e liquidez.',
      message: 'Quero entender o potencial de renda, condomínio e condições de negociação deste imóvel.'
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
