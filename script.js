let words = []; // Almacena las palabras
let score = {
    correct: 0,
    incorrect: 0
};
let exerciseHistory = []; // Almacena el historial de ejercicios

// Cargar palabras y historial desde localStorage al cargar la página
window.onload = function() {
    loadWordsFromLocalStorage();
    loadExerciseHistoryFromLocalStorage();
    populateCategories();
    loadThemeFromLocalStorage();
    updateGeneralStats();
    updateCategoryStats();
    updateExerciseStats();
    renderWordList(); // Asegurarse de renderizar la lista de palabras al cargar la página
};

// Guardar palabra manualmente
document.getElementById("word-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const word = document.getElementById("word").value.trim();
    const translation = document.getElementById("translation").value.trim();
    const category = document.getElementById("category").value.trim();

    if (validateInputs(word, translation, category)) {
        words.push({ word, translation, category });
        saveWordsToLocalStorage();
        alert("Palabra guardada exitosamente");
        document.getElementById("word-form").reset();
        renderWordList(); // Renderizar la lista de palabras después de guardar una nueva palabra
        populateCategories();
        updateGeneralStats();
        updateCategoryStats();
    } else {
        alert("Por favor, complete todos los campos correctamente.");
    }
});

// Validación de Inputs
function validateInputs(word, translation, category) {
    return word !== "" && translation !== "" && category !== "";
}

// Importar palabras desde un archivo CSV
async function handleCSVImport(event) {
    event.preventDefault();
    const fileInput = document.getElementById("csv-file");
    const file = fileInput.files[0];

    if (!file) {
        alert("Por favor, selecciona un archivo CSV.");
        return;
    }

    const reader = new FileReader();

    reader.onload = async function (e) {
        const text = e.target.result;
        const importedWords = parseCSV(text);

        if (validateImportedWords(importedWords)) {
            words.push(...importedWords);
            saveWordsToLocalStorage();
            renderWordList();
            populateCategories();
            // Recargar la pantalla "Añadir Palabras"
            showAddWords();
        } else {
            alert("El archivo CSV contiene datos inválidos.");
        }
    };

    reader.readAsText(file);
}

// Validación de Palabras Importadas
function validateImportedWords(importedWords) {
    return importedWords.length > 0 && importedWords.every(wordObj => wordObj.word !== "" && wordObj.translation !== "" && wordObj.category !== "");
}

// Guardar palabras en localStorage
function saveWordsToLocalStorage() {
    localStorage.setItem("words", JSON.stringify(words));
}

// Cargar palabras desde localStorage
function loadWordsFromLocalStorage() {
    const storedWords = localStorage.getItem("words");
    if (storedWords) {
        words = JSON.parse(storedWords);
    }
}

// Guardar historial de ejercicios en localStorage
function saveExerciseHistoryToLocalStorage() {
    localStorage.setItem("exerciseHistory", JSON.stringify(exerciseHistory));
}

// Cargar historial de ejercicios desde localStorage
function loadExerciseHistoryFromLocalStorage() {
    const storedHistory = localStorage.getItem("exerciseHistory");
    if (storedHistory) {
        exerciseHistory = JSON.parse(storedHistory);
    }
}

// Mostrar la pantalla de añadir palabras
function showAddWords() {
    document.getElementById("home-screen").classList.remove("active");
    document.getElementById("add-words-screen").classList.add("active");
    document.getElementById("exercises-screen").classList.remove("active");
    document.getElementById("statistics-screen").classList.remove("active");
    renderWordList();
    populateCategories();
}

// Mostrar la pantalla de ejercicios
function showExercises() {
    document.getElementById("home-screen").classList.remove("active");
    document.getElementById("add-words-screen").classList.remove("active");
    document.getElementById("exercises-screen").classList.add("active");
    populateCategories();
    hideExerciseContent();
}

// Mostrar la pantalla de estadísticas
function showStatistics() {
    document.getElementById("home-screen").classList.remove("active");
    document.getElementById("add-words-screen").classList.remove("active");
    document.getElementById("exercises-screen").classList.remove("active");
    document.getElementById("statistics-screen").classList.add("active");
    showGeneralStats();
}

// Volver a la pantalla principal
function goBack() {
    document.getElementById("home-screen").classList.add("active");
    document.getElementById("add-words-screen").classList.remove("active");
    document.getElementById("exercises-screen").classList.remove("active");
    document.getElementById("statistics-screen").classList.remove("active");
    clearExerciseContent();
    resetScore();
}

