// ============================================
// INTEGRAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando...');
    if (typeof supabaseAPI === 'undefined') {
        setTimeout(init, 1000);
    } else {
        init();
    }
});

async function init() {
    try {
        await carregarProdutos();
        await carregarMarcas();
        await atualizarBadge();
        configurarBotoes();
        console.log('✅ Pronto!');
    } catch (e) {
        console.error('❌ Erro:', e);
    }
}

async function carregarProdutos() {
    try {
        const produtos = await supabaseAPI.carregarProdutos();
        const catalogo = document.getElementById('catalogo-produtos');
        if (catalogo && produtos.length > 0) {
            catalogo.innerHTML = '';
            produtos.forEach(p => {
                const card = document.createElement('div');
                card.className = 'produto-card';
                card.innerHTML = '<img src="' + (p.imagem_url || 'images/default.jpg') + '" alt="' + p.nome + '" loading="lazy"><div class="produto-info"><h4>' + p.nome + '</h4><p style="font-size:12px;color:#666;">' + (p.marca || '') + '</p><div class="preco">R$ ' + p.preco.toFixed(2).replace('.', ',') + '</div><button class="cta-card btn-add-cart" data-id="' + p.id + '">COMPRAR AGORA</button></div>';
                catalogo.appendChild(card);
            });
            configurarBotoes();
            console.log('✅ Produtos:', produtos.length);
        }
    } catch (e) {
        console.error('❌ Erro:', e);
    }
}

async function carregarMarcas() {
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
    } catch (e) {
        console.error('❌ Erro:', e);
    }
}

async function atualizarBadge() {
    try {
        const carrinho = await supabaseAPI.obterCarrinho();
        const badge = document.getElementById('cart-count');
        if (badge) {
            const total = carrinho.reduce((s, i) => s + i.quantidade, 0);
            badge.textContent = total;
            badge.style.display = total > 0 ? 'flex' : 'none';
        }
    } catch (e) {
        console.error('❌ Erro:', e);
    }
}

function configurarBotoes() {
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.onclick = async function(e) {
            e.preventDefault();
            e.stopPropagation();
            const id = this.dataset.id;
            if (!id) return;
            try {
                await supabaseAPI.adicionarAoCarrinho(id, 1);
                await atualizarBadge();
                const orig = this.textContent;
                this.textContent = '✓ ADICIONADO!';
                this.style.background = '#22c55e';
                this.style.color = 'white';
                setTimeout(() => {
                    this.textContent = orig;
                    this.style.background = '';
                    this.style.color = '';
                }, 2000);
            } catch (e) {
                console.error('❌ Erro:', e);
            }
        };
    });

    const btnFinal = document.getElementById('btn-finalizar');
    if (btnFinal) {
        btnFinal.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            finalizarPedido();
        };
    }
}

window.finalizarPedido = async function() {
    console.log('🛒 Finalizando...');
    try {
        const carrinho = await supabaseAPI.obterCarrinho();
        if (!carrinho || carrinho.length === 0) {
            alert('🛒 Carrinho vazio!');
            return;
        }
        const dados = {
            nome: prompt('Nome:') || '',
            telefone: prompt('Telefone:') || '',
            email: prompt('Email:') || '',
            cpf: prompt('CPF:') || '',
            endereco: {
                rua: prompt('Rua:') || '',
                numero: prompt('Número:') || '',
                bairro: prompt('Bairro:') || '',
                cidade: prompt('Cidade:') || '',
                estado: prompt('Estado:') || '',
                cep: prompt('CEP:') || ''
            },
            pagamento: 'pendente'
        };
        if (!dados.nome || !dados.telefone) {
            alert('Nome e telefone são obrigatórios!');
            return;
        }
        const pedido = await supabaseAPI.criarPedido(dados);
        if (pedido) {
            alert('✅ Pedido #' + pedido.numero_pedido + ' criado!');
            document.getElementById('cart-count').textContent = '0';
            window.location.href = 'obrigado.html';
        }
    } catch (e) {
        console.error('❌ Erro:', e);
        alert('Erro: ' + e.message);
    }
};

console.log('✅ Script carregado!');
