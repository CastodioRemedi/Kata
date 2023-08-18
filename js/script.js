// Выбираем DOM-элементы
const searchInput = document.querySelector("input");
const searchBlockResults = document.querySelector(".search-block__results");
const saved = document.querySelector(".saved");

// Функция debounce позволяет откладывать вызов переданной функции на заданный промежуток времени
const debounce = (fn, debounceTime) => {
  let inDebounce;
  return function () {
    clearTimeout(inDebounce);
    inDebounce = setTimeout(() => fn.apply(this, arguments), debounceTime);
  };
};

// Функция для удаления результатов поиска
const removeResults = () => {
  searchBlockResults.innerHTML = "";
};

// Функция для генерации HTML-кода информации о репозитории
const showResultInfo = (name, owner, stars) => {
  return `
    <div class="saved__info">
      <p>Name: ${name}</p>
      <p>Owner: ${owner}</p>
      <p>Stars: ${stars}</p>
    </div>
  `;
};

// Функция для сохранения результата поиска
const saveResult = (name, owner, stars) => {
  const resultDiv = document.createElement("div");
  resultDiv.classList.add("saved__result");
  resultDiv.innerHTML = `
    ${showResultInfo(name, owner, stars)}
    <button class="remove-btn">Remove</button>
  `;
  saved.appendChild(resultDiv);
};

// Функция для асинхронного получения результатов поиска с GitHub API
const fetchSearchResults = async (repositorySearch) => {
  const searchUrl = new URL("https://api.github.com/search/repositories");
  searchUrl.searchParams.append("q", repositorySearch);

  try {
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const searchResults = await response.json();
    return searchResults.items.slice(0, 5); // Возвращаем только первые 5 результатов
  } catch (err) {
    console.error("Error fetching search results:", err);
    return [];
  }
};

// Функция-обертка для получения результатов поиска с задержкой (500 мс)
const getSearchResults = debounce(async () => {
  const repositorySearch = searchInput.value.trim();
  if (repositorySearch === "") {
    removeResults();
    return;
  }

  const searchResults = await fetchSearchResults(repositorySearch);
  removeResults();

  // Отображаем результаты поиска
  for (const result of searchResults) {
    const { name, owner, stargazers_count: stars } = result;
    const resultDiv = document.createElement("div");
    resultDiv.classList.add("search-block__result");
    resultDiv.dataset.owner = owner.login;
    resultDiv.dataset.stars = stars;
    resultDiv.textContent = name;
    searchBlockResults.appendChild(resultDiv);
  }
}, 500);

// Слушатель события ввода в поле поиска
searchInput.addEventListener("input", getSearchResults);

// Слушатель события клика на результате поиска
searchBlockResults.addEventListener("click", (evt) => {
  const targetResult = evt.target.closest(".search-block__result");
  if (targetResult) {
    const { owner, stars } = targetResult.dataset;
    saveResult(targetResult.textContent, owner, stars);
    searchInput.value = "";
    removeResults();
  }
});

// Слушатель события клика на кнопке "Remove" в сохраненных результатах
saved.addEventListener("click", (evt) => {
  if (evt.target.classList.contains("remove-btn")) {
    evt.target.parentElement.remove(); // Удаляем родительский элемент кнопки
  }
});