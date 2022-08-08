const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
app.get("/doublon-enrollement", async (req, res) => {
  var query = req.query;
  var username = query.username; //"Nosybe"
  console.log(username);
  var password = query.password; //"2021@Covax"
  var periode = query.periode; //"LAST_12_MONTHS"
  var idOrgUnit = query.idOrgUnit; //"A8UMJuP8iI3"
  var sortie = query.sortie; //"enrollments"
  var outputType = query.outputType; //"ENROLLMENT"
  var sort = query.sort; //"enrollmentDate"
  var columns =
    "dimension=a1jCssI2LkW.eNRjVGxVL6l&dimension=a1jCssI2LkW.SB1IHYu2xQT&dimension=a1jCssI2LkW.NI0QRzJvQ0k&dimension=a1jCssI2LkW.LY2bDXpNvS7&dimension=a1jCssI2LkW.oindugucx72&dimension=a1jCssI2LkW.KSr2yTdu1AI&dimension=a1jCssI2LkW.Ewi7FUfcHAD&dimension=a1jCssI2LkW.fctSQp5nAYl";
  var credentials = Buffer.from(username + ":" + password).toString("base64");
  var auth = { Authorization: `Basic ${credentials}` };
  var url = "https://covax.vaksiny.gov.mg/api/29/analytics/";
  const response = await fetch(
    URLStructure(url, sortie, periode, idOrgUnit, columns, outputType, sort),
    { headers: auth }
  );

  var statusText = response.statusText;
  var status = response.status;
  if (status == "200") {
    var data = await response.json();
    var headerWidth = data.headerWidth;
    var headers = data.headers;
    var height = data.height;
    var keys = [];
    for (var i = 0; i < height; i++) {
      keys.push(
        (data.rows[i][10] + data.rows[i][11] + data.rows[i][12])
          .replace(/\s/g, "")
          .toUpperCase()
      );
    }
    var duplicateKey = keys
      .filter((item, index) => keys.indexOf(item) !== index)
      .filter((n) => n);
    var duplicateValue = [];
    for (var i = 0; i < height; i++) {
      if (
        duplicateKey.includes(
          (data.rows[i][10] + data.rows[i][11] + data.rows[i][12])
            .replace(/\s/g, "")
            .toUpperCase()
        )
      ) {
        duplicateValue.push(data.rows[i]);
      }
    }
    https: res.json({
      statusText: statusText,
      status: status,
      data: duplicateValue.sort((a, b) =>
        (a[10] + a[11] + a[12]).replace(/\s/g, "").toUpperCase() >
        (b[10] + b[11] + b[12]).replace(/\s/g, "").toUpperCase()
          ? 1
          : -1
      ),
      headers: headers,
    });
  } else {
    https: res.json({
      statusText: statusText,
      status: status,
    });
  }
});

app.get("/NA-enrollement", async (req, res) => {
  var query = req.query;
  var username = query.username; //"Nosybe"
  var password = query.password; //"2021@Covax"
  var periode = query.periode; //"LAST_12_MONTHS"
  var idOrgUnit = query.idOrgUnit; //"A8UMJuP8iI3"
  var sortie = query.sortie; //"enrollments"
  var outputType = query.outputType; //"ENROLLMENT"
  var sort = query.sort; //"enrollmentDate"
  var columns =
    "dimension=a1jCssI2LkW.eNRjVGxVL6l&dimension=a1jCssI2LkW.SB1IHYu2xQT&dimension=a1jCssI2LkW.NI0QRzJvQ0k&dimension=a1jCssI2LkW.LY2bDXpNvS7&dimension=a1jCssI2LkW.oindugucx72&dimension=a1jCssI2LkW.KSr2yTdu1AI&dimension=a1jCssI2LkW.Ewi7FUfcHAD&dimension=a1jCssI2LkW.fctSQp5nAYl";
  var credentials = Buffer.from(username + ":" + password).toString("base64");
  var auth = { Authorization: `Basic ${credentials}` };
  var url = "https://covax.vaksiny.gov.mg/api/29/analytics/";
  const response = await fetch(
    URLStructure(url, sortie, periode, idOrgUnit, columns, outputType, sort),
    { headers: auth }
  );
  var statusText = response.statusText;
  var status = response.status;
  if (status == "200") {
    var data = await response.json();
    var headers = data.headers;
    var height = data.height;
    var NA = [];
    for (var i = 0; i < height; i++) {
      if (
        data.rows[i][12].replace(/\s/g, "").trim().length == 0 ||
        data.rows[i][13].replace(/\s/g, "").trim().length == 0 ||
        data.rows[i][14].replace(/\s/g, "").trim().length == 0
      ) {
        NA.push(data.rows[i]);
      }
    }
    https: res.json({
      statusText: statusText,
      status: status,
      data: NA.sort((a, b) => (NA[7] > NA[7] ? 1 : -1)),
      headers: headers,
    });
  } else {
    https: res.json({
      statusText: statusText,
      status: status,
    });
  }
});

