# ALPE Ar Condicionado - Web

Site profissional para venda de ar-condicionado com catálogo completo, calculadora de BTU e sistema de carrinho de compras.

## 📋 Pré-requisitos

- **Git** instalado (necessário para versionamento e deploy)
- **Node.js** (opcional, necessário apenas para rodar a API na pasta `/api`)

##  Funcionalidades

- **Carrossel de Banners** - Promoções e destaques automáticos
- **Catálogo de Produtos** - Mais de 12 marcas (Daikin, LG, Samsung, Fujitsu, etc.)
- **Calculadora de BTU** - Ferramenta para dimensionamento correto
- **Carrinho de Compras** - Sistema funcional com localStorage
- **Integração WhatsApp** - Finalização de pedidos direto no WhatsApp
- **Design Responsivo** - Otimizado para desktop e mobile
- **Formulário de Contato** - Integrado com Formspree

## 📁 Estrutura do Projeto

```
site-pasta/
├── index.html              # Página principal
├── js/
│   └── cart.js             # Sistema de carrinho
├── images/
│   ├── banner/             # Banners do carrossel
│   ├── produtos/           # Imagens dos produtos
│   ├── logo marcas/        # Logos das marcas
│   └── icone/              # Ícones diversos
├── marcas.index/           # Páginas específicas das marcas
└── sobre-nos/              # Página institucional
```

## 🛠️ Como Usar

### Frontend
1. Abra o arquivo `index.html` em qualquer navegador.
2. O carrinho e a calculadora funcionam localmente usando JavaScript.

### Backend (API de Integração)
Para usar o comparador de preços dinâmico no Dashboard:
1. Acesse a pasta `api/`.
2. Execute `npm install`.
3. Inicie com `node server.js`.

### Subindo para o GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
git push -u origin main
```

## 📱 Recursos Mobile

- Menu responsivo
- Carrossel otimizado
- Botão WhatsApp flutuante
- Layout adaptativo

## 🎨 Tecnologias

- HTML5 semântico
- CSS3 com animações
- JavaScript vanilla
- Font Awesome (ícones)
- Google Fonts (Roboto)

## 📞 Contato

- **WhatsApp**: (21) 98022-0417
- **E-mail**: alpe.arcondicionado@hotmail.com

---

**Desenvolvido para ALPE Ar Condicionado & Climatização**