// Renderizar la lista de palabras agrupadas por categorías
function renderWordList() {
    const wordListElement = document.getElementById("word-list");
    wordListElement.innerHTML = "";

    const groupedWords = words.reduce((acc, wordObj) => {
        if (!acc[wordObj.category]) {
            acc[wordObj.category] = [];
        }
        acc[wordObj.category].push(wordObj);
        return acc;
    }, {});

    for (const [category, words] of Object.entries(groupedWords)) {
        const categoryElement = document.createElement("li");
        categoryElement.classList.add("category-item");
        categoryElement.innerHTML = `
            <div class="category-header" onclick="toggleCategory('${category}')">
                <strong>${category}</strong>
                <span class="toggle-icon">+</span>
            </div>
            <ul class="word-sublist hidden" id="category-${category}">
                ${words.map((wordObj, index) => `
                    <li>
                        ${wordObj.word} - ${wordObj.translation}
                        <button onclick="editWord(${index})">Editar</button>
                        <button onclick="deleteWord(${index})">Eliminar</button>
                    </li>
                `).join('')}
            </ul>
        `;
        wordListElement.appendChild(categoryElement);
    }
}

// Función para alternar la visibilidad de las categorías
function toggleCategory(category) {
    const sublist = document.getElementById(`category-${category}`);
    const toggleIcon = sublist.previousElementSibling.querySelector('.toggle-icon');
    if (sublist.classList.contains('hidden')) {
        sublist.classList.remove('hidden');
        toggleIcon.textContent = '-';
    } else {
        sublist.classList.add('hidden');
        toggleIcon.textContent = '+';
    }
}

// Editar una palabra
function editWord(index) {
    const updatedWord = prompt("Nueva palabra:", words[index].word).trim();
    const updatedTranslation = prompt("Nueva traducción:", words[index].translation).trim();
    const updatedCategory = prompt("Nueva categoría:", words[index].category).trim();

    if (validateInputs(updatedWord, updatedTranslation, updatedCategory)) {
        words[index] = { word: updatedWord, translation: updatedTranslation, category: updatedCategory };
        saveWordsToLocalStorage();
        alert("Palabra actualizada exitosamente");
        renderWordList(); // Renderizar la lista de palabras después de editar una palabra
        populateCategories();
        updateGeneralStats();
        updateCategoryStats();
    } else {
        alert("No se realizaron cambios. Por favor, complete todos los campos correctamente.");
    }
}

// Eliminar una palabra
function deleteWord(index) {
    if (confirm("¿Estás seguro de que deseas eliminar esta palabra?")) {
        words.splice(index, 1);
        saveWordsToLocalStorage();
        alert("Palabra eliminada exitosamente");
        renderWordList(); // Renderizar la lista de palabras después de eliminar una palabra
        populateCategories();
        updateGeneralStats();
        updateCategoryStats();
    }
}

// Borrar todas las palabras
function clearAllWords() {
    if (confirm("¿Estás seguro de que deseas borrar todas las palabras?")) {
        words = [];
        saveWordsToLocalStorage();
        alert("Todas las palabras han sido borradas exitosamente");
        renderWordList(); // Renderizar la lista de palabras después de borrar todas las palabras
        populateCategories();
        updateGeneralStats();
        updateCategoryStats();
    }
}

// Llenar el selector de categorías
function populateCategories() {
    const categoriesSelect = document.getElementById("categories");
    categoriesSelect.innerHTML = "";

    const uniqueCategories = [...new Set(words.map(word => word.category))];
    uniqueCategories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoriesSelect.appendChild(option);
    });
}

// Iniciar el modo Test
function startTest() {
    if (!validateCategories()) return;
    const selectedCategories = Array.from(document.getElementById("categories").selectedOptions).map(option => option.value);
    const quantity = parseInt(document.getElementById("quantity").value);
    const exerciseWords = getExerciseWords(selectedCategories, quantity);
    shuffleArray(exerciseWords); // Mezclar las palabras para mostrarlas en orden aleatorio
    startExercise(exerciseWords, "test");
}

// Iniciar el modo Escritura
function startWriting() {
    if (!validateCategories()) return;
    const selectedCategories = Array.from(document.getElementById("categories").selectedOptions).map(option => option.value);
    const quantity = parseInt(document.getElementById("quantity").value);
    const exerciseWords = getExerciseWords(selectedCategories, quantity);
    shuffleArray(exerciseWords); // Mezclar las palabras para mostrarlas en orden aleatorio
    startExercise(exerciseWords, "writing");
}

