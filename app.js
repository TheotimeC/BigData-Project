const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const { spawn } = require('child_process');
const path = require('path');
const R = require('r-integration');



const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/hospitalisation', express.static('hospitalisation'));
app.use('/autre', express.static('autre'));
app.use('/consultation', express.static('consultation'));
app.use(express.static(__dirname + '/public'));

//CONNECTION INFO
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'CHU';

const diagnosticSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  code_diag: String,
  diagnostic: String,
});

const Diagnostic = mongoose.model('Diagnostic', diagnosticSchema);

module.exports = Diagnostic;


const consultationSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  num_consultation: { type: String },
  id_patient: { type: String },
  id_prof_sante: { type: String },
  code_diag: { type: String },
  motif: { type: String },
  date_consultation: { type: Date },
  heure_debut: { type: String },
  heure_fin: { type: String}
});

const Consultation = mongoose.model('Consultation', consultationSchema);

module.exports = Consultation;

//--------------------------------------------------------------//
//------------------------CSV WRITERS---------------------------//
//--------------------------------------------------------------//
const { createObjectCsvWriter } = require('csv-writer');
const TotalDiagPeriodeCSV = createObjectCsvWriter({
    path: './CSVrequetes/TotalDiagPeriode.csv',
    header: [
      { id: 'diagnostic', title: 'Diagnostic' },
      { id: 'count', title: 'Total' }
    ],
    fieldDelimiter: ';'
});

const TotalConsultPeriodeCSV = createObjectCsvWriter({
  path: './CSVrequetes/TotalConsultPeriode.csv',
  header: [
    { id: '_id', title: 'Date' },
    { id: 'count', title: 'Total' }
  ],
  fieldDelimiter: ';'
});

const TotalHospitPeriodeCSV = createObjectCsvWriter({
  path: './CSVrequetes/TotalHospitPeriode.csv',
  header: [
    { id: 'date', title: 'Date' },
    { id: 'count', title: 'Total' }
  ],
  fieldDelimiter: ';'
});

const TotalHospiDiagPeriodeCSV = createObjectCsvWriter({
  path: './CSVrequetes/TotalHospiDiagPeriode.csv',
  header: [
    { id: 'diagnostic', title: 'Diagnostic' },
    { id: 'count', title: 'Total' }
  ],
  fieldDelimiter: ';'   
});

const TotalHospiAgeCSV = createObjectCsvWriter({
  path: './CSVrequetes/TotalHospiAge.csv',
  header: [
    { id: '_id', title: 'Age' },
    { id: 'total', title: 'Total' }
  ],
  fieldDelimiter: ';'   
});

const TotalHospiSexeCSV = createObjectCsvWriter({
  path: './CSVrequetes/TotalHospiSexe.csv',
  header: [
    { id: '_id', title: 'Sexe' },
    { id: 'total', title: 'Total' }
  ],
  fieldDelimiter: ';'   
});

const DecesPeriodeCSV = createObjectCsvWriter({
  path: './CSVrequetes/DecesPeriode.csv',
  header: [
    { id: 'count', title: 'Total' },
    { id: 'latitude', title: 'Latitude' },
    { id: 'longitude', title: 'Longitude' },
  ],
  fieldDelimiter: ','   
});




