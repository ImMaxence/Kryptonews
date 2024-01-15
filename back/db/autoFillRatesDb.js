const apiURL = 'https://api.coincap.io/v2/rates/';
const axios = require('axios');
const cron = require('node-cron');

const db = require("../models");
const Rates = db.rates;

const fetchApiData = async () => {
    try {
        const apiResponse = await axios.get(apiURL);
        const data = apiResponse.data;
        console.log('New Rates Data fetched:');
        return data; 
    } catch (error) {
        console.error('Error fetching data:', error.message);
        throw error; 
    }
};

const fillRateData = async () => {
    try {
        const rateData = await fetchApiData();

        for (const rate of rateData.data) {
            const existingRate = await Rates.findOne({
                where: {
                    name_rate: rate.id,
                },
            });
            if (!existingRate) {
                await Rates.create({
                    name_rate: rate.id,
                    symbol_rate: rate.symbol,
                    currencySymbol_rate: rate.currencySymbol,
                    rateUsd_rate: rate.rateUsd
                });
            }else {
                await Rates.update(
                    {
                        rateUsd_rate: rate.rateUsd,
                    },
                    {
                        where: {
                            name_rate: rate.id,
                        },
                    }
                );
            }
        }

        return Rates;
    } catch (error) {
        console.error('Error filling rates data:', error.message);
        throw error;
    }
};

module.exports = fillRateData;
