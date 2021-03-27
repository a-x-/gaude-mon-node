FROM node:alpine

# The port that your application listens to.
EXPOSE 8080

WORKDIR /app

# Prefer not to run as root.
USER node

# Cache the dependencies as a layer (the following two steps are re-run only when src/deps.ts is modified).
# Ideally cache src/deps.ts will download and compile _all_ external files used in src/index.ts.
# COPY src/deps.ts .
# RUN deno cache src/deps.ts

# These steps will be re-run upon each file change in your working directory:
ADD . .

CMD ["node", "src/index.ts"]
