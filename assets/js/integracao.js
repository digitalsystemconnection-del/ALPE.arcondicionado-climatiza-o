document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 Inicializando...');
  try {
    await carregarProdutos();
    await carregarMarcasDropdown();
    await carregarConfiguracoes();
    await atualizarBadge();
    configurarBotoes();
  } catch (error) {
    console.error('❌ Erro:', error);
  }
});

async function carregarProdutos() {
  try {
    const produtos = await supabaseAPI.carregarProdutosEmDestaque(12);
    const catalogo = document.getElementById('catalogo-produtos');
    if (catalogo && produtos.length > 0) {
      catalogo.innerHTML = '';
      produtos.forEach(p => {
        const card = document.createElement('div');
        card.className = 'produto-card';
        card.innerHTML = 
          <img src="" alt="" loading="lazy" onerror="this.src='images/default.jpg'">
          <div class="produto-info">
            <h4></h4>
            <p style="font-size:12px;color:#666;"> </p>
            <div class="preco">R$ </div>
            <button class="cta-card btn-add-cart" data-id="">COMPRAR AGORA</button>
          </div>
        ;
        catalogo.appendChild(card);
      });
      console.log('✅ Produtos carregados:', produtos.length);
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

async function carregarMarcasDropdown() {
  try {
    const marcas = await supabaseAPI.carregarMarcas();
    const container = document.querySelector('.js-dropdown-marcas');
    if (container && marcas.length > 0) {
      container.innerHTML = '';
      marcas.forEach(m => {
        const link = document.createElement('a');
        link.href = marcas.index/.html;
        link.textContent = m.nome;
        container.appendChild(link);
      });
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

async function carregarConfiguracoes() {
  try {
    const config = await supabaseAPI.carregarConfiguracoes();
    console.log('✅ Configurações:', config);
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

async function atualizarBadge() {
  try {
    const carrinho = await supabaseAPI.obterCarrinho();
    const badge = document.getElementById('cart-count');
    if (badge) {
      const total = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
      badge.textContent = total;
      badge.style.display = total > 0 ? 'flex' : 'none';
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

function configurarBotoes() {
  document.addEventListener('click', async function(e) {
    const btn = e.target.closest('.btn-add-cart');
    if (btn) {
      e.preventDefault();
      const produtoId = btn.dataset.id;
      if (produtoId) {
        await supabaseAPI.adicionarAoCarrinho(produtoId, 1);
        await atualizarBadge();
        const original = btn.textContent;
        btn.textContent = '✓ ADICIONADO!';
        btn.style.background = '#22c55e';
        btn.style.color = 'white';
        setTimeout(() => {
          btn.textContent = original;
          btn.style.background = '';
          btn.style.color = '';
        }, 2000);
      }
    }
  });
}
