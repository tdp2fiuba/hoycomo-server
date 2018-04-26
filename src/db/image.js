const mongoose = require('mongoose'),
    Schema   = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const imageSchema = new Schema({
    data: { type: Buffer},
    contentType: { type: String }
});

imageSchema.plugin(AutoIncrement, {inc_field: 'image_id'});

const Image = mongoose.model('Image',imageSchema);

exports.Image = Image;

exports.saveImage = function(image) {
    //image = {data: base64, type: image extension}

    const matches = image.data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
        throw "Imagen inválida";
    }


    const image_data = {};
    image_data.data = new Buffer(image.data.split(',')[1], 'base64');
    image_data.contentType = 'image/' + image.type.toLowerCase();

    const _image = new Image(image_data);
    return _image.save();
};

exports.saveImages = function(images) {
    //image = [{data: base64, type: image extension}, ...]

    if (typeof(images) === 'Array' && images.length > 0 ){
        return Promise.reject("Error en las imagenes, no es un array");
    }

    const images_data = [];
    images.forEach(function (image) {
        let matches = image.data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
            return Promise.reject("Imagen inválida");
        }

        images_data.push(new Image({
            data: new Buffer(image.data.split(',')[1], 'base64'),
            contentType: 'image/' + image.type.toLowerCase()
        }));
    });

    return Image.create(images_data);

};

exports.getImageById = function(image_id) {
    return new Promise(function(resolve, reject) {
        Image.findOne({image_id: image_id})
            .then(img => {
                resolve(img);
            })
            .catch(err => {
                reject(err);
            })
    })
};

exports.delete = function (image_id) {
    return Image.findOneAndRemove({ image_id: image_id});
};