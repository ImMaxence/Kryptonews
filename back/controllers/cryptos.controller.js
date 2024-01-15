const axios = require('axios');
const db = require("../models");
const Cryptos = db.cryptos;
const History = db.history;

exports.all = (req, res) => {
    Cryptos.findAll().then(dataCrypto => {
        History.findAll().then(dataHistory => {
            // console.log(dataHistory)
            dataCrypto.forEach(objet => {

                const entryTrouvee = dataHistory.find(entry => entry.id_name_crypto === objet.id_name_crypto);
                try {
                    console.log("TEST ", entryTrouvee.history_7jours)
                    objet.dataValues.d7 = entryTrouvee.history_7jours
                    objet.dataValues.h24 = entryTrouvee.history_24hrs
                    objet.dataValues.h1 = entryTrouvee.history_1hrs
                }
                catch {
                    objet.dataValues.d7 = "no data"
                    objet.dataValues.h24 = "no data"
                    objet.dataValues.h1 = "no data"
                    console.log("PPPPP")
                }





            });
            console.log(dataCrypto)
            // console.log("DDDDDDDKJDHKLHLIHKLDJKLDJDKLJEKLDB/N?EFBJK/BVHJKRB VK K/F HV RHK/BF EJKNBFJKLENFLKJENFKLENFLKNFKLENFKLEBFJLEBFJLEBFJLEFBKLEBFLKFHEHGKBF")
            res.json(dataCrypto)
        })
    })

};

exports.byId = (req, res) => {
    const id_req = req.params.id;
    Cryptos.findByPk(id_req).then(data => {
        res.status(200).send({
            id: data.id,
            id_name_crypto: data.id,
            rank_crypto: data.rank_crypto,
            symbol_crypto: data.symbol_crypto,
            name_crypto: data.name_crypto,
            url_img_crypto: data.url_img_crypto,
            priceUsd_crypto: data.priceUsd_crypto,
            volumeUsd24Hr_crypto: data.volumeUsd24Hr,

        });
    }).catch(err => {
        res.status(500).send({
            message: "An error occurred while retrieving the cryptos"
        });
    });
};


exports.create = (req, res) => {
    const { name_crypto, url_img_crypto } = req.body;
    Cryptos.findOne({
        where: {
            name_crypto: name_crypto
        }
    })
        .then(existingCrypto => {
            if (existingCrypto) {
                res.status(409).json({ error: 'Crypto with the same name already exists' });
            }
            else {
                return Cryptos.create({
                    name_crypto: name_crypto,
                    url_img_crypto: url_img_crypto,
                });
            }
        }).then(newCrypto => {
            res.status(201).json(newCrypto);
        }).catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
};


exports.delete = (req, res) => {
    const cryptoId = req.params.id;
    Cryptos.destroy({
        where: { id: cryptoId }
    }).then(affectedRows => {
        if (affectedRows > 0) {
            res.status(200).send({
                message: "Crypto deleted successfully"
            });
        } else {
            res.status(404).send({
                message: "Crypto not found"
            });
        }
    }).catch(err => {
        console.error("Error deleting crypto:", err);
        res.status(500).send({
            message: "An error occurred while deleting the crypto"
        });
    });
};


exports.byIdsList = (req, res) => {
    const idList = req.params.idList;

    Cryptos.findAll({
        where: {
            id: idList.split(',').map(id => parseInt(id, 10))
        }
    })
        .then(cryptos => {
            res.status(200).json(cryptos);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
};

exports.byIdHistoryPeriod = (req, res) => {
    //  cmid = id_name_crypto dans notre base de donnes
    const { cmid, period } = req.params;
    console.log('Received request body:', req.params);
    const apiURL = `https://api.coincap.io/v2/assets/${cmid}/history?interval=${period}`;
    fetchApiData(apiURL, res);
};

const fetchApiData = async (apiURL, res) => {
    try {
        const apiResponse = await axios.get(apiURL);
        const data = apiResponse.data;
        console.log('New Crypto Data fetched:', data);
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).json({ error: 'Internal Server Error --->>', message: `current url=${apiURL} \n valid period: m1, m5, m15, m30, h1, h2, h6, h12, d1` });
    }
};


exports.update = (req, res) => {
    console.log("/update");
};
