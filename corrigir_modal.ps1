$c = Get-Content 'index.html' -Raw -Encoding UTF8

# Remove modal antigo
$c = $c -replace '(?s)<!-- MODAL CHECKOUT -->.*?</script>\s*\n', ''

$novo = '<!-- MODAL CHECKOUT -->
<div id="modal-checkout" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.75);align-items:center;justify-content:center;padding:16px;overflow-y:auto;">
  <div style="background:#fff;border-radius:20px;max-width:460px;width:100%;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,.5);margin:auto;">
    <div style="background:linear-gradient(135deg,#1a1a2e,#0f3460);padding:22px 24px;color:#fff;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:11px;opacity:.7;letter-spacing:1px;text-transform:uppercase;">ALPE Ar Condicionado</div>
        <div id="checkout-nome" style="font-size:18px;font-weight:700;margin-top:4px;">Produto</div>
      </div>
      <button onclick="fecharCheckout()" style="background:rgba(255,255,255,.15);border:0;color:#fff;width:34px;height:34px;border-radius:50%;font-size:22px;cursor:pointer;line-height:1;">&times;</button>
    </div>
    <div style="padding:16px 24px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:12px;color:#666;">Valor total</div>
        <div id="checkout-preco" style="font-size:28px;font-weight:800;color:#0f3460;">R$ 0,00</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:12px;color:#25d366;font-weight:700;">5% OFF no PIX</div>
        <div id="checkout-preco-pix" style="font-size:16px;font-weight:700;color:#25d366;">R$ 0,00</div>
      </div>
    </div>
    <div id="painel-opcoes" style="padding:18px 24px;">
      <div style="font-size:12px;font-weight:700;color:#333;margin-bottom:12px;text-transform:uppercase;letter-spacing:.5px;">Como deseja pagar?</div>
      <button onclick="pagarBTG(''pix'')" style="width:100%;padding:14px;margin-bottom:8px;border:2px solid #25d366;border-radius:12px;background:#f0fff4;cursor:pointer;display:flex;align-items:center;gap:12px;text-align:left;">
        <div style="flex:1;"><div style="font-weight:700;color:#166534;">PIX - Pagamento Instantaneo</div><div style="font-size:12px;color:#16a34a;">5% de desconto - Aprovado na hora</div></div>
        <div style="font-weight:800;color:#166534;" id="btn-preco-pix">R$ 0,00</div>
      </button>
      <button onclick="abrirParcelas()" style="width:100%;padding:14px;margin-bottom:8px;border:2px solid #0f3460;border-radius:12px;background:#f0f4ff;cursor:pointer;display:flex;align-items:center;gap:12px;text-align:left;">
        <div style="flex:1;"><div style="font-weight:700;color:#0f3460;">Cartao de Credito</div><div style="font-size:12px;color:#3b5998;">Ate 8x sem juros - Visa, Master, Elo, Hipercard</div></div>
        <div style="font-weight:800;color:#0f3460;font-size:18px;">&#8250;</div>
      </button>
      <button onclick="pagarBTG(''boleto'')" style="width:100%;padding:14px;margin-bottom:8px;border:2px solid #f59e0b;border-radius:12px;background:#fffbeb;cursor:pointer;display:flex;align-items:center;gap:12px;text-align:left;">
        <div style="flex:1;"><div style="font-weight:700;color:#92400e;">Boleto Bancario</div><div style="font-size:12px;color:#b45309;">Vencimento em 3 dias uteis</div></div>
        <div style="font-weight:800;color:#92400e;" id="btn-preco-boleto">R$ 0,00</div>
      </button>
      <button onclick="negociarWhatsApp()" style="width:100%;padding:14px;border:2px solid #25d366;border-radius:12px;background:#fff;cursor:pointer;display:flex;align-items:center;gap:12px;text-align:left;">
        <div style="flex:1;"><div style="font-weight:700;color:#166534;">&#128172; Negociar pelo WhatsApp</div><div style="font-size:12px;color:#16a34a;">Fale com um especialista agora</div></div>
      </button>
    </div>
    <div id="painel-parcelas" style="display:none;padding:18px 24px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
        <button onclick="voltarOpcoes()" style="background:#f1f5f9;border:0;border-radius:8px;padding:6px 12px;cursor:pointer;font-weight:700;color:#0f3460;">&#8592; Voltar</button>
        <div style="font-size:13px;font-weight:700;color:#333;text-transform:uppercase;letter-spacing:.5px;">Escolha as parcelas</div>
      </div>
      <div id="lista-parcelas" style="display:flex;flex-direction:column;gap:8px;"></div>
    </div>
    <div style="padding:8px 24px 16px;text-align:center;color:#aaa;font-size:11px;">&#128274; Pagamento seguro via BTG Pay</div>
  </div>
