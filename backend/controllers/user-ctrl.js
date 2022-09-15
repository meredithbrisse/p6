const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

//enregistrement new user
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ message: error.message }));
        })
        .catch(error => res.status(500).json({ message: error.message }));
};

//connexion user exist
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            //Vérification user email 
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur introuvable !' });
            } else {
                //Vérification mot de passe
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            return res.status(401).json({ error: 'Mot de passe incorrect !' });
                        } else {
                            //Si ok connexion et envoie du token 
                            let token = jwt.sign(
                                { userId: user._id },
                                process.env.TOKEN_SECRET,
                                { expiresIn: '24h' }
                            );
                            res.status(200).json({
                                userId: user._id,
                                token: token
                            });
                        }
                    })
                    .catch(error => res.status(500).json({ message: error.message }));
            };
        })
        .catch(error => res.status(500).json({ message: error.message }));
};



