# TestIT Cypress Adapter

Это пакет для синхронизации тестов из Cypress в TestIt на основе JUnit отчёта.

На текущий момент синхронизация возможна только в части простановки флага автоматизации в TestIT.

## Установка и использование

Установка через Yarn:
```
yarn add @notamedia/cypress-testit-adapter
```

Или через NPM:
```
npm add @notamedia/cypress-testit-adapter
```

Пример запуска:
```
yarn cypress-testit-adapter-export --testit-project-id <project_id> --testit-token <token> --report /app/junit.xml
```

## Используемые аргументы

### Обязательные

- `--testit-project-id` - UUID проекта, с которым выполняется интеграция
- `--testit-token` - Токен доступа к API TestIT
- `--report` - Путь к файлу с JUnit отчётом от Cypress

### Опциональные

- `--report-basedir` - Базовый путь до директории с отчётами, по умолчанию не используется
- `--testit-base-url` - Базовый URL до TestIT, по умолчанию `https://testit.software`

## Отладка

Для вывода дополнительной информации можно задать переменную окружения `DEBUG='*'`, пример запуска:

```
DEBUG='*' yarn cypress-testit-adapter-export --testit-project-id <project_id> --testit-token <token> --report /app/junit.xml
```

## Сборка и запуск через Docker

```
docker build . -t cypress-testit-adapter:latest
docker run \
  --rm \
  -e DEBUG=* \
  -v $(pwd)/reports/junit.xml:/app/junit.xml \
  docker.io/library/cypress-testit-adapter:latest \
  yarn cypress-testit-adapter-export --testit-project-id <project_id> --testit-token <token> --report /app/junit.xml
```

Где:
- `<project_id>` - ID проекта в TestIT
- `<token>` - Токен доступа к API в TestIT

## Пример интеграции

Связь тесткейса из TestIT и автотеста в Cypress формируется на основе включения в описание номера тесткейса через символ "#" (может быть сразу несколько).

Пример теста с одной связью
```
it('#123 should display Index page correctly', () => {
  cy.visit('/');
});
```

Пример теста с несколькими связями
```
it('#123 #456 #789 should display Index page correctly', () => {
  cy.visit('/');
});
```

Также в Cypress должна быть настроена генерация JUnit отчёта по документации: https://docs.cypress.io/guides/tooling/reporters

После выполнения тестирования Cypress сгенерирует JUnit отчёт, который может быть распарсен данным инструментом для синхронизации связей между автотестами и тесткейсами в TestIT.

## Тестирование

```bash
cd src
yarn test
```
