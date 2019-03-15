ARG BASE_IMAGE_PREFIX="docker.adeo.no:5000/pus/"
FROM ${BASE_IMAGE_PREFIX}node as builder

ADD / /source
ENV CI=true
WORKDIR /source
RUN npm ci
ENV NODE_ENV=production
RUN npm run build

FROM docker.adeo.no:5000/pus/decorator
COPY --from=builder /source/build /app
ADD decorator.yaml /decorator.yaml
ENV CONTEXT_PATH /