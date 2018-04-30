const userDB = require('../db/user.js');
const User = userDB.User;
const Store = require('../models/store.js');
const config = require('../config/config');
const FacebookTokenStrategy = require('passport-facebook-token');
const LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    //Facebook
    passport.use(new FacebookTokenStrategy({
        clientID: config.facebook.id,
        clientSecret: config.facebook.secret,
        profileFields : ['id', 'emails', 'name', 'photos']
    }, function(accessToken, refreshToken, profile, done) {
        // Busca en la base de datos si el usuario ya se autenticó en otro
        // momento y ya está almacenado en ella
        User.findOne({facebook_id: profile.id}, function(err, user) {
            if(err) throw(err);
            if(!err && user!= null) return done(null, user);

            user = new User({
                facebook_id: profile.id,
                first_name: profile.name.givenName,
                last_name: profile.name.familyName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value
                //firebase_token:
            });
            user.save(function(err) {
                if(err) throw err;
                done(null, user);
            });
        })
        .catch( err => {
            console.log("Error al loguear o crear usuario de facebook: ", err);
            return done(err);
        })
    }));

    //Local
    passport.use(new LocalStrategy(
        {usernameField: 'user', passwordField: 'password'},
        function(login, password, done) {
            Store.findStoreByLogin(login)
            .then(store => {
                if (!store) {
                    return done(null, false, { message: 'Usuario incorrecto.' });
                }
                if (!store.validPassword(password)) {
                    return done(null, false, { message: 'Contraseña incorrecta.' });
                }
                return done(null, store);
            })
            .catch(err => {
                return done(err);
            });
        }
    ));
};

