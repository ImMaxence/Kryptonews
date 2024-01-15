const db = require("../models");
const Rates = db.rates;

exports.all = (req, res) => {
    Rates.findAll().then(data =>{
        res.json(data);
    })
};

exports.rateBysymbol = (req, res) => {
    const symboleRate = req.params.symbol
    
    Rates.findOne({
        where: {
            symbol_rate: symboleRate
        }
    })
    .then(rates => {
        res.status(200).json(rates);
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    });
};
