import { renderProductCard } from './productCard.js';

export function renderCatalog(products, loading = false) {
    if (loading) {
        return '<p>⏳ Загрузка товаров...</p>';
    }
    
    if (!products || products.length === 0) {
        return '<p>😕 Товаров пока нет. Добавьте их в Supabase таблицу "products"</p>';
    }
    
    return `
        <div class="catalog">
            <h1>Каталог товаров</h1>
            <div class="products-grid">
                ${products.map(p => renderProductCard(p)).join('')}
            </div>
        </div>
    `;
}