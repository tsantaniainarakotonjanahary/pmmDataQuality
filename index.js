const express = require("express");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cors = require("cors");
const process = require('process');
const session = require('express-session');
var pg = require('pg');
const app = express();
app.use(express.json());
app.use(cors());
app.get("/taste", async (req, res) => res.json({val : "Bienvenue welcome!!!!!" }));

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.use(session({
  secret: 'hello',
  resave: false,
  saveUninitialized: true
}));

/*
const { MongoClient } = require('mongodb');
const client = new MongoClient('mongodb+srv://tsanta:ETU001146@cluster0.6oftdrm.mongodb.net/?retryWrites=true&w=majority');
let db = null;
const main = async () =>  {
  client.connect();
   db = client.db('orgUnits');
  return 'done.';
}

main().then(console.log).catch(console.error).finally(() => client.close());
*/

const pool = new pg.Pool({ connectionString: "postgres://kudrtjdw:MRbspJqrSgZtkyzsiG-ANxzacmpYjuzg@babar.db.elephantsql.com/kudrtjdw"});

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


app.get("/tovalidate", (req,res) => {
  pool.connect(function(err, clients, done) {
    if(err) 
    {
      return console.error('error fetching client from pool', err);
    }
    clients.query("select *  from users where isvalidate = 0;", function(err, result) 
    {
      done();
      if(err) { return console.error('error running query', err); }
      res.json(result.rows);
    });
  });
})


app.get("/validate", (req,res) => {
  pool.connect(function(err, clients, done) {
    if(err) { return console.error('error fetching client from pool', err); }
    clients.query("update users set isvalidate = 1 where id = '"+req.query.id+"' ;", function(err, result) 
    {
      done();
      if(err) { return console.error('error running query', err); }
      res.json(result.rows);
    });
  });
})


app.get("/decline",(req,res) => {
  pool.connect(function(err, clients, done) {
    if(err) { return console.error('error fetching client from pool', err); }
    clients.query("delete from  users where id = '"+req.query.id+"' ;", function(err, result) 
    {
      done();
      if(err) { return console.error('error running query', err); }
      res.json(result.rows);
    });
  });
})

const saltRounds = 10 ; 

app.post("/register",(req,res) => {
  const name = req.body.name;
  const username = req.body.username;
  const password = req.body.password;
  bcrypt.hash(password,saltRounds, (err,hash) => 
  {
    if(err) { console.log(err); }
    pool.connect(function(err, clients, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      clients.query("INSERT INTO users (name,username,password,isValidate) values ('"+name+"','"+username+"','"+hash+"',0) ", function(err, result) 
      {
        done();
        if(err) { return console.error('error running query', err); }
        res.json(result.rows);
      });
    });
  });
});

const verifyJWT = (req,res,next) => {
  const token = req.headers["x-access-token"];
  console.log(token);
  if(!token)
  {
    res.send("you need token");
  }else 
  {
    jwt.verify( token, "tsanta" , (err,decoded) => {
      if(err)
      {
        res.json({ auth:false, message : "You failed to authenticate" })
      }
      else 
      {
        req.userId = decoded.id;
        next();
      }
    })
  }
}

app.get("/isUserAuth", verifyJWT , (req,res) => {
  res.send("you are autheticated");
})


app.post("/login",(req,res) => {

  const username = req.body.username;
  const password = req.body.password;

  bcrypt.hash(password,saltRounds, (err,hash) => 
  {
    if(err) { console.log(err); }
    pool.connect(function(err, clients, done) {
      if(err) { return console.error('error fetching client from pool', err); }
      clients.query("select * from users where username = '"+username+"'  and  isvalidate = 1;", function(err, result) 
      {
        done();
        if(err) { return console.error('error running query', err); }
        if(result.rows.length > 0 )
        {
          bcrypt.compare(password,result.rows[0].password , (error,response) => {
            if(response)
            {
              console.log(result.rows);
              const id = result.rows[0].id;
              const token = jwt.sign({id},"tsanta",{ expiresIn : 300, });
              console.log(req.session);
              if(req.session.user)
              {
                req.session.user = result.rows;
              }
              res.json({ auth : true , token , result : result.rows , message : "ok" });
            }
            else 
            {
              res.send({message:"wrong unsername/password combination"});
            }
          })
        }
        else 
        {
          pool.connect(function(err, clients, done) {
            if(err) {
              return console.error('error fetching client from pool', err);
            }
            clients.query("select * from superuser where username = '"+username+"' ", function(err, result) 
            {
              done();
              if(err) { return console.error('error running query', err); }

              if(result.rows.length > 0)
              {
                bcrypt.compare(password,result.rows[0].password , (error,response) => {
                  if(response)
                  {
                    const id = result.rows[0].id;
                    const token = jwt.sign({id},"tsanta",{ expiresIn : 300, });
                    console.log(req.session);
                    if(req.session.user)
                    {
                      req.session.user = result.rows;
                    }
                    res.json({ auth : true , token , result : result.rows , message : "admin" });
                  }
                  else 
                  {
                    res.send({message:"wrong unsername/password combination"});
                  }
                })
              }
              else 
              {
                res.send({message:"user doesn't exist"});
              }     
            });
          });
        }
      });
    });
  });
});



app.get("/districtbyregion",(req,res) => {
  pool.connect(function(err, clients, done) {
    if(err) { return console.error('error fetching client from pool', err); }
    clients.query("select district.name as name,district.dhis2id as dhis2id from district join region on region.dhis2id = district.parentid where region.dhis2id= '"+req.query.idRegion+"' ", function(err, result) 
    {
      done();
      if(err) { return console.error('error running query', err); }
      res.json(result.rows);
    });
  });
})


app.get("/communebydistrict",(req,res) => {
  pool.connect(function(err, clients, done) {
    if(err) { return console.error('error fetching client from pool', err); }
    clients.query("select commune.name as name,commune.dhis2id as dhis2id from commune join district on district.dhis2id = commune.parentid where district.dhis2id ='"+req.query.idDistrict+"' ", function(err, result) 
    {
      done();
      if(err) { return console.error('error running query', err); }
      res.json(result.rows);
    });
  });
})


