// ============================================
// CORRIGIR BOTÕES DE COMPRA
// ============================================

// Função para adicionar ao carrinho
async function adicionarAoCarrinhoClick(produtoId) {
  try {
    await supabaseAPI.adicionarAoCarrinho(produtoId, 1);
    await atualizarBadgeCarrinho();
    
    // Feedback visual
    const btn = document.querySelector([data-id=""]);
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = '✓ ADICIONADO!';
      btn.style.background = '#22c55e';
      btn.style.color = 'white';
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
      }, 2000);
    }
    
    console.log('✅ Produto adicionado ao carrinho');
  } catch (error) {
    console.error('❌ Erro ao adicionar:', error);
  }
}

// Substituir todos os botões "Comprar Agora"
document.addEventListener('DOMContentLoaded', function() {
  // Remover listeners antigos
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
  });
  
  // Adicionar novos listeners
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const produtoId = this.dataset.id;
      if (produtoId) {
        adicionarAoCarrinhoClick(produtoId);
      }
    });
  });
  
  console.log('✅ Botões corrigidos - agora adicionam ao carrinho');
});

// Função para ir ao carrinho
function irParaCarrinho() {
  document.getElementById('nav-carrinho')?.click();
}

console.log('✅ Sistema corrigido! Clique em "Comprar Agora" para adicionar ao carrinho.');
