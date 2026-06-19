// ============================================
// INTEGRAÇÃO DO SUPABASE COM A LOJA
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
  
  console.log('🚀 Inicializando integração com Supabase...');
  
  try {
    await carregarProdutosDinamicamente();
    await carregarMarcasDropdown();
    await carregarConfiguracoesSite();
    await atualizarBadgeCarrinho();
    
    configurarBotoesComprar();
  } catch (error) {
    console.error('❌ Erro na inicialização:', error);
  }
});

async function carregarProdutosDinamicamente() {
  try {
    const produtos = await supabaseAPI.carregarProdutosEmDestaque(12);
    
    if (produtos && produtos.length > 0) {
      const catalogo = document.getElementById('catalogo-produtos');
      if (catalogo) {
        catalogo.innerHTML = '';
        
        produtos.forEach(produto => {
          const card = document.createElement('div');
          card.className = 'produto-card';
          
          const precoFormatado = produto.preco.toFixed(2).replace('.', ',');
          
          card.innerHTML = 
            <img src="" 
                 alt=""
                 loading="lazy"
                 onerror="this.src='images/default-product.jpg'">
            <div class="produto-info">
              <h4></h4>
              <p style="font-size:12px; color:#666;"> </p>
              <div class="preco">R$ </div>
              <button class="cta-card btn-add-cart" 
                      data-id=""
                      data-sku="">
                COMPRAR AGORA
              </button>
            </div>
          ;
          
          catalogo.appendChild(card);
        });
        
        console.log(✅  produtos carregados do Supabase);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao carregar produtos:', error);
  }
}

async function carregarMarcasDropdown() {
  try {
    const marcas = await supabaseAPI.carregarMarcas();
    const container = document.querySelector('.js-dropdown-marcas');
    
    if (container && marcas.length > 0) {
      container.innerHTML = '';
      marcas.forEach(marca => {
        const link = document.createElement('a');
        link.href = marcas.index/.html;
        link.textContent = marca.nome;
        container.appendChild(link);
      });
      
      console.log(✅  marcas carregadas);
    }
  } catch (error) {
    console.error('❌ Erro ao carregar marcas:', error);
  }
}

async function carregarConfiguracoesSite() {
  try {
    const config = await supabaseAPI.carregarConfiguracoes();
    console.log('✅ Configurações carregadas:', config);
  } catch (error) {
    console.error('❌ Erro ao carregar configurações:', error);
  }
}

async function atualizarBadgeCarrinho() {
  try {
    const carrinho = await supabaseAPI.obterCarrinho();
    const badge = document.getElementById('cart-count');
    
    if (badge) {
      const totalItems = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
      badge.textContent = totalItems;
      badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar badge:', error);
  }
}

function configurarBotoesComprar() {
  document.addEventListener('click', async function(e) {
    const btn = e.target.closest('.btn-add-cart');
    if (btn) {
      e.preventDefault();
      const produtoId = btn.dataset.id;
      
      if (produtoId) {
        try {
          await supabaseAPI.adicionarAoCarrinho(produtoId, 1);
          await atualizarBadgeCarrinho();
          
          const originalText = btn.textContent;
          btn.textContent = '✓ ADICIONADO!';
          btn.style.background = '#22c55e';
          btn.style.color = 'white';
          
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.color = '';
          }, 2000);
        } catch (error) {
          console.error('❌ Erro ao adicionar:', error);
        }
      }
    }
  });
}