app.get("/communebyregion",(req,res) => {
  pool.connect(function(err, clients, done) {
    if(err) { return console.error('error fetching client from pool', err); }
    clients.query("select commune.name as name,commune.dhis2id as dhis2id from commune join district on district.dhis2id = commune.parentid join region on region.dhis2id = district.parentid where region.dhis2id ='"+req.query.idRegion+"' ", function(err, result) 
    {
      done();
      if(err) { return console.error('error running query', err); }
      res.json(result.rows);
    });
  });
})

app.get("/communebydistrictbyregion",(req,res) => {
  pool.connect(function(err, clients, done) {
    if(err) { return console.error('error fetching client from pool', err); }
    clients.query(" select  commune.id as communeid , commune.level as communelevel , commune.name as communename, commune.dhis2id as communedhis2id , commune.parentid as communeparentid ,district.id as districtid , district.level as districtlevel , district.name as districtname, district.dhis2id as districtdhis2id , district.parentid as districtparentid , region.id as regionid , region.level as regionlevel , region.name as regionname, region.dhis2id as regiondhis2id , region.parentid as regionparentid   from commune join district on district.dhis2id=commune.parentid join region on region.dhis2id = district.parentid ; ", function(err, result) 
    {
      done();
      if(err) { return console.error('error running query', err); }
      res.json(result.rows);
    });
  });
})


app.get("/centrebycommunebydistrictbyregion",(req,res) => {
  pool.connect(function(err, clients, done) {
    if(err) { return console.error('error fetching client from pool', err); }
    clients.query("select  COUNT(*) OVER() AS total , centrelevel5.id as centreid , centrelevel5.level as centrelevel , centrelevel5.name as centrename, centrelevel5.dhis2id as centredhis2id , centrelevel5.parentid as centreparentid ,centrelevel5.geometry as centregeometry, commune.id as communeid , commune.level as communelevel , commune.name as communename, commune.dhis2id as communedhis2id , commune.parentid as communeparentid ,district.id as districtid , district.level as districtlevel , district.name as districtname, district.dhis2id as districtdhis2id , district.parentid as districtparentid , region.id as regionid , region.level as regionlevel , region.name as regionname, region.dhis2id as regiondhis2id , region.parentid as regionparentid   from commune join district on district.dhis2id=commune.parentid join region on region.dhis2id = district.parentid join centrelevel5 on centrelevel5.parentid = commune.dhis2id ;", function(err, result) {
      done();
      if(err) { return console.error('error running query', err); }
      res.json(result.rows);
    });
  });
})

app.get("/centrebycommune",(req,res) => {
  const remove = ((+req.query.page - 1) * +req.query.row);
  const row = (+req.query.row);
  pool.connect(function(err, clients, done) {
    if(err) { return console.error('error fetching client from pool', err); }
    clients.query("select COUNT(*) OVER() AS total,centrelevel5.id as id,centrelevel5.name as centres,centrelevel5.dhis2id as dhis2id_centres,centrelevel5.geometry as coordinates_centres,centrelevel5.image as image_centres, commune.name as communes , district.name as districts , region.name as regions from centrelevel5 join commune on commune.dhis2id = centrelevel5.parentid join district on district.dhis2id=commune.parentid join region on region.dhis2id = district.parentid where commune.dhis2id = '"+req.query.idCommune+"' offset '"+remove+"' limit '"+row+"'", function(err, result) 
    {
      done();
      if(err) { return console.error('error running query', err); }
      res.json(result.rows);
    });
  });
})

app.get("/centrebydistrict",(req,res) => {
  const remove = ((+req.query.page - 1) * +req.query.row);
  const row = (+req.query.row);
  pool.connect(function(err, clients, done) {
    if(err) { return console.error('error fetching client from pool', err); }
    clients.query("select centrelevel5.name as centres,centrelevel5.dhis2id as dhis2id_centres,centrelevel5.geometry as coordinates_centres,centrelevel5.image as image_centres, commune.name as communes , district.name as districts , region.name as regions from centrelevel5 join commune on commune.dhis2id = centrelevel5.parentid join district on district.dhis2id=commune.parentid join region on region.dhis2id = district.parentid where district.dhis2id = '"+req.query.idDistrict+"' offset '"+remove+"' limit '"+row+"'", function(err, result) 
    {
      done();
      if(err) { return console.error('error running query', err); }
      res.json(result.rows);
    });
  });
})

app.get("/centrebyregion",(req,res) => {
  const remove = ((+req.query.page - 1) * +req.query.row);
  const row = (+req.query.row);

  pool.connect(function(err, clients, done) {
    if(err) { return console.error('error fetching client from pool', err); }
    clients.query("select centrelevel5.name as centres,centrelevel5.dhis2id as dhis2id_centres,centrelevel5.geometry as coordinates_centres,centrelevel5.image as image_centres, commune.name as communes , district.name as districts , region.name as regions from centrelevel5 join commune on commune.dhis2id = centrelevel5.parentid join district on district.dhis2id=commune.parentid join region on region.dhis2id = district.parentid where region.dhis2id = '"+req.query.idRegion+"' offset '"+remove+"' limit '"+row+"'", function(err, result) 
    {
      done();
      if(err) { return console.error('error running query', err); }
      res.json(result.rows);
    });
  });
})


app.get("/centre",(req,res) => {
  const remove = ((+req.query.page - 1) * +req.query.row);
  const row = (+req.query.row);

  pool.connect(function(err, clients, done) {
    if(err) { return console.error('error fetching client from pool', err); }
    clients.query("select centrelevel5.name as centres,centrelevel5.dhis2id as dhis2id_centres,centrelevel5.geometry as coordinates_centres,centrelevel5.image as image_centres, commune.name as communes , district.name as districts , region.name as regions from centrelevel5 join commune on commune.dhis2id = centrelevel5.parentid join district on district.dhis2id=commune.parentid join region on region.dhis2id = district.parentid  offset '"+remove+"' limit '"+row+"'", function(err, result) 
    {
      done();
      if(err) { return console.error('error running query', err); }
      res.json(result.rows);
    });
  });
})


