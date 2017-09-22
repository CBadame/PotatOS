///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module PotatOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public oldInput = [""],
                    public currentPosition = 0,
                    public originalScreenshot = "",
                    public screenshot = ""){
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... add input to array ...
                    _Console.originalScreenshot = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);
                    this.oldInput.splice(1, 0, this.buffer);
                    this.currentPosition = 0;
                    this.oldInput[0] = "";
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";

                    // If the backspace is hit, remove the last char from the buffer...
                    // ...and redraw all char's since the last prompt
                } else if (chr === String.fromCharCode(8)) {
                    if ((this.currentXPosition != _DrawingContext.measureText(this.currentFont, this.currentFontSize,
                            _OsShell.promptStr)) && _OsShell.promptYPosition)
                        redrawInput(_Console.buffer.substring(0, _Console.buffer.length - 1));

                    // Command completion for 'tab'
                } else if (chr === String.fromCharCode(9)) {
                    var matchedCommands = new Array;
                    for (var i = 0; i < _OsShell.commandList.length; i++) {
                        if (_OsShell.commandList[i].command.indexOf(this.buffer) >= 0)
                            matchedCommands.push(_OsShell.commandList[i].command);
                    }
                    if (matchedCommands.length == 1)
                        redrawInput(matchedCommands[0]);

                    // Change buffer to next input in the array of old inputs (up arrow)
                } else if (chr === String.fromCharCode(38)) {
                    if (this.currentPosition < this.oldInput.length-1) {
                        this.currentPosition++;
                        redrawInput(this.oldInput[this.currentPosition]);
                    }

                    // Change buffer to last input in the array of old inputs (down arrow)
                } else if (chr === String.fromCharCode(40)) {
                    if (this.currentPosition > 0) {
                        this.currentPosition--;
                        redrawInput(this.oldInput[this.currentPosition]);
                    }
                } else {
                    // Line-wrap if needed
                    if (this.currentXPosition > 490)
                        this.advanceLine();
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
                if (_Console.currentYPosition < 470) {
                    _DrawingContext.clearRect(0,
                        _OsShell.promptYPosition - (_DefaultFontSize + _FontHeightMargin),
                        _DrawingContext.measureText(_Console.currentFont, _Console.currentFontSize, _Console.buffer),
                        _DefaultFontSize + _FontHeightMargin);
                    _DrawingContext.clearRect(0,
                        _OsShell.promptYPosition - (_DefaultFontSize - _FontHeightMargin),
                        _DrawingContext.measureText(_Console.currentFont, _Console.currentFontSize, _Console.buffer),
                        _DefaultFontSize + _FontHeightMargin);
                    _Console.buffer = newBuffer;
                    _Console.currentXPosition = 0;
                    _Console.currentYPosition = _OsShell.promptYPosition;
                    _Console.putText(_OsShell.promptStr);
                    _Console.drawBuffer();
                }
                else {
                    _Console.drawOriginalScreenshot();
                    _Console.buffer = newBuffer;
                    _Console.currentXPosition = 0;
                    _Console.currentYPosition = _OsShell.promptYPosition;
                    _Console.putText(_OsShell.promptStr);
                    _Console.drawBuffer();
                }
            }
        }

        // Redraws the buffer one character at a time in order to check the x-coordinate and allow for line
        public drawBuffer(): void {
            for (var i = 0; i < _Console.buffer.length; i++) {
                if (_Console.currentXPosition > 490)
                    _Console.advanceLine();
                _StdOut.putText(_Console.buffer[i]);
            }
        }

        public putText(text): void {
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
         }

        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize + 
                                     _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                                     _FontHeightMargin;

            // Checks to see if anything is printed further down from the y-coordinate of 470 as this would cause the
            // next prompt to go off-screen. It then clears the screen, prints the previous screenshot, and resets the
            // current position to the bottom of the canvas.
            _Console.screenshot = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);
            if (this.currentYPosition >= 470) {
                this.init();
                _DrawingContext.putImageData(_Console.screenshot, 0, -20.64);
                this.currentXPosition = 0;
                this.currentYPosition = 467.08;
            }
        }

        // Redraws the the most recent screenshot with an empty input prompt for the updated buffer to print from
        public drawOriginalScreenshot(): void {
            this.init();
            _DrawingContext.putImageData(_Console.originalScreenshot,0, -20.64);
            this.currentXPosition = 0;
            this.currentYPosition = 467.08;
        }
    }
 }
