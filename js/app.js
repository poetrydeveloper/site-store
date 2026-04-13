import { renderHeader } from './components/header.js';
import { renderCatalog } from './components/catalog.js';
import { renderProductForm, attachProductFormEvents, loadCategoriesToSelect } from './components/ProductForm.js';
import { renderBrandForm, attachBrandFormEvents } from './components/BrandForm.js';
import { getProducts, getBrands, deleteProduct, deleteBrand } from './services/supabase.js';
import { Cart } from './models/Cart.js';

// Состояние приложения
const state = {
    currentPage: 'catalog',
    products: [],
    brands: [],
    cart: new Cart(),
    loading: true,
    editingProduct: null,
    editingBrand: null
};

// Рендер приложения
async function renderApp() {
    const app = document.getElementById('app');
    
    let content = '';
    
    switch (state.currentPage) {
        case 'catalog':
            content = renderCatalog(state.products, state.loading);
            break;
        case 'cart':
            content = renderCart(state.cart.getAllItems());
            break;
        case 'admin-products':
            content = await renderAdminProducts();
            break;
        case 'admin-product-form':
            content = await renderProductForm(state.editingProduct);
            break;
        case 'admin-brands':
            content = await renderAdminBrands();
            break;
        case 'admin-brand-form':
            content = renderBrandForm(state.editingBrand);
            break;
        default:
            content = '<p>Страница не найдена</p>';
    }
    
    app.innerHTML = `
        ${renderHeader(state.cart.getTotalItems())}
        <main>${content}</main>
    `;
    
    attachEventListeners();
    
    // Дополнительные инициализации после рендера
    if (state.currentPage === 'admin-product-form') {
        await loadCategoriesToSelect(state.editingProduct?.categoryId);
        attachProductFormEvents(onProductSaved, () => {
            state.currentPage = 'admin-products';
            state.editingProduct = null;
            renderApp();
        });
    } else if (state.currentPage === 'admin-brand-form') {
        attachBrandFormEvents(onBrandSaved, () => {
            state.currentPage = 'admin-brands';
            state.editingBrand = null;
            renderApp();
        });
    }
}

