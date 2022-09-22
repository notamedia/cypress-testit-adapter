FROM node:16

RUN groupadd testit && useradd --no-log-init -g testit testit

USER testit:testit

WORKDIR /home/testit

ENV NODE_ENV='production'

# Копирование всего кроме кода выделено отдельно чтобы закешировать слой и использовать его если не было измений в пакетах
COPY --chown=testit:testit ./src/package.json src/yarn.lock src/.yarnrc.yml ./
COPY --chown=testit:testit ./src/.yarn ./.yarn/
RUN yarn workspaces focus --production && yarn cache clean --mirror

COPY ./src/app ./app/
