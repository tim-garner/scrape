var express = require("express");
// var mongojs = require("mongojs");

var axios = require("axios");
var cheerio = require("cheerio");
// var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// mongoose.connect(MONGODB_URI);




// // Database configuration
// var databaseUrl = "scraper";
// var collections = ["scraper"];
// var app = express();


console.log("\n******************************************\n" +
            "Grabbing every article headline and link\n" +
            "from the website:" +
            "\n******************************************\n");

            axios.get("https://www.nhl.com/").then(function(response) {

              var $ = cheerio.load(response.data);
            

              var results = [];

              $("h4.headline-link").each(function(i, element) {
            
                // Save the text of the h4-tag as "title"
                var title = $(element).text();

                var link = $(element).parent().attr("href");
            
                // Make an object with data we scraped for this h4 and push it to the results array
                results.push({
                  title: title,
                  link: link,
                
                });
              });

              console.log(results);
            });

 

