import { React, useState } from 'react';
import axios from 'axios';

const Article = ({ id, image, title, date, url, source }) => {

    const [isStarAnimated, setStarAnimated] = useState(false);

    const handleStarClick = () => {
        setStarAnimated(true);


        if (localStorage.getItem('id')) {
            axios.post(`${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/favorites/create/${localStorage.getItem('id')}`, { 'id_fav': 1, 'name_fav': title, 'url_img_fav': image, 'filtre_fav': 'articles', "url_source_fav": url })
                .then((res) => {
                    setTimeout(() => {
                        setStarAnimated(false);
                    }, 1600);
                }).catch((err) => {
                    setTimeout(() => {
                        setStarAnimated(false);
                    }, 1600);
                })
        }
        else {
            setStarAnimated(false);
        }


    }

    const handleFormatDate = (dateString) => {
        const options = { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
        const formattedDate = new Date(dateString).toLocaleString('en-US', options);
        return formattedDate;
    }

    const handleMoreClick = () => {
        window.open(url, '_blank');
    }

    return (
        <>
            <div className="container_article">
                <div className="container_image_article">
                    {image === null ? <img src="../assets/default-image.png" alt="image article" /> : <img src={`${image}`} alt="pictureUser" />}
                </div>
                <h5>{title}</h5>
                <div className="quick_fix_wrapper_source">
                    <button onClick={handleMoreClick}>More <i className="fa-solid fa-arrow-up-right-from-square"></i></button>
                    <h6>{source}</h6>
                </div>
                <div className="wrapper_bottom_article">

                    {localStorage.getItem('id') ? <i className={`fa-solid fa-star ${isStarAnimated ? 'animated' : ''}`} onClick={handleStarClick}></i> : <i className="fa-solid fa-lock"></i>}
                    <p>{handleFormatDate(date)}</p>
                </div>
            </div>
        </>
    );
};

export default Article;