// Iniciar el modo Mixto
function startMixed() {
    if (!validateCategories()) return;
    const selectedCategories = Array.from(document.getElementById("categories").selectedOptions).map(option => option.value);
    const quantity = parseInt(document.getElementById("quantity").value);
    const exerciseWords = getExerciseWords(selectedCategories, quantity);
    shuffleArray(exerciseWords); // Mezclar las palabras para mostrarlas en orden aleatorio
    startExercise(exerciseWords, "mixed");
}

// Obtener palabras para el ejercicio
function getExerciseWords(categories, quantity) {
    const filteredWords = words.filter(word => categories.includes(word.category));
    let exerciseWords = [];

    // Mezclar las palabras filtradas para asegurar una distribución aleatoria
    shuffleArray(filteredWords);

    while (exerciseWords.length < quantity) {
        exerciseWords.push(...filteredWords);
        if (exerciseWords.length >= quantity) {
            break;
        }
    }

    return exerciseWords.slice(0, quantity);
}

// Iniciar el ejercicio
let currentQuestionIndex = 0;
let exerciseWords = [];
let exerciseType = "";
let currentWordObj = null;
let showWord = true; // Variable para rastrear si se muestra la palabra o la traducción

function startExercise(words, type) {
    exerciseWords = words;
    exerciseType = type;
    currentQuestionIndex = 0;
    hideExerciseSettings();
    showNextQuestion();
    resetScore();
}

// Ocultar configuración de ejercicios
function hideExerciseSettings() {
    document.getElementById("exercise-settings").classList.add("hidden");
    document.getElementById("exercise-content").classList.remove("hidden");
    document.getElementById("answer-input").classList.add("hidden");
    document.getElementById("submit-answer-btn").classList.add("hidden");
    document.getElementById("exercise-summary").classList.add("hidden");
    document.getElementById("progress-bar-container").classList.add("hidden");
}

// Mostrar la siguiente pregunta
function showNextQuestion() {
    if (currentQuestionIndex >= exerciseWords.length) {
        endExercise();
        return;
    }

    currentWordObj = exerciseWords[currentQuestionIndex];
    const questionElement = document.getElementById("question");
    const optionsElement = document.getElementById("options");
    const answerInputElement = document.getElementById("answer-input");
    const submitAnswerBtn = document.getElementById("submit-answer-btn");
    const resultMessageElement = document.getElementById("result-message");
    const progressBarContainer = document.getElementById("progress-bar-container");
    const progressBar = document.getElementById("progress-bar");

    questionElement.innerHTML = "";
    optionsElement.innerHTML = "";
    answerInputElement.classList.add("hidden");
    submitAnswerBtn.classList.add("hidden");
    resultMessageElement.innerHTML = "";

    // Mostrar barra de progreso
    progressBarContainer.classList.remove("hidden");
    const progressPercentage = ((currentQuestionIndex + 1) / exerciseWords.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;

    // Decidir aleatoriamente si mostrar la palabra o la traducción
    showWord = Math.random() < 0.5;

    if (exerciseType === "test" || (exerciseType === "mixed" && Math.random() < 0.5)) {
        const correctAnswer = showWord ? currentWordObj.translation : currentWordObj.word;
        const randomAnswers = getRandomAnswers(currentWordObj.category, showWord ? 'translation' : 'word', 3, correctAnswer);
        randomAnswers.push(correctAnswer);
        shuffleArray(randomAnswers);

        questionElement.innerHTML = showWord ? currentWordObj.word : currentWordObj.translation;
        randomAnswers.forEach(answer => {
            const optionButton = document.createElement("button");
            optionButton.classList.add("btn", "option");
            optionButton.innerHTML = answer;
            optionButton.onclick = () => checkAnswer(answer);
            optionsElement.appendChild(optionButton);
        });
    } else {
        questionElement.innerHTML = showWord ? currentWordObj.word : currentWordObj.translation;
        answerInputElement.classList.remove("hidden");
        submitAnswerBtn.classList.remove("hidden");
        submitAnswerBtn.onclick = () => checkAnswer(answerInputElement.value.trim());
    }

    document.getElementById('answer-input').value = '';  // Limpia el campo de texto

    currentQuestionIndex++;
}

// Obtener respuestas aleatorias para las opciones de test
function getRandomAnswers(category, type, count, correctAnswer) {
    const filteredWords = words.filter(word => word.category === category);
    const allAnswers = filteredWords.map(word => type === 'translation' ? word.translation : word.word);
    const randomAnswers = new Set();

    while (randomAnswers.size < count) {
        const randomAnswer = allAnswers[Math.floor(Math.random() * allAnswers.length)];
        if (randomAnswer !== correctAnswer) {
            randomAnswers.add(randomAnswer);
        }
    }

    return Array.from(randomAnswers);
}

// Verificar la respuesta
function checkAnswer(userAnswer) {
    const correctAnswer = showWord ? currentWordObj.translation : currentWordObj.word;
    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        score.correct++;
        showNextQuestion();
    } else {
        score.incorrect++;
        showCorrectAnswerDialog(correctAnswer);
    }
}

