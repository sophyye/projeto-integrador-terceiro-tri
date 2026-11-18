// ==========================================
// PROJETO INTEGRADOR
// JavaScript - Funcionalidades do site
// ==========================================


// 1. NAVEGAÇÃO ENTRE AS PÁGINAS

const botoesNavegacao = document.querySelectorAll(".nav-tab");
const paginas = document.querySelectorAll(".page");

function mostrarPagina(nomePagina) {

    paginas.forEach(function (pagina) {
        pagina.classList.remove("active");
    });

    botoesNavegacao.forEach(function (botao) {
        botao.classList.remove("active");
    });

    const paginaSelecionada = document.getElementById(nomePagina);

    if (paginaSelecionada) {
        paginaSelecionada.classList.add("active");
    }

    const botaoSelecionado = document.querySelector(
        '.nav-tab[data-page="' + nomePagina + '"]'
    );

    if (botaoSelecionado) {
        botaoSelecionado.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// 2. CLIQUES NO MENU PRINCIPAL

botoesNavegacao.forEach(function (botao) {

    botao.addEventListener("click", function () {
        mostrarPagina(botao.dataset.page);
    });

});


// 3. BOTÕES DE NAVEGAÇÃO DENTRO DO CONTEÚDO

const botoesInternos = document.querySelectorAll("[data-go]");

botoesInternos.forEach(function (botao) {

    botao.addEventListener("click", function () {
        mostrarPagina(botao.dataset.go);
    });

});


// ==========================================
// 4. COFRE DIGITAL DE SAÚDE
// Criptografia AES-GCM com Web Crypto API
// ==========================================

// A variável guarda somente os dados criptografados
// enquanto a página estiver aberta.
// Nada é salvo no armazenamento do navegador.

let cofreCriptografado = null;


// Converte bytes em texto Base64

function paraBase64(bytes) {

    let textoBinario = "";

    bytes.forEach(function (byte) {
        textoBinario += String.fromCharCode(byte);
    });

    return btoa(textoBinario);
}


// Converte texto Base64 em bytes

function deBase64(texto) {

    const binario = atob(texto);

    const bytes = new Uint8Array(binario.length);

    for (let i = 0; i < binario.length; i++) {
        bytes[i] = binario.charCodeAt(i);
    }

    return bytes;
}


// Deriva uma chave criptográfica a partir da senha
// usando PBKDF2 e SHA-256.

async function derivarChave(senha, salt) {

    const codificador = new TextEncoder();

    const material = await crypto.subtle.importKey(
        "raw",
        codificador.encode(senha),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 310000,
            hash: "SHA-256"
        },
        material,
        {
            name: "AES-GCM",
            length: 256
        },
        false,
        ["encrypt", "decrypt"]
    );
}


// Exibe mensagens na área do cofre

function mostrarMensagemCofre(mensagem, tipo) {

    const elemento = document.getElementById("vault-message");

    elemento.textContent = mensagem;
    elemento.className = "status-message " + tipo;
}


// 4.1 CRIPTOGRAFAR DADOS

const formularioCofre = document.getElementById("vault-form");

formularioCofre.addEventListener("submit", async function (evento) {

    evento.preventDefault();

    const botao = formularioCofre.querySelector("button[type='submit']");

    const nome = document.getElementById("health-name").value.trim();
    const sangue = document.getElementById("health-blood").value;
    const alergias = document.getElementById("health-allergies").value.trim();
    const medicamentos = document.getElementById("health-medicines").value.trim();
    const contato = document.getElementById("health-contact").value.trim();

    const senha = document.getElementById("vault-password").value;
    const confirmacao = document.getElementById("vault-confirm").value;

    if (!window.crypto || !window.crypto.subtle) {
        mostrarMensagemCofre(
            "A criptografia não está disponível neste ambiente. Abra o site em uma conexão segura HTTPS ou em localhost.",
            "error"
        );
        return;
    }

    if (senha.length < 8) {
        mostrarMensagemCofre(
            "A senha precisa ter pelo menos 8 caracteres.",
            "error"
        );
        return;
    }

    if (senha !== confirmacao) {
        mostrarMensagemCofre(
            "As senhas não são iguais. Confira e tente novamente.",
            "error"
        );
        return;
    }

    if (!nome || !sangue) {
        mostrarMensagemCofre(
            "Preencha o nome fictício e o tipo sanguíneo.",
            "error"
        );
        return;
    }

    const dados = {
        nome: nome,
        tipoSanguineo: sangue,
        alergias: alergias || "Não informado",
        medicamentos: medicamentos || "Não informado",
        contatoEmergencia: contato || "Não informado"
    };

    botao.disabled = true;
    botao.textContent = "Criptografando...";

    try {

        // Cria um salt aleatório para a derivação da chave.
        const salt = crypto.getRandomValues(new Uint8Array(16));

        // Cria um vetor de inicialização aleatório.
        const iv = crypto.getRandomValues(new Uint8Array(12));

        // Deriva a chave a partir da senha.
        const chave = await derivarChave(senha, salt);

        // Transforma os dados em bytes.
        const codificador = new TextEncoder();

        const dadosEmBytes = codificador.encode(
            JSON.stringify(dados)
        );

        // Criptografa com AES-GCM.
        const conteudoCriptografado = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            chave,
            dadosEmBytes
        );

        // Guarda somente o material criptografado na memória.
        cofreCriptografado = {
            salt: paraBase64(salt),
            iv: paraBase64(iv),
            conteudo: paraBase64(
                new Uint8Array(conteudoCriptografado)
            )
        };

        // Exibe os dados criptografados.
        document.getElementById("encrypted-output").value =
            JSON.stringify(cofreCriptografado, null, 2);

        document.getElementById("vault-encrypted").hidden = false;

        // Limpa os campos com os dados originais e a senha.
        formularioCofre.reset();

        document.getElementById("vault-decrypted").hidden = true;
        document.getElementById("decrypt-password").value = "";

        mostrarMensagemCofre(
            "Dados criptografados com sucesso! Agora você pode testar a senha.",
            "success"
        );

    } catch (erro) {

        console.error("Erro na criptografia:", erro);

        mostrarMensagemCofre(
            "Não foi possível criptografar os dados. Tente novamente.",
            "error"
        );

    } finally {

        botao.disabled = false;
        botao.textContent = "🔒 Criptografar dados";

    }

});


