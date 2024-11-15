const boxable = function (blobDOM) {
    const pointerDownHandler = function (e) {
        const id = blobDOM.id

        document.querySelectorAll('.box-selected').forEach(function (elem) {
            if (elem.getAttribute("class").includes("box-input")) {
                elem.setAttribute("class", "box-input")
            } else {
                elem.setAttribute("class", "box-selector")
            }
        });
        // remove selected blob if not editing
        // and reset editor to no value
        if (!blobDOM.getAttribute("class").includes("box-input")) {
            document.querySelectorAll('.blob[selected="true"]').forEach(function (elem) {
                elem.setAttribute("selected", "false")
            });
            const inputDOM = document.getElementById("box-edit")
            if (inputDOM) {
                inputDOM.value = ""
            }
        }

        blobDOM.setAttribute("class", blobDOM.getAttribute("class") + " box-selected")

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
    document.querySelectorAll('.box-input').forEach(function (elem) {
        boxable(elem);
    });
}

document.addEventListener('DOMContentLoaded', loadMenu);