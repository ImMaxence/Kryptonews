import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useLocation, BrowserRouter as Router, Route, useParams } from "react-router-dom";
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';


const Navbar = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const [activeId, setActiveId] = useState(1);
    const [show, setShow] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [ok, setOk] = useState("");
    const [statusConnect, setStatusConnect] = useState(false);
    const params = new URLSearchParams(location.search);
    const z = params.get('z');
    const urlDiscord = process.env.REACT_APP_DISCORD_URL

    const handleClose = () => setShow(false);

    //const handleClose = () => {
    //   setShow(false);
    // setErrorMessage("")
    //}
    const handleShow = () => setShow(true);

    const handleToggle = () => {
        const toggleBtnIcon = document.querySelector('.toggle_responsive i')
        const DropDown = document.querySelector('.dropdown_navbar')
        DropDown.classList.toggle('open')

        const isOpen = DropDown.classList.contains('open')
        toggleBtnIcon.classList = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'
    }

    const handleSub = async (e) => {

        e.preventDefault();

        if (username.length <= 0 || password.length <= 0) {
            setErrorMessage("Both fields must be completed")
        }
        else {
            axios.post(`${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/users/login`, { "username": username, "password": password })
                .then((res) => {
                    // console.log(res)
                    localStorage.setItem("token", res.data.accessToken)
                    localStorage.setItem("email", res.data.email)
                    localStorage.setItem("id", res.data.id)
                    localStorage.setItem("username", res.data.username)
                    localStorage.setItem("profil", res.data.profilePicture)
                    localStorage.setItem("role", res.data.role)
                    // setOk(`🔥 Bravo, You're log in @${localStorage.getItem('username')} !`)
                    setErrorMessage("")
                    handleClose()

                })
                .catch((err) => {
                    console.log(err)
                    setErrorMessage(err.response.data.message)
                });
        }
    }
    const handleDiscord = () => {
        // console.log(urlDiscord)
        window.open(urlDiscord);
    }

    useEffect(() => {
        switch (location.pathname) {
            case "/":

                setActiveId(1);
                break;
            case "/favorites":

                setActiveId(2);
                break;
            case "/news":

                setActiveId(3);
                break;
            case "/crypto":

                setActiveId(4);
                break;
            case "/register":

                setActiveId(null);
                break;
            case "/profil":

                setActiveId(null);
                break;
            default:

                setActiveId(null);
                break;
        }
    }, [location]);

    useEffect(() => {
        //------ si ya pas jwt token
        // Envoie l'id user en url(back)
        // recup les data en bdd avec l'id user (front avec axios)
        // si connect ok 
        if (localStorage.getItem("token")) {

        }
        else {
            if (z) {
                axios.get(`${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/users/oneUser/` + z)
                    .then((res) => {
                        console.log(res)
                        localStorage.setItem("token", res.data.accessToken)
                        localStorage.setItem("email", res.data.email)
                        localStorage.setItem("id", res.data.id)
                        localStorage.setItem("username", res.data.username)
                        localStorage.setItem("profil", res.data.profilePicture)
                        localStorage.setItem("role", res.data.role)
                        localStorage.setItem("oauth", res.data.oauth)
                        localStorage.setItem("connect", res.data.connect)
                        setStatusConnect(true)

                    })
                    .catch((err) => {
                        console.log(err)
                        setErrorMessage(err.response.data.message)
                    });
            } else {
                console.log('aucun param trouvé')
            }
        }
    }, []);

    const NavigateTo = (id) => {
        window.scrollTo({ top: 0 });
        switch (id) {
            case 1:
                handleToggle();
                navigate("/");
                break;
            case 2:
                if (localStorage.getItem("token")) {
                    handleToggle();
                    navigate("/favorites");
                } else {
                    handleShow();
                }
                break;
            case 3:
                handleToggle();
                navigate("/news");
                break;
            case 4:
                handleToggle();
                navigate("/crypto");
                break;
            case 5:
                handleToggle();
                navigate("/register");
                break;
            case 6:
                handleToggle();
                navigate("/profil");
                break;
        }
    };

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    {localStorage.getItem("token") !== null || localStorage.getItem("conect") == true ? (
                        <>
                            <div className="container_login_form_modal">
                                <h4>{ok}</h4>
                                <button onClick={handleClose} id='spec'>Close</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="container_login_form_modal">
                                <h1>Hey! Welcome back</h1>
                                <p>Continue with</p>
                                {/* <button><img src="./assets/image_20.svg" alt="google" /></button> */}
                                <button onClick={handleDiscord}><img src="./assets/discord.svg" alt="discord" /></button>
                                <p>or with</p>

                                <form onSubmit={handleSub} className='form_loginpage'>

                                    <div className="input_loginpage">
                                        <input type="text" name='Username' placeholder='Your username' required autoComplete='username' onChange={(e) => setUsername(e.target.value)} />
                                        <i className="fa-solid fa-user"></i>
                                    </div>

                                    <div className="input_loginpage">
                                        <input type="password" name='Password' placeholder='Your password' required autoComplete='new-password' onChange={(e) => setPassword(e.target.value)} />
                                        <i className="fa-solid fa-key"></i>
                                    </div>

                                    <p>{errorMessage}</p>

                                    <button type='submit'>Log in</button>

                                </form>
                                <button onClick={handleClose}>Close</button>

                            </div>
                        </>
                    )}

                </Modal.Body>
            </Modal>
            <div className="container_navbar">
                <div className="container_logo_navbar">
                    <img src="./assets/logo.svg" alt="logo" />
                    <div className="vector_for_logo"></div>
                </div>
                <div className="wrapper_navigation">
                    <button onClick={() => NavigateTo(1)} className={`underline-animation ${activeId === 1 ? "underline" : ""}`}>Home</button>
                    <button onClick={() => NavigateTo(2)} className={`underline-animation ${activeId === 2 ? "underline" : ""}`}>Favorites {localStorage.getItem('token') ? null : <i className="fa-solid fa-lock"></i>}</button>
                    <button onClick={() => NavigateTo(3)} className={`underline-animation ${activeId === 3 ? "underline" : ""}`}>News</button>
                    <button onClick={() => NavigateTo(4)} className={`underline-animation ${activeId === 4 ? "underline" : ""}`}>Crypto</button>
                </div>

                {localStorage.getItem("token") || localStorage.getItem("conect") == true ? (
                    <>
                        <div className="wrapper_profil_user" onClick={() => NavigateTo(6)}>
                            <h5>{localStorage.getItem("username")}</h5>
                            <img src={`./assets/user${localStorage.getItem("profil")}.svg`} alt="pictureUser" />
                            <i className="fa-solid fa-pen"></i>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="login_register_navbar">
                            <button onClick={handleShow}>Login</button>
                            <button onClick={() => NavigateTo(5)}>Register</button>
                        </div>
                    </>
                )}



                <button className="toggle_responsive" onClick={handleToggle}>
                    <i className='fa-solid fa-bars'></i>
                </button>

            </div>
            <div className='dropdown_navbar'>
                <button onClick={() => NavigateTo(1)} className={`underline-animation ${activeId === 1 ? "underline" : ""}`}>Home</button>
                <button onClick={() => NavigateTo(2)} className={`underline-animation ${activeId === 2 ? "underline" : ""}`}>Favorites {localStorage.getItem('token') ? null : <i className="fa-solid fa-lock"></i>}</button>
                <button onClick={() => NavigateTo(3)} className={`underline-animation ${activeId === 3 ? "underline" : ""}`}>News</button>
                <button onClick={() => NavigateTo(4)} className={`underline-animation ${activeId === 4 ? "underline" : ""}`}>Crypto</button>

                {localStorage.getItem("token") || localStorage.getItem("conect") == true ? (
                    <>
                        <button id='prof' onClick={() => NavigateTo(6)}>Your Profile</button>
                    </>
                ) : (
                    <>
                        <button onClick={handleShow}>Login</button>
                        <button onClick={() => NavigateTo(5)}>Register</button>
                    </>
                )}

            </div>
        </>
    );
};

export default Navbar;