app.post('/addCentre',async (req,res) => {
  pool.connect(function(err, clients, done) {
    if(err) { return console.error('error fetching client from pool', err); }
    clients.query("insert into centrelevel5(level,name,dhis2id,parentid,geometry,image) values (5,'"+req.body.nom+"','"+req.body.dhis2id+"','"+req.body.idCommune+"','("+req.body.longitude+","+req.body.latitude+")','"+req.body.image+"')", function(err, result) 
    {
      done();
      if(err) { return console.error('error running query', err); }
      res.json(result.rows);
    });
  });
})

app.post('/updateCentre',async (req,res) => {
  pool.connect(function(err, clients, done) {
    if(err) { return console.error('error fetching client from pool', err); }
    console.log("update centrelevel5 set name = '"+req.body.nom+"' dhis2id='"+req.body.dhis2id+"' parentid = '"+req.body.idCommune+"'  geometry = '("+req.body.longitude+","+req.body.latitude+")' image = '"+req.body.image+"'  where id = "+req.query.id+" ");
    clients.query("update centrelevel5 set name = '"+req.body.nom+"' dhis2id='"+req.body.dhis2id+"' parentid = '"+req.body.idCommune+"'  geometry = '("+req.body.longitude+","+req.body.latitude+")' image = '"+req.body.image+"'  where id = "+req.query.id+" ", function(err, result) 
    {
      done();
      if(err) { return console.error('error running query', err); }
      res.json(result.rows);
    });
  });
})

app.get("/getregion",(req,res) => {
  pool.connect(function(err, clients, done) {
    if(err) { return console.error('error fetching client from pool', err); }
    clients.query("select * from region", function(err, result) 
    {
      done();
      if(err) { return console.error('error running query', err); }
      res.json(result.rows);
    });
  });
})



function convertToPolygon(geometry) {
  const { type, coordinates } = geometry;

  let coords;
  if (type === "Polygon") {
    coords = coordinates[0];
  } else if (type === "MultiPolygon") {
    coords = coordinates.flat(2);
  } else {
    throw new Error("Invalid geometry type");
  }

  return coords.map((coord) => {
    return { lat: coord[1], lng: coord[0] };
  });
}

app.get("/geom/:ou", async (req,res) => {
  async function fetchCovaxData() {
    const url = new URL("https://covax.vaksiny.gov.mg/api/29/organisationUnits.json?fields=id,name,shortName,openingDate,closedDate,geometry,featureType&attribute=PUBLIC_PRIVATE&filter=id:eq:"+req.params.ou);
    const basicAuth = btoa(`${'Nosybe'}:${'2021@Covax'}`);
    console.log(url.toString());
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json'
      }
    });
  
    if (response.ok) {
       const data = await response.json(); 
       const geometry = data.organisationUnits[0].geometry;
        const polygon = convertToPolygon(geometry);
       res.json(polygon); 
    } else {
      console.error(`Error: - ${response.statusText}`);
    }
  } 
   await fetchCovaxData();
})



app.get("/getdistrict",(req,res) => {
  pool.connect(function(err, clients, done) {
    if(err) { return console.error('error fetching client from pool', err); }
    clients.query("select * from district", function(err, result) 
    {
      done();
      if(err) { return console.error('error running query', err); }
      res.json(result.rows);
    });
  });
})


app.get("/getcommune",(req,res) => {
  pool.connect(function(err, clients, done) {
    if(err) { return console.error('error fetching client from pool', err); }
    clients.query("select * from commune", function(err, result) 
    {
      done();
      if(err) { return console.error('error running query', err); }
      res.json(result.rows);
    });
  });
})

app.get("/updateregion",(req,res) => {
  pool.connect(function(err, clients, done) {
    if(err) { return console.error('error fetching client from pool', err); }
    clients.query("update region set level="+req.query.level+",name='"+req.query.name+"',dhis2id='"+req.query.dhis2id+"',parentid='"+req.query.parentid+"' where id = "+req.query.id+" ", function(err, result) 
    {
      done();
      if(err) { return console.error('error running query', err); }
      res.json(result.rows);
    });
  });
})

app.get("/deleteregion",(req,res) => {
  pool.connect(function(err, clients, done) {
    if(err) { return console.error('error fetching client from pool', err); }
    clients.query("Delete from region where id="+req.query.id+" ", function(err, result) 
    {
      done();
      if(err) { return console.error('error running query', err); }
      res.json(result.rows);
    });
  });
})

app.get("/addregion",(req,res) => {
  pool.connect(function(err, clients, done) {
    if(err) { return console.error('error fetching client from pool', err); }
    clients.query("insert into region(level,name,dhis2id,parentid) values ('"+req.query.level+"','"+req.query.name+"','"+req.query.dhis2id+"','"+req.query.parentid+"')", function(err, result) 
    {
      done();
      if(err) { return console.error('error running query', err); }
      res.json(result.rows);
    });
  });
})



app.get("/searchcentre",(req,res) => {
  const remove = ((+req.query.page - 1) * +req.query.row);
  const row = (+req.query.row);
  pool.connect(function(err, clients, done) {
    if(err) { return console.error('error fetching client from pool', err); }
    clients.query("select centrelevel5.name as centres,centrelevel5.dhis2id as dhis2id_centres,centrelevel5.geometry as coordinates_centres,centrelevel5.image as image_centres, commune.name as communes , district.name as districts , region.name as regions from centrelevel5 join commune on commune.dhis2id = centrelevel5.parentid join district on district.dhis2id=commune.parentid join region on region.dhis2id = district.parentid  where centrelevel5.name LIKE  '%"+req.query.seq+"%' offset '"+remove+"' limit '"+row+"'", function(err, result) 
    {
      done();
      if(err) { return console.error('error running query', err); }
      res.json(result.rows);
    });
  });
})

