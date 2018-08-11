require("dotenv").config();
const keys = require("./keys")
const Twitter = require('twitter');
const Spotify = require('node-spotify-api');
const request = require('request');
const fs = require('fs');

var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

function liri(argv) {
    if (argv[2] == "my-tweets") {
        var params = { screen_name: 'realDonaldTrump', count: 20 };
        client.get('statuses/user_timeline', params, function (error, tweets, response) {
            if (!error) {
                for (let i = 0; i < tweets.length; i++) {
                    let tweet = tweets[i];
                    console.log(`tweet #${i + 1}, ${tweet.created_at}`);
                    console.log(tweet.text);
                    console.log();
                }
            }
        });
    } else if (argv[2] === 'spotify-this-song') {
        let query;
        if (argv.length != 4) {
            query = 'The Sign Ace of Base';
        } else {
            query = argv[3];
        }
        console.log(`looking up ${query}`);

        spotify.search({ type: 'track', query: query, limit: 1 }, function (err, data) {
            if (err) {
                return console.log('Error occurred: ' + err);
            }
            if (data.tracks.items.length === 0) {
                console.log("No result about this song.");
                return;
            }
            const result = data.tracks.items[0];
            console.log("Artist(s):", ...result.artists.map((artist) => artist.name));
            console.log("The song's name:", result.name);
            console.log("A preview link of the song from Spotify: ", result.external_urls.spotify);
            console.log("The album that the song is from:", result.album.name);
            // console.log(data.tracks.items[0]);
        });
    } else if (argv[2] === 'movie-this') {
        let query;
        if (argv.length != 4) {
            query = 'Mr. Nobody';
        } else {
            query = argv[3];
        }
        console.log(`looking up ${query}`);
        request(`https://www.omdbapi.com/?t=${query}&y=&plot=short&apikey=trilogy`, function (error, response, body) {
            if (error) {
                console.log('error:', error); // Print the error if one occurred
                return;
            }
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            const json = JSON.parse(body);
            if (json.Error) {
                console.log(json.Error);
                return;
            }
            //  console.log(json); // Print the HTML for the Google homepage.
            console.log("Title of the movie:", json.Title);
            console.log("Year the movie came out:", json.Year);
            console.log("IMDB Rating of the movie:", json.imdbRating);
            rottenTomatoesRating = json.Ratings.find((rating) => rating.Source === "Rotten Tomatoes");
            if (rottenTomatoesRating) {
                console.log("Rotten Tomatoes Rating of the movie:", rottenTomatoesRating.Value);
            }
            console.log("Country where the movie was produced;", json.Country);
            console.log("Language of the movie;", json.Language);
            console.log("Plot of the movie:", json.Plot);
            console.log("Actors in the movie:", json.Actors);
        });
    } else if (argv[2] === 'do-what-it-says') {
        fs.readFile('random.txt', 'utf8', (err, data) => {
            if (err) throw err;
            console.log(data);
            liri(['node', 'liri.js', ...data.split(',')]);
        });
    }
}

liri(process.argv);