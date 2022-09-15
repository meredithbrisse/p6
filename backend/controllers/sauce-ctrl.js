const Sauce = require('../models/Sauce');
const fs = require('fs');
const jwt = require('jsonwebtoken');

//Récupération d'une sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => {
            console.log(error);
            res.status(404).json({ message: error.message });
        });
};

//Récupération des sauces
exports.getAllSauce = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => {
            console.log(error);
            res.status(404).json({ message: error.message });
        });
};
//Création d'une sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId;

    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        userId: userId
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
        .catch(error => res.status(400).json({ message: error.message }));

};


//Suppression sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (!sauce) {
                res.status(404).json({
                    message: 'Sauce non trouvée !'
                });
            }
            else {
                // sauce dispo 
                const token = req.headers.authorization.split(' ')[1];
                const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
                const userId = decodedToken.userId;

                if (sauce.userId !== userId) {
                    res.status(401).json({
                        message: 'Requête non autorisée!'
                    });
                }
                else {
                    // utilisateur a le droit de supprimer 
                    const filename = sauce.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, () => {
                        Sauce.deleteOne({ _id: req.params.id })
                            .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
                            .catch(error => res.status(400).json({ message: error.message }));
                    });
                }
            }

        })
        .catch(error => res.status(500).json({ message: error.message }));
};


exports.modifySauce = (req, res, next) => {
    if (req.file) {
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                const filename = sauce.imageUrl.split("/images/")[1];
                fs.unlink(`images/${filename}`, (err) => {
                    if (err) console.log(err);
                });
            })
            .catch((error) => console.log(error));
    }

    const sauceObject = req.file
        ? {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename
                }`,
        }
        : { ...req.body };
    Sauce.updateOne(
        { _id: req.params.id },
        { ...sauceObject, _id: req.params.id }
    )
        .then(() => res.status(200).json({ message: "Objet modifié !" }))
        .catch((error) => res.status(400).json({ error }));
};

//Like/dislike sauce
exports.likeOrDislike = (req, res) => {
    like = req.body.like;
    id_sauce = req.params.id;
    id_user = req.body.userId;
    switch (like) {
        case -1:
            // traitement
            // mettre à jour le nombre de dislike de sauce  +1
            // ajouter le user ID dans la liste des userDislike
            Sauce.updateOne({ _id: id_sauce }, {
                $push: { usersDisliked: id_user }, $inc: { dislikes: +1 }
            }).then(() =>
                res.status(200).json({ message: "Je n'aime pas!" }))
                .catch((error) => res.status(400).json({ message: error.message }));
            break;

        case 0:
            //chercher la sauce
            Sauce.findOne({ _id: id_sauce }).then((sauce) => {
                // verifier si l'utilisateur like 
                // => eliminer le like
                if (sauce.usersLiked.includes(id_user)) {
                    Sauce.updateOne({ _id: id_sauce }, {
                        $pull: { usersLiked: id_user }, $inc: { likes: -1 }
                    }).then(() =>
                        res.status(200).json({ message: "Neutre !" }))
                        .catch((error) => res.status(400).json({ message: error.message }));

                }
                // S'il dislike pas 
                // => j'elimine le dislike
                if (sauce.usersDisliked.includes(id_user)) {
                    Sauce.updateOne({ _id: id_sauce }, {
                        $pull: { usersDisliked: id_user }, $inc: { dislikes: -1 }
                    }).then(() =>
                        res.status(200).json({ message: "Neutre !" }))
                        .catch((error) => res.status(400).json({ message: error.message }));

                }
            })
                .catch((error) => res.status(400).json({ message: error.message }));

            break;

        case 1:
            // traitement
            // mettre à jour le nombre de like de sauce  +1
            // ajouter le user ID dans la liste des userlike
            Sauce.updateOne({ _id: id_sauce }, {
                $push: { usersLiked: id_user }, $inc: { likes: +1 }
            }).then(() =>
                res.status(200).json({ message: "J'aime !" }))
                .catch((error) => res.status(400).json({ message: error.message }));

            break;
    }

}


