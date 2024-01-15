import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StartPage from './pages/StartPage';
import Background from './components/Background';
import Navbar from './components/Navbar';
import Favorites from './pages/Favorites';
import News from './pages/News';
import Crypto from './pages/Crypto';
import Register from './pages/Register';
import Error from './pages/Error';
import Profil from './pages/Profil';
import Admin from './pages/Admin';
import Interface from './components/Interface';

const App = () => {
    return (
        <>
            <Background />
            <Interface />
            <BrowserRouter>
                <Navbar />
                <Routes>
                    <Route path='/' element={<StartPage />} />
                    <Route path='/favorites' element={<Favorites />} />
                    <Route path='/news' element={<News />} />
                    <Route path='/crypto' element={<Crypto />} />
                    <Route path='/register' element={<Register />} />
                    <Route path='/profil' element={<Profil />} />
                    {/* <Route path='/profile/admin/*' element={<Admin />} /> */}
                    <Route path='*' element={<Error />} />
                </Routes>
            </BrowserRouter>
        </>
    );
};

export default App;