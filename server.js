const express = require("express");
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;

//Database connection
const url = "mongodb+srv://domino566:" + process.env.MONGO_PASS + "@spotmap.mhasa.mongodb.net/spotmapdev?retryWrites=true&w=majority";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('view engine', 'ejs');

function serveWebpage(request, response, zoom = 12, lat = 51.503, lng = -0.118) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("spotmapdev");
        dbo.collection("SpotsCollection").find({}).toArray(function(err, result) { //Retrieves all spots from db as a JSON object
            if (err) throw err;
            response.render(__dirname + "/views/index.ejs", {
                sporcle: JSON.stringify(result),
                zoom: zoom,
                lng: lng,
                lat: lat
            });
            db.close();
        });
    });
}

app.get("/:zoom/:lat/:lng", (request, response) => {
    serveWebpage(request, response, request.params.zoom, request.params.lat, request.params.lng);
});

app.get("/", (request, response) => {
    serveWebpage(request, response);
});

app.post("/", (request, response) => {
    console.log(request.get('host'));
    if (request.get('host') == "pk-spot-map.herokuapp.com") {
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("spotmapdev");
        dbo.collection("SpotsCollection").insertOne(request.body); //Inserts the new spot into the db
        db.close();
      });
    } else {
      console.log("WARNING: External source attempted to make POST request");
    }
});


const listener = app.listen(process.env.PORT, () => {
    console.log("Your app is listening on port " + listener.address().port);
});
