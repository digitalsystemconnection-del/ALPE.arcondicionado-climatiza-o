require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(bodyParser.json());

// Caminho para o arquivo temporário de conciliação
const PAGAMENTOS_FILE = path.join(__dirname, 'pagamentos_confirmados.json');

// ============================================================
// CONFIGURAÇÃO DE FORNECEDORES (Vindo do seu .env)
// ============================================================
const FORNECEDORES_CONFIG = {
  adias:   { apiKey: process.env.ADIAS_API_KEY },
  leveros: { apiKey: process.env.LEVEROS_API_KEY },
  dufrio:  { url:    process.env.DUFRIO_CSV_URL },
  climario:{ apiKey: process.env.CLIMARIO_API_KEY }
};

// ============================================================
// CONFIGURAÇÃO BTG PACTUAL
// ============================================================
const BTG_CONFIG = {
  clientId:     process.env.BTG_CLIENT_ID,
  clientSecret: process.env.BTG_CLIENT_SECRET,
  baseUrl:      process.env.BTG_ENV === 'production' 
                ? 'https://api.btgpactual.com/v1' 
                : 'https://api-sandbox.btgpactual.com/v1',
};

// Função auxiliar para simular obtenção de token OAuth2
async function obterTokenBTG() {
  if (!BTG_CONFIG.clientId || BTG_CONFIG.clientId === 'SEU_CLIENT_ID') {
    console.log('[BTG] Usando Token Simulado (Chaves não configuradas no .env)');
    return "token_simulado";
  }

  try {
    // Para chamadas reais, o BTG exige certificados .crt e .key
    /*
    const agent = new https.Agent({
      cert: fs.readFileSync('./certs/seu_certificado.crt'),
      key: fs.readFileSync('./certs/sua_chave.key'),
    });

    const auth = Buffer.from(`${BTG_CONFIG.clientId}:${BTG_CONFIG.clientSecret}`).toString('base64');
    const response = await axios.post(`${BTG_CONFIG.baseUrl}/oauth2/token`, 
      'grant_type=client_credentials', 
      { 
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        httpsAgent: agent 
      }
    );
    return response.data.access_token;
    */
    return "token_em_desenvolvimento";
  } catch (error) {
    console.error('Erro ao obter token BTG:', error.message);
    throw error;
  }
}

// ============================================================
// ROTAS DE PAGAMENTO (BTG PACTUAL)
// ============================================================

/**
 * POST /api/pagamentos/pix
 * Gera uma cobrança PIX via BTG
 */
app.post('/api/pagamentos/pix', async (req, res) => {
  let { valor, pedidoId, clienteNome } = req.body;
  valor = parseFloat(Number(valor).toFixed(2));
  
  try {
    const token = await obterTokenBTG();
    
    // Simulando resposta de criação de cobrança imediata (PIX)
    const pixResponse = {
      txid: crypto.randomBytes(16).toString('hex'),
      pixCopiaECola: "00020101021226840014br.gov.bcb.pix0122teste-btg-alpe-pix-qr-code-estatico-gerado-pela-api-btg-pactual",
      status: "ATIVA",
      valor: valor
    };

    console.log(`[BTG] PIX Gerado para Pedido #${pedidoId} - Valor: R$ ${valor}`);
    console.log(`[TESTE] Para simular o pagamento deste pedido, use o ID: ${pixResponse.txid}`);
    res.json({ sucesso: true, pix: pixResponse });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao gerar PIX: ' + error.message });
  }
});

/**
 * POST /api/pagamentos/boleto
 * Gera um boleto bancário via BTG
 */
app.post('/api/pagamentos/boleto', async (req, res) => {
  let { valor, pedidoId, clienteNome } = req.body;
  valor = parseFloat(Number(valor).toFixed(2));
  
  try {
    const token = await obterTokenBTG();

    // Simulando resposta de emissão de boleto
    const boletoResponse = {
      nossoNumero: "12345678",
      linhaDigitavel: "20890.00000 00000.000000 00000.000000 1 000000000000",
      pdfUrl: "https://-06-15"
    };

    console.log(`[BTG] Boleto Gerado para Pedido #${pedidoId}`);
    res.json({ sucesso: true, boleto: boletoResponse });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao gerar boleto: ' + error.message });
  }
});

