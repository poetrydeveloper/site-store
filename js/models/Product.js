export class Product {
    constructor(data = {}) {
        this.id = data.id || null;
        this.categoryId = data.categoryId || null;
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

// Тесты для Product (запускать в браузере через testRunner.html)
export function testProductModel() {
    console.log('🧪 Тестируем Product модель...');
    
    // Тест 1: создание
    const p1 = new Product({ code: 'TEST-001', name: 'Тестовый товар' });
    console.assert(p1.code === 'TEST-001', '❌ Ошибка: code не сохранился');
    console.assert(p1.name === 'Тестовый товар', '❌ Ошибка: name не сохранился');
    
    // Тест 2: валидация
    const p2 = new Product({ code: '', name: '' });
    const errors = p2.validate();
    console.assert(errors.length === 2, '❌ Ошибка: валидация не сработала');
    
    // Тест 3: getFullName
    const p3 = new Product({ code: 'FIX-001', name: 'Фиксаторы' });
    console.assert(p3.getFullName() === 'Фиксаторы (FIX-001)', '❌ Ошибка: getFullName');
    
    // Тест 4: isNew
    const p4 = new Product({ id: 1, name: 'Существующий' });
    console.assert(p4.isNew() === false, '❌ Ошибка: isNew для существующего');
    const p5 = new Product({ name: 'Новый' });
    console.assert(p5.isNew() === true, '❌ Ошибка: isNew для нового');
    
    console.log('✅ Все тесты Product пройдены!');
    return true;
}