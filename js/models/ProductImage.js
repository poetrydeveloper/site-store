export const StorageType = {
    LOCAL: 'local',
    FTP: 'ftp',
    SUPABASE: 'supabase'
};

export class ProductImage {
    constructor(data = {}) {
        this.id = data.id || null;
        this.productId = data.productId || null;
        this.url = data.url || '';
        this.storageType = data.storageType || StorageType.SUPABASE;
        this.sortOrder = data.sortOrder || 0;
        this.isMain = data.isMain || false;
        this.createdAt = data.createdAt || new Date().toISOString();
    }
    
    // Пока заглушка — возвращаем placeholder
    async loadAsync() {
        // Заглушка: возвращаем серый placeholder с текстом
        return `https://via.placeholder.com/300x200?text=${encodeURIComponent(this.url || 'No image')}`;
    }
    
    validate() {
        const errors = [];
        if (!this.productId) errors.push('ID товара обязателен');
        return errors;
    }
}

export function testProductImageModel() {
    console.log('🧪 Тестируем ProductImage модель...');
    const img = new ProductImage({ productId: 1, url: 'test.jpg', sortOrder: 1, isMain: true });
    console.assert(img.productId === 1, '❌ Ошибка: productId');
    console.assert(img.sortOrder === 1, '❌ Ошибка: sortOrder');
    console.log('✅ Все тесты ProductImage пройдены!');
    return true;
}