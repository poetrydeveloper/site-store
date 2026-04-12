export class Cart {
    constructor() {
        this.items = this.loadFromStorage();
    }
    
    // Загрузить корзину из localStorage
    loadFromStorage() {
        const saved = localStorage.getItem('crm_cart');
        return saved ? JSON.parse(saved) : [];
    }
    
    // Сохранить корзину в localStorage
    saveToStorage() {
        localStorage.setItem('crm_cart', JSON.stringify(this.items));
    }
    
    // Добавить товар
    addItem(product, quantity = 1) {
        const existing = this.items.find(item => item.productId === product.id);
        
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.items.push({
                productId: product.id,
                name: product.name,
                code: product.code,
                price: product.price,
                quantity: quantity
            });
        }
        
        this.saveToStorage();
        return this.getTotalItems();
    }
    
    // Удалить товар
    removeItem(productId) {
        this.items = this.items.filter(item => item.productId !== productId);
        this.saveToStorage();
    }
    
    // Изменить количество
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.productId === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveToStorage();
            }
        }
    }
    
    // Получить общую сумму
    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    // Получить количество позиций
    getTotalItems() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    // Очистить корзину
    clear() {
        this.items = [];
        this.saveToStorage();
    }
    
    // Получить все позиции
    getAllItems() {
        return [...this.items];
    }
}

// Тесты для Cart
export function testCartModel() {
    console.log('🧪 Тестируем Cart модель...');
    
    // Очищаем localStorage перед тестом
    localStorage.removeItem('crm_cart');
    
    const cart = new Cart();
    console.assert(cart.getTotalItems() === 0, '❌ Ошибка: новая корзина не пуста');
    
    // Тест добавления
    const testProduct = { id: 1, name: 'Тест', code: 'TEST', price: 100 };
    cart.addItem(testProduct, 2);
    console.assert(cart.getTotalItems() === 2, '❌ Ошибка: addItem количество');
    console.assert(cart.getTotal() === 200, '❌ Ошибка: getTotal');
    
    // Тест обновления
    cart.updateQuantity(1, 5);
    console.assert(cart.getTotalItems() === 5, '❌ Ошибка: updateQuantity');
    
    // Тест удаления
    cart.removeItem(1);
    console.assert(cart.getTotalItems() === 0, '❌ Ошибка: removeItem');
    
    console.log('✅ Все тесты Cart пройдены!');
    return true;
}