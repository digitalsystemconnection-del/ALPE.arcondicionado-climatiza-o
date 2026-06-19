// --- State ---

// Função global para navegação dos cards de sistemas
window.navegarParaSistema = (el) => {
  const link = el.getAttribute('data-link');
  if(!link) return;

  // Detecta se estamos em uma subpasta (como marcas.index/) para ajustar o caminho relativo
  const isSubfolder = window.location.pathname.includes('/marcas.index/') || 
                      window.location.pathname.includes('/sobre-nos/') ||
                      window.location.pathname.includes('/sistemas/');

  const finalLink = (isSubfolder && !link.startsWith('http') && !link.startsWith('../')) 
    ? '../' + link 
    : link;

  window.location.href = finalLink;
};

// Armazenamento com fallback em memória quando localStorage estiver bloqueado
window.safeStorage = window.safeStorage || (() => {
  let mem = {};
  const tryLocal = (fn) => { try { return fn(); } catch(e) { return null; } };
  return {
    get: (k) => tryLocal(() => localStorage.getItem(k)) ?? mem[k] ?? null,
    set: (k, v) => { mem[k] = v; tryLocal(() => localStorage.setItem(k, v)); }
  };
})();

// Configurações de Ambiente
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3002' 
  : 'https://sua-api-no-render.com'; // Substitua quando fizer o deploy do backend

// Supabase desativado - configurar quando tiver URL válida
const supabaseClient = null;