// Рендер корзины (обновлённая версия)
function renderCart(items) {
    if (items.length === 0) {
        return '<p>🛒 Корзина пуста</p>';
    }
    
    return `
        <h1>🛒 Корзина</h1>
        <div class="cart-items">
            ${items.map(item => `
                <div class="cart-item" data-id="${item.productId}">
                    <div>
                        <strong>${escapeHtml(item.name)}</strong><br>
                        ${escapeHtml(item.code)} × ${item.quantity}
                    </div>
                    <div>
                        <div class="cart-item-price">${(item.price * item.quantity).toFixed(2)} ₽</div>
                        <button class="remove-from-cart" data-id="${item.productId}">🗑️ Удалить</button>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="cart-total">
            <strong>Итого: ${state.cart.getTotal().toFixed(2)} ₽</strong>
        </div>
        <button id="clear-cart" class="btn-danger">Очистить корзину</button>
        <button id="checkout-btn" class="btn-primary">✅ Оформить заказ</button>
    `;
}

// Рендер админки товаров
async function renderAdminProducts() {
    const products = await getProducts();
    
    if (products.length === 0) {
        return `
            <div class="admin-header">
                <h1>📝 Управление товарами</h1>
                <button id="add-product-btn" class="btn-primary">➕ Добавить товар</button>
            </div>
            <p>😕 Товаров пока нет. Создайте первый товар.</p>
        `;
    }
    
    return `
        <div class="admin-header">
            <h1>📝 Управление товарами</h1>
            <button id="add-product-btn" class="btn-primary">➕ Добавить товар</button>
        </div>
        <div class="admin-table">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Артикул</th>
                        <th>Название</th>
                        <th>Бренд</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(p => `
                        <tr>
                            <td>${p.id}</td>
                            <td>${escapeHtml(p.code)}</td>
                            <td>${escapeHtml(p.name)}</td>
                            <td>${escapeHtml(p.brandId || '—')}</td>
                            <td>
                                <button class="edit-product-btn" data-id="${p.id}">✏️</button>
                                <button class="delete-product-btn" data-id="${p.id}">🗑️</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Рендер админки брендов
async function renderAdminBrands() {
    const brands = await getBrands();
    
    if (brands.length === 0) {
        return `
            <div class="admin-header">
                <h1>🏷️ Управление брендами</h1>
                <button id="add-brand-btn" class="btn-primary">➕ Добавить бренд</button>
            </div>
            <p>😕 Брендов пока нет. Создайте первый бренд.</p>
        `;
    }
    
    return `
        <div class="admin-header">
            <h1>🏷️ Управление брендами</h1>
            <button id="add-brand-btn" class="btn-primary">➕ Добавить бренд</button>
        </div>
        <div class="admin-table">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Описание</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${brands.map(b => `
                        <tr>
                            <td>${b.id}</td>
                            <td>${escapeHtml(b.name)}</td>
                            <td>${escapeHtml(b.description || '—')}</td>
                            <td>
                                <button class="edit-brand-btn" data-id="${b.id}">✏️</button>
                                <button class="delete-brand-btn" data-id="${b.id}">🗑️</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
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
                state.editingProduct = null;
                state.editingBrand = null;
                renderApp();
            }
        });
    });
    
    // Кнопки "В корзину" (каталог)
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(btn.dataset.id);
            const product = state.products.find(p => p.id === productId);
            if (product) {
                state.cart.addItem(product, 1);
                renderApp();
            }
        });
    });
    
    // Кнопка "Добавить товар"
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            state.editingProduct = null;
            state.currentPage = 'admin-product-form';
            renderApp();
        });
    }
    
    // Кнопка "Добавить бренд"
    const addBrandBtn = document.getElementById('add-brand-btn');
    if (addBrandBtn) {
        addBrandBtn.addEventListener('click', () => {
            state.editingBrand = null;
            state.currentPage = 'admin-brand-form';
            renderApp();
        });
    }
    
    // Редактирование товара
    document.querySelectorAll('.edit-product-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = parseInt(btn.dataset.id);
            const product = state.products.find(p => p.id === id);
            if (product) {
                state.editingProduct = product;
                state.currentPage = 'admin-product-form';
                renderApp();
            }
        });
    });
    
    // Удаление товара
    document.querySelectorAll('.delete-product-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = parseInt(btn.dataset.id);
            if (confirm('Удалить товар?')) {
                await deleteProduct(id);
                await loadProducts();
                renderApp();
            }
        });
    });
    
    // Редактирование бренда
    document.querySelectorAll('.edit-brand-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = parseInt(btn.dataset.id);
            const brands = await getBrands();
            const brand = brands.find(b => b.id === id);
            if (brand) {
                state.editingBrand = brand;
                state.currentPage = 'admin-brand-form';
                renderApp();
            }
        });
    });
    
    // Удаление бренда
    document.querySelectorAll('.delete-brand-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = parseInt(btn.dataset.id);
            if (confirm('Удалить бренд?')) {
                await deleteBrand(id);
                await loadBrands();
                renderApp();
            }
        });
    });
    
    // Очистка корзины
    const clearCartBtn = document.getElementById('clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm('Очистить корзину?')) {
                state.cart.clear();
                renderApp();
            }
        });
    }
    
    // Оформление заказа
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            alert('Функция оформления заказа будет добавлена позже.');
        });
    }
    
    // Удаление из корзины
    document.querySelectorAll('.remove-from-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            state.cart.removeItem(id);
            renderApp();
        });
    });
}

// Callback после сохранения товара
function onProductSaved(savedProduct) {
    state.currentPage = 'admin-products';
    state.editingProduct = null;
    loadProducts();
}

// Callback после сохранения бренда
function onBrandSaved(savedBrand) {
    state.currentPage = 'admin-brands';
    state.editingBrand = null;
    loadBrands();
}

// Загрузка товаров из Supabase
async function loadProducts() {
    state.loading = true;
    const products = await getProducts();
    state.products = products;
    state.loading = false;
    renderApp();
}

// Загрузка брендов
async function loadBrands() {
    const brands = await getBrands();
    state.brands = brands;
}

// Вспомогательная функция для экранирования HTML
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Запуск
async function init() {
    await loadProducts();
    await loadBrands();
    renderApp();
}

init();