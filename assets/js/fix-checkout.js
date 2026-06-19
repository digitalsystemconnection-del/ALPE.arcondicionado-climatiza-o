window.finalizarPedido = async function() {
  console.log('🛒 Finalizando...');
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
      alert('✅ Pedido #' + pedido.numero_pedido + ' criado!');
      const badge = document.getElementById('cart-count');
      if (badge) badge.textContent = '0';
      window.location.href = 'obrigado.html';
    }
  } catch (error) {
    console.error('❌ Erro:', error);
    alert('Erro ao finalizar: ' + error.message);
  }
};

document.addEventListener('DOMContentLoaded', function() {
  const btn = document.getElementById('btn-finalizar');
  if (btn) {
    const novoBtn = document.createElement('button');
    novoBtn.id = 'btn-finalizar';
    novoBtn.className = 'cta-header';
    novoBtn.style.cssText = 'width:100%;padding:18px;font-size:18px;text-align:center;border:none;cursor:pointer;background:#0066cc;color:white;border-radius:8px;font-weight:bold;';
    novoBtn.textContent = 'Finalizar Pedido';
    btn.parentNode.replaceChild(novoBtn, btn);
    novoBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.finalizarPedido();
    });
    console.log('✅ Botão corrigido!');
  }
});
