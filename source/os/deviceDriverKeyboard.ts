///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module PotatOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            var charArray = new Array(22);
            charArray = [[186,';'], [187,'='], [188,','], [189,'-'], [190,'.'], [191,'/'], [192,'`'], [219,'['],
                [220,'\\'], [221,']'], [222,'\''], [286,':'], [287,'+'], [288,'<'], [289,'_'], [290,'>'], [291,'?'],
                [292,'~'], [319,'{'], [320,'|'], [321,'}'], [322,'"']];
            var numCharArray = new Array(10);
            numCharArray = [[48, ')'], [49, '!'], [50, '@'], [51, '#'], [52, '$'], [53, '%'], [54, '^'], [55, '&'],
                [56, '*'], [57, '(']];
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90))    ||   // A..Z
                ((keyCode >= 97) && (keyCode <= 123))) {     // a..z
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } else if ( (keyCode == 32)                         ||   // space
                        (keyCode == 13)                         ||   // enter
                        (keyCode == 8)                          ||   // backspace
                        (keyCode == 9)                          ||   // tab
                        (keyCode == 38)                         ||   // up arrow
                        (keyCode == 40)) {                           // down arrow
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);

            //Determines intended special character based on the user's keyCode and enqueue's it
            } else if (keyCode == 8) {                               // backspace
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            } else if ((keyCode >= 48) && (keyCode <= 57)) {
                if (isShifted) {                                    // shifted num special characters
                    for (var i = 0; i < numCharArray.length; i++ ) {
                        if (numCharArray[i][0] == keyCode) {
                            _KernelInputQueue.enqueue(numCharArray[i][1]);
                            break;
                        }
                    }
                } else {                                            // numbers
                    chr = String.fromCharCode(keyCode);
                    _KernelInputQueue.enqueue(chr);
                }
            } else if (((keyCode >= 186) && (keyCode <= 192))   ||  // special characters
                        ((keyCode >= 219) && (keyCode <= 222))) {   // more special characters
                for (var i = 0; i < charArray.length; i++ ) {
                    if (isShifted) {
                        if (charArray[i][0] == keyCode+100) {
                            _KernelInputQueue.enqueue(charArray[i][1]);
                            break;
                        }
                    } else {
                        if (charArray[i][0] == keyCode) {
                            _KernelInputQueue.enqueue(charArray[i][1]);
                            break;
                        }
                    }
                }
            }
        }
    }
}
