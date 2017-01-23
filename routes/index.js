var express = require('express');
var router = express.Router();
var unirest = require('unirest');
var wtf_wikipedia = require("wtf_wikipedia");


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/list', function(req, res) {
    var db = req.db;
    var collection = db.collection('usercollection');
    collection.find().toArray(function(err, results) {
        console.dir(results);
        res.send(results);
        // Let's close the db
        db.close();
    });
});

router.get('/getData/:place',function(req, res) {
	getPlaceID(req.params.place, function(err, response) {
		var placeid = response.body.results[0].place_id;
		getPlaceDetails(placeid, function(err, GoogleResponse){
			console.log(GoogleResponse.body.result.formatted_address);
			wtf_wikipedia.from_api(req.params.place, "en", function(markup){
			  var text = wtf_wikipedia.plaintext(markup);
			  //Toronto ist mit 2,6 Millionen Einwohnern.. 
			  //res.status(200).send(text);
			  res.header("Content-Type", "application/json"); 
	          var data = {
	          	name: GoogleResponse.body.result.name,
	          	address: GoogleResponse.body.result.formatted_address,
	          	phone: GoogleResponse.body.result.international_phone_number,
	          	place_id: GoogleResponse.body.result.place_id,
	          	website: GoogleResponse.body.result.website,
	          	opening_hrs: GoogleResponse.body.result.opening_hours.weekday_text,
	          	latitude: GoogleResponse.body.result.geometry.location.lat,
	          	longitude: GoogleResponse.body.result.geometry.location.lng,
	          	rating: GoogleResponse.body.result.rating,
	          	description: wtf_wikipedia.plaintext(markup)
	          }
			  var serverResponse = {
			  	status:"Ok",
			  	code:200,
			  	data: data
			  };
			  res.status(200).send(JSON.stringify(serverResponse));
			});
		});
	});
});

function getPlaceID(placestr, callback){
	unirest.get('https://maps.googleapis.com/maps/api/place/textsearch/json?query='+placestr+'&key=AIzaSyD_oVMb3OY2R15XXNqx4NJOX67blAztMP0')
	.end(function (response) {
		console.log(response);
		callback(null, response);
	});
}
function getPlaceDetails(placeid, callback){
	unirest.get('https://maps.googleapis.com/maps/api/place/details/json?placeid='+placeid+'&key=AIzaSyD_oVMb3OY2R15XXNqx4NJOX67blAztMP0')
	.end(function (response) {
		console.log(response);
		callback(null, response);
	});
}

//https://maps.googleapis.com/maps/api/place/details/json?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4&key=YOUR_API_KEY




module.exports = router;
