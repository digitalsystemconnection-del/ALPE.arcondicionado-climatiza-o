// Configuração Supabase
const SUPABASE_URL = 'https://imkkxhsxlqwtbdfljwsq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlta2t4aHN4bHF3dGJkZmxqd3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNTYxNjEsImV4cCI6MjA5NTkzMjE2MX0.7WHQvxf_uW90Gs2wzlmuduukoENII5syowTTFiTvtTs';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabaseAPI = {
    supabase,
    async obterCarrinho() {
        const sessionId = localStorage.getItem('session_id') || 'session_' + Date.now();
        const { data, error } = await supabase.from('carrinhos').select('*').eq('session_id', sessionId);
        if (error) return [];
        return data;
    },
    async adicionarAoCarrinho(produtoId, quantidade = 1) {
        const sessionId = localStorage.getItem('session_id') || 'session_' + Date.now();
        const { data, error } = await supabase.from('carrinhos').insert({
            session_id: sessionId,
            produto_id: produtoId,
            quantidade: quantidade
        }).select();
        if (error) return null;
        return data;
    },
    async criarPedido(dados) {
        const carrinho = await this.obterCarrinho();
        if (carrinho.length === 0) { alert('Carrinho vazio!'); return null; }
        const sessionId = localStorage.getItem('session_id') || 'session_' + Date.now();
        const total = carrinho.reduce((s, i) => s + (i.produtos?.preco || 0) * i.quantidade, 0);
        const numPedido = 'ALPE-' + Date.now().toString().slice(-8) + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
        const { data: pedido, error } = await supabase.from('pedidos').insert({
            numero_pedido: numPedido,
            cliente_nome: dados.nome,
            cliente_telefone: dados.telefone,
            cliente_email: dados.email || '',
            cliente_cpf: dados.cpf || '',
            endereco_entrega: dados.endereco || {},
            total_produtos: total,
            total_pedido: total,
            forma_pagamento: dados.pagamento || 'pendente',
            session_id: sessionId
        }).select().single();
        if (error) return null;
        await supabase.from('carrinhos').delete().eq('session_id', sessionId);
        return pedido;
    },
    async carregarProdutos() {
        const { data, error } = await supabase.from('produtos').select('*').eq('ativo', true).eq('destaque', true).limit(12);
        if (error) return [];
        return data;
    },
    async carregarMarcas() {
        const { data, error } = await supabase.from('marcas').select('*').eq('ativo', true).order('nome');
        if (error) return [];
        return data;
    }
};

console.log('✅ SupabaseAPI carregado!');
