import React, { useState } from 'react';

const Interface = () => {

    // const [theme, setTheme] = useState('default');

    const handleTheme = (theme) => {
        switch (theme) {
            case 'default':
                // setTheme("default")
                document.querySelector("body").setAttribute('data-theme', 'default')
                break;
            case 'red':
                //setTheme("red")
                document.querySelector("body").setAttribute('data-theme', 'red')
                break;
            case 'yellow':
                // setTheme("yellow")
                document.querySelector("body").setAttribute('data-theme', 'yellow')
                break;
            case 'green':
                // setTheme("green")
                document.querySelector("body").setAttribute('data-theme', 'green')
                break;
            case 'white':
                //setTheme("white")
                document.querySelector("body").setAttribute('data-theme', 'white')
                break;
            case 'multi':
                // setTheme("multi")
                document.querySelector("body").setAttribute('data-theme', 'multi')
                break;
        }
    }

    const handleToggle = () => {
        const toggleBtnIcon = document.querySelector('.btn_to_toggle_theme i')
        const DropDown = document.querySelector('.container_change_theme')
        DropDown.classList.toggle('themes')

        const isOpen = DropDown.classList.contains('themes')
        toggleBtnIcon.classList = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-droplet'
    }

    return (
        <>
            <div className="btn_to_toggle_theme" onClick={handleToggle}>
                <i className="fa-solid fa-droplet"></i>
            </div>
            <div className="container_change_theme">
                <button onClick={() => handleTheme("default")}></button>
                <button onClick={() => handleTheme("red")}></button>
                <button onClick={() => handleTheme("yellow")}></button>
                <button onClick={() => handleTheme("green")}></button>
                <button onClick={() => handleTheme("white")}></button>
                <button onClick={() => handleTheme("multi")}></button>
            </div>
        </>
    );
};

export default Interface;