const apiURL = 'https://api.coincap.io/v2/assets/';
const axios = require('axios');
const cron = require('node-cron');

const db = require("../models");
const Cryptos = db.cryptos;

const fetchApiData = async () => {
    try {
        const apiResponse = await axios.get(apiURL);
        const data = apiResponse.data;
        console.log('New Crypto Data fetched:');
        return data; 
    } catch (error) {
        console.error('Error fetching data:', error.message);
        throw error; 
    }
};

const fillCryptoData = async () => {
    try {
        const cryptoData = await fetchApiData();

        for (const crypto of cryptoData.data) {
            const existingCrypto = await Cryptos.findOne({
                where: {
                    name_crypto: crypto.name,
                },
            });
            if (!existingCrypto) {
                const symbol = crypto.symbol.toLowerCase();
                await Cryptos.create({
                    id_name_crypto: crypto.id,
                    name_crypto: crypto.name,
                    symbol_crypto : crypto.symbol,
                    url_img_crypto: `https://assets.coincap.io/assets/icons/${symbol}@2x.png`,
                    rank_crypto: crypto.rank,
                    priceUsd_crypto : crypto.priceUsd,
                    volumeUsd24Hr_crypto : crypto.volumeUsd24Hr,
                });
            }
            else {
                await Cryptos.update(
                    {
                        rank_crypto: crypto.rank,
                        priceUsd_crypto: crypto.priceUsd,
                        volumeUsd24Hr_crypto: crypto.volumeUsd24Hr,
                    },
                    {
                        where: {
                            name_crypto: crypto.name,
                        },
                    }
                );
            }
        }

        return Cryptos;
    } catch (error) {
        console.error('Error filling crypto data:', error.message);
        throw error;
    }
};

module.exports = fillCryptoData;