</div>

<script>
var _p = {};
function abrirCheckout(id, nome, preco) {
  _p = { id: id, nome: nome, preco: preco };
  var cfg = window.BTG_CONFIG;
  var px = preco * (1 - cfg.descPix / 100);
  var f = function(v) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); };
  document.getElementById("checkout-nome").textContent = nome;
  document.getElementById("checkout-preco").textContent = f(preco);
  document.getElementById("checkout-preco-pix").textContent = f(px) + " no PIX";
  document.getElementById("btn-preco-pix").textContent = f(px);
  document.getElementById("btn-preco-boleto").textContent = f(preco);
  document.getElementById("painel-opcoes").style.display = "block";
  document.getElementById("painel-parcelas").style.display = "none";
  document.getElementById("modal-checkout").style.display = "flex";
  document.body.style.overflow = "hidden";
}
function fecharCheckout() {
  document.getElementById("modal-checkout").style.display = "none";
  document.body.style.overflow = "";
}
function abrirParcelas() {
  var cfg = window.BTG_CONFIG;
  var f = function(v) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); };
  var lista = document.getElementById("lista-parcelas");
  lista.innerHTML = "";
  for (var i = 1; i <= cfg.parcelamento; i++) {
    var vp = _p.preco / i;
    var label = i === 1 ? "1x a vista" : i + "x sem juros";
    var detalhe = i === 1 ? f(_p.preco) : i + "x de " + f(vp);
    var btn = document.createElement("button");
    btn.style.cssText = "width:100%;padding:13px 16px;border:2px solid #0f3460;border-radius:12px;background:#f0f4ff;cursor:pointer;display:flex;justify-content:space-between;align-items:center;text-align:left;margin-bottom:6px;";
    btn.innerHTML = "<div><div style=\"font-weight:700;color:#0f3460;\">" + label + "</div><div style=\"font-size:12px;color:#3b5998;\">Total: " + f(_p.preco) + "</div></div><div style=\"font-weight:800;color:#0f3460;\">" + detalhe + "</div>";
    (function(parc, valor) {
      btn.onclick = function() { confirmarCartao(parc, valor); };
    })(i, vp);
    lista.appendChild(btn);
  }
  document.getElementById("painel-opcoes").style.display = "none";
  document.getElementById("painel-parcelas").style.display = "block";
}
function voltarOpcoes() {
  document.getElementById("painel-parcelas").style.display = "none";
  document.getElementById("painel-opcoes").style.display = "block";
}
function confirmarCartao(parcelas, vp) {
  var cfg = window.BTG_CONFIG;
  var f = function(v) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); };
  var det = parcelas === 1 ? "a vista (" + f(_p.preco) + ")" : parcelas + "x de " + f(vp) + " sem juros";
  var msg = encodeURIComponent("Ola ALPE! Quero comprar: " + _p.nome + " por " + f(_p.preco) + ". Pagamento: Cartao de Credito " + det);
  window.open("https://api.whatsapp.com/send?phone=" + cfg.whatsapp + "&text=" + msg, "_blank");
  fecharCheckout();
}
function pagarBTG(m) {
  var cfg = window.BTG_CONFIG;
  var f = function(v) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); };
  var mt = m === "pix" ? "PIX" : "Boleto Bancario";
  var msg = encodeURIComponent("Ola ALPE! Quero comprar: " + _p.nome + " por " + f(_p.preco) + ". Pagamento: " + mt);
  window.open("https://api.whatsapp.com/send?phone=" + cfg.whatsapp + "&text=" + msg, "_blank");
  fecharCheckout();
}
function negociarWhatsApp() {
  var cfg = window.BTG_CONFIG;
  var f = function(v) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); };
  var msg = encodeURIComponent("Ola ALPE! Tenho interesse em: " + _p.nome + " (" + f(_p.preco) + "). Podemos negociar?");
  window.open("https://api.whatsapp.com/send?phone=" + cfg.whatsapp + "&text=" + msg, "_blank");
  fecharCheckout();
}
document.addEventListener("click", function(e) {
  if (e.target && e.target.id === "modal-checkout") fecharCheckout();
});
</script>
'

$c = $c -replace '</body>', ($novo + "`n</body>")
[System.IO.File]::WriteAllText((Resolve-Path 'index.html').Path, $c, [System.Text.Encoding]::UTF8)
Write-Host "OK"