//--------------------------------------------------------------//
//---------------------------ROUTES-----------------------------//
//--------------------------------------------------------------//
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


  //-------------------------------------------------------------------//
  //------------------------CONNECT MONGODB----------------------------//
  //-------------------------------------------------------------------//
  
  

  const dbURI = 'mongodb://127.0.0.1/CHU';

  // Connexion à la base de données
  //mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

  mongoose.connect(dbURI, { useNewUrlParser: true })
  .then(() => {
    console.log('Connexion à la base de données réussie');
    console.log(mongoose.connection.readyState);
  })
  .catch((error) => {
    console.error('Erreur de connexion à la base de données:', error);
  });

  
  // Gestion des événements de connexion
  mongoose.connection.on('connected', () => {
    console.log(`Mongoose est connecté à ${dbURI}`);
  });
  
  mongoose.connection.on('error', (err) => {
    console.log(`Mongoose a rencontré une erreur de connexion : ${err}`);
  });
  
  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose est déconnecté');
  });

  //-------------------------------------------------------------------//
  //--------------------APPGET TotalDiagPeriode------------------------//
  //-------------------------------------------------------------------//
  app.get('/TotalDiagPeriode', async (req, res) => {

    try {
      
      const keyword = req.query.keyword;
      const date1 = req.query.date1;
      const date2 = req.query.date2;
      
      
      //const query = { diagnostic: { $regex: keyword, $options:"i" } };


      const date11 = new Date(date1);
      const datedepart = date11.toISOString();

      const date22 = new Date(date2);
      const datefin = date22.toISOString();


      console.log(keyword);
      console.log(datedepart);
      console.log(datefin);

      console.log(date1);
      console.log(date2);

      const db = mongoose.connection;

      //console.log(query)

      var results = await db.collection('Diagnostic').aggregate([
        {
          $match: {
            diagnostic: { $regex: keyword, $options: "i" }
          }
        },
        {
          $lookup: {
            from: "Consultation",
            localField: "code_diag",
            foreignField: "code_diag",
            as: "consultations"
          }
        },
        {
          $unwind: "$consultations"
        },
        {
          $project: {
            _id: 0,
            diagnostic: 1,
            date_consultation: "$consultations.date_consultation"
          }
        },
        {
          $match: {
            date_consultation: {
              $gte: date1,
              $lt: date2
            }
          }
        },
        {
          $group: {
            _id: { diagnostic: "$diagnostic" },
            count: { $sum: 1 }
          }
        }
      ]).toArray();
      
      const flatResults = results.map(result => ({
        diagnostic: result._id.diagnostic,
        count: result.count
      }));
  
      await TotalDiagPeriodeCSV.writeRecords(flatResults);
      console.log('Les résultats ont été écrits dans le fichier TotalDiagPeriode.csv');
      res.send(results);
      
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  });
    


  //-------------------------------------------------------------------//
  //-------------------APPGET TotalConsultPeriode----------------------//
  app.get('/GraphTotalConsultPeriode', (req, res) => {
    // renvoie l'image comme réponse HTTP
    res.sendFile('D:\\A3\\BIGDATA\\ProjetCHU\\ProjetCHU\\GraphsR\\TotalConsultPeriode.png');
  });
  //-------------------------------------------------------------------//
  app.get('/TotalConsultPeriode',async (req, res) => {

  
      const DateDepart1 = req.query.date1;
      const duree = req.query.duree;

      let DateDepart = new Date(DateDepart1);
      DateDepart = DateDepart.toISOString();

      
      const date1 = new Date(DateDepart1);
     
      //TEST VALEURS
      try {

        switch (duree) {
          case "7j":
            date1.setDate(date1.getDate() + 7);
            break;
          case "15j":
            date1.setDate(date1.getDate() + 15);
            break;
          case "30j":
            date1.setDate(date1.getDate() + 30);
            break;
          case "3mois":
            const newMonth3 = date1.getMonth() + 3;
            date1.setMonth(newMonth3);
            break;
          case "6mois":
            const newMonth6 = date1.getMonth() + 6;
            date1.setMonth(newMonth6);
            break;
          case "1an":
            const newYear1 = date1.getFullYear() + 1;
            date1.setFullYear(newYear1);
            break;
          case "2ans":
            const newYear2 = date1.getFullYear() + 2;
            date1.setFullYear(newYear2);
            break;
          case "3ans":
            const newYear3 = date1.getFullYear() + 3;
            date1.setFullYear(newYear3);
            break;
          case "5ans":
            const newYear5 = date1.getFullYear() + 5;
            date1.setFullYear(newYear5);
            break;
          case "10ans":
            const newYear10 = date1.getFullYear() + 10;
            date1.setFullYear(newYear10);
            break;
          default:
            throw new Error(`La valeur sélectionnée (${duree}) n'est pas valide.`);
        }
      } catch (error) {
        console.error(`Une erreur s'est produite : ${error.message}`);
      }

      const DateFin = date1.toISOString();
      

      //console.log(query)

      const db = mongoose.connection;

      //console.log(query)

      var results = await db.collection('Consultation').aggregate([
        
        // Match les consultations entre les deux dates
        {
          $match: {
            date_consultation: {
              $gte: DateDepart ,
              $lte: DateFin 
            },
          },
        },
        // Group par jour/mois/année et compter le nombre de consultations dans chaque groupe
        {
          $group: {
            _id: {
              $dateToString: {
                format: { 
                  $switch: {
                    branches: [
                      { case: { $eq: [duree, "7j"] }, then: "%Y-%m-%d" }, // tri par jour
                      { case: { $eq: [duree, "15j"] }, then: "%Y-%m-%d" }, // tri par jour
                      { case: { $eq: [duree, "30j"] }, then: "%Y-%m-%d" }, // tri par jour
                      { case: { $eq: [duree, "3mois"] }, then: "%Y-%m" }, // tri par mois
                      { case: { $eq: [duree, "6mois"] }, then: "%Y-%m" }, // tri par mois
                      { case: { $eq: [duree, "1an"] }, then: "%Y-%m" }, // tri par année
                      { case: { $eq: [duree, "2ans"] }, then: "%Y" }, // tri par année
                      { case: { $eq: [duree, "3ans"] }, then: "%Y" }, // tri par année
                      { case: { $eq: [duree, "5ans"] }, then: "%Y" }, // tri par année
                      { case: { $eq: [duree, "10ans"] }, then: "%Y" }, // tri par année
                    ],
                    default: "%Y-%m-%d"
                  }
                },
                date: {$toDate:"$date_consultation"},
                timezone: "+01:00"
              }
            },
            count: { $sum: 1 },
          },
        },
        
        // Trier les résultats
        { $sort: { _id: 1 } },
      ]).toArray();

        


        try {
          await TotalConsultPeriodeCSV.writeRecords(results);
          console.log('Les résultats ont été écrits dans le fichier TotalConsultPeriode.csv');
          // Execute R script

          let result = R.executeRScript("./ScriptsR/TotalConsultPeriode.r");
          res.sendFile(__dirname+'/consultation/ctemps.html');

        } catch (error) {
          console.log(error);
          return res.status(500).send(error);
        }
        
        
  });



  //-------------------------------------------------------------------//
  //--------------------APPGET TotalHospiPeriode-----------------------//
  app.get('/GraphTotalHospiPeriode', (req, res) => {
    // renvoie l'image comme réponse HTTP
    res.sendFile('D:\\A3\\BIGDATA\\ProjetCHU\\ProjetCHU\\GraphsR\\TotalHospiPeriode.png');
  });
  //-------------------------------------------------------------------//
  app.get('/TotalHospiPeriode',async (req, res) => {

  
  
      const DateDepart1 = req.query.date1;
      let DateDepart = new Date(DateDepart1);
      DateDepart = DateDepart.toISOString();

      const duree = req.query.duree;
      const date1 = new Date(DateDepart1);
     
      //TEST VALEURS
      try {

        switch (duree) {
          case "7j":
            date1.setDate(date1.getDate() + 7);
            break;
          case "15j":
            date1.setDate(date1.getDate() + 15);
            break;
          case "30j":
            date1.setDate(date1.getDate() + 30);
            break;
          case "3mois":
            const newMonth3 = date1.getMonth() + 3;
            date1.setMonth(newMonth3);
            break;
          case "6mois":
            const newMonth6 = date1.getMonth() + 6;
            date1.setMonth(newMonth6);
            break;
          case "1an":
            const newYear1 = date1.getFullYear() + 1;
            date1.setFullYear(newYear1);
            break;
          case "2ans":
            const newYear2 = date1.getFullYear() + 2;
            date1.setFullYear(newYear2);
            break;
          case "3ans":
            const newYear3 = date1.getFullYear() + 3;
            date1.setFullYear(newYear3);
            break;
          case "5ans":
            const newYear5 = date1.getFullYear() + 5;
            date1.setFullYear(newYear5);
            break;
          case "10ans":
            const newYear10 = date1.getFullYear() + 10;
            date1.setFullYear(newYear10);
            break;
          default:
            throw new Error(`La valeur sélectionnée (${duree}) n'est pas valide.`);
        }
      } catch (error) {
        console.error(`Une erreur s'est produite : ${error.message}`);
      }

      const DateFin = date1.toISOString();

      const db = mongoose.connection;

      //console.log(query)

      var results = await db.collection('Hospitalisation').aggregate([
        
        // Match les consultations entre les deux dates
        {
          $match: {
            date_entree: {
              $gte: DateDepart ,
              $lte: DateFin 
            },
          },
        },
        // Group par jour/mois/année et compter le nombre de consultations dans chaque groupe
        {
          $group: {
            _id: {
              $dateToString: {
                format: { 
                  $switch: {
                    branches: [
                      { case: { $eq: [duree, "7j"] }, then: "%Y-%m-%d" }, // tri par jour
                      { case: { $eq: [duree, "15j"] }, then: "%Y-%m-%d" }, // tri par jour
                      { case: { $eq: [duree, "30j"] }, then: "%Y-%m-%d" }, // tri par jour
                      { case: { $eq: [duree, "3mois"] }, then: "%Y-%m" }, // tri par mois
                      { case: { $eq: [duree, "6mois"] }, then: "%Y-%m" }, // tri par mois
                      { case: { $eq: [duree, "1an"] }, then: "%Y-%m" }, // tri par année
                      { case: { $eq: [duree, "2ans"] }, then: "%Y" }, // tri par année
                      { case: { $eq: [duree, "3ans"] }, then: "%Y" }, // tri par année
                      { case: { $eq: [duree, "5ans"] }, then: "%Y" }, // tri par année
                      { case: { $eq: [duree, "10ans"] }, then: "%Y" }, // tri par année
                    ],
                    default: "%Y-%m-%d"
                  }
                },
                date: {$toDate:"$date_entree"},
                timezone: "+01:00"
              }
            },
            count: { $sum: 1 },
          },
        },
        
        // Trier les résultats
        { $sort: { _id: 1 } },
      ]).toArray();


      const flatResults = results.map(result => ({
        date: result._id,
        count: result.count
      }));

       


        try {
              await TotalHospitPeriodeCSV.writeRecords(flatResults);
              console.log('Les résultats ont été écrits dans le fichier TotalHospitPeriode.csv');
              let result = R.executeRScript("./ScriptsR/TotalHospiPeriode.r");
            } catch (error) {
              console.log(error);
              return res.status(500).send(error);
            }
  
            res.sendFile(__dirname+'/hospitalisation/htemps.html');
      });



  //-------------------------------------------------------------------//
  //------------------APPGET TotalHospiDiagPeriode---------------------//
  //-------------------------------------------------------------------//
  app.get('/TotalHospiDiagPeriode',async (req, res) => {

    
  
      const keyword = req.query.keyword;
      let date1 = req.query.date1; 
      let date2 = req.query.date2;
       
      
      const query = { $text: { $search: keyword } };

      const db = mongoose.connection;

      var results = await db.collection('Diagnostic').aggregate([
        {
          $match: query
        },
        {
          $lookup:
            {
              from: 'Hospitalisation',
              localField: 'code_diag',
              foreignField: 'code_diag',
              as: 'hospitalisations'
            }
        },
        {
          $unwind: "$hospitalisations" // aplatit le tableau hospitalisations
        },
        {
          $project:
            {
              _id: 0,
              diagnostic: 1,
              date_entree: "$hospitalisations.date_entree",
              month: { $month: { $toDate: "$hospitalisations.date_entree" } }
            }
        },
        {
          $match: {
            date_entree: {
              $gte: date1,
              $lt: date2
            }
          }
        },
        {
          $group:{
            
            _id:{"diagnostic" : "$diagnostic"}, 
            count:{$sum:1},

          }
        },
        {
          $skip:0
        },
      ]).toArray();

      const flatResults = results.map(result => ({
        diagnostic: result._id.diagnostic,
        count: result.count
      }));

      


      try {
        await TotalHospiDiagPeriodeCSV.writeRecords(flatResults);
        console.log('Les résultats ont été écrits dans le fichier TotalHospiDiagPeriode.csv');
        //let result = R.executeRScript("./ScriptsR/TotalConsultPeriode.r");
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
        
      res.send(results);
      });

   
  

  //-------------------------------------------------------------------//
  //----------------APPGET TotalHospiConsultAgeSexe--------------------//
  //-------------------------------------------------------------------//
  app.get('/TotalHospiConsultAgeSexe',async (req, res) => {

      const db = mongoose.connection;

      const choix = req.query.age; 
      var results;
      if(choix=='age'){
        results = await db.collection('Patient').aggregate([
          {
            $lookup: {
              from: "Hospitalisation",
              localField: "id_patient",
              foreignField: "id_patient",
              as: "hospitalisations"
            }
          },
          {
            $unwind: "$hospitalisations"
          },
          {
            $group: {
              _id: "$age",
              total_hospitalisations: { $sum: 1 }
            }
          }
        ]).toArray();

    }else if(choix=='sexe'){
      results = await db.collection('Patient').aggregate([
        {
          $lookup: {
            from: "Hospitalisation",
            localField: "id_patient",
            foreignField: "id_patient",
            as: "hospitalisations"
          }
        },
        {
          $unwind: "$hospitalisations"
        },
        {
          $group: {
            _id: "$sexe",
            total_hospitalisations: { $sum: 1 }
          }
        }
      ]).toArray();

    }

 

      const flatResults = results.map(result => ({
        _id : result._id,
        total: result.total_hospitalisations,
      }));

    

        if(choix=='age'){
            try {
                  await TotalHospiAgeCSV.writeRecords(flatResults);
                  console.log('Les résultats ont été écrits dans le fichier TotalHospiAgeSexe.csv');
                  //let result = R.executeRScript("./ScriptsR/TotalHospiAge.r");
                  //let results = R.executeRScript("./ScriptsR/TotalHospiAgeCamembert.r");
                } catch (error) {
                  console.log(error);
                  return res.status(500).send(error);
                }
        }else if(choix=='sexe'){
          try {
            await TotalHospiSexeCSV.writeRecords(flatResults);
            console.log('Les résultats ont été écrits dans le fichier TotalHospiAgeSexe.csv');
            //let result = R.executeRScript("./ScriptsR/TotalHospiSexe.r");
            //let results = R.executeRScript("./ScriptsR/TotalHospiSexeCamembert.r");
          } catch (error) {
            console.log(error);
            return res.status(500).send(error);
          }
        }

            res.send(results);
      });
      



  //-------------------------------------------------------------------//
  //---------------------APPGET TotalConsultPro------------------------//
  //-------------------------------------------------------------------//
  app.get('/TotalConsultPro',async (req, res) => {
    try {
      
      const keyword = req.query.profession;
      const date1 = req.query.date1;
      const date2 = req.query.date2;
      

      const db = mongoose.connection;

      //console.log(query)

      var results = await db.collection('Professionnel_de_sante').aggregate([
        { $match: { profession: keyword } },

  // Joindre la table Consultation avec la table Professionnel_de_sante en utilisant le champ id_prof_sante
  {
    $lookup: {
      from: "Consultation",
      localField: "id_prof_sante",
      foreignField: "id_prof_sante",
      as: "consultations"
    }
  },

  // Filtre les consultations selon la période donnée
  {
    $project: {
      _id: 0,
      nom: 1,
      prenom: 1,
      consultations: {
        $filter: {
          input: "$consultations",
          as: "c",
          cond: {
            $and: [
              { $gte: ["$$c.date_consultation", date1] },
              { $lt: ["$$c.date_consultation", date2] }
            ]
          }
        }
      }
    }
  },

  // Compter le nombre de consultations par professionnel de santé
  {
    $project: {
      nom: 1,
      prenom: 1,
      nombre_consultations: { $size: "$consultations" }
    }
  }
      ]).toArray();
      
      const flatResults = results.map(result => ({
        diagnostic: result._id.diagnostic,
        count: result.count
      }));
  
      await TotalDiagPeriodeCSV.writeRecords(flatResults);
      console.log('Les résultats ont été écrits dans le fichier prof.csv');
      //let result = R.executeRScript("./ScriptsR/TotalConsultPeriode.r");
      
      res.send(results);
      
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  });


  //-------------------------------------------------------------------//
  //----------------------APPGET DecesPeriode--------------------------//
  //-------------------------------------------------------------------//
  app.get('/DecesPeriode',async (req, res) => {

      try {
        const date1 = req.query.date1;
        const date2 = req.query.date2;
  
        const db = mongoose.connection;

        console.log(date1)
        console.log(date2)
  
        var results = await db.collection('Coordonnées').aggregate([
          {
            $lookup: {
              from: "Deces2019",
              localField: "code_commune_INSEE",
              foreignField: "code_lieu_deces",
              as: "deces"
            }
          },
          {
            $unwind: "$deces"
          },
          {
            $match: {
              "deces.date_deces": {
                $gte: date1,
                $lt: date2
              }
            }
          },
          {
            $group: {
              _id: "$code_commune_INSEE",
              latitude: { $first: "$latitude" },
              longitude: { $first: "$longitude" },
              count: { $sum: 1 }
            }
          }
        ]).toArray();

        const flatResults = results.map(result => ({
          longitude: result.longitude,
          latitude: result.latitude,
          count: result.count
        }));
    
        await DecesPeriodeCSV.writeRecords(flatResults);
        console.log('Les résultats ont été écrits dans le fichier DecesPeriode.csv');
        //let result = R.executeRScript("./ScriptsR/TotalConsultPeriode.r");
        
        res.send(results);
        
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    });



app.listen(3000, () => {
    console.log('Le serveur est en cours d\'exécution sur le port 3000');
});

