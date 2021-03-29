const express = require("express");
const app = express();
const fetch = require("node-fetch");

const { formatRelative } = require("date-fns");
const { ru } = require("date-fns/locale");

const port = 8080;
const locale = ru;
const paths = { template: `${__dirname}/../template.html`, store: `${__dirname}/../.store.json` };
const store /*Data*/ = readJsonFile(paths.store) || { cld: 0, hot: 0, upd: new Date().toISOString() };

app.use(express.json()); // for parsing application/json

//
//
//

app
  //
  .put("/roscha/api/wc/water", async (request, response) => {
    console.log(`${request.method} ${request.url}`);

    try {
      const data /*Data*/ = request.body;
      Object.assign(store, data);
      try {
        await write(paths.store, JSON.stringify(store, null, 4));
        response.send({ status: "OK" });
      } catch (e) {
        const errMsg = "DIDNOT_PERSIST";
        console.error(errMsg, e);
        response.send({ status: errMsg });
      }
    } catch (e) {
      const errStr = "Updating failed";
      console.error(errStr, e);
      Object.assign(response, { status: 500, body: errStr + "\n" + e.message });
    }
  })
  .get("/roscha/water.html", async (request, response) => {
    console.log(`${request.method} ${request.url}`);

    const template = read(paths.template);
    response.send(subst(template, store));
  });

//
// Init data
//
const HA_ORIGIN = "https://invntrm.ru:8812";
const headers = { Authorization: `Bearer ${process.env.HA_TOKEN}`, "Content-Type": "application/json" };
fetch(`${HA_ORIGIN}/api/states/sensor.water_hot`, { headers })
  .then((res) => res.json())
  .then((res) => (store.hot = parseFloat(res.state)));
fetch(`${HA_ORIGIN}/api/states/sensor.water_cold`, { headers })
  .then((res) => res.json())
  .then((res) => (store.cld = parseFloat(res.state)));

//
//
//

// app.use(async (context) => {
//   if (context.request.method !== "GET") return;
//   console.log("static", "GET", context.request.url.pathname);
//   if (!context.request.url.pathname.startsWith("/roscha")) return;

//   try {
//     await send(context, context.request.url.pathname.replace("/roscha", ""), {
//       root: `${__dirname}/../static`,
//       index: "index.html",
//     });
//   } catch (e) {
//     const errStr = "Static upload failed";
//     console.error(errStr, e);
//     context.response.send({ status: 500, body: errStr + "\n" + e.message });
//   }
// });

app.use("/roscha", express.static(`${__dirname}/../static`));

app.listen(port, () => {
  console.log(`http://localhost:${port}/`);
});

/*type Data = {
  hot: number;
  cld: number;
  upd: string; // DateTimeIso
}*/

function subst(template, data /*Data*/) {
  const upd = formatDate(data.upd);
  return template.replace("{hot}", data.hot.toFixed(3)).replace("{cld}", data.cld.toFixed(3)).replace("{upd}", upd);
}

function read(name) {
  return require("fs").readFileSync(name, "utf8");
}
function write(name, data) {
  return require("fs").writeFileSync(name, data);
}

function readJsonFile(path) {
  const json = read(path);
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error(`JSON hadn't parsed: ${e}\npath: ${path}\ncontent: «${json}»`);
    return undefined;
  }
}

function formatDate(date) {
  try {
    return formatRelative(new Date(date), new Date(), { locale });
  } catch (e) {
    console.error("Date had not formatted", e, date);
    return date;
  }
}
