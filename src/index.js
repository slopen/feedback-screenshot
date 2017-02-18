import html2canvas from 'html2canvas';

const H2C_IGNORE = 'data-html2canvas-ignore';
const HIGHLIGHT_CLASS = 'feedback-highlighted';
const HIGHLIGHT_ELEMENT_CLASS = 'feedback-highlight-element';
const DATA_EXCLUDE = 'data-exclude';

const removeElements = (list) => {
    const remove = [].slice.call (list);

    for (let i = 0, len = remove.length; i < len; i++) {
        let item = remove.pop ();

        if (typeof item !== 'undefined') {
            // check that the item was actually added to DOM
            if (item.parentNode !== null) {
                item.parentNode.removeChild (item);
            }
        }
    }
}

const getBounds = (el) => el.getBoundingClientRect ();

const emptyElements = (el) => {
    let item = null;

    while (((item = el.firstChild) !== null ? el.removeChild (item) : false)) {}
};

const clearBoxEl = (el) => {
    el.style.left = '-5px';
    el.style.top = '-5px';
    el.style.width = '0px';
    el.style.height = '0px';
    el.setAttribute (DATA_EXCLUDE, true);
};

const createGlass = () => {
    const glass = document.createElement ('div');

    glass.className = 'feedback-glass';
    glass.style.pointerEvents = 'none';
    glass.setAttribute (H2C_IGNORE, true);

    return glass;
}

const createHighlightClose = () => {
    const highlightClose = document.createElement ('div');

    highlightClose.id = 'feedback-highlight-close';
    highlightClose.innerHTML = '&times';

    return highlightClose;
}

const createHighlightContainer = () => {
    const highlightContainer = document.createElement ('div');

    highlightContainer.id = 'feedback-highlight-container';

    return highlightContainer;
}

const createHighlightBox = () => {
    const highlightBox = document.createElement ('canvas');

    highlightBox.className = HIGHLIGHT_ELEMENT_CLASS;

    return highlightBox;
}

export default class Screenshot {

    constructor (options = {}) {
        this.options = options;

        this.glass = createGlass ();
        this.highlightClose = createHighlightClose ();
        this.highlightContainer = createHighlightContainer();
        this.highlightBox = createHighlightBox ();
    }

    init = () => {
        const {options} = this;

        this.dom = document.createElement ('div');

        return new Promise ((resolve, reject) => {
            try {
                options.onrendered = (canvas) => {
                    this.h2cCanvas = canvas;
                    this.h2cCanvas.className = 'feedback-canvas';

                    resolve (this);
                };

                html2canvas ([document.body], options);

            } catch (e) {
                reject (e.message);
            }
        });

    }

    close = () => {
        removeElements ([
            this.glass,
            this.h2cCanvas,
            this.highlightContainer,
            this.highlightBox,
            this.highlightClose
        ]);

        removeElements (
            document.getElementsByClassName (HIGHLIGHT_CLASS)
        );

        document.body.removeEventListener ('mousemove', this.mouseMoveEvent, false);
        document.body.removeEventListener ('click', this.mouseClickEvent, false);
    }

    open = () => {
        emptyElements (this.dom);

        document.body.appendChild (this.glass);
        document.body.appendChild (this.h2cCanvas);
        document.body.appendChild (this.highlightBox);
        document.body.appendChild (this.highlightClose);

        this.highlightContainer.style.width = this.h2cCanvas.width + 'px';
        this.highlightContainer.style.height = this.h2cCanvas.height + 'px';

        document.body.appendChild (this.highlightContainer);

        // bind mouse delegate events
        document.body.addEventListener('mousemove', this.mouseMoveEvent, false);
        document.body.addEventListener('click', this.mouseClickEvent, false);

        this.highlightClose.addEventListener ('click', () => {
            removeElements ([this.removeElement]);
            this._hideClose ();
        }, false);
    }

    // delegate mouse move event for body
    mouseMoveEvent = (e) => {
        const {target} = e;

        // set close button
        if (target.className.indexOf (HIGHLIGHT_CLASS) !== -1) {
            this._displayClose (target);
            this.removeElement = target;
            this.previousElement = null;
            this._clearBox ();

            return;
        }

        // don't do anything if we are highlighting a close button or body tag
        if (target.nodeName === 'BODY' || target === this.highlightClose) {
            this.previousElement = target;
            this._clearBox ();

            return;
        }

        if (target === this.previousElement || target.getAttribute (DATA_EXCLUDE)) {
            return;
        }

        this._hideClose ();
        this.previousElement = target;

        clearTimeout (this.timer);
        this.timer = setTimeout (this._renderBox, 100);
    }

