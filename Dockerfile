FROM node:16

RUN groupadd testit && useradd --no-log-init -g testit testit

USER testit:testit

WORKDIR /home/testit

ENV \
  NODE_ENV='production' \
  REPORT_BASEDIR='/app' \
  TESTIT_BASE_URL='https://testit.software' \
  TESTIT_PROJECT_ID='' \
  TESTIT_TOKEN=''

# Копирование всего кроме кода выделено отдельно чтобы закешировать слой и использовать его если не было измений в пакетах
COPY --chown=testit:testit ./src/package.json src/yarn.lock src/.yarnrc.yml ./
COPY --chown=testit:testit ./src/.yarn ./.yarn/
RUN yarn workspaces focus --production && yarn cache clean --mirror

COPY ./src/app ./app/
