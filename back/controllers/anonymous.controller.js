// router.get("/profile", user.profileGet);
// router.put("/profile", user.profilePut);

const db = require("../models");
const anonymous = db.anonymous;

exports.profileGet = (req, res) => {
    anonymous.findOne().then(data => {
        res.status(200).send({
            id: data.id,
            nb_crypto: data.nb_crypto,
            nb_feed: data.nb_feed
        });
    }).catch(err => {
        res.status(500).send({
            message: "An error occurred while retrieving the anonymous user configuration"
        });
    });
};

exports.profilePut = (req, res) => {
    anonymous.update(req.body, {
        where: { id: req.body.id }
    }).then(data => {
        res.status(200).send({
            nb_crypto: req.body.nb_crypto,
            nb_feed: req.body.nb_feed
        });
    }).catch(err => {
        res.status(500).send({
            message: "An error occurred while updating the anonymous user configuration"
        });
    });
};