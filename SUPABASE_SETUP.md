# Supabase Setup for HealthMind

## 1. Создание проекта Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Войдите в аккаунт или зарегистрируйтесь
3. Нажмите "New Project"
4. Выберите организацию и введите название проекта: `healthmind`
5. Выберите регион (рекомендуется ближайший к вашим пользователям)
6. Создайте пароль для базы данных
7. Нажмите "Create new project"

## 2. Настройка переменных окружения

После создания проекта получите следующие данные:

1. **Project URL** - найдите в Settings > API
2. **Anon Key** - найдите в Settings > API

Создайте файл `.env` в корне проекта:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# Other Configuration
NODE_ENV=production
PORT=5000
```

## 3. Настройка базы данных

### Вариант 1: Через Supabase Dashboard (SQL Editor)

1. Откройте ваш проект в Supabase Dashboard
2. Перейдите в SQL Editor
3. Скопируйте содержимое файла `supabase/migrations/001_initial_schema.sql`
4. Вставьте в SQL Editor и выполните
5. Скопируйте содержимое файла `supabase/migrations/002_seed_biomarkers.sql`
6. Вставьте в SQL Editor и выполните

### Вариант 2: Через Supabase CLI

1. Установите Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Войдите в Supabase:
   ```bash
   supabase login
   ```

3. Свяжите проект:
   ```bash
   supabase link --project-ref your-project-id
   ```

4. Примените миграции:
   ```bash
   supabase db push
   ```

## 4. Настройка Row Level Security (RLS)

Для безопасности данных рекомендуется настроить RLS:

```sql
-- Включить RLS для всех таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomarker_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Политики для пользователей (только свои данные)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id);

-- Политики для профилей здоровья
CREATE POLICY "Users can view own health profiles" ON health_profiles FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own health profiles" ON health_profiles FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own health profiles" ON health_profiles FOR UPDATE USING (auth.uid()::text = user_id);

-- Политики для анализов крови
CREATE POLICY "Users can view own blood analyses" ON blood_analyses FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own blood analyses" ON blood_analyses FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own blood analyses" ON blood_analyses FOR UPDATE USING (auth.uid()::text = user_id);

-- Политики для результатов биомаркеров
CREATE POLICY "Users can view own biomarker results" ON biomarker_results FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM blood_analyses 
    WHERE blood_analyses.id = biomarker_results.analysis_id 
    AND blood_analyses.user_id = auth.uid()::text
  )
);
CREATE POLICY "Users can insert own biomarker results" ON biomarker_results FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM blood_analyses 
    WHERE blood_analyses.id = biomarker_results.analysis_id 
    AND blood_analyses.user_id = auth.uid()::text
  )
);

-- Политики для чатов
CREATE POLICY "Users can view own chat sessions" ON chat_sessions FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own chat sessions" ON chat_sessions FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own chat sessions" ON chat_sessions FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own chat messages" ON chat_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_sessions 
    WHERE chat_sessions.id = chat_messages.session_id 
    AND chat_sessions.user_id = auth.uid()::text
  )
);
CREATE POLICY "Users can insert own chat messages" ON chat_messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_sessions 
    WHERE chat_sessions.id = chat_messages.session_id 
    AND chat_sessions.user_id = auth.uid()::text
  )
);

-- Политики для метрик здоровья
CREATE POLICY "Users can view own health metrics" ON health_metrics FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own health metrics" ON health_metrics FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Политики для сессий
CREATE POLICY "Users can view own sessions" ON sessions FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own sessions" ON sessions FOR DELETE USING (auth.uid()::text = user_id);

-- Политики для логов активности
CREATE POLICY "Users can view own activity logs" ON user_activity_logs FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own activity logs" ON user_activity_logs FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Биомаркеры доступны всем (только для чтения)
CREATE POLICY "Biomarkers are viewable by everyone" ON biomarkers FOR SELECT USING (true);
```

## 5. Настройка аутентификации

1. В Supabase Dashboard перейдите в Authentication > Settings
2. Настройте URL для редиректа:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/auth/callback`

3. Включите провайдеры аутентификации (по желанию):
   - Email/Password
   - Google
   - GitHub
   - и другие

## 6. Настройка Storage (опционально)

Для хранения изображений анализов крови:

1. Перейдите в Storage
2. Создайте bucket: `blood-analysis-images`
3. Настройте политики доступа:

```sql
-- Политика для загрузки изображений
CREATE POLICY "Users can upload own images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'blood-analysis-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Политика для просмотра изображений
CREATE POLICY "Users can view own images" ON storage.objects FOR SELECT USING (
  bucket_id = 'blood-analysis-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 7. Тестирование подключения

После настройки проверьте подключение:

```bash
curl https://your-domain.com/api/health/supabase
```

Должен вернуть:
```json
{
  "status": "ok",
  "supabase": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 8. Мониторинг

1. Используйте Supabase Dashboard для мониторинга:
   - Database > Logs - для просмотра запросов
   - Authentication > Users - для управления пользователями
   - API > Logs - для просмотра API запросов

2. Настройте алерты в Supabase Dashboard для:
   - Высокого использования базы данных
   - Ошибок аутентификации
   - Превышения лимитов API

## Структура базы данных

Приложение использует следующие основные таблицы:

- **users** - пользователи системы
- **health_profiles** - профили здоровья пользователей
- **blood_analyses** - анализы крови
- **biomarkers** - справочник биомаркеров
- **biomarker_results** - результаты анализа биомаркеров
- **chat_sessions** - сессии чата с ИИ
- **chat_messages** - сообщения в чате
- **health_metrics** - метрики здоровья
- **sessions** - сессии аутентификации
- **user_activity_logs** - логи активности пользователей
