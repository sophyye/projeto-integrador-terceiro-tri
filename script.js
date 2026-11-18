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

let cofreCriptografado = null;

function paraBase64(bytes) {
    let textoBinario = "";
    bytes.forEach(function (byte) {
        textoBinario += String.fromCharCode(byte);
    });
    return btoa(textoBinario);
}

function deBase64(texto) {
    const binario = atob(texto);
    const bytes = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i++) {
        bytes[i] = binario.charCodeAt(i);
    }
    return bytes;
}

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
            "A criptografia não está disponível neste ambiente. Abra o site em HTTPS ou localhost.",
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
        alergias: alergias || "Nenhuma informada",
        medicamentos: medicamentos || "Nenhum informado",
        contatoEmergencia: contato || "Não informado"
    };

    botao.disabled = true;
    botao.textContent = "Criptografando...";

    try {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const chave = await derivarChave(senha, salt);

        const codificador = new TextEncoder();
        const dadosEmBytes = codificador.encode(JSON.stringify(dados));

        const conteudoCriptografado = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            chave,
            dadosEmBytes
        );

        cofreCriptografado = {
            salt: paraBase64(salt),
            iv: paraBase64(iv),
            conteudo: paraBase64(new Uint8Array(conteudoCriptografado))
        };

        document.getElementById("encrypted-output").value =
            JSON.stringify(cofreCriptografado, null, 2);

        document.getElementById("vault-encrypted").hidden = false;
        formularioCofre.reset();

        document.getElementById("vault-decrypted").hidden = true;
        document.getElementById("decrypt-password").value = "";

        mostrarMensagemCofre(
            "Dados criptografados com sucesso! Agora digite sua senha acima para desbloquear.",
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
        const salt = deBase64(cofreCriptografado.salt);
        const iv = deBase64(cofreCriptografado.iv);
        const chave = await derivarChave(senha, salt);
        const conteudo = deBase64(cofreCriptografado.conteudo);

        const resultado = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            chave,
            conteudo
        );

        const decodificador = new TextDecoder();
        const textoOriginal = decodificador.decode(resultado);
        const dados = JSON.parse(textoOriginal);

        const tabelaCorpo = document.getElementById("decrypted-content");
        tabelaCorpo.replaceChildren();

        const campos = [
            ["Nome", dados.nome],
            ["Tipo sanguíneo", dados.tipoSanguineo],
            ["Alergias", dados.alergias],
            ["Medicamentos", dados.medicamentos],
            ["Contato de emergência", dados.contatoEmergencia]
        ];

        campos.forEach(function (campo) {
            const linha = document.createElement("tr");

            const celulaRotulo = document.createElement("td");
            const negrito = document.createElement("strong");
            negrito.textContent = campo[0];
            celulaRotulo.appendChild(negrito);

            const celulaValor = document.createElement("td");
            celulaValor.textContent = campo[1];

            linha.appendChild(celulaRotulo);
            linha.appendChild(celulaValor);
            tabelaCorpo.appendChild(linha);
        });

        document.getElementById("vault-decrypted").hidden = false;

        mostrarMensagemCofre(
            "Senha correta! Os dados foram recuperados.",
            "success"
        );
    } catch (erro) {
        mostrarMensagemCofre(
            "Senha incorreta! Não foi possível abrir os dados.",
            "error"
        );
        document.getElementById("vault-decrypted").hidden = true;
    } finally {
        botaoDescriptografar.disabled = false;
        botaoDescriptografar.textContent = "🔓 Descriptografar";
    }
});

// 4.3 COPIAR E LIMPAR COFRE

document.getElementById("copy-encrypted-btn").addEventListener("click", async function () {
    const texto = document.getElementById("encrypted-output").value;
    if (!texto) return;

    try {
        await navigator.clipboard.writeText(texto);
        mostrarMensagemCofre("Código criptografado copiado para a área de transferência!", "info");
    } catch (e) {
        mostrarMensagemCofre("Selecione o texto na caixa e copie manualmente.", "info");
    }
});

function apagarDadosTemporarios() {
    cofreCriptografado = null;
    formularioCofre.reset();

    document.getElementById("encrypted-output").value = "";
    document.getElementById("decrypt-password").value = "";

    document.getElementById("vault-encrypted").hidden = true;
    document.getElementById("vault-decrypted").hidden = true;

    document.getElementById("decrypted-content").replaceChildren();
    document.getElementById("vault-message").textContent = "";
}

document.getElementById("reset-vault-btn").addEventListener("click", function () {
    apagarDadosTemporarios();
    mostrarMensagemCofre("Cofre limpo com sucesso.", "info");
});

window.addEventListener("pagehide", apagarDadosTemporarios);


// ==========================================
// 5. TABELA NUTRICIONAL INTERATIVA
// ==========================================

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

// Lista de itens adicionados na tabela interativa (inicia com um exemplo)
let listaNutricional = [
    {
        id: 1,
        chave: "banana",
        quantidade: 500
    }
];

const formularioNutricao = document.getElementById("nutrition-form");
const seletorAlimento = document.getElementById("food-select");
const campoGramas = document.getElementById("food-grams");