app.get("/doublon-evenement", async (req, res) => {
  var query = req.query;
  var username = query.username; //"Nosybe"
  var password = query.password; //"2021@Covax"
  var periode = query.periode; //"LAST_12_MONTHS"
  var idOrgUnit = query.idOrgUnit; //"A8UMJuP8iI3"
  var sortie = query.sortie; //"enrollments"
  var outputType = query.outputType; //"ENROLLMENT"
  var sort = query.sort; //"enrollmentDate"
  var columns =
    "dimension=a1jCssI2LkW.KSr2yTdu1AI&dimension=a1jCssI2LkW.bbnyNYD1wgS&dimension=a1jCssI2LkW.LUIsbsm3okG&dimension=a1jCssI2LkW.eNRjVGxVL6l&dimension=a1jCssI2LkW.SB1IHYu2xQT&dimension=a1jCssI2LkW.QCwlZedwacH";
  var credentials = Buffer.from(username + ":" + password).toString("base64");
  var auth = { Authorization: `Basic ${credentials}` };
  var url = "https://covax.vaksiny.gov.mg/api/29/analytics/";
  const response = await fetch(
    URLStructure(url, sortie, periode, idOrgUnit, columns, outputType, sort),
    { headers: auth }
  );
  var statusText = response.statusText;
  var status = response.status;
  if (status == "200") {
    var data = await response.json();
    var headerWidth = data.headerWidth;
    var headers = data.headers;
    var height = data.height;
    var keys = [];
    for (var i = 0; i < height; i++) {
      keys.push(
        (data.rows[i][13] + data.rows[i][14] + data.rows[i][15])
          .replace(/\s/g, "")
          .toUpperCase()
      );
    }
    var duplicateKey = keys
      .filter((item, index) => keys.indexOf(item) !== index)
      .filter((n) => n);
    var duplicateValue = [];
    for (var i = 0; i < height; i++) {
      if (
        duplicateKey.includes(
          (data.rows[i][13] + data.rows[i][14] + data.rows[i][15])
            .replace(/\s/g, "")
            .toUpperCase()
        )
      ) {
        duplicateValue.push(data.rows[i]);
      }
    }
    https: res.json({
      statusText: statusText,
      status: status,
      data: duplicateValue.sort((a, b) =>
        (a[13] + a[14] + a[15]).replace(/\s/g, "").toUpperCase() >
        (b[13] + b[14] + b[15]).replace(/\s/g, "").toUpperCase()
          ? 1
          : -1
      ),
      headers: headers,
    });
  } else {
    https: res.json({
      statusText: statusText,
      status: status,
    });
  }
});

app.get("/NA-evenement", async (req, res) => {
  var query = req.query;
  var username = query.username; //"Nosybe"
  var password = query.password; //"2021@Covax"
  var periode = query.periode; //"LAST_12_MONTHS"
  var idOrgUnit = query.idOrgUnit; //"A8UMJuP8iI3"
  var sortie = query.sortie; //"enrollments"
  var outputType = query.outputType; //"ENROLLMENT"
  var sort = query.sort; //"enrollmentDate"
  var columns =
    "dimension=a1jCssI2LkW.eNRjVGxVL6l&dimension=a1jCssI2LkW.SB1IHYu2xQT&dimension=a1jCssI2LkW.NI0QRzJvQ0k&dimension=a1jCssI2LkW.LY2bDXpNvS7&dimension=a1jCssI2LkW.oindugucx72&dimension=a1jCssI2LkW.KSr2yTdu1AI&dimension=a1jCssI2LkW.Ewi7FUfcHAD&dimension=a1jCssI2LkW.fctSQp5nAYl";
  var credentials = Buffer.from(username + ":" + password).toString("base64");
  var auth = { Authorization: `Basic ${credentials}` };
  var url = "https://covax.vaksiny.gov.mg/api/29/analytics/";
  const response = await fetch(
    URLStructure(url, sortie, periode, idOrgUnit, columns, outputType, sort),
    { headers: auth }
  );
  var statusText = response.statusText;
  var status = response.status;
  if (status == "200") {
    var data = await response.json();
    var height = data.height;
    var headers = data.headers;
    var NA = [];
    for (var i = 0; i < height; i++) {
      if (
        data.rows[i][16].replace(/\s/g, "").trim().length == 0 ||
        data.rows[i][17].replace(/\s/g, "").trim().length == 0 ||
        data.rows[i][18].replace(/\s/g, "").trim().length == 0
      ) {
        NA.push(data.rows[i]);
      }
    }
    https: res.json({
      statusText: statusText,
      status: status,
      data: NA,
      headers: headers,
    });
  } else {
    https: res.json({
      statusText: statusText,
      status: status,
    });
  }
});

function URLStructure(
  url,
  sortie,
  periode,
  idOrgUnit,
  columns,
  outputType,
  sort
) {
  return (
    url +
    sortie +
    "/query/yDuAzyqYABS.json?dimension=pe:" +
    periode +
    "&dimension=ou:" +
    idOrgUnit +
    "&" +
    columns +
    "&stage=a1jCssI2LkW&displayProperty=NAME&outputType=" +
    outputType +
    "&desc=" +
    sort
  );
  console.log(
    url +
      sortie +
      "/query/yDuAzyqYABS.json?dimension=pe:" +
      periode +
      "&dimension=ou:" +
      idOrgUnit +
      "&" +
      columns +
      "&stage=a1jCssI2LkW&displayProperty=NAME&outputType=" +
      outputType +
      "&desc=" +
      sort
  );
}

app.listen(process.env.PORT || 3000, () => console.log("Data api ready..."));
