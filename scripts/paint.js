const renderCanvas = function () {
    const canvasDOM = document.getElementById("canvas");
    const queryString = window.location.search;

    const urlParams = new URLSearchParams(queryString);

    const artwork = urlParams.get('artwork')
    const hasDivider = urlParams.has('divider')

    const data = JSON.parse(atob(artwork))
    
    renderLevel(canvasDOM, data, hasDivider)
};

document.addEventListener('DOMContentLoaded', renderCanvas);