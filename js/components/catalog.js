import { renderProductCard } from './productCard.js';

export function renderCatalog(products) {
    if (!products || products.length === 0) {
        return '<p>😕 Товаров пока нет</p>';
    }
    
    return `
        <div class="catalog">
            <div class="products-grid">
                ${products.map(p => renderProductCard(p)).join('')}
            </div>
        </div>
    `;
}