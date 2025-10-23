document.addEventListener('DOMContentLoaded', () => {

    // --- STATE MANAGEMENT ---
    let cart = [];
    let wishlist = [];

    // --- DOM ELEMENTS ---
    const themeToggle = document.getElementById('theme-toggle');
    const themeIconLight = document.getElementById('theme-icon-light');
    const themeIconDark = document.getElementById('theme-icon-dark');
    const docHtml = document.documentElement;
    const currentYearSpan = document.getElementById('currentYear');
    const cartItemsEl = document.getElementById('cart-items');
    const cartCountEl = document.getElementById('cart-count');
    const cartTotalEl = document.getElementById('cart-total');
    const wishlistItemsEl = document.getElementById('wishlist-items');
    const wishlistCountEl = document.getElementById('wishlist-count');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const wishlistSidebar = document.getElementById('wishlist-sidebar');
    const wishlistOverlay = document.getElementById('wishlist-overlay');
    const checkoutModal = document.getElementById('checkout-modal');

    // --- WEB3FORMS CONFIG ---
    const WEB3FORMS_ACCESS_KEY = '6170d072-9b8e-423d-9bad-c7840b1e1eeb';

    // --- THEME LOGIC ---
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            docHtml.classList.add('dark');
            themeIconLight.classList.remove('hidden');
            themeIconDark.classList.add('hidden');
            localStorage.setItem('theme', 'dark');
        } else {
            docHtml.classList.remove('dark');
            themeIconLight.classList.add('hidden');
            themeIconDark.classList.remove('hidden');
            localStorage.setItem('theme', 'light');
        }
    };

    // --- CART LOGIC ---
    const addToCart = (name, price) => {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, quantity: 1 });
        }
        updateCartDisplay();
        showNotification(`${name} added to cart!`);
    };

    const removeFromCart = (name) => {
        cart = cart.filter(item => item.name !== name);
        updateCartDisplay();
    };

    const updateQuantity = (name, change) => {
        const item = cart.find(item => item.name === name);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(name);
            } else {
                updateCartDisplay();
            }
        }
    };

    const updateCartDisplay = () => {
        if (cart.length === 0) {
            cartItemsEl.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center">Your cart is empty</p>';
            cartCountEl.textContent = '0';
        } else {
            cartItemsEl.innerHTML = cart.map(item => `
                <div class="cart-item flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <div class="flex-1">
                        <h4 class="font-semibold dark:text-white">${item.name}</h4>
                        <p class="text-gray-600 dark:text-gray-400">₹${item.price.toLocaleString()}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button data-action="update-quantity" data-name="${item.name}" data-change="-1" class="w-8 h-8 bg-gray-200 dark:bg-gray-600 dark:text-white rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500">-</button>
                        <span class="w-8 text-center dark:text-white">${item.quantity}</span>
                        <button data-action="update-quantity" data-name="${item.name}" data-change="1" class="w-8 h-8 bg-gray-200 dark:bg-gray-600 dark:text-white rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500">+</button>
                        <button data-action="remove-from-cart" data-name="${item.name}" class="ml-2 text-red-500 hover:text-red-700">🗑️</button>
                    </div>
                </div>
            `).join('');
            cartCountEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        }
        const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalEl.textContent = `₹${cartTotal.toLocaleString()}`;
    };

    // --- WISHLIST LOGIC ---
    const toggleWishlistItem = (name, price) => {
        const index = wishlist.findIndex(item => item.name === name);
        if (index > -1) {
            wishlist.splice(index, 1);
            showNotification(`${name} removed from wishlist!`, 'info');
        } else {
            wishlist.push({ name, price });
            showNotification(`${name} added to wishlist!`);
        }
        updateWishlistDisplay();
    };
    
    const removeFromWishlist = (name) => {
        wishlist = wishlist.filter(item => item.name !== name);
        updateWishlistDisplay();
    };

    const updateWishlistDisplay = () => {
        if (wishlist.length === 0) {
            wishlistItemsEl.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center">Your wishlist is empty</p>';
        } else {
            wishlistItemsEl.innerHTML = wishlist.map(item => `
                <div class="cart-item flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <div class="flex-1">
                        <h4 class="font-semibold dark:text-white">${item.name}</h4>
                        <p class="text-gray-600 dark:text-gray-400">₹${item.price.toLocaleString()}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button data-action="add-to-cart-from-wishlist" data-name="${item.name}" data-price="${item.price}" class="bg-rose-600 text-white px-3 py-1 rounded text-sm hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600">Add to Cart</button>
                        <button data-action="remove-from-wishlist" data-name="${item.name}" class="text-red-500 hover:text-red-700">🗑️</button>
                    </div>
                </div>
            `).join('');
        }
        wishlistCountEl.textContent = wishlist.length;
    };
    
    const addAllToCart = () => {
        if (wishlist.length === 0) {
            showNotification('Your wishlist is empty!', 'error');
            return;
        }
        wishlist.forEach(item => addToCart(item.name, item.price));
        showNotification(`Added ${wishlist.length} items to cart!`);
        clearWishlist();
    };

    const clearWishlist = () => {
        wishlist = [];
        updateWishlistDisplay();
        showNotification('Wishlist cleared!', 'info');
    };

    // --- UI TOGGLES ---
    const toggleCart = () => {
        cartSidebar.classList.toggle('translate-x-full');
        cartOverlay.classList.toggle('hidden');
    };

    const toggleWishlist = () => {
        wishlistSidebar.classList.toggle('translate-x-full');
        wishlistOverlay.classList.toggle('hidden');
    };
    
    const showCheckout = () => {
        if (cart.length === 0) {
            showNotification('Your cart is empty!', 'error');
            return;
        }
        const summaryContainer = document.getElementById('checkout-order-summary');
        const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        summaryContainer.innerHTML = cart.map(item => `
            <div class="flex justify-between text-sm dark:text-gray-300">
                <span>${item.name} <span class="text-gray-500">x${item.quantity}</span></span>
                <span class="font-medium">₹${(item.price * item.quantity).toLocaleString()}</span>
            </div>
        `).join('');
        document.getElementById('checkout-total').textContent = `₹${cartTotal.toLocaleString()}`;
        if (!cartSidebar.classList.contains('translate-x-full')) toggleCart();
        checkoutModal.classList.remove('hidden');
        checkoutModal.classList.add('flex');
    };

    const hideCheckout = () => {
        checkoutModal.classList.add('hidden');
        checkoutModal.classList.remove('flex');
    };

    // --- ORDER SUBMISSION ---
    const placeOrder = async () => {
        if (WEB3FORMS_ACCESS_KEY === 'YOUR_ACCESS_KEY_HERE') {
            showNotification('Web3Forms access key is not set up!', 'error');
            console.error("Please replace 'YOUR_ACCESS_KEY_HERE' with your actual Web3Forms access key in the script.");
            return;
        }
        
        const form = document.getElementById('checkout-form');
        const nameInput = document.getElementById('customer-name');
        const emailInput = document.getElementById('customer-email');
        const addressInput = document.getElementById('customer-address');
        const phoneInput = document.getElementById('customer-phone');
        const instagramInput = document.getElementById('customer-instagram');
        
        let isValid = true;
        document.querySelectorAll('[id$="-error"]').forEach(el => el.classList.add('hidden'));

        if (!nameInput.value.trim()) {
            document.getElementById('name-error').classList.remove('hidden'); isValid = false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
            document.getElementById('email-error').classList.remove('hidden'); isValid = false;
        }
        if (!addressInput.value.trim()) {
            document.getElementById('address-error').classList.remove('hidden'); isValid = false;
        }
        if (!phoneInput.value.trim() && !instagramInput.value.trim()) {
            document.getElementById('contact-error').classList.remove('hidden'); isValid = false;
        }
        if (!isValid) {
            showNotification('Please correct the errors in the form.', 'error'); return;
        }
        
        const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderSummary = cart.map(item => `${item.name} x${item.quantity} - ₹${(item.price * item.quantity).toLocaleString()}`).join('\n');
        const formData = {
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: `New Order from ${nameInput.value} - Araaaz Jewelry`,
            from_name: "Araaaz Website", 'Customer Name': nameInput.value, 'Customer Email': emailInput.value, 
            'Shipping Address': addressInput.value, 'Customer Phone': phoneInput.value || 'Not provided', 
            'Customer Instagram': instagramInput.value || 'Not provided', 'Order Items': orderSummary, 
            'Total Amount': `₹${cartTotal.toLocaleString()}`, 'Order Date': new Date().toLocaleString(), 'Order ID': 'ARZ-' + Date.now()
        };
        
        showNotification('Processing your order...', 'info');

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (result.success) {
                showNotification('Order placed! A confirmation will be sent shortly.', 'success');
                cart = []; updateCartDisplay(); hideCheckout(); form.reset();
            } else {
                showNotification(result.message || 'There was an error.', 'error');
            }
        } catch (error) {
            showNotification('An unexpected error occurred.', 'error');
        }
    };

    // --- NOTIFICATIONS ---
    const showNotification = (message, type = 'success') => {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        const notification = document.createElement('div');
        let bgColor, iconSvg;
        switch (type) {
            case 'error': bgColor = 'bg-red-500'; iconSvg = `<svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`; break;
            case 'info': bgColor = 'bg-blue-500'; iconSvg = `<svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`; break;
            default: bgColor = 'bg-green-500'; iconSvg = `<svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
        }
        notification.className = `notification ${bgColor} text-white rounded-lg shadow-lg flex items-center p-4`;
        notification.innerHTML = `${iconSvg}<span>${message}</span>`;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('fade-out');
            notification.addEventListener('animationend', () => notification.remove());
        }, 4000);
    };

    // --- EVENT LISTENERS ---
    const initEventListeners = () => {
        // Theme Toggle
        themeToggle.addEventListener('click', () => {
            const currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });

        // Nav Buttons
        document.getElementById('cart-toggle-btn').addEventListener('click', toggleCart);
        document.getElementById('wishlist-toggle-btn').addEventListener('click', toggleWishlist);
        
        // Sidebar Close Buttons
        document.getElementById('cart-close-btn').addEventListener('click', toggleCart);
        document.getElementById('wishlist-close-btn').addEventListener('click', toggleWishlist);
        cartOverlay.addEventListener('click', toggleCart);
        wishlistOverlay.addEventListener('click', toggleWishlist);

        // Checkout Buttons
        document.getElementById('checkout-btn').addEventListener('click', showCheckout);
        document.getElementById('checkout-close-btn').addEventListener('click', hideCheckout);
        document.getElementById('place-order-btn').addEventListener('click', placeOrder);

        // Wishlist Action Buttons
        document.getElementById('add-all-to-cart-btn').addEventListener('click', addAllToCart);
        document.getElementById('clear-wishlist-btn').addEventListener('click', clearWishlist);
        
        // Event Delegation for dynamically added content
        document.body.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-action]');
            if (!button) return;

            const { action, name, price, change } = button.dataset;
            
            switch (action) {
                case 'add-to-cart':
                    addToCart(name, parseFloat(price));
                    break;
                case 'toggle-wishlist':
                    toggleWishlistItem(name, parseFloat(price));
                    break;
                case 'add-to-cart-from-wishlist':
                    addToCart(name, parseFloat(price));
                    removeFromWishlist(name);
                    break;
                case 'remove-from-wishlist':
                    removeFromWishlist(name);
                    break;
                case 'update-quantity':
                    updateQuantity(name, parseInt(change));
                    break;
                case 'remove-from-cart':
                    removeFromCart(name);
                    break;
            }
        });
    };

    // --- INITIALIZATION ---
    const initApp = () => {
        // Set theme
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(savedTheme || (systemPrefersDark ? 'dark' : 'light'));

        // Set footer year
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }

        // Setup all event listeners
        initEventListeners();

        // Initial UI update
        updateCartDisplay();
        updateWishlistDisplay();
    };

    initApp();
});

