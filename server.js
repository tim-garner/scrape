var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");


var axios = require("axios");
var cheerio = require("cheerio");


var db = require("./models");

var PORT = 3000;

var app = express();


app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

// Connect to the Mongo DB
// var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// mongoose.connect(MONGODB_URI);

mongoose.connect("mongodb://localhost/mongolab-cubic-66949", { useNewUrlParser: true });

// mongoose.connect('mongodb://localhost/mongoHeadlines', {useNewUrlParser: true});

app.get("/scrape", function(req, res) {
  axios.get("https://www.nhl.com/").then(function(response) {
    var $ = cheerio.load(response.data);

    $("article h2").each(function(i, element) {
      var result = {};

      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

        result.headline = $(this)
        .children("a")
        .attr("href");

        result.summary = $(this)
        .children("a")
        .attr("href");

      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
    
          console.log(err);
        });
    })

    res.send("Scrape Complete");
  });
});


app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});


app.get("/articles/:id", function(req, res) {
  
  db.Article.findOne({ _id: req.params.id })
    
    .populate("note")
    .then(function(dbArticle) {
    
      res.json(dbArticle);
    })
    .catch(function(err) {
  
      res.json(err);
    });
});


app.post("/articles/:id", function(req, res) {

  db.Note.create(req.body)
    .then(function(dbNote) {

      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {

      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

db.Note.create({ name: "cnn" })
  .then(function(dbUser) {
    console.log(dbUser);
  })
  .catch(function(err) {
    console.log(err.message);
  });



app.get("/notes", function(req, res) {
  // Find all Notes
  db.Note.find({})
    .then(function(dbNote) {
      // If all Notes are successfully found, send them back to the client
      res.json(dbNote);
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
});

app.post("/submit", function(req, res) {
  // Create a new Note in the db
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one User (there's only one) and push the new Note's _id to the User's `notes` array
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.User.findOneAndUpdate({}, { $push: { notes: dbNote._id } }, { new: true });
    })
    .then(function(dbUser) {
      // If the User was updated successfully, send it back to the client
      res.json(dbUser);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});













app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

