///<reference path="../globals.ts" />
/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var PotatOS;
(function (PotatOS) {
    var Console = (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, oldInput, currentPosition) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            if (oldInput === void 0) { oldInput = [""]; }
            if (currentPosition === void 0) { currentPosition = 0; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.oldInput = oldInput;
            this.currentPosition = currentPosition;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) {
                    // The enter key marks the end of a console command, so ...
                    // ... add input to array ...
                    this.oldInput.splice(1, 0, this.buffer);
                    this.currentPosition = 0;
                    this.oldInput[0] = "";
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                    // If the backspace is hit, remove the last char from the buffer...
                    // ...and redraw all char's since the last prompt
                }
                else if (chr === String.fromCharCode(8)) {
                    redrawInput(_Console.buffer.substring(0, _Console.buffer.length - 1));
                    // Command completion for 'tab'
                }
                else if (chr === String.fromCharCode(9)) {
                    var matchedCommands = new Array;
                    for (var i = 0; i < _OsShell.commandList.length; i++) {
                        if (_OsShell.commandList[i].command.indexOf(this.buffer) >= 0)
                            matchedCommands.push(_OsShell.commandList[i].command);
                    }
                    if (matchedCommands.length == 1)
                        redrawInput(matchedCommands[0]);
                    // Change buffer to next input in the array of old inputs (up arrow)
                }
                else if (chr === String.fromCharCode(38)) {
                    if (this.currentPosition < this.oldInput.length - 1) {
                        this.currentPosition++;
                        redrawInput(this.oldInput[this.currentPosition]);
                    }
                    // Change buffer to last input in the array of old inputs (down arrow)
                }
                else if (chr === String.fromCharCode(40)) {
                    if (this.currentPosition > 0) {
                        this.currentPosition--;
                        redrawInput(this.oldInput[this.currentPosition]);
                    }
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                    // Add current buffer to input array
                    this.oldInput[0] = this.buffer;
                    this.currentPosition = 0;
                }
                // TODO: Write a case for Ctrl-C.
            }
            // Deletes and redraws updated buffer for backspace and command completion...
            // ...this makes it easier for using backspace with line wrap
            function redrawInput(newBuffer) {
                _DrawingContext.clearRect(_OsShell.promptXPosition, _OsShell.promptYPosition - (_DefaultFontSize + _FontHeightMargin), _DrawingContext.measureText(_Console.currentFont, _Console.currentFontSize, _Console.buffer), _DefaultFontSize + _FontHeightMargin);
                _DrawingContext.clearRect(_OsShell.promptXPosition, _OsShell.promptYPosition - (_DefaultFontSize - _FontHeightMargin), _DrawingContext.measureText(_Console.currentFont, _Console.currentFontSize, _Console.buffer), _DefaultFontSize + _FontHeightMargin);
                _Console.buffer = newBuffer;
                _Console.currentXPosition = _OsShell.promptXPosition;
                _Console.currentYPosition = _OsShell.promptYPosition;
                _Console.putText(_Console.buffer);
            }
        };
        Console.prototype.putText = function (text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            console.log(this.currentYPosition);
            var screenshot = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);
            if (this.currentYPosition >= 470) {
                this.init();
                _DrawingContext.putImageData(screenshot, 0, 0, 0, 0, _Canvas.width, _Canvas.height - 13);
            }
            // TODO: Handle scrolling. (iProject 1)
        };
        return Console;
    }());
    PotatOS.Console = Console;
})(PotatOS || (PotatOS = {}));
