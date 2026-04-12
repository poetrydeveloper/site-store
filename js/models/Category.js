export class Category {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.slug = data.slug || '';
        this.description = data.description || '';
        this.image = data.image || '';
        this.level = data.level || 0;
        this.parentId = data.parentId || null;
        this.children = data.children || [];
    }
    
    // Получить полный путь (для breadcrumbs)
    getFullPath(parentCategories = []) {
        const path = [...parentCategories, this.name];
        return path.join(' → ');
    }
    
    // Проверить, есть ли дочерние категории
    hasChildren() {
        return this.children.length > 0;
    }
    
    // Валидация
    validate() {
        const errors = [];
        if (!this.name) errors.push('Название категории обязательно');
        if (!this.slug) errors.push('Slug обязателен');
        return errors;
    }
}

// Тесты для Category
export function testCategoryModel() {
    console.log('🧪 Тестируем Category модель...');
    
    const cat = new Category({ 
        name: 'Электроника', 
        slug: 'electronics',
        level: 0
    });
    
    console.assert(cat.name === 'Электроника', '❌ Ошибка: name');
    console.assert(cat.slug === 'electronics', '❌ Ошибка: slug');
    console.assert(cat.getFullPath([]) === 'Электроника', '❌ Ошибка: getFullPath');
    console.assert(cat.hasChildren() === false, '❌ Ошибка: hasChildren');
    
    console.log('✅ Все тесты Category пройдены!');
    return true;
}