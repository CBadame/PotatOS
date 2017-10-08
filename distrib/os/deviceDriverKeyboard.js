var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var PotatOS;
(function (PotatOS) {
    var DeviceDriverKeyboard = (function (_super) {
        __extends(DeviceDriverKeyboard, _super);
        function DeviceDriverKeyboard() {
            var _this = _super.call(this) || this;
            _this.driverEntry = _this.krnKbdDriverEntry;
            _this.isr = _this.krnKbdDispatchKeyPress;
            return _this;
        }
        DeviceDriverKeyboard.prototype.krnKbdDriverEntry = function () {
            this.status = "loaded";
        };
        DeviceDriverKeyboard.prototype.krnKbdDispatchKeyPress = function (params) {
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            var charArray = new Array(22);
            charArray = [[186, ';'], [187, '='], [188, ','], [189, '-'], [190, '.'], [191, '/'], [192, '`'], [219, '['],
                [220, '\\'], [221, ']'], [222, '\''], [286, ':'], [287, '+'], [288, '<'], [289, '_'], [290, '>'], [291, '?'],
                [292, '~'], [319, '{'], [320, '|'], [321, '}'], [322, '"']];
            var numCharArray = new Array(10);
            numCharArray = [[48, ')'], [49, '!'], [50, '@'], [51, '#'], [52, '$'], [53, '%'], [54, '^'], [55, '&'],
                [56, '*'], [57, '(']];
            if (((keyCode >= 65) && (keyCode <= 90)) ||
                ((keyCode >= 97) && (keyCode <= 123))) {
                chr = String.fromCharCode(keyCode + 32);
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode == 32) ||
                (keyCode == 13) ||
                (keyCode == 8) ||
                (keyCode == 9)) {
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode >= 48) && (keyCode <= 57)) {
                if (isShifted) {
                    for (var i = 0; i < numCharArray.length; i++) {
                        if (numCharArray[i][0] == keyCode) {
                            _KernelInputQueue.enqueue(numCharArray[i][1]);
                            break;
                        }
                    }
                }
                else {
                    chr = String.fromCharCode(keyCode);
                    _KernelInputQueue.enqueue(chr);
                }
            }
            else if (keyCode == 38) {
                chr = 'UP';
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 40) {
                chr = 'DOWN';
                _KernelInputQueue.enqueue(chr);
            }
            else if (((keyCode >= 186) && (keyCode <= 192)) ||
                ((keyCode >= 219) && (keyCode <= 222))) {
                for (var i = 0; i < charArray.length; i++) {
                    if (isShifted) {
                        if (charArray[i][0] == keyCode + 100) {
                            _KernelInputQueue.enqueue(charArray[i][1]);
                            break;
                        }
                    }
                    else {
                        if (charArray[i][0] == keyCode) {
                            _KernelInputQueue.enqueue(charArray[i][1]);
                            break;
                        }
                    }
                }
            }
        };
        return DeviceDriverKeyboard;
    }(PotatOS.DeviceDriver));
    PotatOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=deviceDriverKeyboard.js.map