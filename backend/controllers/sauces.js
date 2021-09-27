const Sauces = require('../models/Sauces');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete req.body._id;
    const sauce = new Sauces({
        ...sauceObject,
        imageUrl : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes : 0,
        dislikes : 0,
        usersLiked : [''],
        usersDisliked : [''],
    });

    sauce.save().then(() => {res.status(201).json({message: 'Post saved successfully!'});
        })
        .catch((error) => {res.status(400).json({error: error});
        }
    );
};

exports.getOneSauce = (req, res, next) => {
    Sauces.findOne({_id: req.params.id})
        .then((sauces) => {res.status(200).json(sauces);})
        .catch((error) => {res.status(404).json({error: error});})
}

exports.modifySauce = (req, res, next) => {
    let sauceObject;
    if (req.file) {
        sauceObject =  {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        };
        Sauces.findOne({ _id: req.params.id })
            .then(sauces => {
                const filename = sauces.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}` , () => {
                    Sauces.updateOne({_id: req.params.id }, { ...sauceObject, _id: req.params.id})
                        .then(() => res.status(200).json({message : "Sauce modifiée"}))
                        .catch(error => res.status(500).json({error}));
                });

            })
            .catch(error => res.status(400).json({ error }));
    } else {
        sauceObject = { ...req.body };
        Sauces.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce modifiée' }))
            .catch(error => res.status(500).json({ error }));
    }
};

exports.deleteSauce = (req, res, next) => {
    Sauces.findOne({ _id: req.params.id })
        .then(sauces => {
            const filename = sauces.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}` , () => {
                Sauces.deleteOne({_id: req.params.id })
                    .then(() => res.status(200).json({message : "Objet supprimé"}))
                    .catch(error => res.status(500).json({error}));
            });

        })
        .catch(error => res.status(400).json({ error }));
}

exports.getAllSauces = (req, res, next) => {
    Sauces.find()
        .then((sauces) => {
            res.status(200).json(sauces);
        })
        .catch((error) => {
            res.status(400).json({error : error});
        })
}

//logique métier likes et dislikes :
// tableau user Liked et dislikes pour mettre tableau avec user id dedans
// cas 1 : on ajoute l'user ID au tableau usersSomething, like ++
// cas -1: on ajoute l'user ID au tableau, dislike ++
//cas 0: on retire l'user ID du tableau dans lequel il était avec splice,
// A la fin, on met en chaine de caractère avec join

exports.userLike = (req, res, next) => {

let like = req.body.like;
let userId = req.body.userId;
let sauceId = req.params.id;

switch (like) {
    case 1:
        Sauces.updateOne(
            { _id: sauceId },
            { $push: { usersLiked: userId }, $inc: { likes: +1 } }
        )
            .then(() => res.status(200).json({ message: "like" }))
            .catch((error) => res.status(400).json({ error }));

        break;

    case 0:
        Sauces.findOne({ _id: sauceId })
            .then((sauce) => {
                if (sauce.usersLiked.includes(userId)) {
                    Sauces.updateOne(
                        { _id: sauceId },
                        { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
                    )
                        .then(() => res.status(200).json({ message: "neutre" }))
                        .catch((error) => res.status(400).json({ error }));
                }
                if (sauce.usersDisliked.includes(userId)) {
                    Sauces.updateOne(
                        { _id: sauceId },
                        { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } }
                    )
                        .then(() => res.status(200).json({ message: "neutre" }))
                        .catch((error) => res.status(400).json({ error }));
                }
            })
            .catch((error) => res.status(404).json({ error }));
        break;

    case -1:
        Sauces.updateOne(
            { _id: sauceId },
            { $push: { usersDisliked: userId }, $inc: { dislikes: +1 } }
        )
            .then(() => {
                res.status(200).json({ message: "dislike" });
            })
            .catch((error) => res.status(400).json({ error }));
        break;

    default:
        console.log(error);
}
}