    _displayClose = ({style}) => {
        let left = parseInt (style.left, 10);
        let top = parseInt (style.top, 10);

        left += parseInt (style.width, 10)
        left = Math.max (left, 10);
        left = Math.min (left, window.innerWidth - 15);

        top = Math.max (top, 10);

        this.highlightClose.style.left = left + 'px';
        this.highlightClose.style.top = top + 'px';
    }

    _hideClose = () => {
        this.highlightClose.style.left = '-50px';
        this.highlightClose.style.top = '-50px';
    }

    _clearBox = () => {
        clearBoxEl (this.highlightBox);
        clearTimeout (this.timer);
    }

    _renderBox = () => {
        const box = this.highlightBox;

        const {
            top,
            left,
            width,
            height
        } = getBounds (this.previousElement);

        box.width = width;
        box.height = height;

        const ctx = box.getContext ('2d');

        ctx.drawImage (this.h2cCanvas,
            window.pageXOffset + left,
            window.pageYOffset + top,
            width,
            height,
            0,
            0,
            width,
            height
        );

        box.style.left = window.pageXOffset + left + 'px';
        box.style.top = window.pageYOffset + top + 'px';
        box.style.width = width + 'px';
        box.style.height = height + 'px';

        box.setAttribute (DATA_EXCLUDE, false);
    }

    // delegate event for body click
    mouseClickEvent = (e) => {
        if (this.highlightBox.getAttribute (DATA_EXCLUDE) === 'false') {
            this.highlightBox.classList.add (HIGHLIGHT_CLASS);
            this.highlightBox.classList.remove (HIGHLIGHT_ELEMENT_CLASS);

            this.highlightBox = document.createElement ('canvas');
            this.highlightBox.classList.add (HIGHLIGHT_ELEMENT_CLASS);
            document.body.appendChild (this.highlightBox);

            this.previousElement = null;
            this._clearBox ();
        }

        e.preventDefault ();
        e.stopPropagation ();
    }

    data = () => {
        const {h2cCanvas} = this;

        if (!h2cCanvas) {
            return;
        }

        const radius = 5;
        const ctx = h2cCanvas.getContext ('2d');

        ctx.fillStyle = '#000';

        // draw highlights
        const items = Array.prototype.slice.call (
            document.getElementsByClassName (HIGHLIGHT_CLASS), 0);

        if (items.length) {

            // copy canvas
            let canvasCopy = document.createElement ('canvas');
            let copyCtx = canvasCopy.getContext ('2d');

            canvasCopy.width = h2cCanvas.width;
            canvasCopy.height = h2cCanvas.height;

            copyCtx.drawImage (h2cCanvas, 0, 0);

            ctx.fillStyle = '#777';
            ctx.globalAlpha = 0.5;
            ctx.fillRect (0, 0, h2cCanvas.width, h2cCanvas.height);

            ctx.beginPath ();

            items.forEach ((item) => {
                const {style} = item;

                const x = parseInt (style.left, 10),
                    y = parseInt (style.top, 10),
                    width = parseInt (style.width, 10),
                    height = parseInt (style.height, 10);

                ctx.moveTo (x + radius, y);
                ctx.lineTo (x + width - radius, y);
                ctx.quadraticCurveTo (x + width, y, x + width, y + radius);
                ctx.lineTo (x + width, y + height - radius);
                ctx.quadraticCurveTo (x + width, y + height, x + width - radius, y + height);
                ctx.lineTo (x + radius, y + height);
                ctx.quadraticCurveTo (x, y + height, x, y + height - radius);
                ctx.lineTo (x, y + radius);
                ctx.quadraticCurveTo (x, y, x + radius, y);
            });

            ctx.closePath ();
            ctx.clip ();
            ctx.globalAlpha = 1;

            ctx.drawImage (canvasCopy, 0, 0);
        }

        // to avoid security error break for tainted canvas
        try {
            return h2cCanvas.toDataURL ();
        } catch (e) {
            return null;
        }
    }

    image () {
        const data = this.data ();

        if (data) {
            let img = new Image ();

            img.src = data;

            return img;
        }

    }

}