function formatarNumero(numero) {
    return numero.toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function atualizarPreviaNutricional() {
    const alimento = alimentos[seletorAlimento.value];
    const quantidade = Number(campoGramas.value);
    const previa = document.getElementById("nutrition-preview");

    if (!alimento || !Number.isFinite(quantidade) || quantidade <= 0) {
        previa.textContent = "Informe uma quantidade válida";
        return;
    }

    const kcal = (alimento.calorias * quantidade) / 100;
    previa.textContent =
        formatarNumero(quantidade) + " g de " + alimento.nome +
        " = " + formatarNumero(kcal) + " kcal";
}

function renderizarTabelaNutricional() {
    const corpoTabela = document.getElementById("nutrition-table-body");
    corpoTabela.replaceChildren();

    let totalCalorias = 0;
    let totalCarbs = 0;
    let totalProteinas = 0;
    let totalGorduras = 0;
    let totalFibras = 0;
    let totalSodio = 0;

    if (listaNutricional.length === 0) {
        const linhaVazia = document.createElement("tr");
        linhaVazia.className = "empty-row";

        const celula = document.createElement("td");
        celula.colSpan = 9;
        celula.textContent = "Nenhum alimento adicionado. Selecione um item acima para montar a tabela.";

        linhaVazia.appendChild(celula);
        corpoTabela.appendChild(linhaVazia);
    } else {
        listaNutricional.forEach(function (item) {
            const base = alimentos[item.chave];
            const fator = item.quantidade / 100;

            const kcal = base.calorias * fator;
            const carbs = base.carboidratos * fator;
            const prot = base.proteinas * fator;
            const gord = base.gorduras * fator;
            const fib = base.fibras * fator;
            const sod = base.sodio * fator;

            totalCalorias += kcal;
            totalCarbs += carbs;
            totalProteinas += prot;
            totalGorduras += gord;
            totalFibras += fib;
            totalSodio += sod;

            const tr = document.createElement("tr");

            const valores = [
                base.nome,
                formatarNumero(item.quantidade) + " g",
                formatarNumero(kcal) + " kcal",
                formatarNumero(carbs) + " g",
                formatarNumero(prot) + " g",
                formatarNumero(gord) + " g",
                formatarNumero(fib) + " g",
                formatarNumero(sod) + " mg"
            ];

            valores.forEach(function (texto) {
                const td = document.createElement("td");
                td.textContent = texto;
                tr.appendChild(td);
            });

            const tdAcao = document.createElement("td");
            const btnRemover = document.createElement("button");
            btnRemover.type = "button";
            btnRemover.className = "remove-food-btn";
            btnRemover.textContent = "Remover";
            btnRemover.addEventListener("click", function () {
                removerItemNutricional(item.id);
            });

            tdAcao.appendChild(btnRemover);
            tr.appendChild(tdAcao);
            corpoTabela.appendChild(tr);
        });
    }

    document.getElementById("total-calories").innerHTML = "<strong>" + formatarNumero(totalCalorias) + " kcal</strong>";
    document.getElementById("total-carbs").innerHTML = "<strong>" + formatarNumero(totalCarbs) + " g</strong>";
    document.getElementById("total-protein").innerHTML = "<strong>" + formatarNumero(totalProteinas) + " g</strong>";
    document.getElementById("total-fat").innerHTML = "<strong>" + formatarNumero(totalGorduras) + " g</strong>";
    document.getElementById("total-fiber").innerHTML = "<strong>" + formatarNumero(totalFibras) + " g</strong>";
    document.getElementById("total-sodium").innerHTML = "<strong>" + formatarNumero(totalSodio) + " mg</strong>";
}

function removerItemNutricional(id) {
    listaNutricional = listaNutricional.filter(function (item) {
        return item.id !== id;
    });
    renderizarTabelaNutricional();
}

formularioNutricao.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const chave = seletorAlimento.value;
    const quantidade = Number(campoGramas.value);
    const mensagem = document.getElementById("nutrition-feedback");

    if (!alimentos[chave]) {
        mensagem.textContent = "Selecione um alimento válido.";
        mensagem.className = "status-message error";
        return;
    }

    if (!Number.isFinite(quantidade) || quantidade <= 0 || quantidade > 5000) {
        mensagem.textContent = "Informe uma quantidade entre 1 e 5000 gramas.";
        mensagem.className = "status-message error";
        return;
    }

    listaNutricional.push({
        id: Date.now() + Math.random(),
        chave: chave,
        quantidade: quantidade
    });

    renderizarTabelaNutricional();

    mensagem.textContent = alimentos[chave].nome + " (" + formatarNumero(quantidade) + " g) adicionado à tabela!";
    mensagem.className = "status-message success";
});

document.getElementById("clear-nutrition-btn").addEventListener("click", function () {
    listaNutricional = [];
    renderizarTabelaNutricional();

    const mensagem = document.getElementById("nutrition-feedback");
    mensagem.textContent = "Tabela limpa.";
    mensagem.className = "status-message info";
});

seletorAlimento.addEventListener("change", atualizarPreviaNutricional);
campoGramas.addEventListener("input", atualizarPreviaNutricional);


// ==========================================
// 6. DADOS DAS MEDIÇÕES DE SOM
// ==========================================

const medicoes = [
    { local: "Pátio da escola", decibeis: 81 },
    { local: "Quadra coberta", decibeis: 75 },
    { local: "Sala de aula", decibeis: 51 },
    { local: "Corredor das salas", decibeis: 71 },
    { local: "Biblioteca", decibeis: 50 },
    { local: "Refeitório", decibeis: 50 }
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
    atualizarPreviaNutricional();
    renderizarTabelaNutricional();
});