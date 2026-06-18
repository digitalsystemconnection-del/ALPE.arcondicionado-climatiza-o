window.safeStorage = window.safeStorage || {
  get: (key) => { try { return localStorage.getItem(key); } catch (e) { return null; } },
  set: (key, value) => { try { localStorage.setItem(key, value); } catch (e) { } }
};

let carrinho = JSON.parse(safeStorage.get('alpe_cart')) || [];

function brl(v) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

function atualizarBadge() {
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = carrinho.length;
  });
}

function navegarParaSistema(el) {
  const link = el.getAttribute('data-link');
  if(link) window.location.href = link;
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(id);
  if(target) target.classList.add('active');
  window.scrollTo(0,0);
}

function adicionarAoCarrinho(id, nome, preco, imagem) {
  carrinho.push({ id, nome, preco, imagem: imagem || '' });
  safeStorage.set('alpe_cart', JSON.stringify(carrinho));
  atualizarBadge();

  const btn = window.event ? (window.event.currentTarget || window.event.target).closest('.btn-add-cart') : null;
  if (btn) {
    const textoOriginal = btn.innerText;
    btn.innerText = "ADICIONADO!";
    btn.style.setProperty('background-color', '#28a745', 'important');
    btn.style.setProperty('color', '#ffffff', 'important');
    
    setTimeout(() => { 
      btn.innerText = textoOriginal;
      btn.style.removeProperty('background-color');
      btn.style.removeProperty('color');
    }, 1500);
  }
}

function removerDoCarrinho(index) {
  carrinho.splice(index, 1);
  safeStorage.set('alpe_cart', JSON.stringify(carrinho));
  atualizarBadge();
  renderCarrinho();
}

function renderCarrinho() {
  const lista = document.getElementById('carrinho-lista');
  if(!lista) return;
  
  if(carrinho.length === 0) {
    lista.innerHTML = '<div style="padding:40px 20px; text-align:center;"><i class="fas fa-shopping-basket" style="font-size:48px; color:#eee; margin-bottom:15px;"></i><p style="color:#999;">Seu carrinho está vazio.</p></div>';
    return;
  }
  
  let total = 0;
  let html = '';
  carrinho.forEach((item, i) => {
    const valor = typeof item.preco === 'string' ? parseFloat(item.preco.replace(/[^0-9,]/g, '').replace(',', '.')) : item.preco;
    total += valor;
    html += `<div class="carrinho-item" style="display:flex; justify-content:space-between; align-items:center; padding:15px 0; border-bottom:1px solid #eee;">
      <div style="flex:1;">
          <h4 style="margin:0; font-size:14px;">${item.nome || item.name}</h4>
          <div style="color:var(--cor-principal); font-weight:bold; margin-top:5px;">${brl(valor)}</div>
      </div>
      <button onclick="removerDoCarrinho(${i})" style="color:#dc3545; background:none; border:0; cursor:pointer; font-size: 18px;">
          <i class="fas fa-trash-alt"></i>
      </button>
    </div>`;
  });
  
  html += `<div style="padding: 20px 0 0; text-align: right; font-size: 22px; font-weight: 800; color: var(--cor-secundaria);">TOTAL: ${brl(total)}</div>`;
  lista.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
  atualizarBadge();

  document.querySelectorAll('.produto-card .btn-add-cart').forEach(btn => {
    if(!btn.getAttribute('onclick')) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const card = this.closest('.produto-card');
        const imgEl = card.querySelector('img');
        const nomeEl = card.querySelector('h4');
        const precoEl = card.querySelector('.preco');
        
        const id = 'prod-' + Math.random().toString(36).substr(2, 9);
        const nome = nomeEl ? nomeEl.innerText : 'Produto';
        const imagem = imgEl ? imgEl.getAttribute('src') : '';
        let preco = 0;
        
        if(precoEl) {
          const precoTexto = precoEl.innerText.replace(/[^0-9,]/g, '').replace(',', '.');
          preco = parseFloat(precoTexto) || 0;
        }
        
        adicionarAoCarrinho(id, nome, preco, imagem);
      });
    }
  });

  document.getElementById('nav-carrinho')?.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('page-carrinho');
    renderCarrinho();
  });

  document.getElementById('btn-continuar-comprando')?.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('page-loja');
  });

  document.getElementById('btn-finalizar')?.addEventListener('click', () => { 
    if (carrinho.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }
    const isSubfolder = window.location.pathname.includes('/marcas.index/') || window.location.pathname.includes('/sistemas/');
    window.location.href = (isSubfolder ? '../' : '') + 'checkout.html';
  });
});
