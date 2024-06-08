const listProductHTML = document.querySelector('.listProduct');
const listCartHTML = document.querySelector('.listCart');
const iconCart = document.querySelector('.icon-cart');
const iconCartSpan = document.querySelector('.icon-cart span');
const body = document.querySelector('body');
const closeCart = document.querySelector('.close');

const USD_TO_INR = 75; // Conversion rate from USD to INR

let products = [];
let cart = [];

// Toggle cart visibility
const toggleCartVisibility = () => {
    body.classList.toggle('showCart');
}

iconCart.addEventListener('click', toggleCartVisibility);
closeCart.addEventListener('click', toggleCartVisibility);

// Add products to the HTML
const addDataToHTML = (filteredProducts = products) => {
    listProductHTML.innerHTML = '';

    if (filteredProducts.length > 0) {
        filteredProducts.forEach(product => {
            const newProduct = document.createElement('div');
            newProduct.dataset.id = product.id;
            newProduct.classList.add('item');
            newProduct.innerHTML = `
                <img src="${product.image}" alt="">
                <h2>${product.name}</h2>
                <div class="price">₹${product.price.toLocaleString()}</div>
                <button class="addCart">Add To Cart</button>
            `;
            listProductHTML.appendChild(newProduct);
        });
    }
}

// Add product to cart
const addToCart = (product_id) => {
    const productIndexInCart = cart.findIndex(item => item.product_id == product_id);

    if (productIndexInCart === -1) {
        cart.push({ product_id, quantity: 1 });
    } else {
        cart[productIndexInCart].quantity += 1;
    }

    updateCartDisplay();
    saveCartToMemory();
}

// Remove product from cart
const removeFromCart = (product_id) => {
    const productIndexInCart = cart.findIndex(item => item.product_id == product_id);

    if (productIndexInCart !== -1) {
        cart[productIndexInCart].quantity -= 1;

        if (cart[productIndexInCart].quantity <= 0) {
            cart.splice(productIndexInCart, 1);
        }
    }

    updateCartDisplay();
    saveCartToMemory();
}

// Save cart to local storage
const saveCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart display in HTML
const updateCartDisplay = () => {
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;
    let totalPrice = 0;

    if (cart.length > 0) {
        cart.forEach(item => {
            totalQuantity += item.quantity;

            const product = products.find(p => p.id == item.product_id);
            const itemPrice = product.price * item.quantity;
            totalPrice += itemPrice;

            const newItem = document.createElement('div');
            newItem.classList.add('item');
            newItem.dataset.id = item.product_id;
            newItem.innerHTML = `
                <div class="image">
                    <img src="${product.image}">
                </div>
                <div class="name">${product.name}</div>
                <div class="totalPrice">₹${itemPrice.toFixed(2)}</div>
                <div class="quantity">
                    <span class="minus">-</span>
                    <span>${item.quantity}</span>
                    <span class="plus">+</span>
                </div>
            `;
            listCartHTML.appendChild(newItem);
        });
    }

    iconCartSpan.innerText = totalQuantity;

    // Add total amount display
    const totalAmountElement = document.createElement('div');
    totalAmountElement.classList.add('totalAmount');
    totalAmountElement.innerHTML = `Total Amount: ₹${totalPrice.toFixed(2)}`;
    listCartHTML.appendChild(totalAmountElement);
}

// Change product quantity in cart
const changeCartQuantity = (product_id, action) => {
    if (action === 'plus') {
        addToCart(product_id);
    } else if (action === 'minus') {
        removeFromCart(product_id);
    }
}

// Initialize app
const initApp = () => {
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            products = data;
            addDataToHTML();

            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                cart = JSON.parse(savedCart);
                updateCartDisplay();
            }
            initializeSearch();
        });
}

// Event delegation for product list
listProductHTML.addEventListener('click', (event) => {
    if (event.target.classList.contains('addCart')) {
        const product_id = event.target.parentElement.dataset.id;
        addToCart(product_id);
    }
});

// Event delegation for cart list
listCartHTML.addEventListener('click', (event) => {
    const isMinus = event.target.classList.contains('minus');
    const isPlus = event.target.classList.contains('plus');

    if (isMinus || isPlus) {
        const product_id = event.target.closest('.item').dataset.id;
        const action = isPlus ? 'plus' : 'minus';
        changeCartQuantity(product_id, action);
    }
});

initApp();

// Initialize search bar functionality
const initializeSearch = () => {
    const searchInput = document.getElementById("search-input");
    const autocompleteList = document.getElementById("autocomplete-list");

    searchInput.addEventListener("input", () => {
        const value = searchInput.value;
        autocompleteList.innerHTML = "";

        if (!value) {
            addDataToHTML();
            return;
        }

        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(value.toLowerCase())
        );

        // Display filtered products
        addDataToHTML(filteredProducts);

        filteredProducts.forEach(product => {
            const item = document.createElement("div");
            item.textContent = product.name;
            item.addEventListener("click", () => {
                searchInput.value = product.name;
                autocompleteList.innerHTML = "";
                addDataToHTML([product]);
            });
            autocompleteList.appendChild(item);
        });
    });

    document.addEventListener("click", (e) => {
        if (e.target !== searchInput) {
            autocompleteList.innerHTML = "";
        }
    });
}
