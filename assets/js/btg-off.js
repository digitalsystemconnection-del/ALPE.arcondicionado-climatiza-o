// ============================================
// DESATIVAR BTG TEMPORARIAMENTE
// ============================================

// Substituir a função do BTG
window.gerarCobrancaBTG = function() {
  console.log('⏸️ BTG desativado - Salvando pedido direto');
  
  try {
    // Pegar dados do formulário ou prompt
    const nome = document.getElementById('nome')?.value || prompt('Digite seu nome completo:');
    const telefone = document.getElementById('telefone')?.value || prompt('Digite seu telefone:');
    const email = document.getElementById('email')?.value || prompt('Digite seu email:');
    const cpf = document.getElementById('cpf')?.value || prompt('Digite seu CPF:');
    
    const endereco = {
      rua: document.getElementById('rua')?.value || prompt('Rua:'),
      numero: document.getElementById('numero')?.value || prompt('Número:'),
      complemento: document.getElementById('complemento')?.value || '',
      bairro: document.getElementById('bairro')?.value || prompt('Bairro:'),
      cidade: document.getElementById('cidade')?.value || prompt('Cidade:'),
      estado: document.getElementById('estado')?.value || prompt('Estado (UF):'),
      cep: document.getElementById('cep')?.value || prompt('CEP:')
    };
    
    if (!nome || !telefone) {
      alert('⚠️ Nome e telefone são obrigatórios!');
      return;
    }
    
    const dadosCliente = {
      nome: nome,
      telefone: telefone,
      email: email || '',
      cpf: cpf || '',
      endereco: endereco,
      pagamento: 'pendente',
      parcelas: 1,
      frete: 0,
      desconto: 0
    };
    
    // Usar a função do Supabase para criar pedido
    supabaseAPI.criarPedido(dadosCliente).then(pedido => {
      if (pedido) {
        alert(✅ Pedido # criado com sucesso!);
        // Atualizar badge do carrinho
        supabaseAPI.obterCarrinho().then(carrinho => {
          const badge = document.getElementById('cart-count');
          if (badge) {
            const total = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
            badge.textContent = total;
          }
        });
        window.location.href = 'obrigado.html';
      }
    }).catch(error => {
      console.error('❌ Erro ao criar pedido:', error);
      alert('Erro ao finalizar pedido. Tente novamente.');
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
    alert('Erro ao processar pedido. Tente novamente.');
  }
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

console.log('✅ BTG desativado com sucesso!');
console.log('✅ Pedidos serão salvos direto no Supabase.');
