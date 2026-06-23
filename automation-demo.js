(function () {
  'use strict';
  var scenarios = {
    comprador: {
      type: 'buyer', scenario: 'comprador_qualificado', title: 'Simular comprador interessado',
      description: 'Teste como a automação recebe um cliente comprador e entrega contexto para o corretor.',
      message: 'Olá, quero comprar um apartamento em Joinville. Procuro 2 ou 3 quartos, até R$ 900 mil, com vaga e boa localização.'
    },
    aluguel: {
      type: 'rent', scenario: 'cliente_locacao', title: 'Simular cliente de aluguel',
      description: 'Teste um lead de locação entrando pelo site e indo para qualificação automática.',
      message: 'Olá, procuro imóvel para alugar em Joinville, preferência por 2 quartos, aceita pet e até R$ 3.500 por mês.'
    },
    proprietario: {
      type: 'owner', scenario: 'captacao_proprietario', title: 'Simular proprietário querendo anunciar',
      description: 'Teste a captação de imóveis para venda ou locação.',
      message: 'Olá, tenho um imóvel em Joinville e gostaria de avaliar para venda ou locação com a imobiliária.'
    },
    visita: {
      type: 'property', scenario: 'agendamento_visita', code: 'V10001', propertyTitle: 'Apartamento 3 quartos em Atiradores', url: new URL('imovel.html?codigo=V10001', location.href).href,
      title: 'Simular agendamento de visita', description: 'Teste um lead vindo de imóvel específico com intenção clara de visita.',
      message: 'Olá, tenho interesse no imóvel V10001 - Apartamento 3 quartos em Atiradores. Quero verificar disponibilidade e agendar uma visita.'
    },
    investimento: {
      type: 'investment', scenario: 'investidor', code: 'I10005', propertyTitle: 'Studio mobiliado no Centro', url: new URL('imovel.html?codigo=I10005', location.href).href,
      title: 'Simular investidor', description: 'Teste um lead que busca imóvel para renda/locação.',
      message: 'Olá, tenho interesse no imóvel I10005 - Studio mobiliado no Centro. Quero entender potencial de renda, condomínio e condições de negociação.'
    }
  };

  function runScenario(key) {
    var data = scenarios[key] || scenarios.comprador;
    if (typeof window.openLeadModal === 'function') {
      window.openLeadModal(data);
      return;
    }
    try { localStorage.setItem('lais_imob_demo_scenario', key); } catch (e) {}
    location.href = 'index.html#teste-fluxo';
  }

  function bootFromStorage() {
    var key = '';
    try { key = localStorage.getItem('lais_imob_demo_scenario') || ''; localStorage.removeItem('lais_imob_demo_scenario'); } catch (e) {}
    if (key && typeof window.openLeadModal === 'function') {
      setTimeout(function () { runScenario(key); }, 500);
    }
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-demo-scenario]');
    if (!btn) return;
    e.preventDefault();
    runScenario(btn.getAttribute('data-demo-scenario'));
  });

  document.addEventListener('DOMContentLoaded', bootFromStorage);
  window.LaisImobDemo = { runScenario: runScenario, scenarios: scenarios };
})();
