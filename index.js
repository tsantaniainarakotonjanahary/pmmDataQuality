const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
var timeout = require("connect-timeout");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
app.get("/doublon-enrollment", async (req, res) => {
  const response = await fetch(
    URLStructure(
      "https://covax.vaksiny.gov.mg/api/29/analytics/",
      req.query.sortie,
      req.query.periode,
      req.query.idOrgUnit,
      "dimension=a1jCssI2LkW.eNRjVGxVL6l&dimension=a1jCssI2LkW.SB1IHYu2xQT&dimension=a1jCssI2LkW.NI0QRzJvQ0k&dimension=a1jCssI2LkW.LY2bDXpNvS7&dimension=a1jCssI2LkW.oindugucx72&dimension=a1jCssI2LkW.KSr2yTdu1AI&dimension=a1jCssI2LkW.Ewi7FUfcHAD&dimension=a1jCssI2LkW.fctSQp5nAYl",
      req.query.outputType,
      req.query.sort
    ),
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          req.query.username + ":" + req.query.password
        ).toString("base64")}`,
      },
    }
  );

  if (response.status == "200") {
    var s = (await response.json()).rows;
    s.sort((a, b) =>
      (a[10] + a[11] + a[12]).replace(/\s/g, "").toUpperCase() >
      (b[10] + b[11] + b[12]).replace(/\s/g, "").toUpperCase()
        ? 1
        : -1
    );

    if (
      (s[0][10] + s[0][11] + s[0][12]).replace(/\s/g, "").toUpperCase() !==
      (s[1][10] + s[1][11] + s[1][12]).replace(/\s/g, "").toUpperCase()
    ) {
      s.splice(0, 1);
    }

    for (var i = 1; i < s.length - 1; i++) {
      switch (s[i][13].replace(/\s/g, "")) {
        case "1":
          s[i][13] = "Agent de santé";
          break;
        case "2":
          s[i][13] = "Force de l'ordre";
          break;
        case "3":
          s[i][13] = "Personne âgée";
          break;
        case "4":
          s[i][13] = "Travailleurs sociaux";
          break;
        case "5":
          s[i][13] = "Autres";
      }

      if (
        (s[i - 1][10] + s[i - 1][11] + s[i - 1][12])
          .replace(/\s/g, "")
          .toUpperCase() !==
          (s[i][10] + s[i][11] + s[i][12]).replace(/\s/g, "").toUpperCase() &&
        (s[i][10] + s[i][11] + s[i][12]).replace(/\s/g, "").toUpperCase() !==
          (s[i + 1][10] + s[i + 1][11] + s[i + 1][12])
            .replace(/\s/g, "")
            .toUpperCase()
      ) {
        s.splice(i, 1);
        i = i - 1;
      }
    }

    if (
      (s[s.length - 2][10] + s[s.length - 2][11] + s[s.length - 2][12])
        .replace(/\s/g, "")
        .toUpperCase() !==
      (s[s.length - 1][10] + s[s.length - 1][11] + s[s.length - 1][12])
        .replace(/\s/g, "")
        .toUpperCase()
    ) {
      s.splice(s.length - 1, 1);
    }

    for (var i = 0; i < s.length; i++) {
      if ((s[i][10] + s[i][11] + s[i][12]).replace(/\s/g, "").length != 0) {
        s[i] = [
          s[i][7],
          s[i][10],
          s[i][11],
          s[i][12],
          s[i][13],
          s[i][14],
          s[i][15],
          s[i][16],
          s[i][17],
        ];
      } else {
        s.splice(i, 1);
        i = i - 1;
      }
    }

    https: res.json({
      statusText: response.statusText,
      status: response.status,
      data: s,
      headers: [
        "Unité d'organisation",
        "Nom",
        "Prénom",
        "Date de naissance ",
        "Type de cible",
        "Sexe",
        "CODE_EPI",
        "CIN",
        "TEL",
      ],
    });
  } else {
    https: res.json({
      statusText: response.statusText,
      status: response.status,
    });
  }
});

app.get("/NA-enrollment", async (req, res) => {
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
    var headers = [
      "Unite d'organisation",
      "Nom",
      "Prenom",
      "Date de naissance",
      "Type de cible",
      "sexe",
      "CODE_EPI",
      "CIN",
      "TEL",
    ];
    var height = data.height;
    var NA = [];
    NA.push([]);
    for (var i = 0; i < height; i++) {
      if (
        data.rows[i][12].replace(/\s/g, "").trim().length == 0 ||
        data.rows[i][13].replace(/\s/g, "").trim().length == 0 ||
        data.rows[i][14].replace(/\s/g, "").trim().length == 0
      ) {
        if (data.rows[i][13].replace(/\s/g, "").trim().length != 0) {
          if (parseInt(data.rows[i][13].replace(/\s/g, "").trim()) == 1) {
            data.rows[i][13] = "Agent de santé";
          }
          if (parseInt(data.rows[i][13].replace(/\s/g, "").trim()) == 2) {
            data.rows[i][13] = "Force de l'ordre";
          }
          if (parseInt(data.rows[i][13].replace(/\s/g, "").trim()) == 3) {
            data.rows[i][13] = "Personne âgée";
          }
          if (parseInt(data.rows[i][13].replace(/\s/g, "").trim()) == 4) {
            data.rows[i][13] = "Travailleurs sociaux";
          }
          if (parseInt(data.rows[i][13].replace(/\s/g, "").trim()) == 5) {
            data.rows[i][13] = "Autres";
          }
        }
        NA.push([
          data.rows[i][7],
          data.rows[i][10],
          data.rows[i][11],
          data.rows[i][12],
          data.rows[i][13],
          data.rows[i][14],
          data.rows[i][15],
          data.rows[i][16],
          data.rows[i][17],
        ]);
      }
    }
    https: res.json({
      statusText: statusText,
      status: status,
      data: NA.sort((a, b) => (a[0] > b[0] ? 1 : -1)),
      headers: headers,
    });
  } else {
    https: res.json({
      statusText: statusText,
      status: status,
    });
  }
});

app.get("/doublon-event", async (req, res) => {
  var query = req.query;
  var username = query.username;
  var password = query.password;
  var periode = query.periode;
  var idOrgUnit = query.idOrgUnit; //"A8UMJuP8iI3"
  var sortie = query.sortie; //"enrollments"
  var outputType = query.outputType; //"ENROLLMENT"
  var sort = query.sort; //"enrollmentDate"
  var columns =
    "dimension=a1jCssI2LkW.bbnyNYD1wgS&dimension=a1jCssI2LkW.LUIsbsm3okG&dimension=a1jCssI2LkW.Yp1F4txx8tm&dimension=a1jCssI2LkW.eNRjVGxVL6l&dimension=a1jCssI2LkW.SB1IHYu2xQT&dimension=a1jCssI2LkW.KSr2yTdu1AI";
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
    var headers = [
      "Unite d'organisation",
      "Nom de vaccin",
      "Numero de dose",
      "Numero de lot",
      "Nom",
      "Prenom",
      "EPI",
    ];
    var height = data.height;
    var keys = [];
    for (var i = 0; i < height; i++) {
      keys.push(
        (data.rows[i][13] + data.rows[i][14] + data.rows[i][18])
          .replace(/\s/g, "")
          .toUpperCase()
      );
    }
    var duplicateKey = keys
      .filter((item, index) => keys.indexOf(item) !== index)
      .filter((n) => n);
    var duplicateValue = [];
    //duplicateValue.push([]);
    for (var i = 0; i < height; i++) {
      if (
        duplicateKey.includes(
          (data.rows[i][13] + data.rows[i][14] + data.rows[i][18])
            .replace(/\s/g, "")
            .toUpperCase()
        )
      ) {
        duplicateValue.push([
          data.rows[i][10],
          data.rows[i][13],
          data.rows[i][14],
          data.rows[i][15],
          data.rows[i][16],
          data.rows[i][17],
          data.rows[i][18],
        ]);
      }
    }
    var sorted = duplicateValue.sort((a, b) =>
      (a[1] + a[2] + a[6]).replace(/\s/g, "").toUpperCase() >
      (b[1] + b[2] + b[6]).replace(/\s/g, "").toUpperCase()
        ? 1
        : -1
    );

    https: res.json({
      statusText: statusText,
      status: status,
      data: sorted,
      headers: headers,
    });
  } else {
    https: res.json({
      statusText: statusText,
      status: status,
    });
  }
});

app.get("/NA-event", async (req, res) => {
  var query = req.query;
  var username = query.username; //"Nosybe"
  var password = query.password; //"2021@Covax"
  var periode = query.periode; //"LAST_12_MONTHS"
  var idOrgUnit = query.idOrgUnit; //"A8UMJuP8iI3"
  var sortie = query.sortie; //"enrollments"
  var outputType = query.outputType; //"ENROLLMENT"
  var sort = query.sort; //"enrollmentDate"
  var columns =
    "dimension=a1jCssI2LkW.bbnyNYD1wgS&dimension=a1jCssI2LkW.LUIsbsm3okG&dimension=a1jCssI2LkW.Yp1F4txx8tm&dimension=a1jCssI2LkW.eNRjVGxVL6l&dimension=a1jCssI2LkW.SB1IHYu2xQT&dimension=a1jCssI2LkW.KSr2yTdu1AI";
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
    var headers = [
      "Unite d'organisation",
      "Nom de vaccin",
      "Numero de dose",
      "Numero de lot",
      "Nom",
      "Prenom",
      "CODE_EPI",
    ];
    var NA = [];
    NA.push([]);
    for (var i = 0; i < height; i++) {
      if (
        data.rows[i][12].replace(/\s/g, "").trim().length == 0 ||
        data.rows[i][13].replace(/\s/g, "").trim().length == 0 ||
        data.rows[i][14].replace(/\s/g, "").trim().length == 0
      ) {
        NA.push([
          data.rows[i][10],
          data.rows[i][13],
          data.rows[i][14],
          data.rows[i][15],
          data.rows[i][16],
          data.rows[i][17],
          data.rows[i][18],
        ]);
      }
    }
    https: res.json({
      statusText: statusText,
      status: status,
      data: NA.sort((a, b) => (a[0] > b[0] ? 1 : -1)),
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
}

app.listen(process.env.PORT || 3000, () => console.log("Data api ready..."));
