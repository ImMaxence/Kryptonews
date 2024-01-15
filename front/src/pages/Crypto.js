import React, { useState, useEffect } from 'react';
import Cryptox from '../components/Cryptox';
import useSWR from 'swr';
import Loader from '../components/Loader';
import axios from 'axios'

const fetcher = (url) => fetch(url).then((res) => res.json());

const Crypto = () => {
    const [anonyme, setAnonyme] = useState(0);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/anonymous/profile`).then((res) => {
            setAnonyme(res.data.nb_crypto)
            console.log(res.data)
        })
    }, []);


    let { data: filter, error } = useSWR(
        `${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/cryptos/all`,
        fetcher
    );



    if (error) {
        console.error('Error fetching data:', error);
    }
    // else {
    //     filter = filter[:]
    // }
    console.log("LISTE => ", filter)
    console.log("DATA => ", anonyme)
    let data = filter
    try {
        console.log("DATA => ", anonyme)
        let logIn = localStorage.getItem("token")

        data = logIn ? data : data.slice(0, anonyme)

    }
    catch {
        console.log("NO")
    }

    return (
        <>
            <div className="container_all_crypto">
                <div className="container_table_cryptox">
                    <table>
                        {data ? (
                            <>
                                <tr className="header_tab_crypt">
                                    <th></th> {/* for favorite */}
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>1h %</th>
                                    <th>24h %</th>
                                    <th>7d %</th>
                                    <th>Volume(24h)</th>
                                    <th></th> {/* for view more information from crypto */}
                                </tr>
                                {data.map((item, index) => (
                                    <Cryptox
                                        key={index}
                                        id={item.id}
                                        rank={item.rank_crypto}
                                        url={item.url_img_crypto}
                                        name={item.name_crypto}
                                        price={item.priceUsd_crypto}
                                        symbol={item.symbol_crypto}
                                        id_name={item.id_name_crypto}
                                        rate1h={item.h1}
                                        rate24h={item.h24}
                                        rate7d={item.d7}
                                        volume={item.volumeUsd24Hr_crypto}
                                    />
                                ))}
                            </>
                        ) : (
                            <Loader />
                        )}
                    </table>
                    {
                        localStorage.getItem('token') ? null : (
                            <>
                                <div className='please_login'>
                                    <h1>If you want to see more cryptocurrency <br></br> please log in ❤️</h1>
                                </div>

                            </>
                        )
                    }
                </div>
            </div>
        </>
    );
};

export default Crypto;
