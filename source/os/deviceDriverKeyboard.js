///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverKeyboard = (function (_super) {
        __extends(DeviceDriverKeyboard, _super);
        function DeviceDriverKeyboard() {
            // Override the base method pointers.
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            _super.call(this);
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }
        DeviceDriverKeyboard.prototype.krnKbdDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };
        DeviceDriverKeyboard.prototype.krnKbdDispatchKeyPress = function (params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
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
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) ||
                ((keyCode >= 97) && (keyCode <= 123))) {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode == 32) ||
                (keyCode == 13) ||
                (keyCode == 8) ||
                (keyCode == 9) ||
                (keyCode == 38) ||
                (keyCode == 40)) {
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 8) {
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode >= 48) && (keyCode <= 57)) {
                if (isShifted) {
                    for (var i = 0; i < numCharArray.length; i++) {
                        if (numCharArray[i][0] == keyCode)
                            _KernelInputQueue.enqueue(numCharArray[i][1]);
                    }
                }
                else {
                    chr = String.fromCharCode(keyCode);
                    _KernelInputQueue.enqueue(chr);
                }
            }
            else if (((keyCode >= 186) && (keyCode <= 192)) ||
                ((keyCode >= 219) && (keyCode <= 222))) {
                for (var i = 0; i < charArray.length; i++) {
                    if (isShifted) {
                        if (charArray[i][0] == keyCode + 100)
                            _KernelInputQueue.enqueue(charArray[i][1]);
                    }
                    else {
                        if (charArray[i][0] == keyCode)
                            _KernelInputQueue.enqueue(charArray[i][1]);
                    }
                }
            }
        };
        return DeviceDriverKeyboard;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
