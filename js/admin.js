document.addEventListener('DOMContentLoaded', async () => {

    // First check if logged in
    try {
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        if (!data.loggedIn) {
            window.location.href = '/login.html';
            return;
        }
    } catch (err) {
        console.error(err);
    }

    // Logout
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.href = '/login.html';
    });

    /* --- THEME TOGGLE --- */
    const themeToggle = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    const icon = themeToggle.querySelector('i');
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

    /* --- TAB NAVIGATION --- */
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const pageTitle = document.getElementById('page-title');

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-tab');
            if (!targetId) return;

            tabLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            pageTitle.innerText = link.innerText;
        });
    });

    /* --- FETCH DATA --- */
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    };
    const formatNaira = (amount) => '₦' + parseFloat(amount).toLocaleString();

    // Fetch Orders
    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders');
            const orders = await res.json();
            const tbody = document.getElementById('orders-tbody');
            tbody.innerHTML = '';
            
            if (orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8">No orders found.</td></tr>';
                return;
            }

            orders.forEach(order => {
                let itemsList = '<ul class="order-items-list">';
                if (order.items && order.items.length > 0) {
                    order.items.forEach(item => {
                        itemsList += `<li>${item.quantity}x ${item.product_name} (${formatNaira(item.price)})</li>`;
                    });
                }
                itemsList += '</ul>';
                const statusClass = order.status === 'completed' ? 'completed' : '';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>#${order.id}</td>
                    <td><strong>${order.name}</strong></td>
                    <td>${order.email}</td>
                    <td>${order.address}</td>
                    <td>${itemsList}</td>
                    <td><strong>${formatNaira(order.total_amount)}</strong></td>
                    <td><span class="status-badge ${statusClass}">${order.status.toUpperCase()}</span></td>
                    <td>${formatDate(order.created_at)}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        }
    };

    // Fetch Products (Inventory)
    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const products = await res.json();
            const tbody = document.getElementById('products-tbody');
            tbody.innerHTML = '';
            
            if (products.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">No products found.</td></tr>';
                return;
            }

            products.forEach(p => {
                const tr = document.createElement('tr');
                const imgTag = p.image_url ? `<img src="${p.image_url}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">` : 'No Image';
                tr.innerHTML = `
                    <td>${p.id}</td>
                    <td>${imgTag}</td>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.category.toUpperCase()}</td>
                    <td>${formatNaira(p.price)}</td>
                    <td>
                        <button class="btn btn-danger btn-sm delete-prod-btn" data-id="${p.id}">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            document.querySelectorAll('.delete-prod-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    if (confirm('Are you sure you want to delete this product?')) {
                        await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
                        fetchProducts();
                    }
                });
            });

        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    // Add Product
    document.getElementById('addProductForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.disabled = true;

        const body = {
            name: document.getElementById('prodName').value,
            category: document.getElementById('prodCategory').value,
            price: document.getElementById('prodPrice').value,
            description: document.getElementById('prodDesc').value,
            image_url: document.getElementById('prodImg').value
        };

        try {
            const res = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if(res.ok) {
                e.target.reset();
                fetchProducts();
            } else {
                alert('Failed to add product');
            }
        } catch(err) {
            console.error(err);
        }
        btn.disabled = false;
    });

    // Fetch Contacts
    const fetchContacts = async () => {
        try {
            const res = await fetch('/api/admin/contacts');
            const contacts = await res.json();
            const tbody = document.getElementById('contacts-tbody');
            tbody.innerHTML = '';
            if (contacts.length === 0) return tbody.innerHTML = '<tr><td colspan="5">No messages found.</td></tr>';
            contacts.forEach(contact => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${contact.id}</td>
                    <td><strong>${contact.name}</strong></td>
                    <td>${contact.email}</td>
                    <td>${contact.message}</td>
                    <td>${formatDate(contact.created_at)}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {}
    };

    // Fetch Subscribers
    const fetchSubscribers = async () => {
        try {
            const res = await fetch('/api/admin/subscribers');
            const subs = await res.json();
            const tbody = document.getElementById('subscribers-tbody');
            tbody.innerHTML = '';
            if (subs.length === 0) return tbody.innerHTML = '<tr><td colspan="3">No subscribers found.</td></tr>';
            subs.forEach(sub => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${sub.id}</td>
                    <td><strong>${sub.email}</strong></td>
                    <td>${formatDate(sub.created_at)}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {}
    };

    // Initial load
    fetchOrders();
    fetchProducts();
    fetchContacts();
    fetchSubscribers();
});
