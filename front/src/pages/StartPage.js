import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const StartPage = () => {

    const navigate = useNavigate()
    const location = useLocation();

    useEffect(() => {
        // console.log("je suis dans le useEffect")
        // Utilisez la bibliothèque URLSearchParams pour obtenir les paramètres de l'URL
        const params = new URLSearchParams(location.search);
        const usernameParam = params.get('username');
        const avatarParam = params.get('avatar');
        const idParam = params.get('id');
        // console.log("params",params)
        // Mettez à jour l'état uniquement si les paramètres existent
        if (usernameParam) {
            localStorage.setItem('username', usernameParam);

        }

        if (avatarParam) {
            localStorage.setItem('avatar', avatarParam);


        }
        if (idParam) {
            localStorage.setItem('id', idParam);

        }
    }, []);
    return (
        <>
            <div className="container_startpage">
                <div className="wrapper_left_content_startpage">
                    <h1>Think</h1>
                    <h1>Forward</h1>
                    <h4>Welcome to the world of crypto</h4>
                    <h5>trade collectibles.</h5>
                    <button className='general_btn' onClick={() => navigate("/crypto")}>Get started <i className="fa-solid fa-arrow-right"></i></button>
                </div>
                <div className="wrapper_right_content_startpage">
                    <img src="./assets/coinsv2.svg" alt="coins" />
                </div>
            </div>
        </>
    );
};

export default StartPage;