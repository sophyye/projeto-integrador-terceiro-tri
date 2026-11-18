// ==========================================
// PROJETO INTEGRADOR
// JavaScript - Funcionalidades do site
// ==========================================


// 1. NAVEGAÇÃO ENTRE AS PÁGINAS

const botoesNavegacao = document.querySelectorAll(".nav-tab");
const paginas = document.querySelectorAll(".page");

function mostrarPagina(nomePagina) {

    // Esconde todas as páginas
    paginas.forEach(function (pagina) {
        pagina.classList.remove("active");
    });

    // Remove a seleção dos botões
    botoesNavegacao.forEach(function (botao) {
        botao.classList.remove("active");
    });

    // Mostra a página escolhida
    const paginaSelecionada = document.getElementById(nomePagina);

    if (paginaSelecionada) {
        paginaSelecionada.classList.add("active");
    }

    // Atualiza o botão selecionado
    const botaoSelecionado = document.querySelector(
        '.nav-tab[data-page="' + nomePagina + '"]'
    );

    if (botaoSelecionado) {
        botaoSelecionado.classList.add("active");
    }

    // Volta ao topo da página
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// 2. CLIQUES NO MENU PRINCIPAL

botoesNavegacao.forEach(function (botao) {

    botao.addEventListener("click", function () {

        const nomePagina = botao.dataset.page;

        mostrarPagina(nomePagina);

    });

});


// 3. BOTÕES DE NAVEGAÇÃO DENTRO DO CONTEÚDO

const botoesInternos = document.querySelectorAll("[data-go]");

botoesInternos.forEach(function (botao) {

    botao.addEventListener("click", function () {

        const destino = botao.dataset.go;

        mostrarPagina(destino);

    });

});


// 4. DADOS DAS MEDIÇÕES DE SOM

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


// 5. CRIAÇÃO DO GRÁFICO DE DECIBÉIS

function criarGrafico() {

    const grafico = document.getElementById("sound-chart");

    // Verifica se o gráfico existe na página
    if (!grafico) {
        return;
    }

    // Limpa o conteúdo anterior
    grafico.innerHTML = "";

    // Encontra o maior valor das medições
    const maiorValor = Math.max(
        ...medicoes.map(function (medicao) {
            return medicao.decibeis;
        })
    );

    // Percorre todas as medições
    medicoes.forEach(function (medicao) {

        // Cria o espaço de cada barra
        const item = document.createElement("div");
        item.classList.add("bar-item");

        // Cria o nome do local
        const nome = document.createElement("span");
        nome.classList.add("bar-label");
        nome.textContent = medicao.local;

        // Cria o fundo da barra
        const trilho = document.createElement("div");
        trilho.classList.add("bar-track");

        // Cria a barra colorida
        const barra = document.createElement("div");
        barra.classList.add("bar-fill");

        // Calcula o tamanho proporcional da barra
        const largura = (medicao.decibeis / maiorValor) * 100;

        barra.style.width = largura + "%";

        // Cria o valor em decibéis
        const valor = document.createElement("span");
        valor.classList.add("bar-value");
        valor.textContent = medicao.decibeis + " dB";

        // Organiza os elementos
        trilho.appendChild(barra);

        item.appendChild(nome);
        item.appendChild(trilho);
        item.appendChild(valor);

        // Adiciona o item ao gráfico
        grafico.appendChild(item);

    });

}


// 6. EXECUÇÃO DO GRÁFICO

document.addEventListener("DOMContentLoaded", function () {

    criarGrafico();

});


// ==========================================
// FIM DO JAVASCRIPT
// ==========================================