// 4.2 DESCRIPTOGRAFAR DADOS

const botaoDescriptografar = document.getElementById("decrypt-button");

botaoDescriptografar.addEventListener("click", async function () {

    if (!cofreCriptografado) {
        mostrarMensagemCofre(
            "Não existe nenhum conteúdo criptografado nesta sessão.",
            "error"
        );
        return;
    }

    const senha = document.getElementById("decrypt-password").value;

    if (!senha) {
        mostrarMensagemCofre(
            "Digite a senha para continuar.",
            "error"
        );
        return;
    }

    botaoDescriptografar.disabled = true;
    botaoDescriptografar.textContent = "Verificando...";

    try {

        // Recupera salt e vetor de inicialização.
        const salt = deBase64(cofreCriptografado.salt);
        const iv = deBase64(cofreCriptografado.iv);

        // Deriva novamente a chave com a senha informada.
        const chave = await derivarChave(senha, salt);

        // Converte o conteúdo criptografado para bytes.
        const conteudo = deBase64(cofreCriptografado.conteudo);

        // Tenta descriptografar.
        const resultado = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            chave,
            conteudo
        );

        // Converte o resultado para texto.
        const decodificador = new TextDecoder();

        const textoOriginal = decodificador.decode(resultado);

        const dados = JSON.parse(textoOriginal);

        // Apresenta os dados recuperados.
        const areaResultado = document.getElementById("decrypted-content");

        areaResultado.replaceChildren();

        const campos = [
            ["Nome", dados.nome],
            ["Tipo sanguíneo", dados.tipoSanguineo],
            ["Alergias", dados.alergias],
            ["Medicamentos", dados.medicamentos],
            ["Contato de emergência", dados.contatoEmergencia]
        ];

        campos.forEach(function (campo) {

            const paragrafo = document.createElement("p");
            const rotulo = document.createElement("strong");

            rotulo.textContent = campo[0] + ": ";

            paragrafo.appendChild(rotulo);
            paragrafo.appendChild(
                document.createTextNode(campo[1])
            );

            areaResultado.appendChild(paragrafo);

        });

        document.getElementById("vault-decrypted").hidden = false;

        mostrarMensagemCofre(
            "Senha correta! Os dados foram recuperados.",
            "success"
        );

    } catch (erro) {

        mostrarMensagemCofre(
            "Não foi possível abrir os dados. Verifique a senha.",
            "error"
        );

        document.getElementById("vault-decrypted").hidden = true;

    } finally {

        botaoDescriptografar.disabled = false;
        botaoDescriptografar.textContent = "Descriptografar";

    }

});


