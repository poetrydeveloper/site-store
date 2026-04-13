export class Brand {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.logo = data.logo || '';
        this.description = data.description || '';
        this.createdAt = data.createdAt || new Date().toISOString();
    }
    
    validate() {
        const errors = [];
        if (!this.name) errors.push('Название бренда обязательно');
        if (this.name && this.name.length < 2) errors.push('Название бренда слишком короткое');
        return errors;
    }
    
    isNew() {
        return !this.id;
    }
}

export function testBrandModel() {
    console.log('🧪 Тестируем Brand модель...');
    const brand = new Brand({ name: 'Nike', logo: '/logos/nike.png', description: 'Спортивная одежда' });
    console.assert(brand.name === 'Nike', '❌ Ошибка: name');
    console.assert(brand.validate().length === 0, '❌ Ошибка: валидация');
    console.log('✅ Все тесты Brand пройдены!');
    return true;
}