document.addEventListener('DOMContentLoaded', () => {
  // --- Configuração Centralizada de Marcas ---
  const LISTA_MARCAS = [
    { nome: "Daikin", url: "daikin.html" },
    { nome: "Electrolux", url: "electrolux.html" },
    { nome: "Elgin", url: "elgin.html" },
    { nome: "Fujitsu", url: "fujitsu.html" },
    { nome: "Gree", url: "gree.html" },
    { nome: "Hisense", url: "hisense.html" },
    { nome: "Hitachi", url: "hitachi.html" },
    { nome: "LG", url: "lg.html" },
    { nome: "Midea", url: "midea.html" },
    { nome: "Philco", url: "philco.html" },
    { nome: "Samsung", url: "samsung.html" },
    { nome: "TCL", url: "tcl.html" }
  ].sort((a, b) => a.nome.localeCompare(b.nome)); // Ordena alfabeticamente

  window.carrinho = JSON.parse(safeStorage.get('alpe_cart')) || [];
  
  window.brl = (v) => {
    if (v === undefined || v === null) return "R$ 0,00";
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  window.atualizarBadgeCarrinho = () => {
    const el = document.getElementById('cart-count');
    if(el) el.textContent = window.carrinho.length;
    safeStorage.set('alpe_cart', JSON.stringify(window.carrinho));
  };

  // Alias para manter compatibilidade com chamadas existentes no HTML
  window.atualizarBadge = window.atualizarBadgeCarrinho;

  window.adicionarAoCarrinho = (id, nome, preco, imagem, event) => {
    window.carrinho.push({ id, nome, preco, imagem });
    window.atualizarBadgeCarrinho();
    
    const isMarcaPage = window.location.pathname.toLowerCase().includes('/marcas.index/');
    const prefix = isMarcaPage ? '../' : '';
    
    // Feedback visual antes de redirecionar
    const btn = event ? (event.currentTarget || event.target).closest('.btn-add-cart') : null;
    if (btn) btn.innerText = "ADICIONADO!";

    setTimeout(() => {
      window.location.href = prefix + 'checkout.html';
    }, 600);
  };

  window.removerDoCarrinho = (index) => {
    window.carrinho.splice(index, 1);
    window.atualizarBadgeCarrinho();
    window.renderCarrinho();
  };

  window.renderCarrinho = () => {
    const lista = document.getElementById('carrinho-lista');
    if(!lista) return;
    
    if(window.carrinho.length === 0) {
      lista.innerHTML = '<div style="padding:40px 20px; text-align:center;"><i class="fas fa-shopping-basket" style="font-size:48px; color:#eee; margin-bottom:15px;"></i><p style="color:#999;">Seu carrinho está vazio.</p></div>';
      return;
    }
    
    let total = 0;
    let html = '';
    
    window.carrinho.forEach((item, i) => {
      const nome = item.nome || item.name || "Produto";
      const precoBruto = item.preco || item.price || 0;
      const valor = typeof precoBruto === 'string' 
        ? parseFloat(precoBruto.replace(/[^0-9,]/g, '').replace(',', '.')) 
        : precoBruto;
      
      total += valor;
      
      html += `
      <div class="carrinho-item">
        <div class="carrinho-item-info">
            <h4>${nome}</h4>
            <div class="preco-item">${window.brl(valor)}</div>
        </div>
        <button class="btn-remover" onclick="removerDoCarrinho(${i})" style="color:#dc3545; background:none; border:0; cursor:pointer; font-size: 18px;">
            <i class="fas fa-trash-alt"></i>
        </button>
      </div>`;
    });
    
    html += `<div class="carrinho-total-row" style="padding: 20px 0 0; text-align: right; font-size: 22px; font-weight: 800; color: var(--cor-secundaria);">TOTAL: ${window.brl(total)}</div>`;
    lista.innerHTML = html;
  };

  window.mostrarPagina = (id) => {
    document.querySelectorAll(".page").forEach(sec => {
      sec.classList.toggle("active", sec.id === id);
    });
    sessionStorage.setItem('last_page', id);
    window.scrollTo(0,0);
  };

  const handleCartClick = (e) => {
    // Evita redirecionamento se estiver em uma página de marca para permitir o modal do cart.js
    if (window.location.pathname.toLowerCase().includes('/marcas.index/')) {
      return;
    }

    const carrinhoPage = document.getElementById("page-carrinho");
    if (!carrinhoPage) {
      const rootPath = window.location.pathname.toLowerCase().includes('/marcas.index/') ? '../venda.html' : 'venda.html';
      window.location.href = rootPath + '#page-carrinho';
      return;
    }
    e.preventDefault();
    window.renderCarrinho();
    window.mostrarPagina("page-carrinho");
  };

  // --- Injeção Dinâmica de Marcas no Menu ---
  window.renderizarMenuMarcas = () => {
    const path = window.location.pathname.toLowerCase();
    const ehPaginaDeMarca = path.includes("/marcas.index/");
    const ehSubpasta = ehPaginaDeMarca || path.includes('/sobre-nos/') || path.includes('/sistemas/') || path.includes('/dashboard/');

    // Define o prefixo correto para os links dentro do dropdown
    const prefixo = ehSubpasta ? (ehPaginaDeMarca ? "" : "../marcas.index/") : "marcas.index/";

    const containers = document.querySelectorAll(".js-dropdown-marcas");
    if (containers.length === 0) return;

    const html = LISTA_MARCAS.map(m => `<a href="${prefixo}${m.url}">${m.nome}</a>`).join("");

    containers.forEach(container => {
      container.innerHTML = html;
    });
  };

  document.getElementById("nav-carrinho")?.addEventListener("click", handleCartClick);
  document.querySelector(".cart-link")?.addEventListener("click", handleCartClick);
  
  document.getElementById("nav-loja")?.addEventListener("click", (e) => { e.preventDefault(); window.mostrarPagina("page-loja"); });
  document.getElementById("btn-continuar-comprando")?.addEventListener("click", (e) => { e.preventDefault(); window.mostrarPagina("page-loja"); });

  window.atualizarBadge();

  // Storefront and Cart actions
  document.addEventListener("click", e => {
    const btnAdd = e.target.closest(".btn-add-cart");
    if (btnAdd) {
      e.preventDefault();
      
      const card = btnAdd.closest('.produto-card');
      if (card) {
        const produto = {
          id: Date.now(),
          name: card.querySelector('h4').innerText,
          price: card.querySelector('.preco').innerText,
          image: card.querySelector('img').src
        };
        
        window.carrinho.push(produto);
        window.atualizarBadgeCarrinho();

        btnAdd.innerText = 'ADICIONADO!';

        // Se existe página de carrinho inline, mostra ela; senão redireciona
        const carrinhoInline = document.getElementById('page-carrinho');
        if (carrinhoInline) {
          setTimeout(() => {
            window.renderCarrinho();
            window.mostrarPagina('page-carrinho');
          }, 500);
        } else {
          const isMarcaPage = window.location.pathname.toLowerCase().includes('/marcas.index/');
          setTimeout(() => { window.location.href = (isMarcaPage ? '../' : '') + 'checkout.html'; }, 500);
        }
      }
    }

    const btnRemove = e.target.closest(".btn-remove");
    if (btnRemove) {
      const index = parseInt(btnRemove.dataset.index);
      window.carrinho.splice(index, 1);
      window.atualizarBadgeCarrinho();
      window.renderCarrinho();
    }
  });

  // Checkout process
  document.getElementById("btn-finalizar")?.addEventListener("click", () => window.mostrarPagina("page-checkout"));
  document.getElementById("form-checkout")?.addEventListener("submit", e => {
    e.preventDefault();
    
    // Integração: Criar objeto do pedido
    const nomeCliente = document.getElementById("nome").value;
    const hoje = new Date().toISOString().split('T')[0];
    const itensPedido = window.carrinho.map(i => i.name).join(", ");
    
    // Calcula total de forma robusta lidando com strings ou números
    const totalPedido = window.carrinho.reduce((acc, i) => {
        const priceRaw = i.price || i.preco || 0;
        const valor = typeof priceRaw === 'string' 
            ? parseFloat(priceRaw.replace(/[^0-9,]/g, '').replace(',', '.')) 
            : priceRaw;
        return acc + valor;
    }, 0);
    
    // Para simplificar, cria um pedido para cada item ou agrupa (aqui agruparemos o primeiro item como exemplo principal)
    if (window.carrinho.length > 0) {
      const pedidoNovo = {
        id: Math.floor(Math.random() * 10000) + 1000, // Gera ID aleatório
        cliente: nomeCliente,
        itens: itensPedido,
        total: totalPedido,
        status: "Pendente",
        instalacao: "Aguardando",
        data: hoje
      };
      
      // Salva no LocalStorage para o Dashboard ler
      const pedidosSalvos = JSON.parse(safeStorage.get('alpe_pedidos')) || [];
      pedidosSalvos.unshift(pedidoNovo);
      safeStorage.set('alpe_pedidos', JSON.stringify(pedidosSalvos));
    }

    showToast("Pedido enviado para o Admin!");
    window.carrinho = []; // Esvazia o carrinho
    window.atualizarBadgeCarrinho(); // Atualiza o badge do carrinho
    e.target.reset();
    mostrarPagina("page-loja");
  });

  // --- Initial Load ---
  window.atualizarBadge();
  window.renderizarMenuMarcas();

  // === Integração Scripts da Loja ===
  
  // 1. Calculadora BTU
  const btuForm = document.getElementById('btuForm');
  if (btuForm) {
    btuForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const area = Number(document.getElementById('area').value) || 0;
      const pessoas = Number(document.getElementById('pessoas').value) || 1;
      const base = area * 600;
      const pessoasExtra = Math.max(0, pessoas - 1) * 600;
      const resultado = Math.ceil(base + pessoasExtra);
      const recomendado = resultado < 7000 ? 7000 : resultado;
      document.getElementById('btuResult').textContent = 'BTU recomendado: ' + recomendado + ' BTU';
    });
  }

  // 2. Menu Mobile
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.getElementById('main-nav');
  if (menuToggle && nav) {
      menuToggle.addEventListener('click', function() {
          nav.classList.toggle('nav-open');
          const icon = menuToggle.querySelector('i');
          // Troca o ícone e controla o scroll da página
          if (nav.classList.contains('nav-open')) {
              icon.classList.remove('fa-bars');
              icon.classList.add('fa-times');
              document.body.style.overflow = 'hidden'; // Impede o scroll do fundo
          } else {
              icon.classList.remove('fa-times');
              icon.classList.add('fa-bars');
              document.body.style.overflow = ''; // Libera o scroll
          }
      });

      // Dropdown logic for mobile
      const dropdownLinks = document.querySelectorAll('#main-nav .dropdown > a');
      dropdownLinks.forEach(link => {
          link.addEventListener('click', function(e) {
              // Only run this on mobile view (when the toggle is visible)
              if (window.getComputedStyle(menuToggle).display !== 'none') {
                  e.preventDefault();
                  const content = this.nextElementSibling;
                  if (content) {
                      // Toggle display for the clicked dropdown
                      const isVisible = content.style.display === 'block';
                      content.style.display = isVisible ? 'none' : 'block';
                  }
              }
          });
      });
  }

  // 3. Carrossel Simples
  const track = document.getElementById('carouselTrack');
  if(track) {
    const slides = Array.from(track.children);
    const prev = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');
    let index = 0;

    function updateCarousel() {
      index = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
    }

    if(next) next.onclick = () => { index++; updateCarousel(); };
    if(prev) prev.onclick = () => { index--; updateCarousel(); };
    
    // Auto play
    setInterval(() => {
      index++;
      updateCarousel();
    }, 5000);
  }
});

