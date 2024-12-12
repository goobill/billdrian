/*
UTILS
====

*/  

const getLevel = function (levelDOM, p) {
    const levelContainers = Array.from(levelDOM.children)
        .filter(elem => elem.getAttribute('class') != "resizer")
    const firstContainer = levelContainers[0]
    const direction = firstContainer.getAttribute("class") === "container_horizontal" ? "h" : "v"
    const unit = direction === "h" ? "width" : "height"

    const level = {
        "p": p,
        "d": direction,
        "l": []
    }

    let percentageTotal = 0
    const finalIdx = levelContainers.length - 1

    levelContainers.map((container, idx) => {
        const child = container.children[0]

        const type = child.getAttribute("class")
        const rect = container.getBoundingClientRect()
        const parentRect = container.parentNode.getBoundingClientRect()

        let percent = 0;
        if (idx === finalIdx) {
            // To ensure level totals 100%
            percent = 100 - percentageTotal;
        } else {
            percent = Math.ceil((rect[unit] * 100) / parentRect[unit]);
            percentageTotal += percent;
        }

        let row = {}
        if (type === "blob") {
            const id = parseInt(child.id);
            const blob = blobs.get(id);
            row = {
                "p": percent,
            }
            if (blob) {
                row["c"] = blob["c"]
                row["s"] = blob["s"] ? 1 : 0
                row["r"] = blob["r"]
            }
        } else {
            row = Object.assign({"p": percent}, getLevel(container, percent))
        }
        level["l"].push(row)
    })

    return level
}

const getData = function () {
    const app = document.getElementById("app");
    
    return getLevel(app, 100)
};

/*
CLICKABLES
====

*/

const resizable = function (resizerDOM) {
    const direction = resizerDOM.getAttribute('data-direction') || 'horizontal';
    let prevSibling = resizerDOM.previousElementSibling;
    let nextSibling = resizerDOM.nextElementSibling;
    let level = resizerDOM.parentNode;

    let x = 0;
    let y = 0;
    let prevSiblingHeight = 0;
    let prevSiblingWidth = 0;
    let nextSiblingHeight = 0;
    let nextSiblingWidth = 0;

    const pointerDownHandler = function (e) {
        e.preventDefault();
        prevSibling = resizerDOM.previousElementSibling;
        nextSibling = resizerDOM.nextElementSibling;
        level = resizerDOM.parentNode;
        // Determine if it's a touch event or mouse event
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        x = clientX;
        y = clientY;

        const prevRect = prevSibling.getBoundingClientRect();
        prevSiblingHeight = prevRect.height;
        prevSiblingWidth = prevRect.width;
        const nextRect = nextSibling.getBoundingClientRect();
        nextSiblingHeight = nextRect.height;
        nextSiblingWidth = nextRect.width;

        document.addEventListener('mousemove', pointerMoveHandler, { passive: false });
        document.addEventListener('touchmove', pointerMoveHandler, { passive: false });
        document.addEventListener('mouseup', pointerUpHandler);
        document.addEventListener('touchend', pointerUpHandler);
    };

    const pointerMoveHandler = function (e) {
        e.preventDefault(); 
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const dx = clientX - x;
        const dy = clientY - y;

        switch (direction) {
            case 'vertical':
                const parentHeight = level.getBoundingClientRect().height;
                const prevHeight = ((prevSiblingHeight + dy) * 100) / parentHeight;
                const nextHeight = ((nextSiblingHeight - dy) * 100) / parentHeight;
                prevSibling.style.height = prevHeight + '%';
                nextSibling.style.height = nextHeight + '%';
                break;
            case 'horizontal':
            default:
                const parentWidth = level.getBoundingClientRect().width;
                const prevWidth = ((prevSiblingWidth + dx) * 100) / parentWidth;
                const nextWidth = ((nextSiblingWidth - dx) * 100) / parentWidth;
                prevSibling.style.width = prevWidth + '%';
                nextSibling.style.width = nextWidth + '%';
                break;
        }
    };

    const pointerUpHandler = function () {
        document.removeEventListener('mousemove', pointerMoveHandler, { passive: false });
        document.removeEventListener('touchmove', pointerMoveHandler, { passive: false });
        document.removeEventListener('mouseup', pointerUpHandler);
        document.removeEventListener('touchend', pointerUpHandler);
    };

    resizerDOM.removeEventListener('mousedown', pointerDownHandler);
    resizerDOM.removeEventListener('touchstart', pointerDownHandler);
    resizerDOM.addEventListener('mousedown', pointerDownHandler);
    resizerDOM.addEventListener('touchstart', pointerDownHandler);
};

const paintable = function (paintDOM) {
    const divider = paintDOM.getAttribute("divider") === "true"
    const pointerDownHandler = function (e) {
        e.preventDefault();
        const painting = btoa(JSON.stringify(getData()))
        const url = `paint.html?${divider ? "divider&" : ""}artwork=${painting}`
        window.open(url).focus();
    };

    paintDOM.addEventListener('mousedown', pointerDownHandler, { passive: false });
    paintDOM.addEventListener('touchstart', pointerDownHandler, { passive: false });
};

/*
RENDER
====

*/

const loadResizables = function () {
    document.querySelectorAll('.resizer').forEach(function (elem) {
        resizable(elem);
    });
};

const renderApp = function () {
    const appDOM = document.getElementById("app");
    renderLevel(appDOM, startData, true)
    loadResizables()

    const paintDOM = document.getElementById("action-paint");
    paintable(paintDOM)
};

document.addEventListener('DOMContentLoaded', renderApp);