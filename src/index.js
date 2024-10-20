const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const resultsDiv = document.getElementById('results');
const noResultsDiv = document.getElementById('no-results');
const favoritesDiv = document.getElementById('favorites');
const toggleDarkModeButton = document.getElementById('toggle-dark-mode');

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];


if (localStorage.getItem('dark-mode') === 'enabled') {
    document.body.classList.add('dark-mode');
    document.getElementById('app').classList.add('dark-mode');
    resultsDiv.classList.add('dark-mode');
    favoritesDiv.classList.add('dark-mode'); 
}


async function fetchProduct(productCode) {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${productCode}.json`);
    const data = await response.json();
    return data;
}


function createProductElement(product, isFavorite = false) {
    const productDiv = document.createElement('div');
    productDiv.className = isFavorite ? 'favorite' : 'product';

   
    if (document.body.classList.contains('dark-mode')) {
        productDiv.classList.add('dark-mode');
    }

    productDiv.innerHTML = `
        <h3>${product.product_name || 'Unknown Product'}</h3>
        <p>Brand: ${product.brands || 'N/A'}</p>
        <p>Ingredients: ${product.ingredients_text || 'N/A'}</p>
        <img src="${product.image_url || ''}" alt="${product.product_name || 'Product Image'}" class="product-image">
        <button class="favorite" onclick="toggleFavorite('${product.code}')">Favorite</button>
    `;
    return productDiv;
}


function renderResults(product) {
    resultsDiv.innerHTML = '';
    if (!product || product.status !== 1) {
        noResultsDiv.style.display = 'block';
        return;
    }
    noResultsDiv.style.display = 'none';
    const productElement = createProductElement(product.product);
    resultsDiv.appendChild(productElement);
}


searchButton.addEventListener('click', async () => {
    const productCode = searchInput.value.trim();
    if (productCode) {
        const data = await fetchProduct(productCode);
        renderResults(data);
    } else {
        noResultsDiv.style.display = 'block';
    }
});


async function toggleFavorite(productCode) {
    const productData = await fetchProduct(productCode);
    if (!productData || productData.status !== 1) return;

    const existingIndex = favorites.findIndex(fav => fav.code === productCode);
    if (existingIndex !== -1) {
        favorites.splice(existingIndex, 1);
    } else {
        favorites.push({
            code: productCode,
            product: {
                product_name: productData.product.product_name,
                brands: productData.product.brands,
                ingredients_text: productData.product.ingredients_text,
                image_url: productData.product.image_url
            }
        });
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites();
}


function renderFavorites() {
    favoritesDiv.innerHTML = '';
    favorites.forEach(fav => {
        if (fav.product) {
            const favoriteItem = createProductElement(fav.product, true);
            favoritesDiv.appendChild(favoriteItem);
        }
    });
}


document.getElementById('clear-favorites-button').addEventListener('click', () => {
    favorites = [];
    localStorage.removeItem('favorites');
    renderFavorites();
});


toggleDarkModeButton.addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    document.getElementById('app').classList.toggle('dark-mode');
    resultsDiv.classList.toggle('dark-mode');
    favoritesDiv.classList.toggle('dark-mode');

    
    const products = resultsDiv.querySelectorAll('.product, .favorite');
    products.forEach(product => product.classList.toggle('dark-mode'));

    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => button.classList.toggle('dark-mode'));

    
    localStorage.setItem('dark-mode', isDarkMode ? 'enabled' : 'disabled');
});


renderFavorites();
