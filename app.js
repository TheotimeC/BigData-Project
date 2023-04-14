const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;


const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/hospitalisation', express.static('hospitalisation'));
app.use('/autre', express.static('autre'));
app.use('/consultation', express.static('consultation'));
app.use(express.static(__dirname + '/public'));

//CONNECTION INFO
const url = 'mongodb://127.0.0.1:27017/';
const dbName = 'CHU';

//CSV WRITERS
const { createObjectCsvWriter } = require('csv-writer');
const csvWriter = createObjectCsvWriter({
    path: 'diagnostics.csv',
    header: [
      { id: 'month', title: 'Mois' },
      { id: 'diagnostic', title: 'Diagnostic' },
      { id: 'count', title: 'Total' }
    ],
    fieldDelimiter: ';'
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

//hospi

app.get('/hospitalisation/age', (req, res) => {
    res.sendFile(__dirname + '/hospitalisation/hage.html');
});

app.get('/hospitalisation/diag', (req, res) => {
    res.sendFile(__dirname + '/hospitalisation/hdiag.html');
});

app.get('/hospitalisation/temps', (req, res) => {
    res.sendFile(__dirname + '/hospitalisation/htemps.html');
});

//consult

app.get('/consultation/pro', (req, res) => {
    res.sendFile(__dirname + '/consultation/ctemps.html');
});

app.get('/consultation/temps', (req, res) => {
    res.sendFile(__dirname + '/consultation/ctemps.html');
});

app.get('/consultation/diag', (req, res) => {
    res.sendFile(__dirname + '/consultation/cdiag.html');
});

//autre

app.get('/autre/deces', (req, res) => {
    res.sendFile(__dirname + '/autre/adeces.html');
});

app.get('/autre/satisfaction', (req, res) => {
    res.sendFile(__dirname + '/consultation/asatisfaction.html');
});

//css 
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/css/style.css'));
  });


