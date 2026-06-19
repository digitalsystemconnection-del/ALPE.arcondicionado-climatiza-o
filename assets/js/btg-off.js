// ============================================
// BTG DESATIVADO TEMPORARIAMENTE
// ============================================

console.log('⏸️ BTG desativado - Modo de teste ativo');

// Substituir função do BTG
window.gerarCobrancaBTG = function() {
  console.log('⏸️ BTG desativado - Salvando pedido direto');
  
  const nome = prompt('Digite seu nome completo:');
  if (!nome) {
    alert('Nome é obrigatório!');
    return;
  }
  
  const telefone = prompt('Digite seu telefone (ex: 21999999999):');
  if (!telefone) {
    alert('Telefone é obrigatório!');
    return;
  }
  
  const dadosCliente = {
    nome: nome,
    telefone: telefone,
    email: prompt('Digite seu email:') || '',
    cpf: prompt('Digite seu CPF:') || '',
    endereco: {
      rua: prompt('Rua:') || '',
      numero: prompt('Número:') || '',
      complemento: prompt('Complemento:') || '',
      bairro: prompt('Bairro:') || '',
      cidade: prompt('Cidade:') || '',
      estado: prompt('Estado (UF):') || '',
      cep: prompt('CEP:') || ''
    },
    pagamento: 'pendente',
    parcelas: 1,
    frete: 0,
    desconto: 0
  };
  
  supabaseAPI.criarPedido(dadosCliente)
    .then(pedido => {
      if (pedido) {
        alert(✅ Pedido # criado!);
        window.location.href = 'obrigado.html';
      } else {
        alert('❌ Erro ao criar pedido. Verifique o console.');
      }
    })
    .catch(error => {
      console.error('Erro:', error);
      alert('Erro ao processar pedido. Tente novamente.');
    });
};

// Bloquear chamadas ao localhost:3002
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  if (typeof url === 'string' && url.includes('localhost:3002')) {
    console.log('⏸️ Chamada BTG bloqueada:', url);
    return Promise.reject(new Error('BTG desativado'));
  }
  return originalFetch.call(this, url, options);
};

console.log('✅ BTG desativado - Pedidos salvos no Supabase');
