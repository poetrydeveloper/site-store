import { renderHeader } from './components/header.js';
import { renderCatalog } from './components/catalog.js';
import { getProducts } from './services/supabase.js';
import { Cart } from './models/Cart.js';

// Состояние приложения
const state = {
    currentPage: 'catalog',
    products: [],
    cart: new Cart(),
    loading: true
};

// Рендер приложения
async function renderApp() {
    const app = document.getElementById('app');
    
    let content = '';
    if (state.currentPage === 'catalog') {
        content = renderCatalog(state.products, state.loading);
    } else if (state.currentPage === 'cart') {
        content = renderCart(state.cart.getAllItems());
    }
    
    app.innerHTML = `
        ${renderHeader(state.cart.getTotalItems())}
        <main>${content}</main>
    `;
    
    attachEventListeners();
}

// Обработчики событий
function attachEventListeners() {
    // Навигация
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            if (page) {
                state.currentPage = page;
                renderApp();
            }
        });
    });
    
    // Кнопки "В корзину"
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(btn.dataset.id);
            const product = state.products.find(p => p.id === productId);
            if (product) {
                state.cart.addItem(product, 1);
                renderApp(); // Обновляем UI (обновится счётчик в шапке)
            }
        });
    });
}

// Рендер корзины (временная версия)
function renderCart(items) {
    if (items.length === 0) {
        return '<p>🛒 Корзина пуста</p>';
    }
    
    return `
        <h1>Корзина</h1>
        ${items.map(item => `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong><br>
                    ${item.code} × ${item.quantity}
                </div>
                <div>${item.price * item.quantity} ₽</div>
            </div>
        `).join('')}
        <div style="margin-top: 20px; font-size: 1.2rem;">
            <strong>Итого: ${state.cart.getTotal()} ₽</strong>
        </div>
        <button id="clear-cart">Очистить корзину</button>
    `;
}

// Загрузка товаров из Supabase
async function loadProducts() {
    state.loading = true;
    renderApp();
    
    const products = await getProducts();
    state.products = products;
    state.loading = false;
    renderApp();
}

// Запуск
loadProducts();