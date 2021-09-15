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
        usersLiked : [],
        usersDisliked : [],
    });

    sauce.save().then(() => {res.status(201).json({message: 'Post saved successfully!'});
        })
        .catch((error) => {res.status(400).json({error: error});
        }
    );
};

exports.getOneSauce = (req, res, next) => {
    Sauces.findOne({
        _id: req.params.id
    })
        .then((sauces) => {res.status(200).json(sauces);})
        .catch((error) => {res.status(404).json({error: error});})
}

exports.modifySauce = (req, res, next) => {
    const saucesObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    Sauces.updateOne({ _id: req.params.id }, { ...saucesObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !'}))
        .catch(error => res.status(400).json({ error }));
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