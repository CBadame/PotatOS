var PotatOS;
(function (PotatOS) {
    var MM = (function () {
        function MM() {
            this.segment = -1;
        }
        MM.prototype.write = function (code, pcb) {
            var codeArray = code.split(" ");
            if (this.segment < 2) {
                this.segment++;
                var arrayCount = 0;
                for (var i = this.base(this.segment); i < this.limit(this.segment); i++) {
                    _Memory.memory[i] = codeArray[arrayCount];
                    arrayCount++;
                    console.log(_Memory.memory[i]);
                    if (i == codeArray.length + (this.base(this.segment) - 1)) {
                        i++;
                        _Memory.memory[i] = 'Done';
                        console.log(_Memory.memory[i]);
                        break;
                    }
                }
                _StdOut.putText('The process successfully loaded and has a PID of: ' + pcb.PID);
            }
            else
                _StdOut.putText('No more free memory.');
        };
        MM.prototype.read = function (segment) {
            var codeArray = Array();
            for (var i = this.base(segment); i < this.limit(segment); i++) {
                if (_Memory.memory[i] != "Done")
                    codeArray.push(_Memory.memory[i]);
                else
                    break;
            }
            return codeArray;
        };
        MM.prototype.base = function (segment) {
            if (segment == 0)
                return 0;
            else if (segment == 1)
                return 256;
            else if (segment == 2)
                return 512;
        };
        MM.prototype.limit = function (segment) {
            if (segment == 0)
                return 256;
            else if (segment == 1)
                return 512;
            else if (segment == 2)
                return 768;
        };
        return MM;
    }());
    PotatOS.MM = MM;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=memoryManager.js.map