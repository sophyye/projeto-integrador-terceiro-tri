document.addEventListener("DOMContentLoaded", () => {
  // Navegação entre abas
  const pages = document.querySelectorAll(".page");
  const navTabs = document.querySelectorAll(".nav-tab");
  const menuToggle = document.getElementById("menu-toggle");
  const mainNav = document.getElementById("main-nav");

  function showPage(pageId) {
    const targetPage = document.getElementById(pageId);
    if (!targetPage) return;

    pages.forEach(page => page.classList.remove("active"));
    navTabs.forEach(tab => tab.classList.remove("active"));

    targetPage.classList.add("active");
    const activeTab = document.querySelector(`.nav-tab[data-page="${pageId}"]`);
    if (activeTab) activeTab.classList.add("active");

    if (mainNav) mainNav.classList.remove("open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navTabs.forEach(tab => {
    tab.addEventListener("click", () => showPage(tab.dataset.page));
  });

  document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => showPage(button.dataset.go));
  });

  document.querySelectorAll("[data-page-link]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      showPage(link.dataset.pageLink);
    });
  });

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // --- COFRE DIGITAL INTERATIVO ---
  let savedCofreData = null;
  const btnSaveCofre = document.getElementById("btn-save-cofre");
  const btnOpenCofre = document.getElementById("btn-open-cofre");
  const btnResetCofre = document.getElementById("btn-reset-cofre");
  const setupStep = document.getElementById("cofre-setup-step");
  const accessStep = document.getElementById("cofre-access-step");
  const cofreMsg = document.getElementById("cofre-msg");
  const cofreResult = document.getElementById("cofre-result");

  if (btnSaveCofre) {
    btnSaveCofre.addEventListener("click", () => {
      const name = document.getElementById("cofre-name").value.trim();
      const blood = document.getElementById("cofre-blood").value.trim();
      const allergies = document.getElementById("cofre-allergies").value.trim();
      const pass = document.getElementById("cofre-pass").value;

      if (!name || !blood || !pass) {
        cofreMsg.textContent = "Preencha pelo menos o nome, tipo sanguíneo e a senha.";
        return;
      }

      savedCofreData = { name, blood, allergies, pass };
      setupStep.style.display = "none";
      accessStep.style.display = "block";
      cofreMsg.textContent = "Cofre criado com sucesso!";
    });

    btnOpenCofre.addEventListener("click", () => {
      const inputPass = document.getElementById("cofre-input-pass").value;
      if (inputPass === savedCofreData.pass) {
        cofreMsg.textContent = "Acesso autorizado!";
        cofreResult.innerHTML = `
          <strong>Informações Recuperadas com Sucesso:</strong><br>
          - Nome: ${savedCofreData.name}<br>
          - Tipo Sanguíneo: ${savedCofreData.blood}<br>
          - Alergias/Medicamentos: ${savedCofreData.allergies || "Nenhuma informada"}
        `;
      } else {
        cofreMsg.textContent = "Senha incorreta! Acesso negado.";
        cofreResult.innerHTML = "";
      }
    });

    btnResetCofre.addEventListener("click", () => {
      setupStep.style.display = "block";
      accessStep.style.display = "none";
      cofreMsg.textContent = "";
      cofreResult.innerHTML = "";
      document.getElementById("cofre-name").value = "";
      document.getElementById("cofre-blood").value = "";
      document.getElementById("cofre-allergies").value = "";
      document.getElementById("cofre-pass").value = "";
      document.getElementById("cofre-input-pass").value = "";
    });
  }

  // --- CALCULADORA NUTRICIONAL ---
  const foods = {
    arroz: { name: "Arroz branco cozido", calories: 128, carbs: 28.1, protein: 2.5, fat: 0.2, fiber: 1.6, sodium: 1 },
    feijao: { name: "Feijão carioca cozido", calories: 76, carbs: 13.6, protein: 4.8, fat: 0.5, fiber: 8.5, sodium: 2 },
    frango: { name: "Frango grelhado", calories: 159, carbs: 0, protein: 32, fat: 2.5, fiber: 0, sodium: 50 },
    banana: { name: "Banana", calories: 98, carbs: 26, protein: 1.3, fat: 0.1, fiber: 2, sodium: 0 },
    maca: { name: "Maçã", calories: 56, carbs: 15.2, protein: 0.3, fat: 0, fiber: 1.3, sodium: 0 },
    ovo: { name: "Ovo cozido", calories: 146, carbs: 0.6, protein: 13.3, fat: 9.5, fiber: 0, sodium: 146 },
    batata: { name: "Batata cozida", calories: 52, carbs: 11.9, protein: 1.2, fat: 0, fiber: 1.3, sodium: 2 }
  };

  let selectedFoods = [];
  const foodSelect = document.getElementById("food-select");
  const foodGrams = document.getElementById("food-grams");
  const calculateButton = document.getElementById("calculate-food");
  const clearButton = document.getElementById("clear-foods");
  const nutritionMessage = document.getElementById("nutrition-message");
  const foodList = document.getElementById("food-list");

  if (calculateButton) {
    calculateButton.addEventListener("click", () => {
      const foodKey = foodSelect.value;
      const grams = Number(foodGrams.value);

      if (!foodGrams.value || grams <= 0) {
        nutritionMessage.textContent = "Digite uma quantidade válida em gramas.";
        return;
      }

      selectedFoods.push({ key: foodKey, name: foods[foodKey].name, grams });
      foodGrams.value = "";
      nutritionMessage.textContent = "Alimento adicionado!";
      updateNutrition();
    });

    clearButton.addEventListener("click", () => {
      selectedFoods = [];
      nutritionMessage.textContent = "Lista limpa.";
      updateNutrition();
    });
  }

  function updateNutrition() {
    if (!foodList) return;
    const totals = { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0, sodium: 0 };
    foodList.innerHTML = "";

    selectedFoods.forEach((item, index) => {
      const f = foods[item.key];
      const factor = item.grams / 100;
      totals.calories += f.calories * factor;
      totals.carbs += f.carbs * factor;
      totals.protein += f.protein * factor;
      totals.fat += f.fat * factor;
      totals.fiber += f.fiber * factor;
      totals.sodium += f.sodium * factor;

      const entry = document.createElement("div");
      entry.className = "food-entry";
      entry.innerHTML = `<span>${item.name} — ${item.grams}g</span> <button type="button" class="remove-food" data-index="${index}">Remover</button>`;
      foodList.appendChild(entry);
    });

    document.querySelectorAll(".remove-food").forEach(btn => {
      btn.addEventListener("click", (e) => {
        selectedFoods.splice(Number(e.target.dataset.index), 1);
        updateNutrition();
      });
    });

    document.getElementById("total-calories").textContent = totals.calories.toFixed(1);
    document.getElementById("total-carbs").textContent = `${totals.carbs.toFixed(1)}g`;
    document.getElementById("total-protein").textContent = `${totals.protein.toFixed(1)}g`;
    document.getElementById("total-fat").textContent = `${totals.fat.toFixed(1)}g`;
    document.getElementById("total-fiber").textContent = `${totals.fiber.toFixed(1)}g`;
    document.getElementById("total-sodium").textContent = `${totals.sodium.toFixed(1)}mg`;
  }

  // --- GRÁFICO DE SOM ---
  const soundMeasurements = [
    { place: "Pátio", value: 81 },
    { place: "Quadra", value: 75 },
    { place: "Corredor", value: 71 },
    { place: "Sala de aula", value: 51 },
    { place: "Biblioteca", value: 50 },
    { place: "Refeitório", value: 50 }
  ];

  const chart = document.getElementById("sound-chart");
  if (chart) {
    soundMeasurements.forEach(m => {
      const row = document.createElement("div");
      row.className = "chart-row";
      row.innerHTML = `
        <span>${m.place}</span>
        <div class="chart-track"><div class="chart-fill" style="width: ${m.value}%"></div></div>
        <span class="chart-value">${m.value} dB</span>
      `;
      chart.appendChild(row);
    });
  }

  // --- BOTÃO VOLTAR AO TOPO ---
  const backToTop = document.getElementById("back-to-top");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});