/*

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

app.get('/statNbPremDose',async (req,res) => 
{
  const response = await fetch("https://covax.vaksiny.gov.mg/api/29/analytics.json?dimension=dx:cNx2l3Lfw7A&dimension=pe:LAST_12_MONTHS&filter=ou:"+req.query.ou+"&displayProperty=NAME",{ headers: { Authorization: `Basic ${Buffer.from( "Nosybe" + ":" + "2021@Covax" ).toString("base64")}`, }, });
    var s = await response.json();
    res.json(s);
})


app.get('/statNbCompDose', async (req,res) => 
{
  const response = await fetch("https://covax.vaksiny.gov.mg/api/29/analytics.json?dimension=dx:vr6nXFKkVGH&dimension=pe:LAST_12_MONTHS&filter=ou:"+req.query.ou+"&displayProperty=NAME",{ headers: { Authorization: `Basic ${Buffer.from( "Nosybe" + ":" + "2021@Covax" ).toString("base64")}`, }, });
  var s = await response.json();
  res.json(s);
})

app.get('/statNb2dpfizerSino', async (req,res) => 
{
  const response = await fetch("https://covax.vaksiny.gov.mg/api/29/analytics.json?dimension=dx:mIVUY55AL5l&dimension=pe:LAST_12_MONTHS&filter=ou:"+req.query.ou+"&displayProperty=NAME",{ headers: { Authorization: `Basic ${Buffer.from( "Nosybe" + ":" + "2021@Covax" ).toString("base64")}`, }, });
  var s = await response.json();
  res.json(s);
})

app.get('/statNbDoseAdd', async (req,res) => 
{
  const response = await fetch("https://covax.vaksiny.gov.mg/api/29/analytics.json?dimension=dx:FSW7Qmy2IJi&dimension=pe:LAST_12_MONTHS&filter=ou:"+req.query.ou+"&displayProperty=NAME",{ headers: { Authorization: `Basic ${Buffer.from( "Nosybe" + ":" + "2021@Covax" ).toString("base64")}`, }, });
  var s = await response.json();
  res.json(s);
})


app.get("/premierDoseDistrict", async (req,res) => 
{
    const response = await fetch("https://covax.vaksiny.gov.mg/api/32/analytics.json?dimension=dx%3AAXweWKC4B3L&dimension=ou%3AUSER_ORGUNIT_GRANDCHILDREN&showHierarchy=true&hierarchyMeta=true&includeMetadataDetails=true&includeNumDen=true&skipRounding=false&completedOnly=false&outputIdScheme=NAME&filter=pe%3ATHIS_YEAR",{
        headers: { Authorization: `Basic ${Buffer.from( "Nosybe" + ":" + "2021@Covax" ).toString("base64")}`, },
      }
    );
    var s = await response.json();
    res.json(s.rows);
})

app.get("/premierDose", async (req,res) => {
  const response = await fetch("https://covax.vaksiny.gov.mg/api/29/analytics.json?dimension=dx:cNx2l3Lfw7A&dimension=pe:THIS_YEAR;LAST_5_YEARS&filter=ou:"+req.query.ou+"&displayProperty=NAME",
    {
      headers: { Authorization: `Basic ${Buffer.from( "Nosybe" + ":" + "2021@Covax" ).toString("base64")}`, },
    }
  );
  var s = await response.json();
  res.json(s);
})



app.get("/completement", async (req,res)=> {
  const response = await fetch("https://covax.vaksiny.gov.mg/api/29/analytics.json?dimension=dx:vr6nXFKkVGH&dimension=pe:THIS_YEAR;LAST_5_YEARS&filter=ou:"+req.query.ou+"&displayProperty=NAME",
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          "Nosybe" + ":" + "2021@Covax"
        ).toString("base64")}`,
      },
    }
  );
  var s = await response.json();
  res.json(s);
})


app.get("/astraRecu", async (req,res)=> {
  const response = await fetch("https://covax.vaksiny.gov.mg/api/29/analytics.json?dimension=dx:Cc2Gwjh1m5J&dimension=pe:THIS_YEAR;LAST_5_YEARS&filter=ou:"+req.query.ou+"&displayProperty=NAME",
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          "Nosybe" + ":" + "2021@Covax"
        ).toString("base64")}`,
      },
    }
  );
  var s = await response.json();
  res.json(s);
})


function calculateCentroid(coordinates) {
  let totalX = 0;
  let totalY = 0;
  const numPoints = coordinates[0].length;

  for (let i = 0; i < numPoints; i++) {
    totalX += coordinates[0][i][0];
    totalY += coordinates[0][i][1];
  }
  
  return {x: totalX / numPoints, y: totalY / numPoints};
}

app.get("/ougroup", async (req,res)=> {
  const response = await fetch("https://covax.vaksiny.gov.mg/api/29/organisationUnits.json?fields=id,name,level,geometry,ancestors[id,name,level]&attribute=PUBLIC_PRIVATE&filter=level:eq:5&pageSize=4652",
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          "Nosybe" + ":" + "2021@Covax"
        ).toString("base64")}`,
      },
    }
  );
  
  const s = await response.json();

  const transformedData = s.organisationUnits.map((unit, index) => {
    let centregeometry = null;
    
    if(unit.geometry) {
      if(unit.geometry.type === "Point") {
        centregeometry = {"x": unit.geometry.coordinates[0], "y": unit.geometry.coordinates[1]};
 
      } else if(unit.geometry.type === "Polygon") {
        centregeometry = calculateCentroid(unit.geometry.coordinates);
      }
    }
    
    return {
      total: s.pager.total,
      centreid: index + 1, // assuming that centreid is an incremental value starting from 1
      centrelevel: unit.level,
      centrename: unit.name,
      centredhis2id: unit.id,
      centreparentid: unit.ancestors[unit.ancestors.length - 1]?.id || null,
      centregeometry: centregeometry,
      communeid: index + 1, // assuming that communeid is an incremental value starting from 1
      communelevel: unit.ancestors[3]?.level || null,
      communename: unit.ancestors[3]?.name || null,
      communedhis2id: unit.ancestors[3]?.id || null,
      communeparentid: unit.ancestors[2]?.id || null,
      districtid: index + 1, // assuming that districtid is an incremental value starting from 1
      districtlevel: unit.ancestors[2]?.level || null,
      districtname: unit.ancestors[2]?.name || null,
      districtdhis2id: unit.ancestors[2]?.id || null,
      districtparentid: unit.ancestors[1]?.id || null,
      regionid: index + 1, // assuming that regionid is an incremental value starting from 1
      regionlevel: unit.ancestors[1]?.level || null,
      regionname: unit.ancestors[1]?.name || null,
      regiondhis2id: unit.ancestors[1]?.id || null,
      regionparentid: unit.ancestors[0]?.id || null
    }
  });

  res.json(transformedData);
});



/*app.get("checkDoublantEnrollment/",async (req,res) => 
{
  
})


app.get("/login",async (req,res) => 
{
    const response = await fetch("https://covax.vaksiny.gov.mg/api/29/me", { headers: { Authorization: `Basic ${Buffer.from( req.query.username + ":" + req.query.password).toString("base64")}`, }, });
    var s = (await response.json());
    if(response.status==200)
    {
      s.settings = {};
      const ou = s.organisationUnits.filter(object => { return object.id !== "O5FeT4g4GOV"; })[0];
      pool.connect(function(err, clients, done) {
        if(err) { return console.error('error fetching client from pool', err); }
        clients.query("select centrelevel5.name as centres,centrelevel5.dhis2id as dhis2id_centres,centrelevel5.geometry as coordinates_centres,centrelevel5.image as image_centres, commune.name as communes , commune.dhis2id as dhis2id_commune , district.name as districts ,district.dhis2id as dhis2id_district, region.name as regions from centrelevel5 join commune on commune.dhis2id = centrelevel5.parentid join district on district.dhis2id=commune.parentid join region on region.dhis2id = district.parentid  where commune.dhis2id = '"+ou.id+"' or centrelevel5.dhis2id='"+ou.id+"' or district.dhis2id= '"+ou.id+"' limit 1 ", function(err, result) 
        {
          done();
          if(err) { return console.error('error running query', err); }
          https: res.json({  s, district : result.rows[0] , status : 200 });
        });
      });
    }
    else 
    {
      https: res.json({ s , status : 401 });
    }
})
*/

