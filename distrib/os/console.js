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
                var chr = _KernelInputQueue.dequeue();
                if (chr === String.fromCharCode(13)) {
                    this.oldInput.splice(1, 0, this.buffer);
                    this.currentPosition = 0;
                    this.oldInput[0] = "";
                    _OsShell.handleInput(this.buffer);
                    this.buffer = "";
                }
                else if (chr === String.fromCharCode(8)) {
                    redrawInput(_Console.buffer.substring(0, _Console.buffer.length - 1));
                }
                else if (chr === String.fromCharCode(9)) {
                    var matchedCommands = new Array;
                    for (var i = 0; i < _OsShell.commandList.length; i++) {
                        if (_OsShell.commandList[i].command.indexOf(this.buffer) >= 0)
                            matchedCommands.push(_OsShell.commandList[i].command);
                    }
                    if (matchedCommands.length == 1)
                        redrawInput(matchedCommands[0]);
                }
                else if (chr === String.fromCharCode(38)) {
                    if (this.currentPosition < this.oldInput.length - 1) {
                        this.currentPosition++;
                        redrawInput(this.oldInput[this.currentPosition]);
                    }
                }
                else if (chr === String.fromCharCode(40)) {
                    if (this.currentPosition > 0) {
                        this.currentPosition--;
                        redrawInput(this.oldInput[this.currentPosition]);
                    }
                }
                else {
                    this.putText(chr);
                    this.buffer += chr;
                    this.oldInput[0] = this.buffer;
                    this.currentPosition = 0;
                }
            }
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
            if (text !== "") {
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            var screenshot = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);
            if (this.currentYPosition >= 470) {
                this.init();
                _DrawingContext.putImageData(screenshot, 0, -20.64);
                this.currentXPosition = 0;
                this.currentYPosition = 467.08;
            }
        };
        return Console;
    }());
    PotatOS.Console = Console;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=console.js.map