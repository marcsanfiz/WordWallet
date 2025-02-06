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
};

// Guardar palabra manualmente
document.getElementById("word-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const word = document.getElementById("word").value.trim();
    const translation = document.getElementById("translation").value.trim();
    const category = document.getElementById("category").value.trim();

    if (validateInputs(word, translation, category)) {
        words.push({
            word: word,
            translation: translation,
            category: category,
            interval: 1, // Intervalo inicial de repetición en días
            nextRepetition: new Date().toISOString() // Fecha de la próxima repetición
        });
        saveWordsToLocalStorage();
        alert("Palabra guardada exitosamente");
        document.getElementById("word-form").reset();
        renderWordList();
        populateCategories();
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
        alert("Por favor, seleccione un archivo CSV.");
        return;
    }

    const reader = new FileReader();

    reader.onload = async function (e) {
        const text = e.target.result;
        const csvRows = text.split("\n");

        const importedWords = csvRows.map(row => {
            const [word, translation, category] = row.split(",");
            return {
                word: word.trim(),
                translation: translation.trim(),
                category: category.trim(),
                interval: 1, // Intervalo inicial de repetición en días
                nextRepetition: new Date().toISOString() // Fecha de la próxima repetición
            };
        }).filter(wordObj => wordObj.word && wordObj.translation && wordObj.category);

        if (validateImportedWords(importedWords)) {
            words = [...words, ...importedWords];
            saveWordsToLocalStorage();
            alert(`${importedWords.length} palabras importadas exitosamente.`);
            renderWordList();
            populateCategories();
        } else {
            alert("El archivo CSV no contiene palabras válidas.");
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

// Renderizar la lista de palabras
function renderWordList() {
    const wordListElement = document.getElementById("word-list");
    wordListElement.innerHTML = "";

    words.forEach((wordObj, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${wordObj.word} - ${wordObj.translation} (${wordObj.category})`;

        const editButton = document.createElement("button");
        editButton.textContent = "Editar";
        editButton.onclick = () => editWord(index);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Eliminar";
        deleteButton.onclick = () => deleteWord(index);

        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);
        wordListElement.appendChild(listItem);
    });
}

// Editar una palabra
function editWord(index) {
    const updatedWord = prompt("Nueva palabra:", words[index].word).trim();
    const updatedTranslation = prompt("Nueva traducción:", words[index].translation).trim();
    const updatedCategory = prompt("Nueva categoría:", words[index].category).trim();

    if (validateInputs(updatedWord, updatedTranslation, updatedCategory)) {
        words[index] = {
            word: updatedWord,
            translation: updatedTranslation,
            category: updatedCategory,
            interval: words[index].interval, // Mantener el intervalo actual
            nextRepetition: words[index].nextRepetition // Mantener la fecha de próxima repetición actual
        };
        saveWordsToLocalStorage();
        alert("Palabra actualizada exitosamente");
        renderWordList();
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
        renderWordList();
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
    const selectedCategories = Array.from(document.getElementById("categories").selectedOptions).map(option => option.value);
    const quantity = parseInt(document.getElementById("quantity").value);
    const exerciseWords = getExerciseWords(selectedCategories, quantity);
    shuffleArray(exerciseWords); // Mezclar las palabras para mostrarlas en orden aleatorio
    startExercise(exerciseWords, "test");
}

// Iniciar el modo Escritura
function startWriting() {
    const selectedCategories = Array.from(document.getElementById("categories").selectedOptions).map(option => option.value);
    const quantity = parseInt(document.getElementById("quantity").value);
    const exerciseWords = getExerciseWords(selectedCategories, quantity);
    shuffleArray(exerciseWords); // Mezclar las palabras para mostrarlas en orden aleatorio
    startExercise(exerciseWords, "writing");
}

// Iniciar el modo Mixto
function startMixed() {
    const selectedCategories = Array.from(document.getElementById("categories").selectedOptions).map(option => option.value);
    const quantity = parseInt(document.getElementById("quantity").value);
    const exerciseWords = getExerciseWords(selectedCategories, quantity);
    shuffleArray(exerciseWords); // Mezclar las palabras para mostrarlas en orden aleatorio
    startExercise(exerciseWords, "mixed");
}

// Obtener palabras para el ejercicio
function getExerciseWords(categories, quantity) {
    const filteredWords = words.filter(word => categories.includes(word.category));

    // Ordenar palabras por fecha de próxima repetición
    filteredWords.sort((a, b) => new Date(a.nextRepetition) - new Date(b.nextRepetition));

    let exerciseWords = [];

    while (exerciseWords.length < quantity) {
        if (filteredWords.length === 0) {
            break; // Evitar bucle infinito si no hay suficientes palabras
        }

        const randomIndex = Math.floor(Math.random() * filteredWords.length);
        const randomWord = filteredWords[randomIndex];

        // Asegurarse de que la palabra no esté ya en el ejercicio
        if (!exerciseWords.some(exWord => exWord.word === randomWord.word && exWord.translation === randomWord.translation)) {
            exerciseWords.push(randomWord);
        }

        // Eliminar la palabra temporalmente para evitar duplicados
        filteredWords.splice(randomIndex, 1);
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

    if (exerciseType === "test") {
        const correctAnswer = showWord ? currentWordObj.word : currentWordObj.translation; // Palabra o traducción correcta
        const category = currentWordObj.category; // Categoría de la palabra/traducción correcta
        const allAnswers = getUniqueOptions(category, correctAnswer, 3, !showWord); // Obtener opciones únicas
        allAnswers.push(correctAnswer); // Añadir la respuesta correcta
        shuffleArray(allAnswers); // Mezclar las opciones

        questionElement.textContent = showWord ?
            `¿Cuál es la palabra para "${currentWordObj.translation}"?` :
            `¿Qué significa "${currentWordObj.word}"?`;

        allAnswers.forEach(answer => {
            const button = document.createElement("button");
            button.textContent = answer;
            button.onclick = () => checkAnswer(answer);
            optionsElement.appendChild(button);
        });
    } else if (exerciseType === "writing") {
        questionElement.textContent = showWord ?
            `Escribe la traducción de "${currentWordObj.word}"` :
            `Escribe la palabra para "${currentWordObj.translation}"`;
        answerInputElement.classList.remove("hidden");
        submitAnswerBtn.classList.remove("hidden");
        answerInputElement.value = ""; // Limpiar el campo de entrada
        submitAnswerBtn.onclick = () => checkAnswer(); // Asignar evento onclick al botón de envío
    } else if (exerciseType === "mixed") {
        const randomType = Math.random() < 0.5 ? "test" : "writing";
        if (randomType === "test") {
            const correctAnswer = showWord ? currentWordObj.word : currentWordObj.translation;
            const category = currentWordObj.category;
            const allAnswers = getUniqueOptions(category, correctAnswer, 3, !showWord);
            allAnswers.push(correctAnswer);
            shuffleArray(allAnswers);

            questionElement.textContent = showWord ?
                `¿Cuál es la palabra para "${currentWordObj.translation}"?` :
                `¿Qué significa "${currentWordObj.word}"?`;

            allAnswers.forEach(answer => {
                const button = document.createElement("button");
                button.textContent = answer;
                button.onclick = () => checkAnswer(answer);
                optionsElement.appendChild(button);
            });
        } else if (randomType === "writing") {
            questionElement.textContent = showWord ?
                `Escribe la traducción de "${currentWordObj.word}"` :
                `Escribe la palabra para "${currentWordObj.translation}"`;
            answerInputElement.classList.remove("hidden");
            submitAnswerBtn.classList.remove("hidden");
            answerInputElement.value = ""; // Limpiar el campo de entrada
            submitAnswerBtn.onclick = () => checkAnswer(); // Asignar evento onclick al botón de envío
        }
    }
}

// Obtener opciones únicas para el modo Test
function getUniqueOptions(category, correctAnswer, count, isWord) {
    const filteredWords = words.filter(word => word.category === category); // Filtrar palabras por categoría
    const options = [];

    while (options.length < count) {
        const randomWord = filteredWords[Math.floor(Math.random() * filteredWords.length)];
        const option = isWord ? randomWord.word : randomWord.translation; // Elegir palabra o traducción según el caso

        if (!options.includes(option) && option !== correctAnswer) {
            options.push(option);
        }
    }

    return options;
}

// Mezclar un array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Verificar la respuesta
function checkAnswer(userAnswer) {
    const questionElement = document.getElementById("question");
    const resultMessageElement = document.getElementById("result-message");

    // Determinar la respuesta correcta basada en lo que se pide (palabra o traducción)
    const correctAnswer = showWord ? currentWordObj.word : currentWordObj.translation;

    // Si userAnswer es undefined, obtener el valor del campo de entrada
    if (userAnswer === undefined) {
        userAnswer = document.getElementById("answer-input").value.trim();
    }

    // Comparar la respuesta del usuario con la respuesta correcta (sin distinguir mayúsculas/minúsculas)
    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();

    if (isCorrect) {
        resultMessageElement.textContent = "Respuesta correcta!";
        resultMessageElement.style.color = "green";
        resultMessageElement.classList.add("fade-in", "correct");
        score.correct++;

        // Actualizar intervalo de repetición
        updateRepetitionInterval(currentWordObj, true);
    } else {
        resultMessageElement.textContent = `Incorrecto. La respuesta correcta era "${correctAnswer}".`;
        resultMessageElement.style.color = "red";
        resultMessageElement.classList.add("fade-in", "incorrect");
        score.incorrect++;

        // Actualizar intervalo de repetición
        updateRepetitionInterval(currentWordObj, false);
    }

    // Guardar resultado en el historial
    exerciseHistory.push({
        date: new Date().toISOString(),
        word: showWord ? currentWordObj.word : currentWordObj.translation,
        answer: userAnswer,
        correct: correctAnswer,
        isCorrect: isCorrect
    });

    setTimeout(() => {
        resultMessageElement.classList.remove("fade-in", "correct", "incorrect");
        currentQuestionIndex++;
        showNextQuestion();
    }, 1500);
}

// Actualizar intervalo de repetición
function updateRepetitionInterval(wordObj, isCorrect) {
    if (isCorrect) {
        // Incrementar el intervalo de repetición
        wordObj.interval *= 2;
    } else {
        // Reiniciar el intervalo de repetición
        wordObj.interval = 1;
    }

    // Calcular la fecha de la próxima repetición
    const currentDate = new Date();
    const nextRepetitionDate = new Date(currentDate);
    nextRepetitionDate.setDate(currentDate.getDate() + wordObj.interval);
    wordObj.nextRepetition = nextRepetitionDate.toISOString();

    // Guardar palabras actualizadas en localStorage
    saveWordsToLocalStorage();
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

    document.getElementById("summary-total-words").textContent = words.length;
    document.getElementById("summary-correct").textContent = score.correct;
    document.getElementById("summary-incorrect").textContent = score.incorrect;
    document.getElementById("summary-correct-percentage").textContent = `${((score.correct / exerciseWords.length) * 100).toFixed(2)}%`;

    // Mostrar análisis de fortalezas y debilidades
    analyzePerformance();
}

// Analizar el rendimiento del usuario
function analyzePerformance() {
    const performanceAnalysis = document.getElementById("performance-analysis");
    performanceAnalysis.classList.remove("hidden");

    // Análisis por categoría
    const categoryPerformance = {};
    exerciseWords.forEach((wordObj, index) => {
        const category = wordObj.category;
        if (!categoryPerformance[category]) {
            categoryPerformance[category] = { correct: 0, incorrect: 0 };
        }

        if (exerciseHistory[index].isCorrect) {
            categoryPerformance[category].correct++;
        } else {
            categoryPerformance[category].incorrect++;
        }
    });

    const categoryListElement = document.getElementById("category-list");
    categoryListElement.innerHTML = "";

    Object.keys(categoryPerformance).forEach(category => {
        const categoryResult = categoryPerformance[category];
        const categoryResultElement = document.createElement("li");
        categoryResultElement.textContent = `Categoría: ${category}, Correctas: ${categoryResult.correct}, Incorrectas: ${categoryResult.incorrect}`;
        categoryListElement.appendChild(categoryResultElement);
    });

    // Análisis de palabras más fáciles y difíciles
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

    const wordListPerformanceElement = document.getElementById("word-list-performance");
    wordListPerformanceElement.innerHTML = "";

    // Ordenar palabras por incorrectas (más difíciles primero)
    const sortedWords = Object.entries(wordPerformance).sort((a, b) => b[1].incorrect - a[1].incorrect);

    sortedWords.forEach(([word, stats]) => {
        const wordResultElement = document.createElement("li");
        wordResultElement.textContent = `Palabra: ${word}, Correctas: ${stats.correct}, Incorrectas: ${stats.incorrect}`;
        wordListPerformanceElement.appendChild(wordResultElement);
    });

    // Guardar historial de ejercicios en localStorage
    saveExerciseHistoryToLocalStorage();
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
    document.getElementById("performance-analysis").classList.add("hidden");
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

// Mostrar estadísticas generales
function showGeneralStats() {
    document.getElementById("general-stats").classList.remove("hidden");
    document.getElementById("category-stats").classList.add("hidden");
    document.getElementById("exercise-stats").classList.add("hidden");

    const totalWords = words.length;
    const totalExercises = exerciseHistory.length;
    const correctPercentage = totalExercises > 0 ?
        `${((exerciseHistory.filter(entry => entry.isCorrect).length / totalExercises) * 100).toFixed(2)}%` :
        "0%";

    document.getElementById("total-words").textContent = `Total de Palabras: ${totalWords}`;
    document.getElementById("total-exercises").textContent = `Total de Ejercicios: ${totalExercises}`;
    document.getElementById("correct-percentage").textContent = `Porcentaje de Respuestas Correctas: ${correctPercentage}`;
}

// Mostrar estadísticas por categoría
function showCategoryStats() {
    document.getElementById("general-stats").classList.add("hidden");
    document.getElementById("category-stats").classList.remove("hidden");
    document.getElementById("exercise-stats").classList.add("hidden");

    const categoryPerformance = {};
    exerciseHistory.forEach(entry => {
        const category = words.find(word => word.word === entry.word || word.translation === entry.word)?.category;
        if (!categoryPerformance[category]) {
            categoryPerformance[category] = { correct: 0, incorrect: 0 };
        }

        if (entry.isCorrect) {
            categoryPerformance[category].correct++;
        } else {
            categoryPerformance[category].incorrect++;
        }
    });

    const categoryListElement = document.getElementById("category-list");
    categoryListElement.innerHTML = "";

    Object.keys(categoryPerformance).forEach(category => {
        const categoryResult = categoryPerformance[category];
        const categoryResultElement = document.createElement("li");
        categoryResultElement.textContent = `Categoría: ${category}, Correctas: ${categoryResult.correct}, Incorrectas: ${categoryResult.incorrect}`;
        categoryListElement.appendChild(categoryResultElement);
    });
}

// Mostrar estadísticas por ejercicio
function showExerciseStats() {
    document.getElementById("general-stats").classList.add("hidden");
    document.getElementById("category-stats").classList.add("hidden");
    document.getElementById("exercise-stats").classList.remove("hidden");

    const exerciseListElement = document.getElementById("exercise-list");
    exerciseListElement.innerHTML = "";

    exerciseHistory.forEach(entry => {
        const entryElement = document.createElement("li");
        entryElement.textContent = `Fecha: ${new Date(entry.date).toLocaleDateString()}, Pregunta: ${entry.word}, Tu Respuesta: ${entry.answer}, Respuesta Correcta: ${entry.correct}, Resultado: ${entry.isCorrect ? "Correcta" : "Incorrecta"}`;
        exerciseListElement.appendChild(entryElement);
    });
}