// Função para carregar preços dinamicamente do Supabase
async function carregarPrecosDinamicos() {
  // Tenta buscar preços do Supabase
  try {
    // Busca preços do backend (que consolida o menor preço do Supabase)
    const response = await fetch(`${API_BASE_URL}/api/produtos/precos-vitrine`);
    if (!response.ok) {
      throw new Error(`Erro HTTP! status: ${response.status}`);
    }
    const precosBackend = await response.json(); // Isso será um mapa de {sku: menorPreco}

    aplicarPrecosNaVitrine(precosBackend);
  } catch (error) {
    console.error('Erro ao buscar preços do backend:', error.message);
    // Fallback para localStorage se o Supabase falhar
    const precosSalvos = JSON.parse(safeStorage.get('alpe_precos_vitrine'));
    if (precosSalvos) {
      aplicarPrecosNaVitrine(precosSalvos);
    }
  }
}

function aplicarPrecosNaVitrine(precos) {
  document.querySelectorAll('.produto-card').forEach(card => {
    const sku = card.dataset.sku; // Agora usa data-sku
    if (precos[sku]) {
      const precoFormatado = precos[sku].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const precoElemento = card.querySelector('.preco');
      if (precoElemento) {
        precoElemento.textContent = precoFormatado;
      }
    }
  });
}

