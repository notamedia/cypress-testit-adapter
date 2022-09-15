# TestIT Cypress Adapter

Это образ для синхронизации тестов из Cypress в TestIt на основе JUnit отчёта.

На текущий момент синхронизация возможна только в части простановки флага автоматизации в TestIT.

## Используемые переменные окружения

### Обязательные

- `TESTIT_PROJECT_ID` - UUID проекта, с которым выполняется интеграция
- `TESTIT_TOKEN` - Токен доступа к API TestIT

### Опциональные

- `REPORT_BASEDIR` - Базовый путь до директории с отчётами, по умолчанию `/app`
- `TESTIT_BASE_URL` - Базовый URL до TestIT, по умолчанию `https://testit.software`

## Сборка и запуск

```
docker build . -t cypress-testit-adapter:latest
docker run \
  --rm \
  -e TESTIT_BASE_URL=https://testit.software \
  -e TESTIT_PROJECT_ID=<project_id> \
  -e TESTIT_TOKEN=<token> \
  -v $(pwd)/reports/junit.xml:/app/junit.xml \
  docker.io/library/cypress-testit-adapter:latest \
  yarn testit:export:cypress junit.xml
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
