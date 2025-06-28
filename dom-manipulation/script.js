const quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", category: "Adventure" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");

// Populate category dropdown
function updateCategoryOptions() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = '<option value="all">All</option>';
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

// Show a random quote
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
}

// Add a new quote to the list
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text, category });
  textInput.value = "";
  categoryInput.value = "";

  updateCategoryOptions();
  alert("Quote added successfully!");
}

// Dynamically create the form to add a new quote
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const heading = document.createElement("h2");
  heading.textContent = "Add a New Quote";

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.id = "addQuoteBtn";
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(heading);
  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// Initialize app
updateCategoryOptions();
newQuoteBtn.addEventListener("click", showRandomQuote);
createAddQuoteForm();
