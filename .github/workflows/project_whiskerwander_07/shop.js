document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    const amountSpan = document.getElementById('amount');
    const sortDropdown = document.querySelector('.sort-dropdown');
    let products = []; // Store products globally to avoid refetching

    // Function to fetch and display products from Firestore
    async function fetchProducts() {
        try {
            const snapshot = await db.collection("shop").get();
            products = snapshot.docs.map(doc => doc.data());
            amountSpan.innerHTML = products.length;
            
            // Apply the initial sorting based on the default selected option
            const initialSortValue = sortDropdown.value;
            sortProducts(initialSortValue);
        } catch (error) {
            console.error("Error fetching products:", error);
            productGrid.innerHTML = '<p>Error loading products. Please try again later.</p>';
        }
    }

    // Function to display products in the grid
    function displayProducts(productsToDisplay) {
        // Clear existing product cards
        productGrid.innerHTML = '';

        // Create product cards dynamically
        productsToDisplay.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.product}" id="image">
                <div id="account">${product.account}</div>
                <h3 id="Product">${product.product}</h3>
                <p class="price" id="price">NT${product.price}</p>
                <div id="details">${product.details}</div>
                <button class="add-to-cart">Add to Cart</button>
            `;

            productGrid.appendChild(productCard);
        });
    }

    // Add event listener for sorting dropdown
    sortDropdown.addEventListener('change', () => {
        const sortValue = sortDropdown.value;
        sortProducts(sortValue);
    });

    // Function to sort products based on selected option
    function sortProducts(sortValue) {
        let sortedProducts = [...products]; // Create a copy to avoid modifying the original array
        
        switch (sortValue) {
            case 'price-low':
                // Sort by price low to high - ensure we're using numeric comparison
                sortedProducts.sort((a, b) => {
                    // Remove any non-numeric characters from price and convert to number
                    const priceA = parseFloat(a.price.toString().replace(/[^0-9.-]+/g, ''));
                    const priceB = parseFloat(b.price.toString().replace(/[^0-9.-]+/g, ''));
                    return priceA - priceB;
                });
                break;
            case 'price-high':
                // Sort by price high to low - ensure we're using numeric comparison
                sortedProducts.sort((a, b) => {
                    // Remove any non-numeric characters from price and convert to number
                    const priceA = parseFloat(a.price.toString().replace(/[^0-9.-]+/g, ''));
                    const priceB = parseFloat(b.price.toString().replace(/[^0-9.-]+/g, ''));
                    return priceB - priceA;
                });
                break;
            case 'recommended':
            default:
                // Default sort (recommended) - no sorting needed as it's the original order
                break;
        }
        
        // Display the sorted products
        displayProducts(sortedProducts);
    }

    // Call fetchProducts when the page loads
    fetchProducts();
});