export class Product {
    constructor(data = {}) {
        this.id = data.id || null;
        this.categoryId = data.categoryId || null;
        this.brandId = data.brandId || null;     // связь с брендом
        this.code = data.code || '';
        this.name = data.name || '';
        this.description = data.description || '';
        this.mainImage = data.mainImage || '';
        this.galleryImages = data.galleryImages || [];
        this.createdAt = data.createdAt || new Date().toISOString();
    }
    
    // Валидация
    validate() {
        const errors = [];
        if (!this.code) errors.push('Артикул обязателен');
        if (!this.name) errors.push('Название обязательно');
        if (this.name && this.name.length < 2) errors.push('Название слишком короткое');
        return errors;
    }
    
    // Получить полное название с артикулом
    getFullName() {
        return `${this.name} (${this.code})`;
    }
    
    // Проверка, новый ли товар
    isNew() {
        return !this.id;
    }
    
    // Клонирование
    clone() {
        return new Product(JSON.parse(JSON.stringify(this)));
    }
}

// Тесты для Product
export function testProductModel() {
    console.log('🧪 Тестируем Product модель...');
    
    const p1 = new Product({ code: 'TEST-001', name: 'Тестовый товар' });
    console.assert(p1.code === 'TEST-001', '❌ Ошибка: code');
    console.assert(p1.name === 'Тестовый товар', '❌ Ошибка: name');
    
    const p2 = new Product({ code: '', name: '' });
    console.assert(p2.validate().length === 2, '❌ Ошибка: валидация');
    
    const p3 = new Product({ code: 'FIX-001', name: 'Фиксаторы' });
    console.assert(p3.getFullName() === 'Фиксаторы (FIX-001)', '❌ Ошибка: getFullName');
    
    const p4 = new Product({ id: 1 });
    console.assert(p4.isNew() === false, '❌ Ошибка: isNew');
    
    const p5 = new Product({ brandId: 5 });
    console.assert(p5.brandId === 5, '❌ Ошибка: brandId');
    
    console.log('✅ Все тесты Product пройдены!');
    return true;
}