app.get("/doublon-enrollment", async (req, res) => {
  console.log(URLStructure("https://covax.vaksiny.gov.mg/api/29/analytics/",req.query.sortie,req.query.periode,req.query.idOrgUnit,"dimension=a1jCssI2LkW.eNRjVGxVL6l&dimension=a1jCssI2LkW.SB1IHYu2xQT&dimension=a1jCssI2LkW.NI0QRzJvQ0k&dimension=a1jCssI2LkW.LY2bDXpNvS7&dimension=a1jCssI2LkW.oindugucx72&dimension=a1jCssI2LkW.KSr2yTdu1AI&dimension=a1jCssI2LkW.Ewi7FUfcHAD&dimension=a1jCssI2LkW.fctSQp5nAYl",req.query.outputType,req.query.sort));
  const response = await fetch(URLStructure("https://covax.vaksiny.gov.mg/api/29/analytics/",req.query.sortie,req.query.periode,req.query.idOrgUnit,"dimension=a1jCssI2LkW.eNRjVGxVL6l&dimension=a1jCssI2LkW.SB1IHYu2xQT&dimension=a1jCssI2LkW.NI0QRzJvQ0k&dimension=a1jCssI2LkW.LY2bDXpNvS7&dimension=a1jCssI2LkW.oindugucx72&dimension=a1jCssI2LkW.KSr2yTdu1AI&dimension=a1jCssI2LkW.Ewi7FUfcHAD&dimension=a1jCssI2LkW.fctSQp5nAYl",req.query.outputType,req.query.sort),
    {
      headers: {Authorization: `Basic ${Buffer.from( req.query.username + ":" + req.query.password ).toString("base64")}`,},
    }
  );


  if (response.status == "200") {
    var s = (await response.json()).rows;
    s.sort((a, b) => (a[10] + a[11] + a[12] + a[7] ).replace(/\s/g, "").toUpperCase() > (b[10] + b[11] + b[12] + a[7] ).replace(/\s/g, "").toUpperCase() ? 1 : -1 );

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

      //console.log(s[i+1]);
      if ( typeof s[i - 1] === "undefined" && typeof s[i + 1] !== "undefined" &&
        (s[i + 1][10] + s[i + 1][11] + s[i + 1][12]  + s[i + 1][7] ) 
          .replace(/\s/g, "")
          .toUpperCase() !==
          (s[i][10] + s[i][11] + s[i][12] + s[i][7] ).replace(/\s/g, "").toUpperCase()
      ) {
        s.splice(0, 1);
        i = i - 1;
      } else if (
        typeof s[i + 1] === "undefined" && typeof s[i - 1] !== "undefined" &&
        (s[i][10] + s[i][11] + s[i][12] + s[i][7] ).replace(/\s/g, "").toUpperCase() !==
          (s[i - 1][10] + s[i - 1][11] + s[i - 1][12] + s[i-1][7])
            .replace(/\s/g, "")
            .toUpperCase()
      ) {
        s.splice(i, 1);
        i = i - 1;
      } else if (
        typeof s[i - 1] !== "undefined" &&
        typeof s[i + 1] !== "undefined" &&
        (s[i - 1][10] + s[i - 1][11] + s[i - 1][12] + s[i - 1][7] )
          .replace(/\s/g, "")
          .toUpperCase() !==
          (s[i][10] + s[i][11] + s[i][12] + s[i][7] ).replace(/\s/g, "").toUpperCase() &&
        (s[i][10] + s[i][11] + s[i][12] + s[i][7] ).replace(/\s/g, "").toUpperCase() !==
          (s[i + 1][10] + s[i + 1][11] + s[i + 1][12] + s[i + 1][7])
            .replace(/\s/g, "")
            .toUpperCase()
      ) {
        s.splice(i, 1);
        i = i - 1;
      }
    }

    for (var i = 0; i < s.length; i++) {
      if ((s[i][10] + s[i][11] + s[i][12] + s[i][7] ).replace(/\s/g, "").length != 0) {
        s[i] = [s[i][7],s[i][10],s[i][11],s[i][12],s[i][13],s[i][14],s[i][15],s[i][16],s[i][17],];
      } else {
        s.splice(i, 1);
        i = i - 1;
      }
    }

    var length = s.unshift(["","","","","","","","",""]);
    s = removeDuplicatesByEPI(s);

    https: res.json({
      statusText: response.statusText,
      status: response.status,
      data: s,
      headers: ["Unité d'organisation","Nom","Prénom","Date de naissance ","Type de cible","Sexe","CODE_EPI","CIN","TEL", ],
    });
  } else {
    https: res.json({
      statusText: response.statusText,
      status: response.status,
    });
  }
});
const removeDuplicatesByEPI = (data) => {
  const epiCounts = new Map();
  data.forEach(record => {
    const epiCode = record[6];
    epiCounts.set(epiCode, (epiCounts.get(epiCode) || 0) + 1);
  });
  const noDuplicates = data.filter(record => epiCounts.get(record[6]) === 1);
  return noDuplicates;
};

