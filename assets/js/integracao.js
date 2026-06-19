// ============================================
// INTEGRAÇÃO COMPLETA
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Inicializando...');
  
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
        card.innerHTML = '<img src=\"' + (p.imagem_url || 'images/default.jpg') + '\" alt=\"' + p.nome + '\" loading=\"lazy\" onerror=\"this.src='images/default.jpg'\"><div class=\"produto-info\"><h4>' + p.nome + '</h4><p style=\"font-size:12px;color:#666;\">' + (p.marca || '') + (p.btu ? ' - ' + p.btu + ' BTU' : '') + '</p><div class=\"preco\">R$ ' + p.preco.toFixed(2).replace('.', ',') + '</div><button class=\"cta-card btn-add-cart\" data-id=\"' + p.id + '\">COMPRAR AGORA</button></div>';
        catalogo.appendChild(card);
      });
      console.log('✅ Produtos carregados:', produtos.length);
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
        link.href = 'marcas.index/' + (m.slug || m.nome.toLowerCase()) + '.html';
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
    console.error('❌ Erro:', error);
  }
}

function configurarBotoesComprar() {
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    const novoBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(novoBtn, btn);
    novoBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      const produtoId = this.dataset.id;
      if (!produtoId) return;
      try {
        await supabaseAPI.adicionarAoCarrinho(produtoId, 1);
        await atualizarBadge();
        const originalText = this.textContent;
        this.textContent = '✓ ADICIONADO!';
        this.style.background = '#22c55e';
        this.style.color = 'white';
        setTimeout(() => {
          this.textContent = originalText;
          this.style.background = '';
          this.style.color = '';
        }, 2000);
      } catch (error) {
        console.error('❌ Erro:', error);
      }
    });
  });
}

function configurarBotaoFinalizar() {
  const btn = document.getElementById('btn-finalizar');
  if (!btn) return;
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
    window.finalizarPedido();
  });
  console.log('✅ Botão Finalizar configurado!');
}

window.finalizarPedido = async function() {
  console.log('🛒 Finalizando...');
  try {
    const carrinho = await supabaseAPI.obterCarrinho();
    if (!carrinho || carrinho.length === 0) {
      alert('🛒 Carrinho vazio!');
      return;
    }
    const dadosCliente = {
      nome: prompt('📝 Nome completo:') || '',
      telefone: prompt('📱 Telefone:') || '',
      email: prompt('📧 Email:') || '',
      cpf: prompt('📄 CPF:') || '',
      endereco: {
        rua: prompt('🏠 Rua:') || '',
        numero: prompt('🔢 Número:') || '',
        complemento: prompt('📦 Complemento:') || '',
        bairro: prompt('🏘️ Bairro:') || '',
        cidade: prompt('🌆 Cidade:') || '',
        estado: prompt('📌 Estado:') || '',
        cep: prompt('📮 CEP:') || ''
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
    alert('❌ Erro: ' + error.message);
  }
};

console.log('✅ Script carregado!');
