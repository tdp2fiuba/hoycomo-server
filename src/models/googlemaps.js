const googleMapsClient = require('@google/maps').createClient({
	key: 'AIzaSyBMJi-iBGMoLBGQvoA6Vb6jMcnoZ8DeLGM',
	Promise: Promise
});

exports.processAddress = function(address_name){
	return googleMapsClient.geocode({ address: address_name})
	.asPromise()
	.then((response) => {
		var result = response.json.results[0];
		address = {
			name : result.formatted_address,
			lat : result.geometry.location.lat,
			lon : result.geometry.location.lng
		}
		return address;
	})
	.catch((err) => {
		return err;
	});
}