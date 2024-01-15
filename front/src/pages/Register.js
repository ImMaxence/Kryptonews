import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [ok, setOk] = useState("");
    const urlDiscord = process.env.REACT_APP_DISCORD_URL

    // const [data, setData] = useState({})

    // username: req.body.username,
    // email: req.body.email,
    // password: req.body.password

    const handleSub = (e) => {

        e.preventDefault();

        if (username.length <= 0 || password.length <= 0 || email.length <= 0) {
            setErrorMessage("Fields must be completed")
        }
        else {
            axios.post(`${process.env.REACT_APP_HTTP}://${process.env.REACT_APP_BACK_HOST}${process.env.REACT_APP_BACK_PORT}/api/users/register`, { "username": username, "email": email, "password": password })
                .then((res) => {
                    console.log(res)
                    //setData(res)
                    setOk("🔥 Bravo, your account has been created successfully ! Please log in")
                })
                .catch((err) => {
                    console.log(err)
                    setErrorMessage(err.response.data.message)
                });
        }
    }
    const handleDiscord = (e) => {
        window.open(urlDiscord);
    }

    return (
        <>
            <div className="fit_to_screen">

                {ok ? (
                    <>
                        <div className="container_register_page">
                            <h4>{ok}</h4>
                        </div>

                    </>
                ) : (
                    <>
                        <div className="container_register_page">
                            <div className="container_login_form_modal register">
                                <h1>Hey, welcome to<br /><span>our place</span></h1>
                                <p>Continue with</p>
                                {/* <button><img src="./assets/image_20.svg" alt="google" /></button> */}
                                <button onClick={handleDiscord}><img src="./assets/discord.svg" alt="discord" /></button>                                <p>or with</p>

                                <form onSubmit={handleSub} className='form_loginpage'>

                                    <div className="input_loginpage">
                                        <input type="text" name='Username' placeholder='Your username' required autoComplete='username' onChange={(e) => setUsername(e.target.value)} />
                                        <i className="fa-solid fa-user"></i>
                                    </div>

                                    <div className="input_loginpage">
                                        <input type="email" name='Email' placeholder='Your email' required autoComplete='email' onChange={(e) => setEmail(e.target.value)} />
                                        <i className="fa-solid fa-envelope"></i>
                                    </div>

                                    <div className="input_loginpage">
                                        <input type="password" name='Password' placeholder='Your password' required autoComplete='new-password' onChange={(e) => setPassword(e.target.value)} />
                                        <i className="fa-solid fa-key"></i>
                                    </div>

                                    <p>{errorMessage}</p>

                                    <button type='submit'>Register</button>

                                </form>
                            </div>
                        </div>
                    </>
                )
                }

            </div >

        </>
    );
};

export default Register;