app.get("/doublon-enrollmentdd", async (req, res) => {
  const response = await fetch("https://covax.vaksiny.gov.mg/api/29/analytics/enrollments/query/yDuAzyqYABS.json?dimension=ou:"+req.query.idOrgUnit+"&dimension=a1jCssI2LkW.eNRjVGxVL6l&dimension=a1jCssI2LkW.SB1IHYu2xQT&dimension=a1jCssI2LkW.NI0QRzJvQ0k&dimension=a1jCssI2LkW.LY2bDXpNvS7&dimension=a1jCssI2LkW.oindugucx72&dimension=a1jCssI2LkW.KSr2yTdu1AI&dimension=a1jCssI2LkW.Ewi7FUfcHAD&dimension=a1jCssI2LkW.fctSQp5nAYl&stage=a1jCssI2LkW&startDate="+req.query.d1+"&endDate="+req.query.d2+"&displayProperty=NAME&outputType=ENROLLMENT&desc=enrollmentDate",
    { headers: {Authorization: `Basic ${Buffer.from( req.query.username + ":" + req.query.password ).toString("base64")}`,}, }
  );

  if (response.status == "200") {
    var s = (await response.json()).rows;
    console.log(s);
    s.sort((a, b) => (a[10] + a[11] + a[12] + a[7] ).replace(/\s/g, "").toUpperCase() > (b[10] + b[11] + b[12] + a[7] ).replace(/\s/g, "").toUpperCase() ? 1 : -1 );

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

      if ( typeof s[i - 1] === "undefined" &&  typeof s[i + 1] !== "undefined" &&
        (s[i + 1][10] + s[i + 1][11] + s[i + 1][12]  + s[i + 1][7] ) 
          .replace(/\s/g, "")
          .toUpperCase() !==
          (s[i][10] + s[i][11] + s[i][12] + s[i][7] ).replace(/\s/g, "").toUpperCase()
      ) {
        s.splice(0, 1);
        i = i - 1;
      } else if (
        typeof s[i + 1] === "undefined" &&  typeof s[i - 1] !== "undefined" &&
        (s[i][10] + s[i][11] + s[i][12] + s[i][7] ).replace(/\s/g, "").toUpperCase() !==
          (s[i - 1][10] + s[i - 1][11] + s[i - 1][12] + s[i-1][7])
            .replace(/\s/g, "")
            .toUpperCase()
      ) {
        s.splice(i, 1);
        i = i - 1;
      } else if (
        typeof s[i - 1] !== "undefined" &&
        typeof s[i + 1] !== "undefined" &&
        (s[i - 1][10] + s[i - 1][11] + s[i - 1][12] + s[i - 1][7] )
          .replace(/\s/g, "")
          .toUpperCase() !==
          (s[i][10] + s[i][11] + s[i][12] + s[i][7] ).replace(/\s/g, "").toUpperCase() &&
        (s[i][10] + s[i][11] + s[i][12] + s[i][7] ).replace(/\s/g, "").toUpperCase() !==
          (s[i + 1][10] + s[i + 1][11] + s[i + 1][12] + s[i + 1][7])
            .replace(/\s/g, "")
            .toUpperCase()
      ) {
        s.splice(i, 1);
        i = i - 1;
      }
    }

    for (var i = 0; i < s.length; i++) {
      if ((s[i][10] + s[i][11] + s[i][12] + s[i][7] ).replace(/\s/g, "").length != 0) {
        s[i] = [s[i][7],s[i][10],s[i][11],s[i][12],s[i][13],s[i][14],s[i][15],s[i][16],s[i][17],];
      } else {
        s.splice(i, 1);
        i = i - 1;
      }
    }


    https: res.json({
      statusText: response.statusText,
      status: response.status,
      data: s.length == 1 ? [] : s ,
      headers: ["Unité d'organisation","Nom","Prénom","Date de naissance ","Type de cible","Sexe","CODE_EPI","CIN","TEL", ],
    });
  } else {
    https: res.json({
      statusText: response.statusText,
      status: response.status,
    });
  }
});



