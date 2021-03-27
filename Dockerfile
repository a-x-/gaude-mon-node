FROM arm32v7/node:alpine

# The port that your application listens to.
EXPOSE 8080

WORKDIR /app

# Prefer not to run as root.
USER node

# Cache the dependencies as a layer (the following two steps are re-run only when src/deps.js is modified).
# Ideally cache src/deps.js will download and compile _all_ external files used in src/index.js.
# COPY src/deps.js .
# RUN deno cache src/deps.js

# These steps will be re-run upon each file change in your working directory:
ADD . .

CMD ["node", "src/index.js"]