// Mostrar el cuadro de diálogo con la respuesta correcta
function showCorrectAnswerDialog(correctAnswer) {
    const dialog = document.getElementById("correct-answer-dialog");
    const message = document.getElementById("correct-answer-message");
    message.textContent = `La respuesta correcta es: ${correctAnswer}`;
    dialog.classList.remove("hidden");
}

// Cerrar el cuadro de diálogo y pasar a la siguiente pregunta
function closeCorrectAnswerDialog() {
    const dialog = document.getElementById("correct-answer-dialog");
    dialog.classList.add("hidden");
    showNextQuestion();
}

// Finalizar el ejercicio
function endExercise() {
    const questionElement = document.getElementById("question");
    const optionsElement = document.getElementById("options");
    const answerInputElement = document.getElementById("answer-input");
    const submitAnswerBtn = document.getElementById("submit-answer-btn");
    const resultMessageElement = document.getElementById("result-message");
    const progressBarContainer = document.getElementById("progress-bar-container");

    questionElement.textContent = "";
    optionsElement.innerHTML = "";
    answerInputElement.classList.add("hidden");
    submitAnswerBtn.classList.add("hidden");
    resultMessageElement.textContent = "";
    progressBarContainer.classList.add("hidden");

    document.getElementById("exercise-content").classList.add("hidden");
    document.getElementById("exercise-summary").classList.remove("hidden");

    document.getElementById("summary-correct").textContent = `Correctas: ${score.correct}`;
    document.getElementById("summary-incorrect").textContent = `Incorrectas: ${score.incorrect}`;

    // Mostrar análisis de fortalezas y debilidades
    analyzePerformance();
}

// Analizar el rendimiento del usuario
function analyzePerformance() {
    const summarySection = document.getElementById("exercise-summary");
    const performanceAnalysis = document.createElement("section");
    performanceAnalysis.classList.add("performance-analysis");
    performanceAnalysis.innerHTML = "<h4>Análisis de Fortalezas y Debilidades</h4>";

    const wordPerformance = {};

    exerciseHistory.forEach(entry => {
        const word = entry.word;
        if (!wordPerformance[word]) {
            wordPerformance[word] = { correct: 0, incorrect: 0 };
        }

        if (entry.isCorrect) {
            wordPerformance[word].correct++;
        } else {
            wordPerformance[word].incorrect++;
        }
    });

    // Ordenar palabras por incorrectas descendente
    const sortedWords = Object.keys(wordPerformance).sort((a, b) => wordPerformance[b].incorrect - wordPerformance[a].incorrect);

    sortedWords.forEach(word => {
        const wordResult = wordPerformance[word];
        const wordResultElement = document.createElement("p");
        wordResultElement.textContent = `Palabra: ${word}, Correctas: ${wordResult.correct}, Incorrectas: ${wordResult.incorrect}`;
        performanceAnalysis.appendChild(wordResultElement);
    });

    summarySection.appendChild(performanceAnalysis);
}

// Limpiar contenido del ejercicio
function clearExerciseContent() {
    const questionElement = document.getElementById("question");
    const optionsElement = document.getElementById("options");
    const answerInputElement = document.getElementById("answer-input");
    const submitAnswerBtn = document.getElementById("submit-answer-btn");
    const resultMessageElement = document.getElementById("result-message");
    const progressBarContainer = document.getElementById("progress-bar-container");

    questionElement.textContent = "";
    optionsElement.innerHTML = "";
    answerInputElement.classList.add("hidden");
    submitAnswerBtn.classList.add("hidden");
    resultMessageElement.textContent = "";
    progressBarContainer.classList.add("hidden");
}

// Ocultar contenido del ejercicio
function hideExerciseContent() {
    document.getElementById("exercise-settings").classList.remove("hidden");
    document.getElementById("exercise-content").classList.add("hidden");
    document.getElementById("exercise-summary").classList.add("hidden");
    document.getElementById("answer-input").classList.add("hidden");
    document.getElementById("submit-answer-btn").classList.add("hidden");
}

// Resetear la puntuación y el historial
function resetScore() {
    score.correct = 0;
    score.incorrect = 0;
    exerciseHistory = [];
}

