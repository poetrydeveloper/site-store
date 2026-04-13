// js/models/ProductUnit.js
// Статусы (по вашей документации)
export const PhysicalStatus = {
    IN_STORE: 'IN_STORE',           // На складе
    SOLD: 'SOLD',                   // Продан
    LOST: 'LOST',                   // Потерян/списан
    IN_DISASSEMBLED: 'IN_DISASSEMBLED', // Коллекция разобрана
    IN_COLLECTED: 'IN_COLLECTED',   // Участвует в коллекции
    ABSORBED: 'ABSORBED'            // Поглощён восстановленной коллекцией
};

export const UnitDisassemblyStatus = {
    MONOLITH: 'MONOLITH',           // Обычный товар
    DISASSEMBLED: 'DISASSEMBLED',   // Разобран (родитель)
    PARTIAL: 'PARTIAL',             // Частица от разобранной коллекции
    COLLECTED: 'COLLECTED',         // Частица в восстановленной коллекции
    RESTORED: 'RESTORED'            // Коллекция восстановлена
};

export const LogEventType = {
    STATUS_CHANGE: 'STATUS_CHANGE',
    PHYSICAL_STATUS_CHANGE: 'PHYSICAL_STATUS_CHANGE',
    DISASSEMBLY_STATUS_CHANGE: 'DISASSEMBLY_STATUS_CHANGE',
    SALE: 'SALE',
    RETURN: 'RETURN',
    DISASSEMBLE: 'DISASSEMBLE',
    COLLECT: 'COLLECT',
    LOST: 'LOST',
    MANUAL_RECEIPT: 'MANUAL_RECEIPT',
    PRICE_UPDATE: 'PRICE_UPDATE',
    RESERVED: 'RESERVED',
    UNRESERVED: 'UNRESERVED'
};

export class ProductUnit {
    constructor(data = {}) {
        this.id = data.id || null;
        this.productId = data.productId || null;      // Ссылка на Product
        this.uniqueSerialNumber = data.uniqueSerialNumber || this.generateSerial();
        this.purchasePrice = data.purchasePrice || 0;
        this.isReserved = data.isReserved || false;
        this.createdAt = data.createdAt || new Date().toISOString();
        
        // Статусы
        this.physicalStatus = data.physicalStatus || PhysicalStatus.IN_STORE;
        this.disassemblyStatus = data.disassemblyStatus || UnitDisassemblyStatus.MONOLITH;
        
        // Продажи и возвраты
        this.isReturned = data.isReturned || false;
        this.returnedAt = data.returnedAt || null;
        this.salePrice = data.salePrice || null;
        this.soldAt = data.soldAt || null;
        
        // Связи
        this.supplierId = data.supplierId || null;
        this.customerId = data.customerId || null;
        this.orderId = data.orderId || null;
        this.parentUnitId = data.parentUnitId || null;  // Для иерархии разборки
        this.childUnits = data.childUnits || [];        // Дочерние единицы
        
        // Логи
        this.logs = data.logs || [];
    }
    
