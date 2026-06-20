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

// Função segura para acessar o Storage (evita erro de Tracking Prevention)
window.safeStorage = window.safeStorage || {
  get: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('Acesso ao localStorage bloqueado pelo navegador.', e);
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('Erro ao salvar no localStorage.', e);
    }
  }
};

// Configurações de Ambiente
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3002' 
  : 'https://sua-api-no-render.com';

// Supabase
const SUPABASE_URL = 'https://imkkxhsxlqwtbdfljwsq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlta2t4aHN4bHF3dGJkZmxqd3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNTYxNjEsImV4cCI6MjA5NTkzMjE2MX0.7WHQvxf_uW90Gs2wzlmuduukoENII5syowTTFiTvtTs';

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

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
    document.querySelectorAll("section.page").forEach(sec => {
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
      
      // Se o botão tem handlers manuais complexos, deixa eles agirem
      if (btnAdd.getAttribute('onclick') && (btnAdd.getAttribute('onclick').includes('abrirCheckout') || btnAdd.getAttribute('onclick').includes('adicionarAoCarrinho'))) {
        return;
      }
      
      // Captura os dados direto do cartão do produto (DOM) para garantir consistência
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

        const isMarcaPage = window.location.pathname.toLowerCase().includes('/marcas.index/');
        const checkoutUrl = (isMarcaPage ? '../' : '') + 'checkout.html';
        window.location.href = checkoutUrl;
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
  document.getElementById("btn-finalizar")?.addEventListener("click", () => { window.location.href = 'checkout.html'; });
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
        cliente: nomeCliente,
        itens: itensPedido,
        total: totalPedido,
        status: 'Pendente',
        instalacao: 'Aguardando',
        data: hoje
      };

      // Salva no Supabase
      if (supabaseClient) {
        supabaseClient.from('pedidos').insert([pedidoNovo]).then(({ error }) => {
          if (error) console.warn('Erro ao salvar pedido no Supabase:', error);
        });
      }

      // Salva também no localStorage como backup
      const pedidosSalvos = JSON.parse(safeStorage.get('alpe_pedidos')) || [];
      pedidosSalvos.unshift({ ...pedidoNovo, id: Math.floor(Math.random() * 10000) + 1000 });
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
  
  const lastPage = sessionStorage.getItem('last_page');
  if (lastPage) {
    window.mostrarPagina(lastPage);
  }

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

// Função para carregar produtos do Supabase e renderizar os cards
async function carregarPrecosDinamicos() {
  if (!supabaseClient) return;
  try {
    const { data: produtos, error } = await supabaseClient
      .from('produtos')
      .select('sku, preco, nome, imagem_url')
      .eq('ativo', true);

    if (error || !produtos) return;

    produtos.forEach(p => {
      const card = document.querySelector(`.produto-card[data-sku="${p.sku}"]`);
      if (!card) return;
      const precoEl = card.querySelector('.preco');
      if (precoEl) precoEl.textContent = p.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const imgEl = card.querySelector('img');
      if (imgEl && p.imagem_url) imgEl.src = p.imagem_url;
      const nomeEl = card.querySelector('h4');
      if (nomeEl && p.nome) nomeEl.textContent = p.nome;
    });
  } catch (e) {
    console.warn('Supabase indisponível, usando preços fixos.', e);
  }
}

// Chama a função de carregamento de preços ao carregar a página
document.addEventListener('DOMContentLoaded', carregarPrecosDinamicos);