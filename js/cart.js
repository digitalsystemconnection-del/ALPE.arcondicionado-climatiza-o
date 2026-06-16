// js/cart.js
window.safeStorage = window.safeStorage || {
    get: (key) => { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set: (key, value) => { try { localStorage.setItem(key, value); } catch (e) { } }
};

let carrinho = JSON.parse(safeStorage.get('alpe_cart')) || [];

function adicionarAoCarrinho(id, nome, preco, imagem) {
    carrinho.push({ id, nome, preco, imagem: imagem || '' });
    safeStorage.set('alpe_cart', JSON.stringify(carrinho));
    // Correção: As páginas de marca estão em /alpe_climaerp-zero/marcas.index/
    // Para chegar no checkout.html que está na raiz, precisamos subir dois níveis.

    const btn = window.event ? (window.event.currentTarget || window.event.target).closest('.btn-add-cart') : null;
    if (btn) {
        btn.innerText = "ADICIONADO!";
        btn.style.setProperty('background-color', '#28a745', 'important');
        btn.style.setProperty('color', '#ffffff', 'important');

        // Reseta o botão após 2 segundos em vez de redirecionar
        setTimeout(() => {
            btn.innerText = "COMPRAR AGORA";
            btn.style.setProperty('background-color', 'var(--cor-principal)', 'important');
        }, 2000);
    }
}

// Atualiza o badge do carrinho no header das páginas de marcas
document.addEventListener('DOMContentLoaded', () => {
    const badge = document.querySelector('.cart-badge');
    if(badge) badge.textContent = carrinho.length;

    // Adiciona o evento de clique para os botões "COMPRAR AGORA" 
    // que não possuem o atributo onclick manual.
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        if (!btn.getAttribute('onclick')) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const card = this.closest('.produto-card');
                if (card) {
                    const id = 'prod-' + Date.now();
                    const nome = card.querySelector('h4')?.innerText || 'Produto';
                    const precoTexto = card.querySelector('.preco')?.innerText || '0';
                    const imagem = card.querySelector('img')?.src || '';
                    const preco = parseFloat(precoTexto.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
                    adicionarAoCarrinho(id, nome, preco, imagem);
                }
            });
        }
    });
});