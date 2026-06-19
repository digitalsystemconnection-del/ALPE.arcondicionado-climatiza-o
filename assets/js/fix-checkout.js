// ============================================
// CORREÇÃO DO BOTÃO FINALIZAR PEDIDO
// ============================================

// Função de finalizar pedido
window.finalizarPedido = async function() {
  console.log('🛒 Finalizando pedido...');
  
  try {
    const carrinho = await supabaseAPI.obterCarrinho();
    
    if (!carrinho || carrinho.length === 0) {
      alert('🛒 Carrinho vazio!');
      return;
    }
    
    const dadosCliente = {
      nome: prompt('Nome completo:') || '',
      telefone: prompt('Telefone:') || '',
      email: prompt('Email:') || '',
      cpf: prompt('CPF:') || '',
      endereco: {
        rua: prompt('Rua:') || '',
        numero: prompt('Número:') || '',
        complemento: prompt('Complemento:') || '',
        bairro: prompt('Bairro:') || '',
        cidade: prompt('Cidade:') || '',
        estado: prompt('Estado:') || '',
        cep: prompt('CEP:') || ''
      },
      pagamento: 'pendente',
      parcelas: 1
    };
    
    if (!dadosCliente.nome || !dadosCliente.telefone) {
      alert('⚠️ Nome e telefone são obrigatórios!');
      return;
    }
    
    const pedido = await supabaseAPI.criarPedido(dadosCliente);
    
    if (pedido) {
      alert(✅ Pedido # criado!);
      const badge = document.getElementById('cart-count');
      if (badge) badge.textContent = '0';
      window.location.href = 'obrigado.html';
    }
  } catch (error) {
    console.error('❌ Erro:', error);
    alert('Erro ao finalizar pedido.');
  }
};

// Corrigir botão
document.addEventListener('DOMContentLoaded', function() {
  const btn = document.getElementById('btn-finalizar');
  if (btn) {
    const novoBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(novoBtn, btn);
    novoBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.finalizarPedido === 'function') {
        window.finalizarPedido();
      } else {
        alert('Função não encontrada!');
      }
    });
    console.log('✅ Botão Finalizar Pedido corrigido!');
  }
});