// 4.3 APAGAMENTO DOS DADOS AO SAIR DA PÁGINA

function apagarDadosTemporarios() {

    // Descarta o conteúdo criptografado da memória
    // e limpa os campos do formulário.

    cofreCriptografado = null;

    formularioCofre.reset();

    document.getElementById("encrypted-output").value = "";
    document.getElementById("decrypt-password").value = "";

    document.getElementById("vault-encrypted").hidden = true;
    document.getElementById("vault-decrypted").hidden = true;

    document.getElementById("decrypted-content").replaceChildren();

    document.getElementById("vault-message").textContent = "";

}


// O evento pagehide é acionado ao sair da página,
// inclusive em situações de navegação e fechamento.

window.addEventListener("pagehide", apagarDadosTemporarios);


// ==========================================
// 5. CALCULADORA NUTRICIONAL
// ==========================================

// Valores aproximados por 100 gramas.

const alimentos = {

    arroz: {
        nome: "Arroz branco cozido",
        calorias: 128,
        carboidratos: 28.1,
        proteinas: 2.5,
        gorduras: 0.2,
        fibras: 1.6,
        sodio: 1
    },

    feijao: {
        nome: "Feijão carioca cozido",
        calorias: 76,
        carboidratos: 13.6,
        proteinas: 4.8,
        gorduras: 0.5,
        fibras: 8.5,
        sodio: 2
    },

    frango: {
        nome: "Frango grelhado",
        calorias: 159,
        carboidratos: 0,
        proteinas: 32,
        gorduras: 2.5,
        fibras: 0,
        sodio: 50
    },

    banana: {
        nome: "Banana",
        calorias: 98,
        carboidratos: 26,
        proteinas: 1.3,
        gorduras: 0.1,
        fibras: 2,
        sodio: 0
    },

    maca: {
        nome: "Maçã",
        calorias: 56,
        carboidratos: 15.2,
        proteinas: 0.3,
        gorduras: 0,
        fibras: 1.3,
        sodio: 0
    },

    ovo: {
        nome: "Ovo cozido",
        calorias: 146,
        carboidratos: 0.6,
        proteinas: 13.3,
        gorduras: 9.5,
        fibras: 0,
        sodio: 146
    },

    batata: {
        nome: "Batata cozida",
        calorias: 52,
        carboidratos: 11.9,
        proteinas: 1.2,
        gorduras: 0,
        fibras: 1.3,
        sodio: 2
    }

};


// Elementos da calculadora.

const seletorAlimento = document.getElementById("food-select");
const campoGramas = document.getElementById("food-grams");


// Formata os números com vírgula decimal.

function formatarNumero(numero) {

    return numero.toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });

}


// 5.1 REALIZAR O CÁLCULO

