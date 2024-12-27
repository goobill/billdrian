/*
STATES
====

*/  

let selectedId = undefined; 
let selectedAction = 2; 
let startData = {}
const blobs = new Map();

/*
UTILS
====

*/  

const getId = () => Math.floor(Math.random() * 10000)

const createBlob = function (content, scrolling, percent) {
    id = getId()
    d = {
        "p": percent,
        "c": content,
        "s": scrolling
    }
    
    blobs.set(id, d);
    return id
}

const removeBlob = function (id) {
    blobs.delete(id);
    return id
}

/*
ACTIONS
====

*/

const deleteBlob = function (id) {
    const blobDOM = document.getElementById(id)
    if (!blobDOM) {
        return
    }

    const containerDOM = blobDOM.parentNode
    const levelDOM = containerDOM.parentNode
    
    const containerDirection = containerDOM.getAttribute('class')
    const unit = containerDirection === "container_horizontal" ? "width" : "height"
    
    const containerSize = containerDOM.getBoundingClientRect()[unit]

    const prevSibling = containerDOM.previousElementSibling;
    const nextSibling = containerDOM.nextElementSibling;
    const levelSize = Array.from(levelDOM.children)
        .filter(elem => elem.getAttribute('class') != "resizer")
        .map(container => container.getBoundingClientRect()[unit])
        .reduce((sum, num) => sum + num);

    // Remove blob and container if next to resizer
    if (prevSibling && prevSibling.getAttribute("class") === "resizer") {
        blobDOM.remove()
        containerDOM.remove()
        prevSibling.remove()
        removeBlob(id)
    } else if (nextSibling && nextSibling.getAttribute("class") === "resizer") {
        blobDOM.remove()
        containerDOM.remove()
        nextSibling.remove()
        removeBlob(id)
    }
    
    const levelContainers = Array.from(levelDOM.children)
        .filter(elem => elem.getAttribute('class') != "resizer")
    const increase = containerSize / levelContainers.length

    levelContainers.map(container => {
        const percent = ((container.getBoundingClientRect()[unit] + increase) * 100) / levelSize
        container.style[unit] = percent + '%'
    })

    // If last blob and container in level promote to higher level
    // Unless no more levels
    if (levelDOM.id !== "app" && levelDOM.children.length === 1) {
        const orphan = levelDOM.children[0]
        const blob = orphan.children[0]
        levelDOM.appendChild(blob);
        orphan.remove();
    }
}

const appendBlob = function (id) {
    const blobDOM = document.getElementById(id)
    if (!blobDOM) {
        return
    }

    const containerDOM = blobDOM.parentNode
    const levelDOM = containerDOM.parentNode
    const containerDirection = containerDOM.getAttribute('class')
    const direction = containerDirection === "container_horizontal" ? "horizontal" : "vertical"
    const unit = containerDirection === "container_horizontal" ? "width" : "height"
    const levelContainers = Array.from(levelDOM.children)
        .filter(elem => elem.getAttribute('class') != "resizer")
    const levelSize = levelContainers
        .map(container => container.getBoundingClientRect()[unit])
        .reduce((sum, num) => sum + num);

    const children = undefined
    const content = ""
    const scrolling = false
    let newContainerPercent = 100 / (levelContainers.length + 1);

    const containerPercentOld = (100 - newContainerPercent) / 100
    let containerTotalPercent = 0

    levelContainers.map(container => {
        const percent = ((container.getBoundingClientRect()[unit] * 100) / levelSize) * containerPercentOld
        containerTotalPercent += percent
        container.style[unit] = percent + '%'
    })
    // re-calculating to make sure it adds up to 100%
    newContainerPercent = 100 - containerTotalPercent

    const DOMs = renderContainer(
        direction,
        newContainerPercent, 
        children,
        content, 
        scrolling
    )
    const newContainerDOM = DOMs.containerDOM
    const newDividerDOM = DOMs.dividerDOM

    containerDOM.insertAdjacentElement("afterend", newDividerDOM);
    newDividerDOM.insertAdjacentElement("afterend", newContainerDOM);

    // add listeners
    loadResizables()
    return
}

const splitBlob = function (id) {
    const blobDOM = document.getElementById(id)
    if (!blobDOM) {
        return
    }

    const containerDOM = blobDOM.parentNode
    const containerDirection = containerDOM.getAttribute('class')
    const direction = containerDirection === "container_horizontal" ? "v" : "h"
    
    const blob1 = createBlob("", false, 50)
    const blob2 = createBlob("", false, 50)

    const data = {
        "p": 100,
        "d": direction,
        "l": [
            blobs.get(blob1),
            blobs.get(blob2)
        ]
    }
    
    const level = renderLevel(containerDOM, data, true)

    // first container, idx 1 as blob is idx 0 still
    const cont = level.children[1]
    const temp_blob = cont.children[0]
    blobs.delete(temp_blob.id)
    temp_blob.remove()
    cont.appendChild(blobDOM)

    // add listeners
    loadResizables()
    return
}

const colorBlob = function (id, color) {
    const blobDOM = document.getElementById(id)
    if (!blobDOM) {
        return
    }
    const data = blobs.get(id);
    data["c"] = color;
    blobDOM.style.backgroundColor = color
    return
}

