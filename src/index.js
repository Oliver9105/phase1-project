const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");
const resultsDiv = document.getElementById("results");
const noResultsDiv = document.getElementById("no-results");
const favoritesDiv = document.getElementById("favorites");
const clearFavoritesButton = document.getElementById("clear-favorites-button");
const toggleDarkModeButton = document.getElementById("toggle-dark-mode");
const featuredProductsContainer = document.getElementById(
  "featured-products-container"
);

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const toggleDarkModeElements = (isDarkMode) => {
  const elements = document.querySelectorAll(
    ".product-details, .favorite-item"
  );
  elements.forEach((element) => {
    if (isDarkMode) {
      element.classList.add("dark-mode");
    } else {
      element.classList.remove("dark-mode");
    }
  });
};

const isDarkMode = localStorage.getItem("dark-mode") === "enabled";
if (isDarkMode) {
  document.body.classList.add("dark-mode");
  toggleDarkModeElements(true);
}

const fetchProducts = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    noResultsDiv.style.display = "block";
  }
};

const fetchAndDisplayProducts = async (query) => {
  const data = await fetchProducts(
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1`
  );
  displayProducts(data?.products || []);
};

const fetchFeaturedProducts = async () => {
  const data = await fetchProducts(
    "https://world.openfoodfacts.org/cgi/search.pl?sort_by=popularity&json=1&action=process"
  );
  if (data?.products) {
    displayFeaturedProducts(data.products.slice(0, 4));
  }
};

const displayProducts = (products) => {
  resultsDiv.innerHTML = "";
  if (products.length > 0) {
    noResultsDiv.style.display = "none";
    products.forEach((product) =>
      createProductElement(product, resultsDiv, true)
    );
    attachButtonListeners();
  } else {
    noResultsDiv.style.display = "block";
  }
};

const displayFeaturedProducts = (products) => {
  featuredProductsContainer.innerHTML = "";
  products.forEach((product) =>
    createProductElement(product, featuredProductsContainer, false)
  );
};

const createProductElement = (product, container, isSearchResult) => {
  const productDiv = document.createElement("div");
  productDiv.classList.add("product-item");
  productDiv.innerHTML = `
        <h3>${product.product_name || "Unknown"}</h3>
        <img src="${
          product.image_url || "https://via.placeholder.com/150"
        }" alt="${product.product_name || "Image not available"}">
        <button class="view-details" data-id="${
          product.code
        }">View Details</button>
        ${
          isSearchResult
            ? `<button class="favorite-button" data-id="${product.code}">${
                favorites.includes(product.code)
                  ? "Remove from Favorites"
                  : "Add to Favorites"
              }</button>`
            : ""
        }
    `;
  container.appendChild(productDiv);
};

searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) {
    fetchAndDisplayProducts(query);
  } else {
    alert("Please enter a product name.");
  }
});

const viewProductDetails = async (productId) => {
  const data = await fetchProducts(
    `https://world.openfoodfacts.org/api/v0/product/${productId}.json`
  );
  if (data?.product) {
    const product = data.product;
    const detailsDiv = document.createElement("div");
    detailsDiv.classList.add("product-details");
    detailsDiv.innerHTML = `
            <h2>${product.product_name || "Unknown"}</h2>
            <img src="${
              product.image_url || "https://via.placeholder.com/150"
            }" alt="${product.product_name || "Image not available"}">
            <p><strong>Brand:</strong> ${product.brands || "Unknown"}</p>
            <p><strong>Ingredients:</strong> ${
              product.ingredients_text || "N/A"
            }</p>
            <p><strong>Nutrition:</strong> ${
              product.nutriments ? JSON.stringify(product.nutriments) : "N/A"
            }</p>
            <button id="close-details">Close</button>
        `;
    resultsDiv.innerHTML = "";
    resultsDiv.appendChild(detailsDiv);
    document.getElementById("close-details").addEventListener("click", () => {
      resultsDiv.innerHTML = "";
    });
  }
};

const attachButtonListeners = () => {
  document.querySelectorAll(".favorite-button").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.getAttribute("data-id");
      toggleFavorite(productId);
      button.innerText = favorites.includes(productId)
        ? "Remove from Favorites"
        : "Add to Favorites";
    });
  });

  document.querySelectorAll(".view-details").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.getAttribute("data-id");
      viewProductDetails(productId);
    });
  });
};

const toggleFavorite = (productId) => {
  favorites = favorites.includes(productId)
    ? favorites.filter((id) => id !== productId)
    : [...favorites, productId];
  localStorage.setItem("favorites", JSON.stringify(favorites));
  displayFavorites();
};

const displayFavorites = () => {
  favoritesDiv.innerHTML = "";
  if (favorites.length > 0) {
    favorites.forEach(async (productId) => {
      const data = await fetchProducts(
        `https://world.openfoodfacts.org/api/v0/product/${productId}.json`
      );
      if (data?.product) {
        createProductElement(data.product, favoritesDiv, false);
      }
    });
  } else {
    favoritesDiv.innerHTML = "<p>No favorites added.</p>";
  }
};

clearFavoritesButton.addEventListener("click", () => {
  favorites = [];
  localStorage.removeItem("favorites");
  displayFavorites();
});

toggleDarkModeButton.addEventListener("click", () => {
  const isDarkMode = document.body.classList.toggle("dark-mode");
  localStorage.setItem("dark-mode", isDarkMode ? "enabled" : "disabled");
  toggleDarkModeElements(isDarkMode);
});

displayFavorites();
fetchFeaturedProducts();
