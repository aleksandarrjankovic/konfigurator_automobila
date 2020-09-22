const express = require('express');
const mongodb = require('mongodb');
const bodyparser = require('body-parser');
const ejs = require('ejs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const MongoClient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017';

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('vire engine', ejs);

//Rute
app.get('/',(req,res)=>{
    res.render('index.ejs');
});
app.get('/autolista',(req,res)=>{
    res.render('auto.ejs');
});
app.get('/konfigurator', (req,res)=>{
    res.render('configurator.ejs');
});
app.get('/korisnik', (req,res)=>{
    res.render('korisnik.ejs');
})


global.car = "";
global.kod = ""; //generisani kod za odredjeni automobil

MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true} ,  (err, client)=>{
	if(err){
		console.log("Konekcija sa bazom nije uspostavljena");
	}
	else{
        console.log("Konekcija sa bazom je uspostavljena");
        //Unosimo automobil u bazu podataka
        app.post('/autolista', (req,res)=>{
            const db = client.db('konfigurator'); 
            var getData = req.body;
            car = getData.name;
            kod = crypto.randomBytes(5).toString('hex').toUpperCase();
              db.collection(car).insertOne({
        				"gorivo" : "null",
        				"menjac" : "null",
        				"pogon" : "null",
        				"motor" : "null",
        				"boje" : "null",
                "felne" : "null",
                "dodatna_oprema" : "null",
                "cena" : "null",
                "kod" : kod
      			});
            res.redirect('/konfigurator');
            console.log("Generisani kod: " + kod);
        });
        //Unosimo podatke automobila u bazu podataka i citamo ih
        app.post('/konfigurator',(req,res)=>{
            var postData = req.body;
            var boje = postData.boje;
            var felne = postData.felne;
            var motor = postData.motor;
            var pogon = postData.pogon;
            var menjac = postData.menjac;
            var gorivo= postData.gorivo;
            var dodatna_oprema = postData.dodatna_oprema;
            var cena = getCena(40000,60000);
            var inserJson = {
                  "boje" : boje,
                  "felne" : felne,
                  "pogon" : pogon,
                  "motor" : motor,
                  "menjac" : menjac,
                  "gorivo" : gorivo,
                  "dodatna_oprema" : dodatna_oprema,
                  "cena" : cena,
                };
            const db = client.db('konfigurator');
            db.collection(car).findOneAndUpdate({'kod': kod}, {$set: inserJson}, (err, res)=>{
              if(err) throw err;
              else {
                  console.log("Uneli ste kola u bazu.");
                  }
            });
            var autoResult = [];
            var auto = db.collection(car).find({'kod' : kod});
            auto.forEach((doc, err) => {
                autoResult.push(doc);
            },()=>{
              res.render('korisnik.ejs',{auto:autoResult});
              console.log("Uspesno ste konfigurisali automobil.");
            });
        });
    }
});

app.listen(3000, () => {
	console.log("Web Servis radi na portu 3000");
});

function getCena(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