//CONNECT TO MONGODB
MongoClient.connect(url, { useUnifiedTopology: true }, function(err, client) {

    if (err) throw err;

    const db = client.db('CHU');

    console.log(db);
    console.log("Connected to MongoDB");


  //-------------------------------------------------------------------//
  //-----------------------APPGET DIAGNOSTIC---------------------------//
  //-------------------------------------------------------------------//
  app.get('/TotalDiagPeriode', (req, res) => {
    const client = new MongoClient(url, { useUnifiedTopology: true });
    client.connect(async function(err) {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }
  
      const collection = db.collection('Diagnostic');
  
      const keyword = req.query.keyword;
      const day = req.query.days;
      const date1 = req.query.date1; 

      const datefull = new Date(date1);
      let datefinal = new Date(datefull)
      //ajoute 'day' jours
      //datefinal.setDate(datefull.getDate()+day);
      //ajoute 'day' jours
      datefinal.setDate(datefull.getMonth()+day);
      //ajoute 'day' années
      //datefinal.setDate(datefull.getFullYear()+day);

      const dateformat = datefinal.toISOString().slice(0,10);
      console.log(date1)
      console.log(dateformat)
      const query = { $text: { $search: keyword } };
      /*
      function addDays(date, days) {
        date.setDate(date.getDate() + days);
        return date;
      }

      const date2 = addDays(date1, day);
      */
      const cursor = collection.aggregate([
        {
          $match: query
        },
        {
          $lookup:
            {
              from: 'Consultation',
              localField: 'code_diag',
              foreignField: 'code_diag',
              as: 'consultations'
            }
        },
        {
          $unwind: "$consultations" // aplatit le tableau consultations
        },
        {
          $project:
            {
              _id: 0,
              diagnostic: 1,
              date_consultation: "$consultations.date_consultation",
              month: { $month: { $toDate: "$consultations.date_consultation" } }
            }
        },
        {
          $match: {
            date_consultation: {
              $gte: date1,
              $lt: dateformat
            }
          }
        },
        {
          $group:{
            
            _id:{"diagnostic" : "$diagnostic", month: "$month"}, 
            count:{$sum:1},

          }
        },
        {
          $skip:0
        }
      ]);

      const results = await cursor.toArray();

      const flatResults = results.map(result => ({
        diagnostic: result._id.diagnostic,
        month: result._id.month,
        count: result.count
      }));

        client.close();


        try {
              await csvWriter.writeRecords(flatResults);
              console.log('Les résultats ont été écrits dans le fichier diagnostics.csv');
            } catch (error) {
              console.log(error);
              return res.status(500).send(error);
            }
  
        res.send(results);
      });
    });
  });
  

  //-------------------------------------------------------------------//
  //-------------------APPGET TotalConsultPeriode----------------------//
  //-------------------------------------------------------------------//
  app.get('/TotalConsultPeriode', (req, res) => {
    const client = new MongoClient(url, { useUnifiedTopology: true });
    client.connect(function(err) {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }
  
      const collection = db.collection('Consultation');
  
      const keyword = req.query.keyword;
      const date1 = req.query.date1;
      const date2 = req.query.date2;
      const query = { diagnostic: { $regex: keyword, $options: 'i' } };
  
      collection.find(query).toArray(function(err, docs) {
        if (err) {
          console.log(err);
          return res.status(500).send(err);
        }
        
        client.close();

        csvWriter.writeRecords(docs)
        .then(() => {
          console.log('Les résultats ont été écrits dans le fichier diagnostics.csv');
          return res.send(docs);
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).send(error);
        });
      });
    });
  });

  //-------------------------------------------------------------------//
  //--------------------APPGET TotalHospiPeriode-----------------------//
  //-------------------------------------------------------------------//
  app.get('/TotalHospiPeriode', (req, res) => {
    const client = new MongoClient(url, { useUnifiedTopology: true });
    client.connect(function(err) {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }
  
      const collection = db.collection('Hospitalisation');
  
      const keyword = req.query.keyword;
      const date1 = req.query.date1;
      const date2 = req.query.date2;
      const query = { diagnostic: { $regex: keyword, $options: 'i' } };
  
      collection.find(query).toArray(function(err, docs) {
        if (err) {
          console.log(err);
          return res.status(500).send(err);
        }
        
        client.close();

        csvWriter.writeRecords(docs)
        .then(() => {
          console.log('Les résultats ont été écrits dans le fichier diagnostics.csv');
          return res.send(docs);
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).send(error);
        });
      });
    });
  });

  //-------------------------------------------------------------------//
  //------------------APPGET TotalHospiDiagPeriode---------------------//
  //-------------------------------------------------------------------//
  app.get('/TotalHospiDiagPeriode', (req, res) => {
    const client = new MongoClient(url, { useUnifiedTopology: true });
    client.connect(function(err) {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }
  
      const collection = db.collection('Hospitalisation');
  
      const keyword = req.query.keyword;
      const date1 = req.query.date1;
      const date2 = req.query.date2;
      const query = { diagnostic: { $regex: keyword, $options: 'i' } };
  
      collection.find(query).toArray(function(err, docs) {
        if (err) {
          console.log(err);
          return res.status(500).send(err);
        }
        
        client.close();

        csvWriter.writeRecords(docs)
        .then(() => {
          console.log('Les résultats ont été écrits dans le fichier diagnostics.csv');
          return res.send(docs);
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).send(error);
        });
      });
    });
  });

  //-------------------------------------------------------------------//
  //----------------APPGET TotalHospiConsultAgeSexe--------------------//
  //-------------------------------------------------------------------//
  app.get('/TotalHospiConsultAgeSexe', (req, res) => {
    const client = new MongoClient(url, { useUnifiedTopology: true });
    client.connect(function(err) {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }
  
      const collection = db.collection('Hospitalisation');
  
      const keyword = req.query.keyword;
      const date1 = req.query.date1;
      const date2 = req.query.date2;
      const query = { diagnostic: { $regex: keyword, $options: 'i' } };
  
      collection.find(query).toArray(function(err, docs) {
        if (err) {
          console.log(err);
          return res.status(500).send(err);
        }
        
        client.close();

        csvWriter.writeRecords(docs)
        .then(() => {
          console.log('Les résultats ont été écrits dans le fichier diagnostics.csv');
          return res.send(docs);
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).send(error);
        });
      });
    });
  });

  //-------------------------------------------------------------------//
  //---------------------APPGET TotalConsultPro------------------------//
  //-------------------------------------------------------------------//
  app.get('/TotalConsultPro', (req, res) => {
    const client = new MongoClient(url, { useUnifiedTopology: true });
    client.connect(function(err) {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }
  
      const collection = db.collection('Hospitalisation');
  
      const keyword = req.query.keyword;
      const date1 = req.query.date1;
      const date2 = req.query.date2;
      const query = { diagnostic: { $regex: keyword, $options: 'i' } };
  
      collection.find(query).toArray(function(err, docs) {
        if (err) {
          console.log(err);
          return res.status(500).send(err);
        }
        
        client.close();

        csvWriter.writeRecords(docs)
        .then(() => {
          console.log('Les résultats ont été écrits dans le fichier diagnostics.csv');
          return res.send(docs);
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).send(error);
        });
      });
    });
  });

  //-------------------------------------------------------------------//
  //----------------------APPGET DecesPeriode--------------------------//
  //-------------------------------------------------------------------//
  app.get('/DecesPeriode', (req, res) => {
    const client = new MongoClient(url, { useUnifiedTopology: true });
    client.connect(function(err) {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }
  
      const collection = db.collection('Hospitalisation');
  
      const keyword = req.query.keyword;
      const date1 = req.query.date1;
      const date2 = req.query.date2;
      const query = { diagnostic: { $regex: keyword, $options: 'i' } };
  
      collection.find(query).toArray(function(err, docs) {
        if (err) {
          console.log(err);
          return res.status(500).send(err);
        }
        
        client.close();

        csvWriter.writeRecords(docs)
        .then(() => {
          console.log('Les résultats ont été écrits dans le fichier diagnostics.csv');
          return res.send(docs);
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).send(error);
        });
      });
    });
  });




app.listen(3000, () => {
    console.log('Le serveur est en cours d\'exécution sur le port 3000');
});

