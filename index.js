const express = require("express");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cors = require("cors");
const process = require('process');
var pg = require('pg');
const app = express();
app.use(express.json());
app.use(cors());
app.get("/test", async (req, res) => res.json({val : "Bienvenue !!!!!" }));

const { MongoClient } = require('mongodb');
const client = new MongoClient('mongodb+srv://tsanta:ETU001146@cluster0.6oftdrm.mongodb.net/?retryWrites=true&w=majority');
let db = null;
const main = async () =>  {
  client.connect();
   db = client.db('orgUnits');
  return 'done.';
}

main().then(console.log).catch(console.error).finally(() => client.close());
  
//var clients = new pg.Client("postgres://kudrtjdw:MRbspJqrSgZtkyzsiG-ANxzacmpYjuzg@babar.db.elephantsql.com/kudrtjdw");

var conString ="postgres://kudrtjdw:MRbspJqrSgZtkyzsiG-ANxzacmpYjuzg@babar.db.elephantsql.com/kudrtjdw";

const pool = new pg.Pool({
  connectionString: conString
});

/*clients.connect(async function(err) 
{
  if(err) { return console.error('could not connect to postgres', err); }
  console.log("Connected to postgres ");
});*/

/*

app.get("/migrateregion",async (req,res) => 
{
    const region = await db.collection('region').find({}).toArray();
    for(var i = 0 ; i < region.length ; i ++ )
    {
      var query = "insert into region(level,name,dhis2id,parentid) values("+region[i].level+",'"+region[i].name+"','"+region[i].dhis2id+"','"+region[i].parentid+"') ";
      clients.query(query, function(err, result) 
      {
        if(err) { return console.error('error running query', err); }
      });
    } 
 
})

app.get("image",(req,res) => 
{
  clients.query("select * from region", function(err, result) 
  {
    if(err) { return console.error('error running query', err); }
    res.json(result.rows);
  });
})

*/

app.get("/region",(req,res) => {
  /*clients.query("select * from region", function(err, result) 
  {
    if(err) { return console.error('error running query', err); }
    res.json(result.rows);
  });
*/

  pool.connect(function(err, clients, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }
    clients.query("select * from region", function(err, result) 
    {
      done();
      if(err) { return console.error('error running query', err); }
      res.json(result.rows);
    });
  });
  
})

