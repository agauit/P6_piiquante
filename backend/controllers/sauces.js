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

// exports.userLike = (req, res, next) => {
//     const userId = req.body.userId;
//     const sauceId = req.params.id;

    //si l'utilisateur aime la sauce
//     if (req.body.likes === 1) {
//         Sauces.updateOne({_id: sauceId}, {$inc: {likes: req.body.likes++}, push: {usersLiked: userId}})
//             .then(
//                 () => res.status(200).json({message: 'Le client aime'}))
//             .catch(error => res.status(400).json({error}))
//
//         //si l'utilisateur n'aime pas la sauce
//     } else if (req.body.like === -1) {
//         Sauces.updateOne({_id: sauceId}, {$inc: {dislikes: (req.body.dislikes++)}, $push: {usersDisliked: userId}})
//             .then(
//                 () => res.status(200).json({message: 'Le client n aime pas'})
//             )
//             .catch(error => res.status(400).json({error}))
//     } else {
//         Sauces.findOne({_id: req.params.id}) .then(sauce => {
//             if (sauce.usersLiked.includes(req.body.userId)) {
//                 Sauces.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } })
//                     .then((sauce) => { res.status(200).json({ message: 'Like supprimé !' }) })
//                     .catch(error => res.status(400).json({ error }))
//             } else if (sauce.usersDisliked.includes(req.body.userId)) {
//                 Sauces.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 } })
//                     .then((sauce) => { res.status(200).json({ message: 'Dislike supprimé !' }) })
//                     .catch(error => res.status(400).json({ error }))
//             }
//         })
//             .catch(error => res.status(400).json({ error }))
//     }
// }


//logique métier likes et dislikes :
// tableau user Liked et dislikes pour mettre tableau avec user id dedans
// cas 1 : on ajoute l'user ID au tableau usersSomething, like ++
// cas -1: on ajoute l'user ID au tableau, dislike ++
//cas 0: on retire l'user ID du tableau dans lequel il était avec splice,
// A la fin, on met en chaine de caractère avec join

exports.userLike = (req, res, next) => {
    Sauces.findOne({ _id: req.params.id})
        .then(sauce => {
            let like = req.body.likes;
            let dislikes = req.body.dislikes;
            const sauceId = req.params.id;
            const userId = req.body.userId;

            switch (like) {
                case  req.body.likes === 1 :
                    Sauces.updateOne({
                        _id : sauceId }, {
                        $push : {usersLiked : userId},
                        $inc : {like : like++}
                        .then(() => res.status(200).json({
                            message: 'le client a aimé !'
                        }))
                            .catch((error) => res.status(400).json({
                                error
                            }))

            })
                    break;
                case req.body.likes === -1 :
                    Sauces.updateOne({
                        _id : sauceId,
                        $push : {usersDisliked : userId},
                        $inc : {dislikes :  dislikes++}
                            .then(() => res.status(200).json({
                                message: 'le client a pas aimé !'
                            }))
                            .catch((error) => res.status(400).json({
                                error
                            }))
                    })
                    break;

                case req.body.likes === 0 :
                    Sauces.findOne({ _id: req.params.id })
                    .then(sauce => {
                        if (sauce.usersLiked.includes(req.body.userId)) {

                            like--;
                        } else {

                            dislikes--;
                        }
                    })


            }
        })
        .catch(error => res.status(500).json({ error }))
}