// Chama a função de carregamento de preços ao carregar a página
document.addEventListener('DOMContentLoaded', carregarPrecosDinamicos);

// =============================================
// CARRINHO - lógica direta e sem dependências
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  // Garante que window.carrinho está sincronizado com localStorage
  if (!window.carrinho) {
    try { window.carrinho = JSON.parse(localStorage.getItem('alpe_cart')) || []; }
    catch(e) { window.carrinho = []; }
  }

  // Delegação de clique nos botões COMPRAR AGORA
  document.body.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn-add-cart');
    if (!btn) return;
    e.preventDefault();
    e.stopImmediatePropagation();

    const card = btn.closest('.produto-card');
    if (!card) return;

    const produto = {
      id: Date.now(),
      name: (card.querySelector('h4') || {}).innerText || 'Produto',
      price: (card.querySelector('.preco') || {}).innerText || '0',
      image: (card.querySelector('img') || {}).src || ''
    };

    const cart = JSON.parse(window.safeStorage.get('alpe_cart') || '[]');
    cart.push(produto);
    window.safeStorage.set('alpe_cart', JSON.stringify(cart));

    btn.textContent = 'ADICIONADO! ✓';
    btn.style.background = '#28a745';

    const isMarca = window.location.pathname.toLowerCase().includes('/marcas.index/');
    setTimeout(() => {
      window.location.href = (isMarca ? '../' : '') + 'checkout.html';
    }, 600);
  }, true); // capture=true garante prioridade máxima
});