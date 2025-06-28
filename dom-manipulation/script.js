let quotes = [];

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    quotes = [
      { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", category: "Adventure" }
    ];
  }
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const lastFilter = localStorage.getItem("lastSelectedFilter");
  if (lastFilter) {
    categoryFilter.value = lastFilter;
  }
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastSelectedFilter", selectedCategory);

  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  const display = document.getElementById("quoteDisplay");

  if (filtered.length === 0) {
    display.textContent = "No quotes available for this category.";
  } else {
    const randomIndex = Math.floor(Math.random() * filtered.length);
    const quote = filtered[randomIndex];
    display.textContent = `"${quote.text}" — ${quote.category}`;
    sessionStorage.setItem("lastViewedQuote", display.textContent);
  }
}

function showRandomQuote() {
  const display = document.getElementById("quoteDisplay");
  if (quotes.length === 0) {
    display.textContent = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  display.textContent = `"${quote.text}" — ${quote.category}`;
  sessionStorage.setItem("lastViewedQuote", display.textContent);
}

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
  saveQuotes();
  populateCategories();
  filterQuotes();
  textInput.value = "";
  categoryInput.value = "";
  alert("Quote added successfully!");
}

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

function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch (err) {
      alert("Error reading file: " + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ========== Server Sync Logic ==========

// Fetch quotes from server (mock)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
    const serverData = await response.json();

    const serverQuotes = serverData.map(post => ({
      text: post.title,
      category: "Server"
    }));

    return serverQuotes;
  } catch (err) {
    showNotification("Failed to fetch server data.", true);
    return [];
  }
}

function syncQuotesWithServer(serverQuotes) {
  let updated = false;

  serverQuotes.forEach(sq => {
    const exists = quotes.some(local => local.text === sq.text && local.category === sq.category);
    if (!exists) {
      quotes.push(sq);
      updated = true;
    }
  });

  if (updated) {
    saveQuotes();
    populateCategories();
    filterQuotes();
    showNotification("Synced with server. New quotes added.");
  } else {
    showNotification("No new quotes from server.");
  }
}

function showNotification(message, isError = false) {
  const notif = document.getElementById("notification");
  notif.style.color = isError ? "red" : "green";
  notif.textContent = message;
  setTimeout(() => notif.textContent = "", 5000);
}

async function syncNow() {
  const serverQuotes = await fetchQuotesFromServer();
  syncQuotesWithServer(serverQuotes);
}

function startAutoSync() {
  setInterval(syncNow, 30000); // every 30 seconds
}

// POST quotes to server (mock)
async function postQuotesToServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(quotes)
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    showNotification("Quotes posted to server successfully!");
    return data;
  } catch (error) {
    showNotification("Failed to post quotes to server.", true);
  }
}

// ========== Init ==========

loadQuotes();
populateCategories();
createAddQuoteForm();
filterQuotes();

const lastViewed = sessionStorage.getItem("lastViewedQuote");
if (lastViewed) {
  document.getElementById("quoteDisplay").textContent = lastViewed;
}

document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("exportBtn").addEventListener("click", exportToJson);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);
document.getElementById("syncBtn").addEventListener("click", syncNow);
document.getElementById("postBtn").addEventListener("click", postQuotesToServer);
startAutoSync();
