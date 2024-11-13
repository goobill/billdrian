const renderCanvas = function () {
    const canvasDOM = document.getElementById("canvas");
    const queryString = window.location.search;

    const urlParams = new URLSearchParams(queryString);

    const product = urlParams.get('artwork')

    const data = JSON.parse(atob(product))
    
    renderLevel(canvasDOM, data)
};

document.addEventListener('DOMContentLoaded', renderCanvas);