app.get("/doublon-event", async (req, res) => {
  console.log(URLStructure("https://covax.vaksiny.gov.mg/api/29/analytics/",req.query.sortie,req.query.periode,req.query.idOrgUnit,"dimension=a1jCssI2LkW.bbnyNYD1wgS&dimension=a1jCssI2LkW.LUIsbsm3okG&dimension=a1jCssI2LkW.Yp1F4txx8tm&dimension=a1jCssI2LkW.eNRjVGxVL6l&dimension=a1jCssI2LkW.SB1IHYu2xQT&dimension=a1jCssI2LkW.KSr2yTdu1AI&dimension=a1jCssI2LkW.NI0QRzJvQ0k", req.query.outputType, req.query.sort));
  const response = await fetch(URLStructure("https://covax.vaksiny.gov.mg/api/29/analytics/",req.query.sortie,req.query.periode,req.query.idOrgUnit,"dimension=a1jCssI2LkW.bbnyNYD1wgS&dimension=a1jCssI2LkW.LUIsbsm3okG&dimension=a1jCssI2LkW.Yp1F4txx8tm&dimension=a1jCssI2LkW.eNRjVGxVL6l&dimension=a1jCssI2LkW.SB1IHYu2xQT&dimension=a1jCssI2LkW.KSr2yTdu1AI&dimension=a1jCssI2LkW.NI0QRzJvQ0k", req.query.outputType, req.query.sort),{ headers: { Authorization: `Basic ${Buffer.from( req.query.username + ":" + req.query.password).toString("base64")}`, }, } );
  if (response.status == "200") 
  {
    var s = (await response.json()).rows;
    //trie
    s.sort((a, b) => (a[13] + a[14] + a[18]).replace(/\s/g, "").toUpperCase() > (b[13] + b[14] + b[18]).replace(/\s/g, "").toUpperCase() ? 1 : -1 );


    //suppression
    for (var i = 0; i < s.length; i++) 
    {
      if ( typeof s[i - 1] === "undefined" && typeof s[i + 1] !== "undefined" && (s[i + 1][13] + s[i + 1][14] + s[i + 1][18]).replace(/\s/g, "").toUpperCase() !== (s[i][13] + s[i][14] + s[i][18]).replace(/\s/g, "").toUpperCase()) 
      {
        s.splice(0, 1);i = i - 1;
      } 
      else if (typeof s[i + 1] === "undefined" && typeof s[i - 1] !== "undefined" && (s[i][13] + s[i][14] + s[i][18]).replace(/\s/g, "").toUpperCase() !== (s[i - 1][13] + s[i - 1][14] + s[i - 1][18]).replace(/\s/g, "").toUpperCase()) 
      {
        s.splice(i, 1);i = i - 1;
      } 
      else if (typeof s[i - 1] !== "undefined" && typeof s[i + 1] !== "undefined" && (s[i - 1][13] + s[i - 1][14] + s[i - 1][18]).replace(/\s/g, "").toUpperCase() !== (s[i][13] + s[i][14] + s[i][18]).replace(/\s/g, "").toUpperCase() && (s[i][13] + s[i][14] + s[i][18]).replace(/\s/g, "").toUpperCase() !== (s[i + 1][13] + s[i + 1][14] + s[i + 1][18]).replace(/\s/g, "").toUpperCase()) 
      {
        s.splice(i, 1);i = i - 1;
      }
    }

    //affichage
    for (var i = 0; i < s.length; i++) 
    {
      if ((s[i][13] + s[i][14] + s[i][18]).replace(/\s/g, "").length != 0 && (s[i][18]).replace(/\s/g, "").length != 0) 
      {
        s[i] = [s[i][10],s[i][13],s[i][14],s[i][15],s[i][16],s[i][17],s[i][18],s[i][19]];
      } 
      else 
      {
        s.splice(i, 1);
        i = i - 1;
      }
    }

    var length = s.unshift(["","","","","","","","",""]);

    https: res.json({
      statusText: response.statusText,
      status: response.status,
      data: s,
      headers: [ "Unite d'organisation", "Nom de vaccin", "Numero de dose", "Numero de lot", "Nom", "Prenom", "EPI","Date de Naissance"],
    });
  } else {
    https: res.json({
      statusText: response.statusText,
      status: response.status,
    });
  }
});


app.get("/doublon-eventdd", async (req, res) => {
  const response = await fetch("https://covax.vaksiny.gov.mg/api/29/analytics/events/query/yDuAzyqYABS.json?dimension=ou:"+req.query.idOrgUnit+"&dimension=a1jCssI2LkW.bbnyNYD1wgS&dimension=a1jCssI2LkW.LUIsbsm3okG&dimension=a1jCssI2LkW.Yp1F4txx8tm&dimension=a1jCssI2LkW.eNRjVGxVL6l&dimension=a1jCssI2LkW.SB1IHYu2xQT&dimension=a1jCssI2LkW.KSr2yTdu1AI&dimension=a1jCssI2LkW.NI0QRzJvQ0k&stage=a1jCssI2LkW&startDate="+req.query.d1+"&endDate="+req.query.d2+"&displayProperty=NAME&outputType=EVENT&desc=eventDate",{ headers: { Authorization: `Basic ${Buffer.from( req.query.username + ":" + req.query.password).toString("base64")}`, }, } );
  if (response.status == "200") 
  {
    var s = (await response.json()).rows;
    //trie
    s.sort((a, b) => (a[13] + a[14] + a[18]).replace(/\s/g, "").toUpperCase() > (b[13] + b[14] + b[18]).replace(/\s/g, "").toUpperCase() ? 1 : -1 );


    //suppression
    for (var i = 0; i < s.length; i++) 
    {
      if ( typeof s[i - 1] === "undefined" && typeof s[i + 1] !== "undefined" && (s[i + 1][13] + s[i + 1][14] + s[i + 1][18]).replace(/\s/g, "").toUpperCase() !== (s[i][13] + s[i][14] + s[i][18]).replace(/\s/g, "").toUpperCase()) 
      {
        s.splice(0, 1);i = i - 1;
      } 
      else if (typeof s[i + 1] === "undefined"  && typeof s[i - 1] !== "undefined" && (s[i][13] + s[i][14] + s[i][18]).replace(/\s/g, "").toUpperCase() !== (s[i - 1][13] + s[i - 1][14] + s[i - 1][18]).replace(/\s/g, "").toUpperCase()) 
      {
        s.splice(i, 1);i = i - 1;
      } 
      else if (typeof s[i - 1] !== "undefined" && typeof s[i + 1] !== "undefined" && (s[i - 1][13] + s[i - 1][14] + s[i - 1][18]).replace(/\s/g, "").toUpperCase() !== (s[i][13] + s[i][14] + s[i][18]).replace(/\s/g, "").toUpperCase() && (s[i][13] + s[i][14] + s[i][18]).replace(/\s/g, "").toUpperCase() !== (s[i + 1][13] + s[i + 1][14] + s[i + 1][18]).replace(/\s/g, "").toUpperCase()) 
      {
        s.splice(i, 1);i = i - 1;
      }
    }

    //affichage
    for (var i = 0; i < s.length; i++) 
    {
      if ((s[i][13] + s[i][14] + s[i][18]).replace(/\s/g, "").length != 0 && (s[i][18]).replace(/\s/g, "").length != 0) 
      {
        s[i] = [s[i][10],s[i][13],s[i][14],s[i][15],s[i][16],s[i][17],s[i][18],s[i][19]];
      } 
      else 
      {
        s.splice(i, 1);
        i = i - 1;
      }
    }

    https: res.json({
      statusText: response.statusText,
      status: response.status,
      data: s.length == 1 ? [] : s ,
      headers: [ "Unite d'organisation", "Nom de vaccin", "Numero de dose", "Numero de lot", "Nom", "Prenom", "EPI","Date de Naissance"],
    });
  } else {
    https: res.json({
      statusText: response.statusText,
      status: response.status,
    });
  }
});