// Función para cambiar el tema
function toggleTheme() {
    const themeSwitch = document.getElementById("theme-switch");
    if (themeSwitch.checked) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark");
    } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("theme", "light");
    }
}

// Función para cargar el tema desde localStorage
function loadThemeFromLocalStorage() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        document.getElementById("theme-switch").checked = true;
    }
}

// Actualizar estadísticas generales
function updateGeneralStats() {
    const totalWordsElement = document.getElementById("total-words");
    const totalExercisesElement = document.getElementById("total-exercises");
    const correctPercentageElement = document.getElementById("correct-percentage");

    const totalWords = words.length;
    const totalExercises = exerciseHistory.length;
    const correctPercentage = totalExercises > 0 ? ((score.correct / totalExercises) * 100).toFixed(2) + "%" : "0%";

    totalWordsElement.textContent = `Total de Palabras: ${totalWords}`;
    totalExercisesElement.textContent = `Total de Ejercicios: ${totalExercises}`;
    correctPercentageElement.textContent = `Porcentaje de Respuestas Correctas: ${correctPercentage}`;
}

// Actualizar estadísticas por categoría
function updateCategoryStats() {
    const categoryListElement = document.getElementById("category-list");
    categoryListElement.innerHTML = "";

    const categoryPerformance = {};

    exerciseHistory.forEach(entry => {
        const wordObj = words.find(word => word.word === entry.word || word.translation === entry.word);
        if (wordObj) {
            const category = wordObj.category;
            if (!categoryPerformance[category]) {
                categoryPerformance[category] = { correct: 0, incorrect: 0 };
            }

            if (entry.isCorrect) {
                categoryPerformance[category].correct++;
            } else {
                categoryPerformance[category].incorrect++;
            }
        }
    });

    Object.keys(categoryPerformance).forEach(category => {
        const categoryResult = categoryPerformance[category];
        const categoryResultElement = document.createElement("li");
        categoryResultElement.textContent = `Categoría: ${category}, Correctas: ${categoryResult.correct}, Incorrectas: ${categoryResult.incorrect}`;
        categoryListElement.appendChild(categoryResultElement);
    });
}

// Actualizar estadísticas por ejercicio
function updateExerciseStats() {
    const exerciseListElement = document.getElementById("exercise-list");
    exerciseListElement.innerHTML = "";

    exerciseHistory.forEach(entry => {
        const exerciseResultElement = document.createElement("li");
        const date = new Date(entry.date).toLocaleString();
        exerciseResultElement.textContent = `Fecha: ${date}, Palabra: ${entry.word}, Tu Respuesta: ${entry.answer}, Respuesta Correcta: ${entry.correct}, Resultado: ${entry.isCorrect ? "Correcta" : "Incorrecta"}`;
        exerciseListElement.appendChild(exerciseResultElement);
    });
}

// Mostrar estadísticas generales
function showGeneralStats() {
    document.getElementById("general-stats").classList.remove("hidden");
    document.getElementById("category-stats").classList.add("hidden");
    document.getElementById("exercise-stats").classList.add("hidden");
    updateGeneralStats();
}

// Mostrar estadísticas por categoría
function showCategoryStats() {
    document.getElementById("general-stats").classList.add("hidden");
    document.getElementById("category-stats").classList.remove("hidden");
    document.getElementById("exercise-stats").classList.add("hidden");
    updateCategoryStats();
}

// Mostrar estadísticas por ejercicio
function showExerciseStats() {
    document.getElementById("general-stats").classList.add("hidden");
    document.getElementById("category-stats").classList.add("hidden");
    document.getElementById("exercise-stats").classList.remove("hidden");
    updateExerciseStats();
}

// Función para restablecer estadísticas
function resetStats() {
    if (confirm("¿Restablecer estadísticas?")) {
        localStorage.removeItem("exerciseHistory");
        alert("Estadísticas restablecidas.");
    }
}

// Parsear CSV
function parseCSV(text) {
    const lines = text.split("\n");
    const result = [];
    for (const line of lines) {
        const [word, translation, category] = line.split(",");
        if (word && translation && category) {
            result.push({ word: word.trim(), translation: translation.trim(), category: category.trim() });
        }
    }
    return result;
}

// Función para mezclar un array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function validateCategories() {
    const categories = document.getElementById('categories');
    const errorMessage = document.getElementById('category-error');
    
    if (categories.selectedOptions.length === 0) {
        errorMessage.classList.remove('hidden');
        return false;
    }
    errorMessage.classList.add('hidden');
    return true;
}
