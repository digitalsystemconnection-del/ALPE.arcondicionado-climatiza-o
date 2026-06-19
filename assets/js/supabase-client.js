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

async function criarPedido(dadosCliente) {
  const carrinho = await obterCarrinho();
  
  if (carrinho.length === 0) {
    alert('Carrinho vazio!');
    return null;
  }
  
  let totalProdutos = 0;
  const itens = carrinho.map(item => {
    const subtotal = item.produtos?.preco * item.quantidade || 0;
    totalProdutos += subtotal;
    return {
      sku: item.produtos?.sku || 'N/A',
      nome_produto: item.produtos?.nome || 'Produto',
      quantidade: item.quantidade,
      preco_unitario: item.produtos?.preco || 0,
      subtotal: subtotal
    };
  });
  
  const numeroPedido = 'ALPE-' + Date.now().toString().slice(-8) + '-' + 
                      Math.random().toString(36).substr(2, 4).toUpperCase();
  
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .insert({
      numero_pedido: numeroPedido,
      cliente_nome: dadosCliente.nome,
      cliente_email: dadosCliente.email || '',
      cliente_telefone: dadosCliente.telefone,
      cliente_cpf: dadosCliente.cpf || '',
      endereco_entrega: dadosCliente.endereco || {},
      total_produtos: totalProdutos,
      total_frete: dadosCliente.frete || 0,
      total_desconto: dadosCliente.desconto || 0,
      total_pedido: totalProdutos + (dadosCliente.frete || 0) - (dadosCliente.desconto || 0),
      forma_pagamento: dadosCliente.pagamento || 'pendente',
      parcelas: dadosCliente.parcelas || 1,
      session_id: localStorage.getItem('session_id') || 'session_' + Date.now()
    })
    .select()
    .single();
    
  if (pedidoError) {
    console.error('Erro ao criar pedido:', pedidoError);
    return null;
  }
  
  const itensParaInserir = itens.map(item => ({
    pedido_id: pedido.id,
    ...item
  }));
  
  const { error: itensError } = await supabase
    .from('itens_pedido')
    .insert(itensParaInserir);
    
  if (itensError) {
    console.error('Erro ao inserir itens do pedido:', itensError);
  }
  
  await supabase.from('carrinhos').delete().eq('session_id', localStorage.getItem('session_id') || 'session_' + Date.now());
  
  return pedido;
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
  criarPedido,
  supabase
};