const editBlob = function (id) {
    const blobDOM = document.getElementById(id)
    if (!blobDOM) {
        return
    }

    document.querySelectorAll('.blob[selected="true"]').forEach(function (elem) {
        elem.setAttribute("selected", "false")
    });

    blobDOM.setAttribute("selected", "true")

    if (selectedId === id) {
        selectedId = undefined
    } else {
        selectedId = id
    }

    const inputUrlChangeHandler = function (e) {
        const val = e.target.value
        const blob = blobs.get(selectedId)
        if (blob) {
            blob["c"] = val
        }
    }

    const inputReloadChangeHandler = function (e) {
        const val = e.target.value
        const blob = blobs.get(selectedId)
        if (blob) {
            blob["r"] = val
        }
    }

    const blob = blobs.get(id)
    const currentUrl = blob["c"] || ""
    const currentReload = blob["r"] || ""
    const textUrlDOM = document.getElementById("box-input-url")
    const textReloadDOM = document.getElementById("box-input-reload")

    textUrlDOM.value = currentUrl
    textUrlDOM.removeEventListener("input", inputUrlChangeHandler);
    textUrlDOM.addEventListener("input", inputUrlChangeHandler);

    textReloadDOM.value = currentReload
    textReloadDOM.removeEventListener("input", inputReloadChangeHandler);
    textReloadDOM.addEventListener("input", inputReloadChangeHandler);
}

/*
CLICKABLES
====

*/

const blobable = function (blobDOM) {
    const pointerDownHandler = function (e) {
        e.preventDefault();
        const id = parseInt(blobDOM.id);

        const is_vert = blobDOM.parentNode.getAttribute("class") === "container_horizontal"

        switch (selectedAction) {
            case 0:
                if (is_vert) {
                    appendBlob(id);
                } else {
                    splitBlob(id);
                }
                break;
            case 1:
                if (is_vert) {
                    splitBlob(id);
                } else {
                    appendBlob(id);
                }
                break;
            case 3:
                deleteBlob(id);
                break;
            case 4:
                editBlob(id);
                break;
            case 5:
                // yellow
                colorBlob(id, "#F7C940");
                break;
            case 6:
                // red
                colorBlob(id, "#EC4028");
                break;
            case 7:
                // blue
                colorBlob(id, "#3755A1");
                break;
            case 8:
                // black
                colorBlob(id, "#333333");
                break;
        }
    };

    blobDOM.removeEventListener('mousedown', pointerDownHandler);
    blobDOM.removeEventListener('touchstart', pointerDownHandler);
    blobDOM.addEventListener('mousedown', pointerDownHandler);
    blobDOM.addEventListener('touchstart', pointerDownHandler);
};

/*
RENDER
====

*/

const renderContainer = function (direction, percent, children, content, scrolling, reloadInterval) {
    const id = createBlob(content, scrolling, percent)
    const containerDOM = document.createElement('div');
    const dividerDOM = document.createElement('div');
    dividerDOM.setAttribute("class", "resizer");

    switch (direction) {
        case 'vertical':
            containerDOM.style.height = percent + '%';
            containerDOM.setAttribute("class", "container_vertical");
            
            dividerDOM.setAttribute("data-direction", "vertical");
            break;
        case 'horizontal':
            containerDOM.style.width = percent + '%';
            containerDOM.setAttribute("class", "container_horizontal");
            
            dividerDOM.setAttribute("data-direction", "horizontal");
            break;
        default:
            throw new Error(`${direction} is not a valid direction`);
    }

    if (!children) {
        let blobDOM;
        if (content.startsWith("#")) {
            blobDOM = document.createElement('div');
            blobDOM.style.backgroundColor = content
        } else {
            blobDOM = document.createElement('iframe');
            blobDOM.setAttribute("src", content);
            blobDOM.setAttribute("scrolling", scrolling ? "yes" : "no");
            
            if (reloadInterval) {
                function reload(elemId, content) {
                    console.log("reload")
                    const d = document.getElementById(elemId)
                    d.src = content;
                }
                window.setInterval(reload, reloadInterval * 1000, id, content);
            }
        }
        blobDOM.id = id
        blobDOM.setAttribute("class", "blob");

        blobable(blobDOM)
        
        containerDOM.appendChild(blobDOM)
    }

    return {containerDOM, dividerDOM}
}

const renderLevel = function (parentDOM, levelData, hasDivider) {
    const level = levelData["l"]
    const direction = levelData["d"] === "h" ? "horizontal" : "vertical"
    const total = level.length

    level.forEach((containerData, idx) => {
        const isLast = idx === (total - 1)
        const children = containerData["l"]
        const content = containerData["c"]
        const scrolling = containerData["s"]
        const percent = containerData["p"]
        const r = parseInt(containerData["r"])
        const reloadInterval = r && r > 0 ? r : null

        const {containerDOM, dividerDOM} = renderContainer(
            direction,
            percent, 
            children, 
            content, 
            scrolling,
            reloadInterval
        )
        
        parentDOM.appendChild(containerDOM);
        if (!isLast && hasDivider) {
            parentDOM.appendChild(dividerDOM);
        }

        if (children) {
            renderLevel(containerDOM, containerData, hasDivider)
        }
    })

    return parentDOM
}