const googleMapsClient = require('@google/maps').createClient({
	key: 'AIzaSyBMJi-iBGMoLBGQvoA6Vb6jMcnoZ8DeLGM',
	Promise: Promise
});

exports.processAddress = function(address_name){
	return googleMapsClient.geocode({ address: address_name})
	.asPromise()
	.then((response) => {
		const result = response.json.results[0];
		if (!result){
			throw "La dirección ingresada es inválida.";
		}

		if (result.address_components[4].short_name !== "CABA"){
			//por el momento solo se soportan direcciones en CABA
            throw "Por el momento sólo se aceptan direcciones dentro de CABA.";
		}

		const address = {
			name : result.formatted_address,
			lat : result.geometry.location.lat,
			lon : result.geometry.location.lng
		};
		return address;
	})
};