/*
app.get("/districtbyregion",(req,res) => {
  clients.query("select district.name as name,district.dhis2id as dhis2id from district join region on region.dhis2id = district.parentid where region.dhis2id= '"+req.query.idRegion+"' ", function(err, result) 
  {
    if(err) { return console.error('error running query', err); }
    res.json(result.rows);
  });
})


app.get("/communebydistrict",(req,res) => {
  clients.query("select commune.name as name,commune.dhis2id as dhis2id from commune join district on district.dhis2id = commune.parentid where district.dhis2id ='"+req.query.idDistrict+"' ", function(err, result) 
  {
    if(err) { return console.error('error running query', err); }
    res.json(result.rows);
  });
})


app.get("/communebyregion",(req,res) => {
  clients.query("select commune.name as name,commune.dhis2id as dhis2id from commune join district on district.dhis2id = commune.parentid join region on region.dhis2id = district.parentid where region.dhis2id ='"+req.query.idRegion+"' ", function(err, result) 
  {
    if(err) { return console.error('error running query', err); }
    res.json(result.rows);
  });
})

app.get("/centrebycommune",(req,res) => {
  const remove = ((+req.query.page - 1) * +req.query.row);
  const row = (+req.query.row);
  clients.query("select centrelevel5.name as centres,centrelevel5.dhis2id as dhis2id_centres,centrelevel5.geometry as coordinates_centres,centrelevel5.image as image_centres, commune.name as communes , district.name as districts , region.name as regions from centrelevel5 join commune on commune.dhis2id = centrelevel5.parentid join district on district.dhis2id=commune.parentid join region on region.dhis2id = district.parentid where commune.dhis2id = '"+req.query.idCommune+"' offset '"+remove+"' limit '"+row+"'", function(err, result) 
  {
    if(err) { return console.error('error running query', err); }
    res.json(result.rows);
  });
})


app.get("/centrebydistrict",(req,res) => {
  const remove = ((+req.query.page - 1) * +req.query.row);
  const row = (+req.query.row);
  clients.query("select centrelevel5.name as centres,centrelevel5.dhis2id as dhis2id_centres,centrelevel5.geometry as coordinates_centres,centrelevel5.image as image_centres, commune.name as communes , district.name as districts , region.name as regions from centrelevel5 join commune on commune.dhis2id = centrelevel5.parentid join district on district.dhis2id=commune.parentid join region on region.dhis2id = district.parentid where district.dhis2id = '"+req.query.idDistrict+"' offset '"+remove+"' limit '"+row+"'", function(err, result) 
  {
    if(err) { return console.error('error running query', err); }
    res.json(result.rows);
  });
})


app.get("/centrebyregion",(req,res) => {
  const remove = ((+req.query.page - 1) * +req.query.row);
  const row = (+req.query.row);
  clients.query("select centrelevel5.name as centres,centrelevel5.dhis2id as dhis2id_centres,centrelevel5.geometry as coordinates_centres,centrelevel5.image as image_centres, commune.name as communes , district.name as districts , region.name as regions from centrelevel5 join commune on commune.dhis2id = centrelevel5.parentid join district on district.dhis2id=commune.parentid join region on region.dhis2id = district.parentid where region.dhis2id = '"+req.query.idRegion+"' offset '"+remove+"' limit '"+row+"'", function(err, result) 
  {
    if(err) { return console.error('error running query', err); }
    res.json(result.rows);
  });
})


app.get("/centre",(req,res) => {
  const remove = ((+req.query.page - 1) * +req.query.row);
  const row = (+req.query.row);
  clients.query("select centrelevel5.name as centres,centrelevel5.dhis2id as dhis2id_centres,centrelevel5.geometry as coordinates_centres,centrelevel5.image as image_centres, commune.name as communes , district.name as districts , region.name as regions from centrelevel5 join commune on commune.dhis2id = centrelevel5.parentid join district on district.dhis2id=commune.parentid join region on region.dhis2id = district.parentid  offset '"+remove+"' limit '"+row+"'", function(err, result) 
  {
    if(err) { return console.error('error running query', err); }
    res.json(result.rows);
  });
})

app.get("/migratedistrict",async (req,res) => 
{
    const region = await db.collection('district').find({}).toArray();
    
    for(var i = 0 ; i < region.length ; i ++ )
    {
      console.log(region[i])
      var query = "insert into district(level,name,dhis2id,parentid) values("+region[i].level+",'"+region[i].name+"','"+region[i].dhis2id+"','"+region[i].parentid+"') ";
      clients.query(query, function(err, result) 
      {
        if(err) { return console.error('error running query', err); }
      });
    } 
 
})

app.get("/migratecenter",async (req,res) => 
{
    const region = await db.collection('centreLevel5').find({}).toArray();
    for(var i = 0 ; i < region.length ; i ++ )
    {
      var query = "insert into centrelevel5(level,name,dhis2id,parentid,geometry) values("+region[i].level+",'"+region[i].name+"','"+region[i].dhis2id+"','"+region[i].parentid+"',"+String(region[i].geometry ? (region[i].geometry.coordinates ? ("'("+region[i].geometry.coordinates[0]+","+region[i].geometry.coordinates[1]+")'") : "null" ) : "null")+")";
      clients.query(query, function(err, result) 
      {
        if(err) { return console.error('error running query', err); }
      });
    } 
 
})

app.get("/migratecommune",async (req,res) => 
{
    const region = await db.collection('commune').find({}).toArray();
    
    for(var i = 0 ; i < region.length ; i ++ )
    {
      console.log(region[i])
      var query = "insert into commune(level,name,dhis2id,parentid) values("+region[i].level+",'"+region[i].name+"','"+region[i].dhis2id+"','"+region[i].parentid+"') ";

       clients.query(query, function(err, result) 
      {
        if(err) { return console.error('error running query', err); }
      });
    } 
 
})

app.get("/regionmongo", async (req,res) => res.json(await db.collection('region').find({}).toArray()))
app.get("/districtByRegionmongo", async (req,res) => res.json(await db.collection('district').find({ parentid : req.query.idRegion }).toArray()))
app.get("/communeBydistrictmongo", async (req,res) => res.json(await db.collection('commune').find({ parentid : req.query.idDistrict }).toArray()))
app.get("/centrel5Bycommunemongo", async (req,res) => res.json(await db.collection('centreLevel5').find({ parentid : req.query.idCommune }).skip((+req.query.page - 1) * +req.query.row).limit(+req.query.row).toArray()))
app.get("/centrel5mongo", async (req,res) => res.json(await db.collection('centreLevel5').find({ }).skip((+req.query.page - 1) * +req.query.row).limit(+req.query.row).toArray()))
app.get("/centrel6Byl5mongo", async (req,res) => res.json(await db.collection('centreLevel6').find({ parentid : req.query.idCentrel5 }).skip((+req.query.page - 1) * +req.query.row).limit(+req.query.row).toArray()))


*/

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
    s.sort((a, b) => (a[10] + a[11] + a[12]).replace(/\s/g, "").toUpperCase() > (b[10] + b[11] + b[12]).replace(/\s/g, "").toUpperCase() ? 1 : -1 );

    for (var i = 0; i < s.length; i++) {
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
        typeof s[i - 1] === "undefined" &&
        (s[i + 1][10] + s[i + 1][11] + s[i + 1][12])
          .replace(/\s/g, "")
          .toUpperCase() !==
          (s[i][10] + s[i][11] + s[i][12]).replace(/\s/g, "").toUpperCase()
      ) {
        s.splice(0, 1);
        i = i - 1;
      } else if (
        typeof s[i + 1] === "undefined" &&
        (s[i][10] + s[i][11] + s[i][12]).replace(/\s/g, "").toUpperCase() !==
          (s[i - 1][10] + s[i - 1][11] + s[i - 1][12])
            .replace(/\s/g, "")
            .toUpperCase()
      ) {
        s.splice(i, 1);
        i = i - 1;
      } else if (
        typeof s[i - 1] !== "undefined" &&
        typeof s[i + 1] !== "undefined" &&
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

    for (var i = 0; i < s.length; i++) {
      if ((s[i][10] + s[i][11] + s[i][12]).replace(/\s/g, "").length != 0) {
        s[i] = [ s[i][7],s[i][10],s[i][11],s[i][12],s[i][13],s[i][14],s[i][15],s[i][16],s[i][17],];
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
  var columns = "dimension=a1jCssI2LkW.eNRjVGxVL6l&dimension=a1jCssI2LkW.SB1IHYu2xQT&dimension=a1jCssI2LkW.NI0QRzJvQ0k&dimension=a1jCssI2LkW.LY2bDXpNvS7&dimension=a1jCssI2LkW.oindugucx72&dimension=a1jCssI2LkW.KSr2yTdu1AI&dimension=a1jCssI2LkW.Ewi7FUfcHAD&dimension=a1jCssI2LkW.fctSQp5nAYl";
  var credentials = Buffer.from(username + ":" + password).toString("base64");
  var auth = { Authorization: `Basic ${credentials}` };
  var url = "https://covax.vaksiny.gov.mg/api/29/analytics/";
  const response = await fetch(URLStructure(url, sortie, periode, idOrgUnit, columns, outputType, sort),{ headers: auth } );
  var statusText = response.statusText;
  var status = response.status;
  if (status == "200") {
    var data = await response.json();
    var headers = [ "Unite d'organisation","Nom","Prenom","Date de naissance","Type de cible","sexe","CODE_EPI","CIN","TEL",];
    var height = data.height;
    var NA = [];
    NA.push([]);
    for (var i = 0; i < height; i++) {
      if (data.rows[i][12].replace(/\s/g, "").trim().length == 0 || data.rows[i][13].replace(/\s/g, "").trim().length == 0 || data.rows[i][14].replace(/\s/g, "").trim().length == 0) {
        if (data.rows[i][13].replace(/\s/g, "").trim().length != 0) {
          if (parseInt(data.rows[i][13].replace(/\s/g, "").trim()) == 1) { data.rows[i][13] = "Agent de santé"; }
          if (parseInt(data.rows[i][13].replace(/\s/g, "").trim()) == 2) { data.rows[i][13] = "Force de l'ordre"; }
          if (parseInt(data.rows[i][13].replace(/\s/g, "").trim()) == 3) { data.rows[i][13] = "Personne âgée"; }
          if (parseInt(data.rows[i][13].replace(/\s/g, "").trim()) == 4) { data.rows[i][13] = "Travailleurs sociaux"; }
          if (parseInt(data.rows[i][13].replace(/\s/g, "").trim()) == 5) { data.rows[i][13] = "Autres"; }
        }
        NA.push([data.rows[i][7],data.rows[i][10],data.rows[i][11],data.rows[i][12],data.rows[i][13],data.rows[i][14],data.rows[i][15],data.rows[i][16],data.rows[i][17],]);
      }
    }
    https: res.json({ statusText: statusText,status: status,data: NA.sort((a, b) => (a[0] > b[0] ? 1 : -1)),headers: headers,});
  } else {
    https: res.json({ statusText: statusText, status: status, });
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
  var columns = "dimension=a1jCssI2LkW.bbnyNYD1wgS&dimension=a1jCssI2LkW.LUIsbsm3okG&dimension=a1jCssI2LkW.Yp1F4txx8tm&dimension=a1jCssI2LkW.eNRjVGxVL6l&dimension=a1jCssI2LkW.SB1IHYu2xQT&dimension=a1jCssI2LkW.KSr2yTdu1AI";
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
      if (data.rows[i][18].replace(/\s/g, "") !== "") {
        keys.push(
          (data.rows[i][13] + data.rows[i][14] + data.rows[i][18])
            .replace(/\s/g, "")
            .toUpperCase()
        );
      }
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

function URLStructure( url,sortie,periode,idOrgUnit,columns,outputType,sort) {
  return (url +sortie +"/query/yDuAzyqYABS.json?dimension=pe:" +periode +"&dimension=ou:" + idOrgUnit + "&" + columns + "&stage=a1jCssI2LkW&displayProperty=NAME&outputType=" + outputType + "&desc=" + sort );
}

app.listen(process.env.PORT || 3000, () => console.log("Data api ready..."));

module.exports = app;
