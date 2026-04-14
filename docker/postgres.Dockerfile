FROM postgres:16-alpine

# bake in UTC so all timestamps are consistent
ENV LANG=en_US.utf8
ENV TZ=UTC

EXPOSE 5432
