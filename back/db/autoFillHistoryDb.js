const axios = require('axios');
const cron = require('node-cron');

const db = require("../models");
const Cryptos = db.cryptos;
const History = db.history;

let liste_liste_index = 1
let liste_liste_valeur = []

function trouverObjetLePlusProche(data, timestampRecherche) {
    let objetPlusProche = null;
    let differenceMinimale = Infinity;

    for (let i = 0; i < data.length; i++) {
        const timestampActuel = data[i].time;
        const difference = Math.abs(timestampRecherche - timestampActuel);

        if (difference < differenceMinimale) {
            differenceMinimale = difference;
            objetPlusProche = data[i].priceUsd;
        }
    }
    //console.log(objetPlusProche)
    return objetPlusProche;
}

const gethistory = async () => {
    try {
        const data = await Cryptos.findAll();

        let liste_history = [];
        let listesDivisees = [];
        // console.log("@@@@@@@@@@@@@ ", data)
        for (let i = 0; i < data.length; i++) {
            //console.log("ID NAME CRYPTO => ", data.map(element => element.id_name_crypto)) //.cryptos.data.id_name_crypto
            data.map(element => element.id_name_crypto).forEach(element => {
                //console.log("CRYPTO => ", element)
                liste_history.push(element)
            });
            // data.map(element => element.id_name_crypto));
        }
        //console.log("LISTE GRANDE DE TOUS : ", liste_history)

        for (let i = 0; i < liste_history.length; i += 20) {
            listesDivisees.push(liste_history.slice(i, i + 20));
        }
        //console.log("LISTE DIVISE DE TOUS : ", listesDivisees)
        return listesDivisees;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};

const fetchApiData = async (valeur) => {
    try {
        let d7 = 0;
        let h24 = 0;
        let h1 = 0;
        let now = 0;
        let timestampActuel = 0;
        let timestampH1 = 0;
        let timestampH24 = 0;
        let timestampD7 = 0;

        const dayApiResponse = await axios.get(`https://api.coincap.io/v2/assets/${valeur}/history?interval=d1`);
        const HourApiResponse = await axios.get(`https://api.coincap.io/v2/assets/${valeur}/history?interval=m1`);
        // console.log(dayApiResponse)
        // console.log(HourApiResponse)
        timestampActuel = HourApiResponse.data.timestamp;
        timestampH1 = timestampActuel - (3600 * 1000)
        timestampH24 = timestampActuel - (3600 * 24 * 1000)
        timestampD7 = timestampActuel - (3600 * 24 * 7 * 1000)

        now = trouverObjetLePlusProche(HourApiResponse.data.data, timestampActuel);
        h1 = trouverObjetLePlusProche(HourApiResponse.data.data, timestampH1);
        h24 = trouverObjetLePlusProche(HourApiResponse.data.data, timestampH24);
        d7 = trouverObjetLePlusProche(dayApiResponse.data.data, timestampD7);

        let pourcentage_d7 = parseFloat((now / d7) * 100 - 100).toFixed(2);
        let pourcentage_h24 = parseFloat((now / h24) * 100 - 100).toFixed(2);
        let pourcentage_h1 = parseFloat((now / h1) * 100 - 100).toFixed(2);
        // console.log("D7 :", pourcentage_d7)
        // console.log("H24 :", pourcentage_h24)
        // console.log("H1 :", pourcentage_h1)
        // console.log('New history Data fetched:');
        return [pourcentage_d7, pourcentage_h24, pourcentage_h1];

    } catch (error) {
        console.error('Error fetching data:', error.message);
        throw error;
    }
};

const fillHistoryData = async () => {
    try {
        if (liste_liste_index === 6) {
            liste_liste_index = 1;
        }
        if (liste_liste_index === 1) {
            liste_liste_valeur = await gethistory();
        }

        for (let i = 0; i < 19; i++) {
            const valeur = liste_liste_valeur[liste_liste_index][i];
            //console.log(`liste_liste_valeur ----------------------------------> ${liste_liste_valeur}`);

            //console.log(`valeur -----------------------------------------------------------------------------------> ${valeur}`)
            const historyData = await fetchApiData(valeur); // [D7, H24, H1]
            const existingHistory = await History.findOne({
                where: {
                    id_name_crypto: valeur,
                },
            });
            if (!existingHistory) {
                await History.create({
                    id_name_crypto: valeur,
                    history_7jours: historyData[0],
                    history_24hrs: historyData[1],
                    history_1hrs: historyData[2],
                });
            } else {
                await existingHistory.update({
                    history_7jours: historyData[0],
                    history_24hrs: historyData[1],
                    history_1hrs: historyData[2],
                });
            }
        }

        liste_liste_index++;
        return History;
    } catch (error) {
        console.error('Error filling history data:', error.message);
        throw error;
    }
};



module.exports = fillHistoryData;
