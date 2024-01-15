// router.post("/register", user.register);
// router.post("/login", user.login);
// router.get("/auth/:provider", user.oauth);
// router.post("/logout", user.logout);
// router.get("/profile", user.profileGet);
// router.put("/profile", user.profilePut);


const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.register = (req, res) => {
    // Save User to Database
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password),
        profilePicture: Math.floor(Math.random() * 6) + 1,
        oauth: null
    })

        .then(user => {
            const token = jwt.sign({ id: user.id },
                config.secret,
                {
                    algorithm: 'HS256',
                    allowInsecureKeySizes: true,
                    expiresIn: 86400, // 24 hours
                });
            res.status(200).send({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                accessToken: token

            });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "An error occurred while creating the user, maybe nickname or email is already in use"
            });
        });
};

exports.login = (req, res) => {
    User.findOne({
        where: {
            username: req.body.username
        }
    })
        .then(user => {
            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }

            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }

            const token = jwt.sign({ id: user.id },
                config.secret,
                {
                    algorithm: 'HS256',
                    allowInsecureKeySizes: true,
                    expiresIn: 86400, // 24 hours
                });

            res.status(200).send({
                id: user.id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                role: user.role,
                accessToken: token
            });
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};

exports.oneUser = (req, res) => {
    const { id } = req.params;
    User.findOne({
        where: {
            id: id
        }
    })
        .then(user => {
            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }

            res.status(200).send({
                id: user.id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                role: user.role,
                oauth: user.oauth,
                connect: user.connect
            });
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
}



exports.delete = (req, res) => {
    const { id } = req.params;
    User.findOne({
        where: {
            id: id
        }
    })
        .then(user => {
            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }
            user.destroy({
                where: { id: id }
            })
                .then(data => {
                    res.status(200).send({
                        message: "Successfully deleted user !"
                    });
                })
                .catch(err => {
                    res.status(500).send({ message: err.message });
                })
        })
}


exports.oauth = (req, res) => {
    console.log("oauth")
};

exports.logout = (req, res) => {
    User.update({ connect: 0 }, { where: { id: req.body.id } })
        .then(() => {
            console.log('Deconnexion');
            res.redirect(`http://localhost:80/`);
        })
        .catch((error) => {
            console.error('Erreur lors de la mise à jour de la colonne Connect :', error);
            res.status(500).send('Erreur lors de la mise à jour de la colonne Connect');
        })
};

exports.profileGet = (req, res) => {
    console.log("profileGet")
};

exports.profilePut = (req, res) => {
    console.log("profilePut")
    const idUser = req.params.id;
    User.findOne({
        where: {
            id: idUser
        }
    })
};

exports.update = (req, res) => {
    const id = req.params.id;
    const { username, email, password, profilePicture } = req.body;

    User.update(
        {
            username: username,
            email: email,
            password: bcrypt.hashSync(password),
            profilePicture: profilePicture,
        },
        {
            where: {
                id: id,
            }
        }
    )
        .then(([rowsUpdated]) => {
            if (rowsUpdated === 0) {
                res.status(404).json({ error: 'User not found' });
            } else {
                res.status(201).json({ success: true });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.message || 'Internal Server Error' });
        });
};