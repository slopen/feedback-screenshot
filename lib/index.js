'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _html2canvas = require('html2canvas');

var _html2canvas2 = _interopRequireDefault(_html2canvas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var H2C_IGNORE = 'data-html2canvas-ignore';
var HIGHLIGHT_CLASS = 'feedback-highlighted';
var HIGHLIGHT_ELEMENT_CLASS = 'feedback-highlight-element';
var DATA_EXCLUDE = 'data-exclude';

var removeElements = function removeElements(list) {
    var remove = [].slice.call(list);

    for (var i = 0, len = remove.length; i < len; i++) {
        var item = remove.pop();

        if (typeof item !== 'undefined') {
            // check that the item was actually added to DOM
            if (item.parentNode !== null) {
                item.parentNode.removeChild(item);
            }
        }
    }
};

var getBounds = function getBounds(el) {
    return el.getBoundingClientRect();
};

var emptyElements = function emptyElements(el) {
    var item = null;

    while ((item = el.firstChild) !== null ? el.removeChild(item) : false) {}
};

var clearBoxEl = function clearBoxEl(el) {
    el.style.left = '-5px';
    el.style.top = '-5px';
    el.style.width = '0px';
    el.style.height = '0px';
    el.setAttribute(DATA_EXCLUDE, true);
};

var createGlass = function createGlass() {
    var glass = document.createElement('div');

    glass.className = 'feedback-glass';
    glass.style.pointerEvents = 'none';
    glass.setAttribute(H2C_IGNORE, true);

    return glass;
};

var createHighlightClose = function createHighlightClose() {
    var highlightClose = document.createElement('div');

    highlightClose.id = 'feedback-highlight-close';
    highlightClose.innerHTML = '&times';

    return highlightClose;
};

var createHighlightContainer = function createHighlightContainer() {
    var highlightContainer = document.createElement('div');

    highlightContainer.id = 'feedback-highlight-container';

    return highlightContainer;
};

var createHighlightBox = function createHighlightBox() {
    var highlightBox = document.createElement('canvas');

    highlightBox.className = HIGHLIGHT_ELEMENT_CLASS;

    return highlightBox;
};

var Screenshot = function () {
    function Screenshot() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Screenshot);

        _initialiseProps.call(this);

        this.options = options;
        this.root = options.root || document.body;

        this.glass = createGlass();
        this.highlightClose = createHighlightClose();
        this.highlightContainer = createHighlightContainer();
        this.highlightBox = createHighlightBox();
    }

    // delegate mouse move event for body


    // delegate event for body click


    _createClass(Screenshot, [{
        key: 'image',
        value: function image() {
            var data = this.data();

            if (data) {
                var img = new Image();

                img.src = data;

                return img;
            }
        }
    }]);

    return Screenshot;
}();

