/* ==========================================================================
   ISET ALPHA FARMS v2 - MAIN JAVASCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --- THEME TOGGLE (DARK MODE) --- */
    const themeToggle = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    const icon = themeToggle.querySelector('i');

    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        htmlEl.setAttribute('data-theme', 'dark');
        icon.classList.replace('fa-moon', 'fa-sun');
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            htmlEl.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            icon.classList.replace('fa-sun', 'fa-moon');
        } else {
            htmlEl.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            icon.classList.replace('fa-moon', 'fa-sun');
        }
    });

    /* --- NAVBAR SHRINK & SCROLL --- */
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* --- MOBILE MENU --- */
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            
            // Active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    /* --- SCROLL REVEAL ANIMATIONS --- */
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    /* --- PRODUCT FILTERING --- */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            productCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filterValue === 'all' || filterValue === category) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    /* --- STATS COUNTER ANIMATION --- */
    const counters = document.querySelectorAll('.counter');
    let counted = false;

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !counted) {
                counted = true;
                counters.forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    const duration = 2000; // 2 seconds
                    const increment = target / (duration / 16); // 60fps
                    
                    let current = 0;
                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            counter.innerText = Math.ceil(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.innerText = target;
                        }
                    };
                    updateCounter();
                });
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.stats-grid');
    if (statsSection) {
        counterObserver.observe(statsSection);
    }

    /* --- CONTACT FORM SUBMIT TO BACKEND --- */
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;
            
            const inputs = form.querySelectorAll('input, textarea');
            const name = inputs[0].value;
            const email = inputs[1].value;
            const message = inputs[2].value;

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                });

                if (response.ok) {
                    btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                    btn.style.backgroundColor = 'var(--primary-dark)';
                    form.reset();
                } else {
                    btn.innerHTML = '<i class="fas fa-times"></i> Error Sending';
                    btn.style.backgroundColor = 'red';
                }
            } catch (error) {
                console.error('Error:', error);
                btn.innerHTML = '<i class="fas fa-times"></i> Error Sending';
                btn.style.backgroundColor = 'red';
            }
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.backgroundColor = '';
                btn.disabled = false;
            }, 3000);
        });
    }

    /* --- NEWSLETTER SUBMIT TO BACKEND --- */
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = newsletterForm.querySelector('input[type="email"]');
            const btn = newsletterForm.querySelector('button');
            const originalHTML = btn.innerHTML;
            const email = input.value;

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            btn.disabled = true;

            try {
                const response = await fetch('/api/newsletter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                if (response.ok) {
                    btn.innerHTML = '<i class="fas fa-check"></i>';
                    input.value = '';
                    input.placeholder = 'Subscribed successfully!';
                } else {
                    btn.innerHTML = '<i class="fas fa-times"></i>';
                }
            } catch (error) {
                console.error('Error:', error);
                btn.innerHTML = '<i class="fas fa-times"></i>';
            }

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
                input.placeholder = 'Email Address';
            }, 3000);
        });
    }

    /* --- CART AND CHECKOUT LOGIC --- */
    let cart = [];
    const cartToggle = document.getElementById('cart-toggle');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCart = document.getElementById('close-cart');
    const cartBadge = document.getElementById('cart-badge');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const proceedCheckoutBtn = document.getElementById('proceed-checkout-btn');

    const checkoutOverlay = document.getElementById('checkout-modal-overlay');
    const closeCheckout = document.getElementById('close-checkout');
    const checkoutForm = document.getElementById('checkoutForm');

    // Toggle Cart
    cartToggle.addEventListener('click', () => cartOverlay.classList.add('active'));
    closeCart.addEventListener('click', () => cartOverlay.classList.remove('active'));
    cartOverlay.addEventListener('click', (e) => {
        if(e.target === cartOverlay) cartOverlay.classList.remove('active');
    });

    // Toggle Checkout
    proceedCheckoutBtn.addEventListener('click', () => {
        cartOverlay.classList.remove('active');
        checkoutOverlay.classList.add('active');
    });
    closeCheckout.addEventListener('click', () => checkoutOverlay.classList.remove('active'));
    checkoutOverlay.addEventListener('click', (e) => {
        if(e.target === checkoutOverlay) checkoutOverlay.classList.remove('active');
    });

    // Format Currency
    const formatNaira = (amount) => '₦' + amount.toLocaleString();

    // Update Cart UI
    const updateCart = () => {
        cartBadge.innerText = cart.reduce((total, item) => total + item.quantity, 0);
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is currently empty.</div>';
            proceedCheckoutBtn.disabled = true;
        } else {
            proceedCheckoutBtn.disabled = false;
            cart.forEach((item, index) => {
                total += item.price * item.quantity;
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = `
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>${formatNaira(item.price)}</p>
                    </div>
                    <div class="cart-item-controls">
                        <button class="dec-qty" data-index="${index}">-</button>
                        <span>${item.quantity}</span>
                        <button class="inc-qty" data-index="${index}">+</button>
                        <button class="remove-item" data-index="${index}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                cartItemsContainer.appendChild(div);
            });
        }
        cartTotalPrice.innerText = formatNaira(total);

        // Attach event listeners to new buttons
        document.querySelectorAll('.dec-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const i = e.target.getAttribute('data-index');
                if(cart[i].quantity > 1) {
                    cart[i].quantity--;
                } else {
                    cart.splice(i, 1);
                }
                updateCart();
            });
        });
        document.querySelectorAll('.inc-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const i = e.target.getAttribute('data-index');
                cart[i].quantity++;
                updateCart();
            });
        });
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const btnEl = e.target.closest('button');
                const i = btnEl.getAttribute('data-index');
                cart.splice(i, 1);
                updateCart();
            });
        });
    };

    // Add to Cart
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const name = e.target.getAttribute('data-name');
            const price = parseFloat(e.target.getAttribute('data-price'));

            const existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ name, price, quantity: 1 });
            }
            updateCart();
            
            // Visual feedback
            const originalText = e.target.innerHTML;
            e.target.innerHTML = '<i class="fas fa-check"></i> Added';
            e.target.style.backgroundColor = 'var(--primary-dark)';
            setTimeout(() => {
                e.target.innerHTML = originalText;
                e.target.style.backgroundColor = '';
            }, 1500);
        });
    });

    // Checkout Submit
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = checkoutForm.querySelector('button');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            btn.disabled = true;

            const name = document.getElementById('checkoutName').value;
            const email = document.getElementById('checkoutEmail').value;
            const address = document.getElementById('checkoutAddress').value;
            const total_amount = cart.reduce((t, i) => t + (i.price * i.quantity), 0);

            try {
                const response = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, address, total_amount, items: cart })
                });

                if (response.ok) {
                    btn.innerHTML = '<i class="fas fa-check"></i> Order Placed!';
                    btn.style.backgroundColor = 'var(--primary-dark)';
                    cart = [];
                    updateCart();
                    setTimeout(() => {
                        checkoutOverlay.classList.remove('active');
                        checkoutForm.reset();
                        btn.innerHTML = originalHTML;
                        btn.style.backgroundColor = '';
                        btn.disabled = false;
                    }, 2000);
                } else {
                    btn.innerHTML = '<i class="fas fa-times"></i> Error';
                    btn.style.backgroundColor = 'red';
                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                        btn.style.backgroundColor = '';
                        btn.disabled = false;
                    }, 2000);
                }
            } catch (error) {
                console.error('Error:', error);
                btn.innerHTML = '<i class="fas fa-times"></i> Error';
                btn.style.backgroundColor = 'red';
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.backgroundColor = '';
                    btn.disabled = false;
                }, 2000);
            }
        });
    }

});
