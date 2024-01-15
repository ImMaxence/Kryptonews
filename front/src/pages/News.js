import React, { useState, useEffect } from 'react';
import Article from '../components/Article';
import useSWR from 'swr';
import axios from 'axios';
import Loader from '../components/Loader';

const fetcher = (url) => axios.get(url).then((res) => res.data);

const News = () => {
    const { data, error } = useSWR(
        `${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/articles/all`,
        fetcher
    );

    const [anonyme, setAnonyme] = useState(0);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/anonymous/profile`).then((res) => {
            setAnonyme(res.data.nb_feed)
        }).catch((err) => {
            console.log(err)
        })

    }, [])

    const sortedData = data ? data.sort((a, b) => new Date(b.articles_date) - new Date(a.articles_date)) : [];

    const [filter, setFilter] = useState([]);
    const [nameEnter, setNameEnter] = useState("");

    useEffect(() => {
        setFilter(sortedData);
    }, [sortedData]);

    const handleFilter = (e) => {
        let search = e.target.value;
        setNameEnter(search);

        const newFilter = sortedData.filter((value) => {
            return value.articles_title.toLowerCase().includes(search.toLowerCase());
        });

        if (search === "") {
            setFilter(sortedData);
        } else {
            setFilter(newFilter);
        }
    };

    const handleClear = () => {
        setFilter(sortedData);
        setNameEnter("");
    };

    if (error) {
        console.error('Error fetching data:', error);
    }

    return (
        <>
            <div className="container_all_news">
                <div className="wrapper_header_news">
                    <div className='title_header_news'>
                        <h4>CRYPTOCURRENCY</h4>
                        <h4>NEWS</h4>
                    </div>

                    <div className="wrapper_search_bar">
                        <input type="text" value={nameEnter} onChange={handleFilter} />
                        {nameEnter.length === 0 ? <i className='fa fa-search'></i> : <i className="fa-solid fa-xmark" onClick={handleClear}></i>}
                    </div>
                </div>
                <hr />

                {data ? (
                    <div className="contains_news_to_map">
                        {
                            localStorage.getItem('token') ? (
                                <>
                                    {
                                        filter.map((item, index) => (
                                            <Article key={index} id={item.id} image={item.url_img_articles} title={item.articles_title} date={item.articles_date} url={item.url_articles} source={item.articles_source} />
                                        ))
                                    }
                                </>
                            ) : (
                                <>

                                    {
                                        filter.slice(0, anonyme).map((item, index) => (
                                            <Article key={index} id={item.id} image={item.url_img_articles} title={item.articles_title} date={item.articles_date} url={item.url_articles} source={item.articles_source} />
                                        ))

                                    }
                                    <div className='please_login'>
                                        <h1>If you want to see more news <br></br> please log in ❤️</h1>
                                    </div>
                                </>
                            )
                        }

                    </div>
                ) : (
                    <Loader />
                )}
            </div>
        </>
    );
};

export default News;