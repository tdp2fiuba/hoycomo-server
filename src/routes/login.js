var HttpStatus = require('http-status-codes');
var loginCtrl = require('../api/login');

exports.login = function(req, res) {
    var credentials = {
        user: req.body.user,
        password: req.body.password
    };

    loginCtrl.login(credentials).then(function (store) {
        if (store) {
            res.send(store);
        } else {
            res.status(400).send({ message: "Usuario o contraseña no encontrados" })
        }
    })
    .catch(function (err) {
        res.status(400).send(err);
    })
}