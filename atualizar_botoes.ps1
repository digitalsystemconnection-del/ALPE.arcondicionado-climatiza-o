$c = Get-Content 'index.html' -Raw -Encoding UTF8

# Mapa de produtos: data-id => [nome, preco]
$produtos = @{
  '1'  = @('Samsung Inverter 12.000 BTU', 2999.00)
  '2'  = @('LG Dual Inverter 9.000 BTU', 2450.00)
  '3'  = @('Daikin Cassete 36.000 BTU', 8990.00)
  '4'  = @('Hisense Inverter 12.000 BTU', 2050.48)
  '5'  = @('Elgin Inverter 12.000 BTU', 2155.60)
  '6'  = @('Electrolux Inverter 9.000 BTU', 1709.05)
  '7'  = @('Fujitsu Inverter 9.000 BTU', 1709.05)
  '8'  = @('Hitachi Inverter 9.000 BTU', 2496.79)
  '9'  = @('Philco Inverter 12.000 BTU', 2435.24)
  '10' = @('Gree Inverter 9.000 BTU', 2435.24)
  '11' = @('TCL Inverter 12.000 BTU', 2435.24)
  '12' = @('Midea Inverter 9.000 BTU', 2435.24)
}

foreach ($id in $produtos.Keys) {
  $nome  = $produtos[$id][0]
  $preco = $produtos[$id][1]
  $old = "class=""cta-card btn-add-cart"" data-id=""$id"">COMPRAR AGORA</a>"
  $new = "class=""cta-card btn-add-cart"" data-id=""$id"" onclick=""abrirCheckout('$id','$nome',$preco); return false;"">COMPRAR AGORA</a>"
  $c = $c -replace [regex]::Escape($old), $new
}

Set-Content 'index.html' -Value $c -NoNewline -Encoding UTF8
Write-Host "OK - $($produtos.Count) botoes atualizados"
