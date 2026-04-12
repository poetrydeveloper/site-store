export function renderHeader(cartCount = 0) {
    return `
        <header>
            <nav>
                <a href="#" data-page="catalog">📦 Каталог</a>
                <a href="#" data-page="cart">🛒 Корзина ${cartCount > 0 ? `(${cartCount})` : ''}</a>
                <a href="#" data-page="orders">📋 Заказы</a>
            </nav>
        </header>
    `;
}