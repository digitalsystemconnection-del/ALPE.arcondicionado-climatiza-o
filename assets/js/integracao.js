// ============================================
// INTEGRAÇÃO COMPLETA
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Inicializando...');
  
  // Aguardar o supabaseAPI carregar
  if (typeof supabaseAPI === 'undefined') {
    console.log('⏳ Aguardando supabaseAPI...');
    setTimeout(init, 1000);
  } else {
    init();
  }
});

async function init() {
  try {
    await carregarProdutos();
    await carregarMarcasDropdown();
    await carregarConfiguracoes();
    await atualizarBadge();
    configurarBotoesComprar();
    configurarBotaoFinalizar();
    console.log('✅ Sistema inicializado!');
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

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
      // Reconfigurar botões após carregar produtos
      configurarBotoesComprar();
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
      marcas.forEach(m => {
        const link = document.createElement('a');
        link.href = marcas.index/.html;
        link.textContent = m.nome;
        container.appendChild(link);
      });
    }
  } catch (error) {
    console.error('❌ Erro ao carregar marcas:', error);
  }
}

async function carregarConfiguracoes() {
  try {
    const config = await supabaseAPI.carregarConfiguracoes();
    console.log('✅ Configurações carregadas');
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
    console.error('❌ Erro ao atualizar badge:', error);
  }
}

// ============================================
// BOTÃO COMPRAR AGORA
// ============================================
function configurarBotoesComprar() {
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    // Remover eventos antigos
    const novoBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(novoBtn, btn);
    
    novoBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const produtoId = this.dataset.id;
      if (!produtoId) {
        console.error('❌ Produto ID não encontrado');
        return;
      }
      
      try {
        await supabaseAPI.adicionarAoCarrinho(produtoId, 1);
        await atualizarBadge();
        
        // Feedback visual
        const originalText = this.textContent;
        this.textContent = '✓ ADICIONADO!';
        this.style.background = '#22c55e';
        this.style.color = 'white';
        
        setTimeout(() => {
          this.textContent = originalText;
          this.style.background = '';
          this.style.color = '';
        }, 2000);
        
        console.log('✅ Produto adicionado ao carrinho');
      } catch (error) {
        console.error('❌ Erro ao adicionar:', error);
        alert('Erro ao adicionar produto. Tente novamente.');
      }
    });
  });
}

// ============================================
// BOTÃO FINALIZAR PEDIDO
// ============================================
function configurarBotaoFinalizar() {
  const btn = document.getElementById('btn-finalizar');
  if (!btn) {
    console.log('⚠️ Botão finalizar não encontrado');
    return;
  }
  
  // Remover botão antigo
  const novoBtn = document.createElement('button');
  novoBtn.id = 'btn-finalizar';
  novoBtn.className = 'cta-header';
  novoBtn.style.cssText = 'width:100%;padding:18px;font-size:18px;text-align:center;border:none;cursor:pointer;background:#0066cc;color:white;border-radius:8px;font-weight:bold;';
  novoBtn.textContent = '🛒 Finalizar Pedido';
  btn.parentNode.replaceChild(novoBtn, btn);
  
  novoBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔘 Finalizar Pedido clicado!');
    finalizarPedido();
  });
  
  console.log('✅ Botão Finalizar configurado!');
}

// ============================================
// FUNÇÃO FINALIZAR PEDIDO
// ============================================
window.finalizarPedido = async function() {
  console.log('🛒 Iniciando finalização...');
  
  try {
    const carrinho = await supabaseAPI.obterCarrinho();
    
    if (!carrinho || carrinho.length === 0) {
      alert('🛒 Seu carrinho está vazio!');
      return;
    }
    
    console.log('📦 Itens no carrinho:', carrinho.length);
    
    const dadosCliente = {
      nome: prompt('📝 Digite seu nome completo:') || '',
      telefone: prompt('📱 Digite seu telefone (ex: 21999999999):') || '',
      email: prompt('📧 Digite seu email:') || '',
      cpf: prompt('📄 Digite seu CPF:') || '',
      endereco: {
        rua: prompt('🏠 Rua:') || '',
        numero: prompt('🔢 Número:') || '',
        complemento: prompt('📦 Complemento:') || '',
        bairro: prompt('🏘️ Bairro:') || '',
        cidade: prompt('🌆 Cidade:') || '',
        estado: prompt('📌 Estado (UF):') || '',
        cep: prompt('📮 CEP:') || ''
      },
      pagamento: 'pendente',
      parcelas: 1
    };
    
    if (!dadosCliente.nome || !dadosCliente.telefone) {
      alert('⚠️ Nome e telefone são obrigatórios!');
      return;
    }
    
    console.log('📝 Criando pedido...');
    const pedido = await supabaseAPI.criarPedido(dadosCliente);
    
    if (pedido) {
      alert(✅ Pedido # criado com sucesso!);
      const badge = document.getElementById('cart-count');
      if (badge) badge.textContent = '0';
      window.location.href = 'obrigado.html';
    } else {
      alert('❌ Erro ao criar pedido. Verifique o console.');
    }
  } catch (error) {
    console.error('❌ Erro ao finalizar:', error);
    alert('❌ Erro ao finalizar pedido: ' + error.message);
  }
};

console.log('✅ Script carregado com sucesso!');
