// router.post("/discord", oauth.discord);
// router.get("/discord/callback", oauth.discordCallback);
const Express = require('express');
const { URLSearchParams } = require('url');
const axios = require('axios');
require('dotenv').config();
const querystring = require('querystring');
const util = require('util');
const db = require("../models");
const User = db.user;
var bcrypt = require("bcryptjs");



const client_id = process.env.DISCORD_CLIENT_ID;
const client_secret = process.env.DISCORD_SECRET;
const redirect_uri = process.env.DISCORD_REDIRECT_URI;

exports.discord = (req, res) => {
    // const data = new URLSearchParams();
    // data.append('client_id', client_id);
    // data.append('client_secret', client_secret);
    // data.append('grant_type', 'authorization_code');
    // data.append('redirect_uri', redirect_uri);
    // data.append('scope', 'identify');
    // data.append('code', req.body.code)

    var data = {
        'client_id': client_id,
        'client_secret': client_secret,
        'grant_type': 'authorization_code',
        'redirect_uri': redirect_uri,
        'scope': 'identify email',
        'code': req.body.code
    }
    const requestData = querystring.stringify(data);

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    console.log(`CODE POUR BODY : ${JSON.stringify(req.body.code)}`)
    console.log(`BODY DISCORD : ${JSON.stringify(data)}`)
    axios.post('https://discord.com/api/oauth2/token', requestData, { headers }).then(data => {
        console.log(`TOKEN : ${data.data.access_token}`)
        axios.get("https://discord.com/api/users/@me", { headers: { "authorization": `Bearer ${data.data.access_token}` } }).then(response => {
            res.status(200).send(response.data);
        }).catch(err => {
            res.sendStatus(500).send(err);
        });
    }).catch(error => {
        console.error(`Erreur Axios : ${error}`);
        // Gérer l'erreur ici
        res.sendStatus(500); // Envoyer une réponse d'erreur au client
    });
};

exports.discordCallback = (req, res) => {
    console.log(`CODE : ${req.query.code}`);

    axios.post('https://kryptonews.fun/back/api/auth/discord', { code: req.query.code })
        .then(data => {
            console.log(`USERNAME : ${data.data.username}`);
            console.log(`EMAIL : ${data.data.email}`);
            User.findOne({
                where: {
                    email: data.data.email
                }
            })
                .then(user => {
                    if (!user) {
                        // Créer l'utilisateur en utilisant les informations de Discord
                        User.create({
                            username: data.data.username,
                            email: data.data.email,
                            password: bcrypt.hashSync(data.data.id),
                            profilePicture: Math.floor(Math.random() * 6) + 1,
                            oauth: data.data.id
                        })
                            .then((user) => {
                                User.update({ connect: 1 }, { where: { id: user.id } })
                                    .then(() => {
                                        console.log('Colonne Connect mise à jour avec succès');
                                        res.redirect(`https://kryptonews.fun/?z=${user.id}`);
                                    })
                                    .catch((error) => {
                                        console.error('Erreur lors de la mise à jour de la colonne Connect :', error);
                                        res.status(500).send('Erreur lors de la mise à jour de la colonne Connect');
                                    })
                            })
                            .catch(error => {
                                console.error('Erreur lors de la création de l\'utilisateur :', error);
                            });
                    } else {
                        if (user.oauth !== null) {
                            // Il c'est deja connecté avec l'oauth
                            const updatedUser = User.update({ connect: 1 }, { where: { id: user.id } })
                                .then(() => {
                                    console.log('Colonne Connect mise à jour avec succès');
                                    res.redirect(`https://kryptonews.fun/?z=${user.id}`);
                                })
                                .catch((error) => {
                                    console.error('Erreur lors de la mise à jour de la colonne Connect :', error);
                                    res.status(500).send('Erreur lors de la mise à jour de la colonne Connect');
                                })
                        } else {
                            // Il c'est deja co sur le site directement
                            console.log("le mail existe déjà")
                            res.status(500).send({ message: "vous inscrit sans oauth" });
                        }
                    }

                })
                .catch(err => {
                    res.status(500).send({ message: err.message });
                });

        })
        .catch(error => {
            console.error('Erreur lors de la requête Discord :', error);
        });
};