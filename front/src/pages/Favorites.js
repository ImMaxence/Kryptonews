import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import Loader from '../components/Loader';
import axios from 'axios';

const Favorites = () => {
    const [activeId, setActiveId] = useState(1);

    const fetchFavorites = async (url) => {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    };

    const { data: favorites, mutate: mutateFavorites } = useSWR(
        `${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/favorites/favorites/${localStorage.getItem('id')}`,
        fetchFavorites
    );

    const articles = Array.isArray(favorites)
        ? favorites.filter((fav) => fav.filtre_fav === 'articles')
        : [];

    const cryptos = Array.isArray(favorites)
        ? favorites.filter((fav) => fav.filtre_fav === 'cryptos')
        : [];

    const handleMoreClick = (url) => {
        window.open(url, '_blank');
    };

    const handleDeleteFavo = (id) => {
        axios.delete(`${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/favorites/delete/${id}`)
            .then((res) => {
                mutateFavorites();
            })
            .catch((err) => {
                console.log(err);
            });
    };

    return (
        <>
            <div className="container_fav_page">
                <div className="wrapper_navigation_favorites">
                    <button onClick={() => setActiveId(1)} className={`underline-animation ${activeId === 1 ? 'underline' : ''}`}>
                        Your News
                    </button>
                    <button onClick={() => setActiveId(2)} className={`underline-animation ${activeId === 2 ? 'underline' : ''}`}>
                        Your Crypto
                    </button>
                </div>
                <div className="container_content_fav_map">
                    {favorites ? (
                        activeId === 1 ? (
                            <>
                                {articles.map((article) => (
                                    <div key={article.id} className='container_favo_main'>
                                        <div className="container_img_favo_article">
                                            {article.url_img_fav === null ? <img src="../assets/default-image.png" alt="image article" /> : <img src={`${article.url_img_fav}`} alt="pictureArt" />}
                                        </div>
                                        <div className='container_favo_second'>
                                            <h1>{article.name_fav}</h1>
                                            <button onClick={() => handleMoreClick(article.url_source_fav)}>More <i className="fa-solid fa-arrow-up-right-from-square"></i></button>
                                            <i className={`fa-solid fa-star`} onClick={() => handleDeleteFavo(article.id)}></i>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                {cryptos.map((crypto) => (
                                    <div key={crypto.id} className='container_favo_three'>
                                        <img src={`${crypto.url_img_fav}`} alt="crypto image" />
                                        <p>{crypto.name_fav}</p>
                                        <i className={`fa-solid fa-star`} onClick={() => handleDeleteFavo(crypto.id)}></i>
                                    </div>
                                ))}
                            </>
                        )
                    ) : (
                        <Loader />
                    )}
                </div>
            </div>
        </>
    );
};

export default Favorites;