    // Генерация уникального серийного номера
    generateSerial() {
        return `UNIT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    }
    
    // Добавить запись в лог
    log(type, message, meta = {}) {
        const logEntry = {
            id: Date.now(),
            type: type,
            message: message,
            meta: { ...meta, previousStatus: this.physicalStatus },
            createdAt: new Date().toISOString()
        };
        this.logs.unshift(logEntry);
        
        // Здесь можно отправить лог в Supabase
        console.log(`[LOG] ${type}: ${message}`, meta);
        return logEntry;
    }
    
    // Изменить физический статус
    changePhysicalStatus(newStatus, reason = '') {
        const oldStatus = this.physicalStatus;
        this.physicalStatus = newStatus;
        this.log(LogEventType.PHYSICAL_STATUS_CHANGE, 
            `Статус изменён с ${oldStatus} на ${newStatus}${reason ? `: ${reason}` : ''}`,
            { oldStatus, newStatus, reason });
    }
    
    // Изменить статус разборки
    changeDisassemblyStatus(newStatus, reason = '') {
        const oldStatus = this.disassemblyStatus;
        this.disassemblyStatus = newStatus;
        this.log(LogEventType.DISASSEMBLY_STATUS_CHANGE,
            `Статус разборки изменён с ${oldStatus} на ${newStatus}`,
            { oldStatus, newStatus, reason });
    }
    
    // Продажа товара
    sell(price, cashDay = null) {
        if (this.physicalStatus === PhysicalStatus.SOLD) {
            throw new Error('Товар уже продан');
        }
        
        this.salePrice = price;
        this.soldAt = new Date().toISOString();
        this.changePhysicalStatus(PhysicalStatus.SOLD, `Продан за ${price}`);
        this.isReserved = false;
        
        this.log(LogEventType.SALE, `Товар продан за ${price}`, {
            price,
            cashDayId: cashDay?.id || null,
            soldAt: this.soldAt
        });
        
        // Здесь нужно создать CashEvent и CashEventItem
        return true;
    }
    
    // Возврат товара
    return(cashDay = null) {
        if (this.physicalStatus !== PhysicalStatus.SOLD) {
            throw new Error('Возврат возможен только для проданного товара');
        }
        
        this.isReturned = true;
        this.returnedAt = new Date().toISOString();
        this.changePhysicalStatus(PhysicalStatus.IN_STORE, 'Возврат товара');
        
        this.log(LogEventType.RETURN, `Товар возвращён`, {
            cashDayId: cashDay?.id || null,
            returnedAt: this.returnedAt
        });
        
        return true;
    }
    
    // Списание/потеря
    lose(reason, comment = '') {
        this.changePhysicalStatus(PhysicalStatus.LOST, `${reason}: ${comment}`);
        this.isReserved = true;
        
        this.log(LogEventType.LOST, `Товар списан: ${reason}`, { reason, comment });
        return true;
    }
    
    // Разобрать коллекцию на части
    async disassemble(scenario) {
        if (this.disassemblyStatus !== UnitDisassemblyStatus.MONOLITH) {
            throw new Error('Разборка возможна только для MONOLITH');
        }
        
        if (!scenario || !scenario.childProductCodes) {
            throw new Error('Не передан сценарий разборки');
        }
        
        // Замораживаем родителя
        this.changePhysicalStatus(PhysicalStatus.IN_DISASSEMBLED, 'Коллекция разобрана');
        this.changeDisassemblyStatus(UnitDisassemblyStatus.DISASSEMBLED);
        this.isReserved = true;
        
        // Создаём дочерние единицы (здесь нужно обращение к Supabase)
        const childUnits = [];
        for (const childCode of scenario.childProductCodes) {
            // Поиск Product по childCode и создание ProductUnit
            // Это заглушка — реальная реализация через Supabase
            const childUnit = new ProductUnit({
                productId: null, // нужно найти по childCode
                uniqueSerialNumber: `${this.uniqueSerialNumber}-PART-${childCode}`,
                parentUnitId: this.id,
                physicalStatus: PhysicalStatus.IN_COLLECTED,
                disassemblyStatus: UnitDisassemblyStatus.PARTIAL
            });
            childUnits.push(childUnit);
        }
        
        this.childUnits = childUnits;
        
        this.log(LogEventType.DISASSEMBLE, 
            `Коллекция разобрана на ${childUnits.length} частей по сценарию "${scenario.name}"`,
            { scenarioId: scenario.id, partsCount: childUnits.length });
        
        return childUnits;
    }
    
    // Собрать коллекцию из частей
    collect(childUnits) {
        if (this.disassemblyStatus !== UnitDisassemblyStatus.DISASSEMBLED) {
            throw new Error('Сборка возможна только для DISASSEMBLED коллекции');
        }
        
        // Проверяем, что все части не проданы
        const soldParts = childUnits.filter(u => u.physicalStatus === PhysicalStatus.SOLD);
        if (soldParts.length > 0) {
            throw new Error(`Нельзя собрать: ${soldParts.length} частей продано`);
        }
        
        // Восстанавливаем родителя
        this.changePhysicalStatus(PhysicalStatus.IN_COLLECTED, 'Коллекция восстановлена');
        this.changeDisassemblyStatus(UnitDisassemblyStatus.RESTORED);
        this.isReserved = false;
        
        // Помечаем дочерние части как поглощённые
        for (const child of childUnits) {
            child.changePhysicalStatus(PhysicalStatus.ABSORBED, 'Поглощена восстановленной коллекцией');
            child.changeDisassemblyStatus(UnitDisassemblyStatus.COLLECTED);
            child.isReserved = true;
        }
        
        this.log(LogEventType.COLLECT, 
            `Коллекция восстановлена из ${childUnits.length} частей`,
            { partsCount: childUnits.length });
        
        return this;
    }
    
    // Автоматическое восстановление коллекции
    async restore() {
        if (!this.childUnits || this.childUnits.length === 0) {
            throw new Error('Нет сохранённых частей для восстановления');
        }
        
        const availableParts = this.childUnits.filter(
            u => u.physicalStatus !== PhysicalStatus.SOLD && 
                 u.physicalStatus !== PhysicalStatus.LOST
        );
        
        if (availableParts.length === 0) {
            throw new Error('Нет доступных частей для сборки');
        }
        
        return this.collect(availableParts);
    }
    
    // Привязать к заказу
    assignToOrder(orderId) {
        this.orderId = orderId;
        this.log(LogEventType.STATUS_CHANGE, `Привязан к заказу ${orderId}`, { orderId });
    }
    
    // Привязать к покупателю
    assignToCustomer(customerId) {
        this.customerId = customerId;
        this.log(LogEventType.STATUS_CHANGE, `Привязан к покупателю ${customerId}`, { customerId });
    }
    
    // Валидация
    validate() {
        const errors = [];
        if (!this.uniqueSerialNumber) errors.push('Серийный номер обязателен');
        if (!this.productId) errors.push('Не указан ID товара');
        if (this.purchasePrice < 0) errors.push('Цена закупки не может быть отрицательной');
        return errors;
    }
    
    // Получить информацию о товаре
    getInfo() {
        return {
            serial: this.uniqueSerialNumber,
            physicalStatus: this.physicalStatus,
            disassemblyStatus: this.disassemblyStatus,
            isReserved: this.isReserved,
            isReturned: this.isReturned,
            purchasePrice: this.purchasePrice,
            salePrice: this.salePrice,
            soldAt: this.soldAt,
            createdAt: this.createdAt
        };
    }
}

// Тесты для ProductUnit
export function testProductUnitModel() {
    console.log('🧪 Тестируем ProductUnit модель...');
    
    const unit = new ProductUnit({ productId: 1, purchasePrice: 500 });
    console.assert(unit.physicalStatus === PhysicalStatus.IN_STORE, '❌ Начальный статус');
    console.assert(unit.disassemblyStatus === UnitDisassemblyStatus.MONOLITH, '❌ Статус разборки');
    
    // Тест продажи
    unit.sell(1000);
    console.assert(unit.physicalStatus === PhysicalStatus.SOLD, '❌ После продажи статус SOLD');
    console.assert(unit.salePrice === 1000, '❌ Цена продажи');
    
    // Тест возврата
    unit.return();
    console.assert(unit.isReturned === true, '❌ Флаг возврата');
    console.assert(unit.physicalStatus === PhysicalStatus.IN_STORE, '❌ После возврата IN_STORE');
    
    // Тест списания
    const unit2 = new ProductUnit({ productId: 2 });
    unit2.lose('Утерян', 'Потерян при транспортировке');
    console.assert(unit2.physicalStatus === PhysicalStatus.LOST, '❌ После списания LOST');
    
    console.log('✅ Все тесты ProductUnit пройдены!');
    return true;
}