var _initialiseProps = function _initialiseProps() {
    var _this = this;

    this.init = function () {
        var options = _this.options;


        _this.dom = document.createElement('div');

        return new Promise(function (resolve, reject) {
            try {
                options.onrendered = function (canvas) {
                    _this.h2cCanvas = canvas;
                    _this.h2cCanvas.className = 'feedback-canvas';

                    resolve(_this);
                };

                (0, _html2canvas2.default)([document.body], options);
            } catch (e) {
                reject(e.message);
            }
        });
    };

    this.close = function () {
        removeElements([_this.glass, _this.h2cCanvas, _this.highlightContainer, _this.highlightBox, _this.highlightClose]);

        removeElements(document.getElementsByClassName(HIGHLIGHT_CLASS));

        _this.root.removeEventListener('mousemove', _this.mouseMoveEvent, false);
        _this.root.removeEventListener('click', _this.mouseClickEvent, false);
    };

    this.open = function () {
        emptyElements(_this.dom);

        document.body.appendChild(_this.glass);
        document.body.appendChild(_this.h2cCanvas);
        document.body.appendChild(_this.highlightBox);
        document.body.appendChild(_this.highlightClose);

        _this.highlightContainer.style.width = _this.h2cCanvas.width + 'px';
        _this.highlightContainer.style.height = _this.h2cCanvas.height + 'px';

        document.body.appendChild(_this.highlightContainer);

        // bind mouse delegate events
        _this.root.addEventListener('mousemove', _this.mouseMoveEvent, false);
        _this.root.addEventListener('click', _this.mouseClickEvent, false);

        _this.highlightClose.addEventListener('click', function () {
            removeElements([_this.removeElement]);
            _this._hideClose();
        }, false);
    };

    this.mouseMoveEvent = function (e) {
        var target = e.target;

        // set close button

        if (target.className.indexOf(HIGHLIGHT_CLASS) !== -1) {
            _this._displayClose(target);
            _this.removeElement = target;
            _this.previousElement = null;
            _this._clearBox();

            return;
        }

        // don't do anything if we are highlighting a close button or body tag
        if (target.nodeName === 'BODY' || target === _this.highlightClose) {
            _this.previousElement = target;
            _this._clearBox();

            return;
        }

        if (target === _this.previousElement || target.getAttribute(DATA_EXCLUDE)) {
            return;
        }

        _this._hideClose();
        _this.previousElement = target;

        clearTimeout(_this.timer);
        _this.timer = setTimeout(_this._renderBox, 100);
    };

    this._displayClose = function (_ref) {
        var style = _ref.style;

        var left = parseInt(style.left, 10);
        var top = parseInt(style.top, 10);

        left += parseInt(style.width, 10);
        left = Math.max(left, 10);
        left = Math.min(left, window.innerWidth - 15);

        top = Math.max(top, 10);

        _this.highlightClose.style.left = left + 'px';
        _this.highlightClose.style.top = top + 'px';
    };

    this._hideClose = function () {
        _this.highlightClose.style.left = '-50px';
        _this.highlightClose.style.top = '-50px';
    };

    this._clearBox = function () {
        clearBoxEl(_this.highlightBox);
        clearTimeout(_this.timer);
    };

    this._renderBox = function () {
        var box = _this.highlightBox;

        var _getBounds = getBounds(_this.previousElement),
            top = _getBounds.top,
            left = _getBounds.left,
            width = _getBounds.width,
            height = _getBounds.height;

        box.width = width;
        box.height = height;

        var ctx = box.getContext('2d');

        ctx.drawImage(_this.h2cCanvas, window.pageXOffset + left, window.pageYOffset + top, width, height, 0, 0, width, height);

        box.style.left = window.pageXOffset + left + 'px';
        box.style.top = window.pageYOffset + top + 'px';
        box.style.width = width + 'px';
        box.style.height = height + 'px';

        box.setAttribute(DATA_EXCLUDE, false);
    };

    this.mouseClickEvent = function (e) {
        if (_this.highlightBox.getAttribute(DATA_EXCLUDE) === 'false') {
            _this.highlightBox.classList.add(HIGHLIGHT_CLASS);
            _this.highlightBox.classList.remove(HIGHLIGHT_ELEMENT_CLASS);

            _this.highlightBox = document.createElement('canvas');
            _this.highlightBox.classList.add(HIGHLIGHT_ELEMENT_CLASS);
            document.body.appendChild(_this.highlightBox);

            _this.previousElement = null;
            _this._clearBox();
        }

        e.preventDefault();
        e.stopPropagation();
    };

    this.data = function () {
        var h2cCanvas = _this.h2cCanvas;


        if (!h2cCanvas) {
            return;
        }

        var radius = 5;
        var ctx = h2cCanvas.getContext('2d');

        ctx.fillStyle = '#000';

        // draw highlights
        var items = Array.prototype.slice.call(document.getElementsByClassName(HIGHLIGHT_CLASS), 0);

        if (items.length) {

            // copy canvas
            var canvasCopy = document.createElement('canvas');
            var copyCtx = canvasCopy.getContext('2d');

            canvasCopy.width = h2cCanvas.width;
            canvasCopy.height = h2cCanvas.height;

            copyCtx.drawImage(h2cCanvas, 0, 0);

            ctx.fillStyle = '#777';
            ctx.globalAlpha = 0.5;
            ctx.fillRect(0, 0, h2cCanvas.width, h2cCanvas.height);

            ctx.beginPath();

            items.forEach(function (item) {
                var style = item.style;


                var x = parseInt(style.left, 10),
                    y = parseInt(style.top, 10),
                    width = parseInt(style.width, 10),
                    height = parseInt(style.height, 10);

                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + width - radius, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
                ctx.lineTo(x + width, y + height - radius);
                ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                ctx.lineTo(x + radius, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
            });

            ctx.closePath();
            ctx.clip();
            ctx.globalAlpha = 1;

            ctx.drawImage(canvasCopy, 0, 0);
        }

        // to avoid security error break for tainted canvas
        try {
            return h2cCanvas.toDataURL();
        } catch (e) {
            return null;
        }
    };
};

exports.default = Screenshot;