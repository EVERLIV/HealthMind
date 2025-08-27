# 🔒 Правила безопасности для иконок и карточек

Набор правил для предотвращения выезжания иконок и контента за границы элементов.

## 🚨 Исправленная проблема
**Проблема**: В карточке "новый анализ" на странице /blood-analyses иконка выезжала за поля при недостаточном пространстве.

## 🛠️ Готовые CSS классы

### Безопасные карточки
```css
.safe-card {
  overflow: hidden;
}

.safe-card-content {
  flex items-center gap-2 max-w-full overflow-hidden;
}
```

### Безопасный текстовый контент
```css
.safe-text-content {
  flex-1 min-w-0; /* Позволяет тексту сжиматься */
}

.safe-truncate {
  truncate min-w-0; /* Обрезает текст с многоточием */
}
```

### Безопасные иконки
```css
.safe-icon {
  flex-shrink-0 overflow-hidden; /* Иконки никогда не сжимаются */
}
```

## 📐 Компонент IconContainer

Встроенные правила безопасности:
- `flex-shrink-0` - иконка никогда не сжимается
- `overflow-hidden` - контент не выходит за границы
- `hover:scale-[1.05]` - безопасный hover эффект (максимум 5% увеличение)

```jsx
<IconContainer size="sm" className="flex-shrink-0">
  <Icon className={iconSizes.sm} />
</IconContainer>
```

## 🎯 Правила для карточек с иконками

### ✅ Правильно
```jsx
<Card className="overflow-hidden">
  <div className="flex items-center gap-2 max-w-full">
    <IconContainer size="sm" className="flex-shrink-0">
      <Icon className={iconSizes.sm} />
    </IconContainer>
    <div className="flex-1 min-w-0 pr-1">
      <div className="font-semibold truncate">Текст</div>
      <div className="text-xs text-gray-600 truncate">Подтекст</div>
    </div>
    <IconContainer size="xs" className="flex-shrink-0">
      <Icon className={iconSizes.xs} />
    </IconContainer>
  </div>
</Card>
```

### ❌ Неправильно
```jsx
<Card>
  <div className="flex items-center gap-3">
    <div className="w-8 h-8"> <!-- Может сжиматься -->
      <Icon className="w-4 h-4" />
    </div>
    <div> <!-- Не может сжиматься -->
      <div>Очень длинный текст без truncate</div>
    </div>
    <Icon className="w-4 h-4" /> <!-- Может выйти за границы -->
  </div>
</Card>
```

## 📏 Правила размеров

### Gap (отступы)
- Компактные карточки: `gap-2` (8px)
- Обычные карточки: `gap-3` (12px)
- Большие карточки: `gap-4` (16px)

### Hover эффекты
- Иконки: `hover:scale-[1.05]` (максимум)
- Карточки: `hover:scale-[1.02]` (максимум)
- Кнопки: `active:scale-95` (сжатие при нажатии)

## 🏷️ Применение в проекте

### Обновленные компоненты
1. ✅ IconContainer - встроенная защита
2. ✅ blood-analyses-list.tsx - исправлены карточки "новый анализ"
3. ✅ dashboard.tsx - единая система иконок
4. ✅ biomarkers.tsx - единая система иконок
5. ✅ blood-analysis.tsx - единая система иконок

### Проверить при добавлении новых карточек
- [ ] Используется ли `overflow-hidden` на карточке?
- [ ] Есть ли `flex-shrink-0` на иконках?
- [ ] Есть ли `min-w-0` на текстовых блоках?
- [ ] Используется ли `truncate` для длинного текста?
- [ ] Ограничен ли hover эффект до 5%?

## 🚀 Быстрая проверка

Добавьте эти классы для мгновенной защиты:

```jsx
// Быстрое исправление карточки
<Card className="safe-card">
  <div className="safe-card-content">
    <IconContainer className="safe-icon">
      <Icon />
    </IconContainer>
    <div className="safe-text-content">
      <div className="safe-truncate">Текст</div>
    </div>
  </div>
</Card>
```