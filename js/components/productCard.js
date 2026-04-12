export function renderProductCard(product) {
    return `
        <div class="product-card" data-id="${product.id}">
            <h3>${product.name}</h3>
            <p>Артикул: ${product.code}</p>
            <div class="price">${product.price} ₽</div>
            <button class="add-to-cart" data-id="${product.id}">
                🛒 В корзину
            </button>
        </div>
    `;
}