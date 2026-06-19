// ============================================
// CONFIGURAÇÃO DO SUPABASE - ALPE
// ============================================
const SUPABASE_URL = 'https://imkkxhsxlqwtbdfljwsq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlta2t4aHN4bHF3dGJkZmxqd3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNTYxNjEsImV4cCI6MjA5NTkzMjE2MX0.7WHQvxf_uW90Gs2wzlmuduukoENII5syowTTFiTvtTs';

// Inicializar cliente
const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ============================================
// FUNÇÕES DE PRODUTOS
// ============================================
async function carregarProdutosEmDestaque(limite = 12) {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('ativo', true)
    .eq('destaque', true)
    .limit(limite);
    
  if (error) {
    console.error('Erro ao carregar produtos:', error);
    return [];
  }
  return data;
}

async function carregarMarcas() {
  const { data, error } = await supabase
    .from('marcas')
    .select('*')
    .eq('ativo', true)
    .order('nome');
    
  if (error) {
    console.error('Erro ao carregar marcas:', error);
    return [];
  }
  return data;
}

async function carregarConfiguracoes() {
  const { data, error } = await supabase
    .from('configuracoes')
    .select('*');
    
  if (error) {
    console.error('Erro ao carregar configurações:', error);
    return {};
  }
  
  const config = {};
  data.forEach(item => {
    config[item.chave] = item.valor;
  });
  return config;
}

async function obterCarrinho() {
  const sessionId = localStorage.getItem('session_id') || 'session_' + Date.now();
  
  const { data, error } = await supabase
    .from('carrinhos')
    .select('*')
    .eq('session_id', sessionId);
    
  if (error) {
    console.error('Erro ao obter carrinho:', error);
    return [];
  }
  return data;
}

async function adicionarAoCarrinho(produtoId, quantidade = 1) {
  const sessionId = localStorage.getItem('session_id') || 'session_' + Date.now();
  
  const { data, error } = await supabase
    .from('carrinhos')
    .insert({
      session_id: sessionId,
      produto_id: produtoId,
      quantidade: quantidade
    })
    .select();
    
  if (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    return null;
  }
  return data;
}

// ============================================
// EXPORTAR FUNÇÕES
// ============================================
window.supabaseAPI = {
  carregarProdutosEmDestaque,
  carregarMarcas,
  carregarConfiguracoes,
  obterCarrinho,
  adicionarAoCarrinho,
  supabase
};
