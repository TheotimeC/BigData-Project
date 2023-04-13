const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

//CONNECTION INFO
const url = 'mongodb+srv://root:root@projetchu.0fj09qm.mongodb.net';
const dbName = 'ProjetCHU';

//CSV WRITERS
const { createObjectCsvWriter } = require('csv-writer');
const csvWriter = createObjectCsvWriter({
    path: 'diagnostics.csv',
    header: [
        { id: 'diagnostic', title: 'diagnostic' },
    ]
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/graphique', (req, res) => {
  res.sendFile(__dirname + '/graphique.html');
});



//CONNECT TO MONGODB
MongoClient.connect(url, { useUnifiedTopology: true }, function(err, client) {

    if (err) throw err;

    const db = client.db('ProjetCHU');

    console.log(db);
    console.log("Connected to MongoDB");


    //-------------------------------------------------------------------//
    //-----------------------APPGET DIAGNOSTIC---------------------------//
    //-------------------------------------------------------------------//
    /*app.get('/TotalDiagPeriode', (req, res) => {
        const client = new MongoClient(url, { useUnifiedTopology: true });
        client.connect(function(err) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            const collection = db.collection('Diagnostic');

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
    });*/
    
    //-------------------------------------------------------------------//
    //-----------------------APPGET DIAGNOSTIC---------------------------//
    //-------------------------------------------------------------------//

});


app.listen(3000, () => {
    console.log('Le serveur est en cours d\'exécution sur le port 3000');
});