function calcularNutrientes() {

    const alimentoSelecionado = seletorAlimento.value;
    const quantidade = Number(campoGramas.value);

    const alimento = alimentos[alimentoSelecionado];

    const mensagem = document.getElementById("nutrition-feedback");

    if (!alimento) {
        mensagem.textContent = "Selecione um alimento válido.";
        mensagem.className = "status-message error";
        return;
    }

    if (
        !Number.isFinite(quantidade) ||
        quantidade <= 0 ||
        quantidade > 5000
    ) {
        mensagem.textContent =
            "Informe uma quantidade entre 1 e 5000 gramas.";

        mensagem.className = "status-message error";
        return;
    }

    // A fórmula considera os valores de referência por 100 g.
    // Exemplo: (500 / 100) × 98 = 490 kcal.

    const fator = quantidade / 100;

    const calorias = alimento.calorias * fator;
    const carboidratos = alimento.carboidratos * fator;
    const proteinas = alimento.proteinas * fator;
    const gorduras = alimento.gorduras * fator;
    const fibras = alimento.fibras * fator;
    const sodio = alimento.sodio * fator;

    // Atualiza os resultados na tela.

    document.getElementById("nutrition-calories").textContent =
        formatarNumero(calorias) + " kcal";

    document.getElementById("nutrition-carbs").textContent =
        formatarNumero(carboidratos) + " g";

    document.getElementById("nutrition-protein").textContent =
        formatarNumero(proteinas) + " g";

    document.getElementById("nutrition-fat").textContent =
        formatarNumero(gorduras) + " g";

    document.getElementById("nutrition-fiber").textContent =
        formatarNumero(fibras) + " g";

    document.getElementById("nutrition-sodium").textContent =
        formatarNumero(sodio) + " mg";

    mensagem.textContent =
        alimento.nome + " — cálculo estimado para " +
        formatarNumero(quantidade) + " gramas.";

    mensagem.className = "status-message success";

}


// 5.2 ATUALIZAÇÃO AUTOMÁTICA

// Sempre que o alimento mudar, o cálculo será atualizado.

seletorAlimento.addEventListener(
    "change",
    calcularNutrientes
);


// Sempre que a quantidade mudar, o cálculo será atualizado.

campoGramas.addEventListener(
    "input",
    calcularNutrientes
);


// ==========================================
// 6. DADOS DAS MEDIÇÕES DE SOM
// ==========================================

const medicoes = [
    {
        local: "Pátio da escola",
        decibeis: 81
    },
    {
        local: "Quadra coberta",
        decibeis: 75
    },
    {
        local: "Sala de aula",
        decibeis: 51
    },
    {
        local: "Corredor das salas",
        decibeis: 71
    },
    {
        local: "Biblioteca",
        decibeis: 50
    },
    {
        local: "Refeitório",
        decibeis: 50
    }
];


// ==========================================
// 7. CRIAÇÃO DO GRÁFICO DE DECIBÉIS
// ==========================================

function criarGrafico() {

    const grafico = document.getElementById("sound-chart");

    if (!grafico) {
        return;
    }

    grafico.innerHTML = "";

    const maiorValor = Math.max(
        ...medicoes.map(function (medicao) {
            return medicao.decibeis;
        })
    );

    medicoes.forEach(function (medicao) {

        const item = document.createElement("div");
        item.classList.add("bar-item");

        const nome = document.createElement("span");
        nome.classList.add("bar-label");
        nome.textContent = medicao.local;

        const trilho = document.createElement("div");
        trilho.classList.add("bar-track");

        const barra = document.createElement("div");
        barra.classList.add("bar-fill");

        const largura = (medicao.decibeis / maiorValor) * 100;

        barra.style.width = largura + "%";

        const valor = document.createElement("span");
        valor.classList.add("bar-value");
        valor.textContent = medicao.decibeis + " dB";

        trilho.appendChild(barra);

        item.appendChild(nome);
        item.appendChild(trilho);
        item.appendChild(valor);

        grafico.appendChild(item);

    });

}


// ==========================================
// 8. INICIALIZAÇÃO DO SITE
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    criarGrafico();

    calcularNutrientes();

});


// ==========================================
// FIM DO JAVASCRIPT
// ==========================================