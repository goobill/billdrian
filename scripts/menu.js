const boxable = function (blobDOM) {
    const pointerDownHandler = function (e) {
        const id = blobDOM.id

        document.querySelectorAll('.box-selector--selected').forEach(function (ele) {
            ele.setAttribute("class", "box-selector")
        });

        blobDOM.setAttribute("class", "box-selector box-selector--selected")

        switch (id) {
            case "box-vertical":
                selectedAction = 0
                break;
            case "box-horizontal":
                selectedAction = 1
                break;
            case "box-resize":
                selectedAction = 2
                break;
            case "box-delete":
                selectedAction = 3
                break;
            case "box-edit":
                selectedAction = 4
                break;
            case "box-yellow":
                selectedAction = 5
                break;
            case "box-red":
                selectedAction = 6
                break;
            case "box-blue":
                selectedAction = 7
                break;
            case "box-black":
                selectedAction = 8
                break;
            default:
                console.log('Unexpected id: ' + id);
        }

    };

    blobDOM.addEventListener('mousedown', pointerDownHandler, { passive: false });
    blobDOM.removeEventListener('touchstart', pointerDownHandler, { passive: false });
}

const loadMenu = function () {
    document.querySelectorAll('.box-selector').forEach(function (elem) {
        boxable(elem);
    });
}

document.addEventListener('DOMContentLoaded', loadMenu);