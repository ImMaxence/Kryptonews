import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    RadialLinearScale,
} from 'chart.js';


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    RadialLinearScale,
);


const Cryptox = ({ id, rank, url, name, price, symbol, id_name, rate1h, rate24h, rate7d, volume }) => {

    const [isOpen, setIsOpen] = useState(false);
    const [nameEnter, setNameEnter] = useState("");
    const [textToDisplay, setTextToDisplay] = useState("Select an option");
    const [show, setShow] = useState(false);
    const [filter, setFilter] = useState();
    const [rate, setRate] = useState();
    const [selectedButton, setSelectedButton] = useState(null);
    const [isStarAnimated, setStarAnimated] = useState(false);

    const handleStarClick = () => {
        setStarAnimated(true);

        if (localStorage.getItem('id')) {
            axios.post(`${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/favorites/create/${localStorage.getItem('id')}`, { 'id_fav': 1, 'name_fav': name, 'url_img_fav': url, 'filtre_fav': 'cryptos', 'url_source_fav': null })
                .then((res) => {

                    setTimeout(() => {
                        setStarAnimated(false);
                    }, 1600);
                }).catch((err) => {
                    console.log(err)
                    setTimeout(() => {
                        setStarAnimated(false);
                    }, 1600);
                })
        }
        else {
            setStarAnimated(false);
        }


    }

    const [oneHour, setOneHour] = useState({
        data1: { Hours: "", value: 0 },
        data2: { Hours: "", value: 0 },
        data3: { Hours: "", value: 0 },
        data4: { Hours: "", value: 0 },
        data5: { Hours: "", value: 0 },
        data6: { Hours: "", value: 0 },
        data7: { Hours: "", value: 0 },
        data8: { Hours: "", value: 0 },
        data9: { Hours: "", value: 0 },
        data10: { Hours: "", value: 0 },
        data11: { Hours: "", value: 0 },
        data12: { Hours: "", value: 0 },
    });

    const [dayHour, setDayHour] = useState({
        data1: { Hours: "", value: 0 },
        data2: { Hours: "", value: 0 },
        data3: { Hours: "", value: 0 },
        data4: { Hours: "", value: 0 },
        data5: { Hours: "", value: 0 },
        data6: { Hours: "", value: 0 },
        data7: { Hours: "", value: 0 },
        data8: { Hours: "", value: 0 },
        data9: { Hours: "", value: 0 },
        data10: { Hours: "", value: 0 },
        data11: { Hours: "", value: 0 },
        data12: { Hours: "", value: 0 },
        data13: { Hours: "", value: 0 },
        data14: { Hours: "", value: 0 },
        data15: { Hours: "", value: 0 },
        data16: { Hours: "", value: 0 },
        data17: { Hours: "", value: 0 },
        data18: { Hours: "", value: 0 },
        data19: { Hours: "", value: 0 },
        data20: { Hours: "", value: 0 },
        data21: { Hours: "", value: 0 },
        data22: { Hours: "", value: 0 },
        data23: { Hours: "", value: 0 },
        data24: { Hours: "", value: 0 }
    });

    const [weekHour, setWeekHour] = useState({
        data1: { Day: "", value: 0 },
        data2: { Day: "", value: 0 },
        data3: { Day: "", value: 0 },
        data4: { Day: "", value: 0 },
        data5: { Day: "", value: 0 },
        data6: { Day: "", value: 0 },
        data7: { Day: "", value: 0 }
    });

    const dataChart1 = {
        labels: [
            `${oneHour.data1.Hours}`,
            `${oneHour.data2.Hours}`,
            `${oneHour.data3.Hours}`,
            `${oneHour.data4.Hours}`,
            `${oneHour.data5.Hours}`,
            `${oneHour.data6.Hours}`,
            `${oneHour.data7.Hours}`,
            `${oneHour.data8.Hours}`,
            `${oneHour.data9.Hours}`,
            `${oneHour.data10.Hours}`,
            `${oneHour.data11.Hours}`,
            `${oneHour.data12.Hours}`
        ],
        datasets: [
            {
                label: '1 Hour Ago',
                data: [
                    `${oneHour.data1.value}`,
                    `${oneHour.data2.value}`,
                    `${oneHour.data3.value}`,
                    `${oneHour.data4.value}`,
                    `${oneHour.data5.value}`,
                    `${oneHour.data6.value}`,
                    `${oneHour.data7.value}`,
                    `${oneHour.data8.value}`,
                    `${oneHour.data9.value}`,
                    `${oneHour.data10.value}`,
                    `${oneHour.data11.value}`,
                    `${oneHour.data12.value}`,
                ],
                hoverBackgroundColor: 'rgba(75, 192, 192, 0.4)',
                borderWidth: 2,
                borderColor: 'rgba(20, 14, 53, 0.8)',
            },
        ],
    };

    const dataChart2 = {
        labels: [
            `${dayHour.data1.Hours}`,
            `${dayHour.data2.Hours}`,
            `${dayHour.data3.Hours}`,
            `${dayHour.data4.Hours}`,
            `${dayHour.data5.Hours}`,
            `${dayHour.data6.Hours}`,
            `${dayHour.data7.Hours}`,
            `${dayHour.data8.Hours}`,
            `${dayHour.data9.Hours}`,
            `${dayHour.data10.Hours}`,
            `${dayHour.data11.Hours}`,
            `${dayHour.data12.Hours}`,
            `${dayHour.data13.Hours}`,
            `${dayHour.data14.Hours}`,
            `${dayHour.data15.Hours}`,
            `${dayHour.data16.Hours}`,
            `${dayHour.data17.Hours}`,
            `${dayHour.data18.Hours}`,
            `${dayHour.data19.Hours}`,
            `${dayHour.data20.Hours}`,
            `${dayHour.data21.Hours}`,
            `${dayHour.data22.Hours}`,
            `${dayHour.data23.Hours}`,
            `${dayHour.data24.Hours}`
        ],
        datasets: [
            {
                label: '24 Hour Ago',
                data: [
                    `${dayHour.data1.value}`,
                    `${dayHour.data2.value}`,
                    `${dayHour.data3.value}`,
                    `${dayHour.data4.value}`,
                    `${dayHour.data5.value}`,
                    `${dayHour.data6.value}`,
                    `${dayHour.data7.value}`,
                    `${dayHour.data8.value}`,
                    `${dayHour.data9.value}`,
                    `${dayHour.data10.value}`,
                    `${dayHour.data11.value}`,
                    `${dayHour.data12.value}`,
                    `${dayHour.data13.value}`,
                    `${dayHour.data14.value}`,
                    `${dayHour.data15.value}`,
                    `${dayHour.data16.value}`,
                    `${dayHour.data17.value}`,
                    `${dayHour.data18.value}`,
                    `${dayHour.data19.value}`,
                    `${dayHour.data20.value}`,
                    `${dayHour.data21.value}`,
                    `${dayHour.data22.value}`,
                    `${dayHour.data23.value}`,
                    `${dayHour.data24.value}`
                ],
                hoverBackgroundColor: 'rgba(75, 192, 192, 0.4)',
                borderWidth: 2,
                borderColor: 'rgba(0, 158, 213, 0.8)',
            },
        ],
    };

    const dataChart3 = {
        labels: [
            `${weekHour.data1.Day}`,
            `${weekHour.data2.Day}`,
            `${weekHour.data3.Day}`,
            `${weekHour.data4.Day}`,
            `${weekHour.data5.Day}`,
            `${weekHour.data6.Day}`,
            `${weekHour.data7.Day}`
        ],
        datasets: [
            {
                label: '7 Day Ago',
                data: [
                    `${weekHour.data1.value}`,
                    `${weekHour.data2.value}`,
                    `${weekHour.data3.value}`,
                    `${weekHour.data4.value}`,
                    `${weekHour.data5.value}`,
                    `${weekHour.data6.value}`,
                    `${weekHour.data7.value}`
                ],
                hoverBackgroundColor: 'rgba(75, 192, 192, 0.4)',
                borderWidth: 2,
                borderColor: 'rgba(110, 15, 255, 0.8)',
            },
        ],
    };

    const handleButtonClick = (button) => {
        setSelectedButton(button);
        //console.log(button)

        if (button === "1h") {
            axios.get(`${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/cryptos/${id_name}/history/m5`).then((res) => {

                let array_resultat = []
                let array_date = [];
                let list = res.data.data
                let len_array_list = list.length

                for (let i = len_array_list - 12; i < len_array_list; i++) {
                    array_resultat.push(list[i])
                }

                for (let i = 0; i < array_resultat.length; i++) {
                    let fulldate = new Date(array_resultat[i].time)
                    let heure = (fulldate.getHours() < 10 ? '0' : '') + fulldate.getHours();
                    let minute = (fulldate.getMinutes() < 10 ? '0' : '') + fulldate.getMinutes();
                    let heure_minute = `${heure}:${minute}`

                    array_date.push(heure_minute)
                }

                setOneHour((prev) => {
                    let update = { ...prev };

                    update.data1.Hours = "";
                    update.data1.value = 0;

                    update.data2.Hours = "";
                    update.data2.value = 0;

                    update.data3.Hours = "";
                    update.data3.value = 0;

                    update.data4.Hours = "";
                    update.data4.value = 0;

                    update.data5.Hours = "";
                    update.data5.value = 0;

                    update.data6.Hours = "";
                    update.data6.value = 0;

                    update.data7.Hours = "";
                    update.data7.value = 0;

                    update.data8.Hours = "";
                    update.data8.value = 0;

                    update.data9.Hours = "";
                    update.data9.value = 0;

                    update.data10.Hours = "";
                    update.data10.value = 0;

                    update.data11.Hours = "";
                    update.data11.value = 0;

                    update.data12.Hours = "";
                    update.data12.value = 0;

                    update.data1.Hours = array_date[0];
                    update.data1.value = array_resultat[0].priceUsd;

                    update.data2.Hours = array_date[1];
                    update.data2.value = array_resultat[1].priceUsd;

                    update.data3.Hours = array_date[2];
                    update.data3.value = array_resultat[2].priceUsd;

                    update.data4.Hours = array_date[3];
                    update.data4.value = array_resultat[3].priceUsd;

                    update.data5.Hours = array_date[4];
                    update.data5.value = array_resultat[4].priceUsd;

                    update.data6.Hours = array_date[5];
                    update.data6.value = array_resultat[5].priceUsd;

                    update.data7.Hours = array_date[6];
                    update.data7.value = array_resultat[6].priceUsd;

                    update.data8.Hours = array_date[7];
                    update.data8.value = array_resultat[7].priceUsd;

                    update.data9.Hours = array_date[8];
                    update.data9.value = array_resultat[8].priceUsd;

                    update.data10.Hours = array_date[9];
                    update.data10.value = array_resultat[9].priceUsd;

                    update.data11.Hours = array_date[10];
                    update.data11.value = array_resultat[10].priceUsd;

                    update.data12.Hours = array_date[11];
                    update.data12.value = array_resultat[11].priceUsd;

                    return update;
                })

            }).catch((err) => {
                console.log(err)
            })
        }

        else if (button === "24h") {
            axios.get(`${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/cryptos/${id_name}/history/h1`).then((res) => {
                let array_resultat = []
                let array_date = [];
                let list = res.data.data
                let len_array_list = list.length

                for (let i = len_array_list - 25; i < len_array_list; i++) {
                    array_resultat.push(list[i])
                }

                for (let i = 0; i < array_resultat.length; i++) {

                    let fulldate = new Date(array_resultat[i].time)
                    let heure = (fulldate.getHours() < 10 ? '0' : '') + fulldate.getHours();
                    let minute = (fulldate.getMinutes() < 10 ? '0' : '') + fulldate.getMinutes();
                    let heure_minute = `${heure}:${minute}`

                    array_date.push(heure_minute)
                }

                setDayHour((prev) => {
                    let update = { ...prev };

                    update.data1.Hours = "";
                    update.data1.value = 0;

                    update.data2.Hours = "";
                    update.data2.value = 0;

                    update.data3.Hours = "";
                    update.data3.value = 0;

                    update.data4.Hours = "";
                    update.data4.value = 0;

                    update.data5.Hours = "";
                    update.data5.value = 0;

                    update.data6.Hours = "";
                    update.data6.value = 0;

                    update.data7.Hours = "";
                    update.data7.value = 0;

                    update.data8.Hours = "";
                    update.data8.value = 0;

                    update.data9.Hours = "";
                    update.data9.value = 0;

                    update.data10.Hours = "";
                    update.data10.value = 0;

                    update.data11.Hours = "";
                    update.data11.value = 0;

                    update.data12.Hours = "";
                    update.data12.value = 0;

                    update.data13.Hours = "";
                    update.data13.value = 0;

                    update.data14.Hours = "";
                    update.data14.value = 0;

                    update.data15.Hours = "";
                    update.data15.value = 0;

                    update.data16.Hours = "";
                    update.data16.value = 0;

                    update.data17.Hours = "";
                    update.data17.value = 0;

                    update.data18.Hours = "";
                    update.data18.value = 0;

                    update.data19.Hours = "";
                    update.data19.value = 0;

                    update.data20.Hours = "";
                    update.data20.value = 0;

                    update.data21.Hours = "";
                    update.data21.value = 0;

                    update.data22.Hours = "";
                    update.data22.value = 0;

                    update.data23.Hours = "";
                    update.data23.value = 0;

                    update.data24.Hours = "";
                    update.data24.value = 0;

                    update.data1.Hours = array_date[0];
                    update.data1.value = array_resultat[0].priceUsd;

                    update.data2.Hours = array_date[1];
                    update.data2.value = array_resultat[1].priceUsd;

                    update.data3.Hours = array_date[2];
                    update.data3.value = array_resultat[2].priceUsd;

                    update.data4.Hours = array_date[3];
                    update.data4.value = array_resultat[3].priceUsd;

                    update.data5.Hours = array_date[4];
                    update.data5.value = array_resultat[4].priceUsd;

                    update.data6.Hours = array_date[5];
                    update.data6.value = array_resultat[5].priceUsd;

                    update.data7.Hours = array_date[6];
                    update.data7.value = array_resultat[6].priceUsd;

                    update.data8.Hours = array_date[7];
                    update.data8.value = array_resultat[7].priceUsd;

                    update.data9.Hours = array_date[8];
                    update.data9.value = array_resultat[8].priceUsd;

                    update.data10.Hours = array_date[9];
                    update.data10.value = array_resultat[9].priceUsd;

                    update.data11.Hours = array_date[10];
                    update.data11.value = array_resultat[10].priceUsd;

                    update.data12.Hours = array_date[11];
                    update.data12.value = array_resultat[11].priceUsd;

                    update.data12.Hours = array_date[12];
                    update.data12.value = array_resultat[12].priceUsd;

                    update.data13.Hours = array_date[13];
                    update.data13.value = array_resultat[13].priceUsd;

                    update.data14.Hours = array_date[14];
                    update.data14.value = array_resultat[14].priceUsd;

                    update.data15.Hours = array_date[15];
                    update.data15.value = array_resultat[15].priceUsd;

                    update.data16.Hours = array_date[16];
                    update.data16.value = array_resultat[16].priceUsd;

                    update.data17.Hours = array_date[17];
                    update.data17.value = array_resultat[17].priceUsd;

                    update.data18.Hours = array_date[18];
                    update.data18.value = array_resultat[18].priceUsd;

                    update.data19.Hours = array_date[19];
                    update.data19.value = array_resultat[19].priceUsd;

                    update.data20.Hours = array_date[20];
                    update.data20.value = array_resultat[20].priceUsd;

                    update.data21.Hours = array_date[21];
                    update.data21.value = array_resultat[21].priceUsd;

                    update.data22.Hours = array_date[22];
                    update.data22.value = array_resultat[22].priceUsd;

                    update.data23.Hours = array_date[23];
                    update.data23.value = array_resultat[23].priceUsd;

                    update.data24.Hours = array_date[24];
                    update.data24.value = array_resultat[24].priceUsd;

                    return update;
                })
            }).catch((err) => {
                console.log(err)
            })
        }

        else if (button === "7d") {
            axios.get(`${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/cryptos/${id_name}/history/d1`).then((res) => {
                let array_resultat = []
                let array_date = [];
                let list = res.data.data

                let len_array_list = list.length
                for (let i = len_array_list - 7; i < len_array_list; i++) {
                    array_resultat.push(list[i])
                }

                for (let i = 0; i < array_resultat.length; i++) {
                    // let fulldate = new Date(array_resultat[i].time)
                    // // let jour = (fulldate.getDay() < 10 ? '0' : '') + fulldate.getDay();
                    // // let mois = (fulldate.getMonth() < 10 ? '0' : '') + fulldate.getMonth();
                    // // //let annee = fulldate.getFullYear()
                    // // let jour_mois_annee = `${jour}/${mois}`

                    // console.log(fulldate)
                    // //console.log(jour)
                    // // console.log(mois)

                    // array_date.push(jour_mois_annee)


                    // const originalDate = "2023-12-06T00:00:00.000Z";
                    const dateObject = new Date(array_resultat[i].time);

                    const day = dateObject.getUTCDate();
                    const month = dateObject.getUTCMonth() + 1;

                    const formattedDate = `${day}/${month}`;

                    array_date.push(formattedDate)
                }

                // console.log(list)
                // console.log(array_date)
                // console.log(array_resultat)

                setWeekHour((prev) => {
                    let update = { ...prev };

                    update.data1.Day = "";
                    update.data1.value = 0;

                    update.data2.Day = "";
                    update.data2.value = 0;

                    update.data3.Day = "";
                    update.data3.value = 0;

                    update.data4.Day = "";
                    update.data4.value = 0;

                    update.data5.Day = "";
                    update.data5.value = 0;

                    update.data6.Day = "";
                    update.data6.value = 0;

                    update.data7.Day = "";
                    update.data7.value = 0;

                    update.data1.Day = array_date[0];
                    update.data1.value = array_resultat[0].priceUsd;

                    update.data2.Day = array_date[1];
                    update.data2.value = array_resultat[1].priceUsd;

                    update.data3.Day = array_date[2];
                    update.data3.value = array_resultat[2].priceUsd;

                    update.data4.Day = array_date[3];
                    update.data4.value = array_resultat[3].priceUsd;

                    update.data5.Day = array_date[4];
                    update.data5.value = array_resultat[4].priceUsd;

                    update.data6.Day = array_date[5];
                    update.data6.value = array_resultat[5].priceUsd;

                    update.data7.Day = array_date[6];
                    update.data7.value = array_resultat[6].priceUsd;

                    return update;
                })
            }).catch((err) => {
                console.log(err)
            })
        }
    };

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/rates/all`).then((res) => {
            const sortedRates = res.data.sort((a, b) => a.name_rate.localeCompare(b.name_rate));
            setRate(sortedRates)
            setFilter(sortedRates)
        }).catch((err) => {
            console.log(err)
        })
    }, [])

    const handleToggleDropdown = () => {
        setIsOpen(prevIsOpen => !prevIsOpen);
    };

    const handleFilter = (e) => {

        let search = e.target.value;
        setNameEnter(search)

        const newFilter = rate.filter((value) => {
            return value.name_rate.toLowerCase().includes(search.toLowerCase());
        })

        if (search === "") {
            setFilter(rate)
        }
        else {
            setFilter(newFilter);
        }
    }

    const handleClear = () => {
        setFilter(rate)
        setNameEnter("")
    }

    const handleClose = () => {
        setShow(false);
        setIsOpen(false);
        setTextToDisplay("Select an option");
        setSelectedButton(null);
    }

    const handleShow = () => setShow(true);

    const handleSelected = (rate, symbol, abr) => {
        setIsOpen(false)
        let calcul = price / rate
        let stringToDisplay = `${calcul.toFixed(2).toLocaleString()} ${symbol === null ? '💰' : symbol} (${abr})`
        setTextToDisplay(stringToDisplay)
        // setNameEnter("")
    }

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <div className='more_info_on_crypto'>

                        <div className="wrapper_name_more_info">
                            <h3>{name}</h3>
                            <h3>({symbol})</h3>
                        </div>

                        <div className="container_convert_crypto">
                            <h3>{price} $</h3>
                            <h6>convert to...</h6>
                            <div className="custom-dropdown">
                                <button onClick={handleToggleDropdown}>
                                    {textToDisplay}
                                </button>
                                {isOpen && (
                                    <div className="dropdown-content">

                                        <div className="wrapper_input_search">
                                            <input type="text" value={nameEnter} onChange={handleFilter} />
                                            {nameEnter.length === 0 ? <i className='fa fa-search'></i> : <i className="fa-solid fa-xmark" onClick={handleClear}></i>}

                                        </div>
                                        {
                                            filter.map((item, index) => (
                                                <li key={index} onClick={() => handleSelected(item.rateUsd_rate, item.currencySymbol_rate, item.symbol_rate)}>
                                                    {item.name_rate}
                                                </li>
                                            ))
                                        }

                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="container_chart_more">
                            <h6>History</h6>
                            <div className="wrapper_buttons">
                                <button className={selectedButton === '1h' ? 'selectedButton' : ''} onClick={() => handleButtonClick('1h')}>1h</button>
                                <button className={selectedButton === '24h' ? 'selectedButton' : ''} onClick={() => handleButtonClick('24h')}>24h</button>
                                <button className={selectedButton === '7d' ? 'selectedButton' : ''} onClick={() => handleButtonClick('7d')}>7 Days</button>
                            </div>

                            {
                                selectedButton === '1h' ? (
                                    <Line data={dataChart1} />
                                ) : selectedButton === '24h' ? (
                                    <Line data={dataChart2} />
                                ) : selectedButton === '7d' ? (
                                    <Line data={dataChart3} />
                                ) : null
                            }

                        </div>

                    </div>
                </Modal.Body>
            </Modal>
            <tr className='content_tab_crypto'>
                <td>{localStorage.getItem('token') ? <i className={`fa-solid fa-star ${isStarAnimated ? 'animated' : ''}`} onClick={handleStarClick}></i> : <i className="fa-solid fa-lock"></i>}</td>
                <td>{rank}</td>
                <td><div className="wrapper_name_crypt"><div className='container_cryptox_img'><img src={`${url}`} alt="crypto image" /> </div>{name}</div></td>
                <td>${price}</td>
                {
                    rate1h.toString().startsWith('-') ? (
                        <td className='down'>{rate1h}% <i className="fa-solid fa-caret-down"></i></td>
                    ) : rate1h.toString() === '0' ? (
                        <td className='egual'>{rate1h}%</td>
                    ) : rate1h.toString() === 'no data' ? (
                        <td className='egual'>wait...</td>
                    ) : (
                        <td className='more'>{rate1h}% <i className="fa-solid fa-caret-up"></i></td>
                    )
                }
                {
                    rate24h.toString().startsWith('-') ? (
                        <td className='down'>{rate24h}% <i className="fa-solid fa-caret-down"></i></td>
                    ) : rate24h.toString() === '0' ? (
                        <td className='egual'>{rate24h}%</td>
                    ) : rate24h.toString() === 'no data' ? (
                        <td className='egual'>wait...</td>
                    ) : (
                        <td className='more'>{rate24h}% <i className="fa-solid fa-caret-up"></i></td>
                    )
                }
                {
                    rate7d.toString().startsWith('-') ? (
                        <td className='down'>{rate7d}% <i className="fa-solid fa-caret-down"></i></td>
                    ) : rate7d.toString() === '0' ? (
                        <td className='egual'>{rate7d}%</td>
                    ) : rate7d.toString() === 'no data' ? (
                        <td className='egual'>wait...</td>
                    ) : (
                        <td className='more'>{rate7d}% <i className="fa-solid fa-caret-up"></i></td>
                    )
                }
                <td>${volume}</td>
                <td><button onClick={handleShow}>More</button></td>
            </tr>

        </>
    );
};

export default Cryptox;