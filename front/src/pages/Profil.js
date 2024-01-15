import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import useSWR from 'swr';
import axios from 'axios';
import Loader from '../components/Loader';

const fetchData = async (url) => {
    const response = await axios.get(url);
    return response.data;
};

const Profil = () => {

    const navigate = useNavigate()

    const { data: dataRSS, error, mutate } = useSWR(
        `${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/rss_feeds/all`,
        fetchData
    );

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [showv2, setShowv2] = useState(false);
    const handleClosev2 = () => setShowv2(false);
    const handleShowv2 = () => setShowv2(true);

    const [showv3, setShowv3] = useState(false);
    //const [isLoad, setIsLoad] = useState(false);
    const [selectedButton, setSelectedButton] = useState('post');

    const [limit, setLimit] = useState([])

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/anonymous/profile`).then((res) => {
            setLimit([res.data]);
            setCrypto(res.data.nb_crypto)
            setNews(res.data.nb_feed)
        }).catch((err) => {
            console.log(err)
        })
    }, [])

    const handleButtonClick = (button) => {
        setSelectedButton(button);
        mutate();
    }

    const handleClosev3 = () => setShowv3(false);
    const handleShowv3 = () => setShowv3(true);

    const [showv4, setShowv4] = useState(false);

    const handleClosev4 = () => {
        setActiveProfile(parseInt(localStorage.getItem("profil")));
        setShowv4(false);
    }
    const handleShowv4 = () => setShowv4(true);

    const [username, setUsername] = useState(`${localStorage.getItem("username")}`);
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState(`${localStorage.getItem("email")}`);
    const [input, setInput] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [input2, setInput2] = useState("");
    const [crypto, setCrypto] = useState("");
    const [news, setNews] = useState("");

    const [activeProfile, setActiveProfile] = useState(parseInt(localStorage.getItem("profil")))

    const handleLogOut = () => {
        localStorage.clear()
        navigate("/")
    }

    const handleDeleteUser = () => {
        axios.delete(`${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/users/${localStorage.getItem("id")}`) // delete by user id
            .then((res) => {
                console.log(res.data)
                navigate("/")
                localStorage.clear()
            }).catch((err) => {
                console.log(err)
            })
    }

    const handleUpdate = (id, status, name, url) => {
        let string = id.toString()
        axios.put(`${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/rss_feeds/update/${string}`, { "name_rss_feed": name, "url_rss_feed": url, "parse_rss_feed": !status })
            .then((res) => {
                console.log(res.data)
                mutate();
            }).catch((error) => {
                console.log(error)
            })
    }

    const handleDelete = (id) => {
        let string = id.toString()

        axios.delete(`${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/rss_feeds/delete/${string}`)
            .then((res) => {
                console.log(res.data)
                mutate();
            }).catch((error) => {
                console.log(error)
            })
    }

    const handlePostRss = () => {

        if (input.length < 1 || input2.length < 1) {
            setErrorMsg("Both fileds must be specified")
        }

        else {
            axios.post(`${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/rss_feeds/create`, { "name_rss_feed": input2, "url_rss_feed": input, "parse_rss_feed": false })
                .then((res) => {
                    console.log(res.data)
                    setErrorMsg("")
                })
                .catch((err) => {
                    console.log(err)
                });
        }
    }

    const handleChangeUser = () => {

        if (password.length < 1) {
            setErrorMsg("Please enter a password")
        }

        else {
            axios.put(`${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/users/update/${localStorage.getItem("id")}`, { "username": username, "email": email, "password": password, "profilePicture": activeProfile })
                .then((res) => {
                    console.log(res.data)
                    setErrorMsg("");
                    localStorage.setItem("email", email)
                    localStorage.setItem("username", username)
                    localStorage.setItem("profil", activeProfile)
                    handleClosev4();
                }).catch((err) => {
                    console.log(err)
                })

        }
    }

    const handleChangeLimit = async (id) => {

        console.log(news, crypto)

        if (news > 1 || crypto > 1) {
            if (id === 1) {
                console.log("DATAAA", limit)
                await axios.put(`${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/anonymous/profile`, { "id": 1, "nb_crypto": parseInt(crypto), "nb_feed": limit[0].nb_feed }).then((res) => {
                    console.log(res.data)
                }).catch((err) => {
                    console.log(err)
                })
            }

            else {
                await axios.put(`${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/anonymous/profile`, { "id": 1, "nb_crypto": limit[0].nb_crypto, "nb_feed": parseInt(news) }).then((res) => {
                    console.log(res.data)
                }).catch((err) => {
                    console.log(err)
                })
            }
        }

        else {
            console.log('fields must be specified')
        }



    }

    return (
        <>
            <Modal show={showv4} onHide={handleClosev4}>
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <div className="container_custom_pdp">
                        <h1>Custom your profil 🎨</h1>
                        <div className="input_loginpage">
                            <input type="text" name='Username' placeholder='Your new username' value={localStorage.getItem("username")} onChange={(e) => setUsername(e.target.value)} />
                            <i className="fa-solid fa-user"></i>
                        </div>

                        <div className="input_loginpage">
                            <input type="email" name='Email' placeholder='Your new email' value={localStorage.getItem("email")} onChange={(e) => setEmail(e.target.value)} />
                            <i className="fa-solid fa-envelope"></i>
                        </div>

                        <div className="input_loginpage">
                            <input type="password" name='Password' placeholder='Your new password' onChange={(e) => setPassword(e.target.value)} />
                            <i className="fa-solid fa-key"></i>
                        </div>
                        <h3>Choose your profile picture</h3>
                        <div className="wrapper_img_profil">
                            <div onClick={() => setActiveProfile(1)} className={`divOff ${activeProfile === 1 ? "activeProfileOff" : ""}`}><img src="./assets/user1.svg" alt="user" /></div>
                            <div onClick={() => setActiveProfile(2)} className={`divOff ${activeProfile === 2 ? "activeProfileOff" : ""}`}><img src="./assets/user2.svg" alt="user" /></div>
                            <div onClick={() => setActiveProfile(3)} className={`divOff ${activeProfile === 3 ? "activeProfileOff" : ""}`}><img src="./assets/user3.svg" alt="user" /></div>
                            <div onClick={() => setActiveProfile(4)} className={`divOff ${activeProfile === 4 ? "activeProfileOff" : ""}`}><img src="./assets/user4.svg" alt="user" /></div>
                            <div onClick={() => setActiveProfile(5)} className={`divOff ${activeProfile === 5 ? "activeProfileOff" : ""}`}><img src="./assets/user5.svg" alt="user" /></div>
                            <div onClick={() => setActiveProfile(6)} className={`divOff ${activeProfile === 6 ? "activeProfileOff" : ""}`}><img src="./assets/user6.svg" alt="user" /></div>
                        </div>
                        <p>{errorMsg}</p>
                        <button id='change' onClick={handleChangeUser}>Change</button>
                        <button id='custom' onClick={handleClosev4}>Close</button>
                    </div>
                </Modal.Body>
            </Modal>
            <Modal show={showv3} onHide={handleClosev3}>
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <div className="container_admin_panel">
                        <h1>Welcome to your admin panel ! 🤗</h1>
                        <div className="wrapper_btns_rss">
                            <button className={selectedButton === 'post' ? 'selectedButton' : ''} onClick={() => handleButtonClick('post')}>Create RSS Feed</button>
                            <button className={selectedButton === 'get' ? 'selectedButton' : ''} onClick={() => handleButtonClick('get')}>My RSS Feed</button>
                            <button className={selectedButton === 'limit' ? 'selectedButton' : ''} onClick={() => handleButtonClick('limit')}>Limit</button>
                        </div>
                        <div className="container_rss_feed">
                            {
                                selectedButton === 'post' ? (
                                    <>
                                        <input type="text" placeholder='Set an name for your RSS feed' onChange={(event) => setInput2(event.target.value)} />
                                        <input type="text" placeholder='Enter a valid RSS URL' onChange={(event) => setInput(event.target.value)} />
                                        <p>{errorMsg}</p>
                                        <button onClick={handlePostRss}>Add this feed</button>
                                    </>
                                ) : selectedButton === "get" ? (
                                    <>
                                        {
                                            dataRSS ? (
                                                dataRSS.map((item, index) => (
                                                    <div className="container_rss_map">
                                                        <p key={index}>{item.name_rss_feed} {item.parse_rss_feed ? <i className="fa-solid fa-circle active"></i> : <i className="fa-solid fa-circle notactive"></i>} <button onClick={() => handleDelete(item.id)}>delete</button> <button onClick={() => handleUpdate(item.id, item.parse_rss_feed, item.name_rss_feed, item.url_rss_feed)}>active ?</button></p>
                                                    </div>
                                                ))
                                            ) : (
                                                <Loader />
                                            )
                                        }

                                    </>
                                ) : selectedButton === "limit" ? (
                                    <>
                                        <input type="number" placeholder='Set limit crypto' value={crypto} onChange={(event) => setCrypto(event.target.value)} />
                                        <button onClick={() => handleChangeLimit(1)}>OK</button>
                                        <input type="number" placeholder='Set limit news' value={news} onChange={(event) => setNews(event.target.value)} />
                                        <button onClick={() => handleChangeLimit(2)}>OK</button>
                                    </>
                                ) : null
                            }
                        </div>
                    </div>
                    <div className="sure_to_action">
                        <h1></h1>
                        <button onClick={handleClosev3}>Close</button>
                    </div>
                </Modal.Body>
            </Modal>
            <Modal show={showv2} onHide={handleClosev2}>
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <div className="sure_to_action">
                        <h1>Are you sure to delete your account ? 🤬</h1>
                        <button onClick={handleDeleteUser}>Yes</button>
                        <button onClick={handleClosev2}>Close</button>
                    </div>
                </Modal.Body>
            </Modal>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <div className="sure_to_action">
                        <h1>Are you sure to log out ? 😭💕</h1>
                        <button onClick={handleLogOut}>Yes</button>
                        <button onClick={handleClose}>Close</button>
                    </div>
                </Modal.Body>
            </Modal>
            <div className="container_profilpage">
                <div className="wrapper_left_profil">
                    <img src={`./assets/user${localStorage.getItem("profil")}.svg`} alt="pictureUser" />
                </div>
                <div className="wrapper_right_profil">
                    <h1>Hey what's up</h1>
                    <h1><span>{localStorage.getItem("username")}</span> ?</h1>
                </div>
            </div>
            <div className="container_all_btn_users">
                <button className='general_btn' onClick={handleShow}>Log out</button>
                <button className='general_btn' onClick={handleShowv4}>Custom your profile</button>
                <button className='general_btn' onClick={handleShowv2}>Delete account</button>
                {
                    localStorage.getItem("role") > 0 ? (
                        <button className='general_btn' onClick={handleShowv3}>Only Admin 😤</button>
                    ) : null
                }
            </div>
        </>
    );
};

export default Profil;