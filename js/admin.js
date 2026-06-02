document.addEventListener('DOMContentLoaded', () => {

    /* --- THEME TOGGLE (Copied from main.js) --- */
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

            // Update active states
            tabLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            // Update Title
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
            document.getElementById('orders-tbody').innerHTML = '<tr><td colspan="8" style="color:red;">Error loading orders.</td></tr>';
        }
    };

    // Fetch Contacts
    const fetchContacts = async () => {
        try {
            const res = await fetch('/api/admin/contacts');
            const contacts = await res.json();
            const tbody = document.getElementById('contacts-tbody');
            tbody.innerHTML = '';
            
            if (contacts.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5">No messages found.</td></tr>';
                return;
            }

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
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
            document.getElementById('contacts-tbody').innerHTML = '<tr><td colspan="5" style="color:red;">Error loading messages.</td></tr>';
        }
    };

    // Fetch Subscribers
    const fetchSubscribers = async () => {
        try {
            const res = await fetch('/api/admin/subscribers');
            const subs = await res.json();
            const tbody = document.getElementById('subscribers-tbody');
            tbody.innerHTML = '';
            
            if (subs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3">No subscribers found.</td></tr>';
                return;
            }

            subs.forEach(sub => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${sub.id}</td>
                    <td><strong>${sub.email}</strong></td>
                    <td>${formatDate(sub.created_at)}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Failed to fetch subscribers:', error);
            document.getElementById('subscribers-tbody').innerHTML = '<tr><td colspan="3" style="color:red;">Error loading subscribers.</td></tr>';
        }
    };

    // Initial load
    fetchOrders();
    fetchContacts();
    fetchSubscribers();

});