app.get("/NA-enrollmentdd", async (req, res) => {
  var query = req.query;
  var username = query.username; 
  var password = query.password; 
  var credentials = Buffer.from(username + ":" + password).toString("base64");
  var auth = { Authorization: `Basic ${credentials}` };
  var url = "https://covax.vaksiny.gov.mg/api/29/analytics/";
  const response = await fetch("https://covax.vaksiny.gov.mg/api/29/analytics/enrollments/query/yDuAzyqYABS.json?dimension=ou:"+req.query.idOrgUnit+"&dimension=a1jCssI2LkW.eNRjVGxVL6l&dimension=a1jCssI2LkW.SB1IHYu2xQT&dimension=a1jCssI2LkW.NI0QRzJvQ0k&dimension=a1jCssI2LkW.LY2bDXpNvS7&dimension=a1jCssI2LkW.oindugucx72&dimension=a1jCssI2LkW.KSr2yTdu1AI&dimension=a1jCssI2LkW.Ewi7FUfcHAD&dimension=a1jCssI2LkW.fctSQp5nAYl&stage=a1jCssI2LkW&startDate="+req.query.d1+"&endDate="+req.query.d2+"&displayProperty=NAME&outputType=ENROLLMENT&desc=enrollmentDate",{ headers: auth } );
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


app.get("/NA-enrollment", async (req, res) => {
  var query = req.query;
  var username = query.username; 
  var password = query.password; 
  var periode = query.periode; 
  var idOrgUnit = query.idOrgUnit; 
  var sortie = query.sortie; 
  var outputType = query.outputType; 
  var sort = query.sort; 
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

app.get("/DisponibiliteDeVaccinRoutine", async (req,res) => 
{
    const response = await fetch("https://ministere-sante.mg/api/29/analytics.json?dimension=pe:202302&dimension=dx:JTfvT0DrBvz;Nm1qAOpMbDX;ip8qeFyILRB;sYVDf23mZsg;d7jhJrTl6ig;LdkpYulBjdW;HGALcAqspdR;ebV6IUA6Xwk;GkEv4YDqZ40&filter=ou:"+req.query.ou+"&displayProperty=NAME&outputIdScheme=NAME",{
        headers: { Authorization: `Basic ${Buffer.from( "Scorcard" + ":" + "D@shb0ard" ).toString("base64")}`, },
      }
    );
    var s = await response.json();
    res.json(s);
})

app.get("/DisponibiliteDeVaccinCovax", async (req,res) => 
{
    const response = await fetch("https://covax.vaksiny.gov.mg/api/29/analytics.json?dimension=dx:TPW8h9OYSkS;aSDvXnavplO;ziprLDlyUDf;ulBHnoeCEkm;zqTS3RiSL3o;K4UPUEDKFZJ;RkC5nQeFp1f;Kkbt3LgbCbD&dimension=pe:202301&filter=ou:"+req.query.ou+"&displayProperty=NAME&outputIdScheme=NAME",{
        headers: { Authorization: `Basic ${Buffer.from( "Nosybe" + ":" + "2021@Covax" ).toString("base64")}`, },
      }
    );
    var s = await response.json();
    res.json(s);
})

app.get("/StockFinalCovid", async (req,res) => 
{
    const response = await fetch("https://covax.vaksiny.gov.mg/api/29/analytics.json?dimension=pe:202301&dimension=dx:LWmmFCXgUmg;hJKdezT5GcK;f6JAIJEpHpe;OJUzxCAcudW;D20DogInJTS&filter=ou:"+req.query.ou+"&displayProperty=NAME&outputIdScheme=NAME",{
        headers: { Authorization: `Basic ${Buffer.from(  "Nosybe" + ":" + "2021@Covax"  ).toString("base64")}`, },
      }
    );
    var s = await response.json();
    res.json(s);
})

app.get("/NombreTotalDesPersonneVaccine", async (req,res) => 
{
    const response = await fetch("https://covax.vaksiny.gov.mg/api/29/analytics.json?dimension=dx:vr6nXFKkVGH&dimension=ou:"+req.query.ou+"&startDate=2021-05-02&endDate=2023-03-28&displayProperty=NAME&outputIdScheme=NAME",{
        headers: { Authorization: `Basic ${Buffer.from(  "Nosybe" + ":" + "2021@Covax"  ).toString("base64")}`, },
      }
    );
    var s = await response.json();
    res.json(s);
})


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


app.get("/NA-eventdd", async (req, res) => {
  var query = req.query;
  var username = query.username; //"Nosybe"
  var password = query.password; //"2021@Covax"
   var credentials = Buffer.from(username + ":" + password).toString("base64");
  var auth = { Authorization: `Basic ${credentials}` };
  var url = "https://covax.vaksiny.gov.mg/api/29/analytics/";
  const response = await fetch("https://covax.vaksiny.gov.mg/api/29/analytics/events/query/yDuAzyqYABS.json?dimension=ou:"+req.query.idOrgUnit+"&dimension=a1jCssI2LkW.bbnyNYD1wgS&dimension=a1jCssI2LkW.LUIsbsm3okG&dimension=a1jCssI2LkW.Yp1F4txx8tm&dimension=a1jCssI2LkW.eNRjVGxVL6l&dimension=a1jCssI2LkW.SB1IHYu2xQT&dimension=a1jCssI2LkW.KSr2yTdu1AI&stage=a1jCssI2LkW&startDate="+req.query.d1+"&endDate="+req.query.d2+"&displayProperty=NAME&outputType=EVENT&desc=eventDate",
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