/**
 * POST /api/pagamentos/webhook
 * Recebe notificações de status do BTG (Conciliação Automática)
 */
app.post('/api/pagamentos/webhook', (req, res) => {
  const payload = req.body;
  
  console.log('\n--- NOVA NOTIFICAÇÃO DE PAGAMENTO (BTG) ---');
  console.log('ID Transação:', payload.txid || payload.nossoNumero);
  console.log('Status:', payload.status);
  console.log('Valor:', payload.valor);
  console.log('-------------------------------------------\n');
  
  if (payload.status === 'CONCLUIDO' || payload.status === 'PAGO') {
    // Salva o pagamento confirmado em um arquivo para o Dashboard ler
    let confirmados = [];
    if (fs.existsSync(PAGAMENTOS_FILE)) {
      try {
        const data = fs.readFileSync(PAGAMENTOS_FILE, 'utf-8');
        confirmados = data ? JSON.parse(data) : [];
      } catch (e) { confirmados = []; }
    }
    
    confirmados.push({
      id: payload.txid || payload.nossoNumero,
      data: new Date().toISOString()
    });

    fs.writeFileSync(PAGAMENTOS_FILE, JSON.stringify(confirmados, null, 2));
    console.log(`[BTG Webhook] Confirmação registrada com sucesso para ID: ${payload.txid || payload.nossoNumero}`);
  }
  
  res.status(200).send('OK');
});

/**
 * GET /api/pagamentos/atualizacoes
 * Endpoint para o Dashboard verificar se houve pagamentos novos
 */
app.get('/api/pagamentos/atualizacoes', (req, res) => {
  if (fs.existsSync(PAGAMENTOS_FILE)) {
    const confirmados = JSON.parse(fs.readFileSync(PAGAMENTOS_FILE, 'utf-8'));
    
    // Só limpa o arquivo se ele realmente contiver dados, evitando escritas desnecessárias
    if (confirmados.length > 0) {
      fs.writeFileSync(PAGAMENTOS_FILE, JSON.stringify([]));
    }
    return res.json(confirmados);
  }
  res.json([]);
});

// ============================================================
// ROTAS DE FORNECEDORES
// ============================================================

app.get('/api/fornecedores/status', (req, res) => {
  res.json({ status: "Operacional", integracoes: ["Adias", "Leveros", "Dufrio", "ClimaRio"] });
});

app.post('/api/importar/adias', (req, res) => {
  if (!FORNECEDORES_CONFIG.adias.apiKey) return res.status(400).json({ erro: "Chave Adias não configurada no .env" });
  res.json({ sucesso: true, msg: "Conectando à API da Adias..." });
});

app.post('/api/importar/leveros', (req, res) => {
  if (!FORNECEDORES_CONFIG.leveros.apiKey) return res.status(400).json({ erro: "Chave Leveros não configurada no .env" });
  res.json({ sucesso: true, msg: "Conectando à API da Leveros..." });
});

app.post('/api/importar/dufrio', (req, res) => {
  if (!FORNECEDORES_CONFIG.dufrio.url) return res.status(400).json({ erro: "URL CSV Dufrio não configurada no .env" });
  res.json({ sucesso: true, msg: "Baixando planilha da Dufrio..." });
});

app.post('/api/importar/climario', (req, res) => {
  if (!FORNECEDORES_CONFIG.climario.apiKey) return res.status(400).json({ erro: "Chave ClimaRio não configurada no .env" });
  res.json({ sucesso: true, msg: "Conectando à API da ClimaRio..." });
});

app.get('/api/comparar', (req, res) => {
  const { sku } = req.query;
  res.json({ sku, melhorPreco: 2400, fornecedor: "Adias" });
});

app.get('/api/precos', (req, res) => {
  res.json([]);
});

// ============================================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================================

const server = app.listen(PORT, () => {
  console.log(`\n✅ ClimaERP API rodando em http://localhost:${PORT}`);
  console.log(`Endpoints BTG Pactual configurados em modo ${process.env.BTG_ENV || 'sandbox'}.`);
  console.log(`Acesse o Dashboard para testar a geração de cobranças.`);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`\n❌ ERRO: A porta ${PORT} já está sendo usada por outro processo.`);
    console.error(`Para liberar a porta, execute no PowerShell:`);
    console.error(`Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force`);
    process.exit(1);
  }
});