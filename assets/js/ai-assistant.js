const API_KEY = "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";
const chat = document.getElementById("corpoChat");
const inputChat = document.getElementById("inputChat");
const btnEnviar = document.getElementById("enviarMsg");
const btnToggle = document.getElementById("toggleAssistente");
const btnFechar = document.getElementById("fecharAssistente");
const janelaAssistente = document.getElementById("janelaAssistente");

if (btnToggle && btnFechar && janelaAssistente) {
    function toggleChat() { janelaAssistente.classList.toggle("ativo"); }
    btnToggle.onclick = toggleChat;
    btnFechar.onclick = toggleChat;
}

function adicionarMensagem(texto, tipo) {
    if (!chat) return;
    let msg = document.createElement("div");
    msg.className = "msg-chat " + (tipo === "ia" ? "msg-ia" : "msg-usuario");
    msg.innerText = texto;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
}

async function buscarRespostaIA(mensagem) {
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "Você é o assistente virtual oficial da ALPE Ar Condicionado & Climatização. Sua função é EXCLUSIVA para tirar dúvidas sobre nossos serviços: Venda de aparelhos, Instalação Certificada, Manutenção Preventiva (PMOC) e Limpeza. Trabalhamos com marcas como Fujitsu, Daikin, Samsung, LG, Gree, Midea, Hitachi, Elgin, Hisense, Philco e TCL. Use as informações da página para vender esses serviços e produtos. Se o usuário perguntar sobre qualquer assunto não relacionado à climatização ou à ALPE, diga educadamente que só pode ajudar com serviços da empresa. Seja persuasivo, breve e profissional." },
                    { role: "user", content: mensagem }
                ]
            })
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error(error);
        return "Desculpe, tive um problema na conexão. Pode tentar novamente ou nos chamar no WhatsApp?";
    }
}

async function responder() {
    if (!inputChat) return;
    let texto = inputChat.value.trim();
    if (texto === "") return;
    adicionarMensagem(texto, "usuario");
    inputChat.value = "";
    const loadingMsg = document.createElement("div");
    loadingMsg.className = "msg-chat msg-ia";
    loadingMsg.innerText = "Analisando seu pedido...";
    chat.appendChild(loadingMsg);
    chat.scrollTop = chat.scrollHeight;
    const respostaReal = await buscarRespostaIA(texto);
    loadingMsg.innerText = respostaReal;
}

if (btnEnviar) btnEnviar.onclick = responder;
if (inputChat) inputChat.onkeypress = (e) => { if (e.key === "Enter") responder(); };

setTimeout(() => { adicionarMensagem("Olá! Sou o especialista virtual da ALPE. Como posso ajudar no seu projeto de climatização hoje?", "ia"); }, 3000);