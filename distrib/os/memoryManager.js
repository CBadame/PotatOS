var PotatOS;
(function (PotatOS) {
    var MM = (function () {
        function MM() {
            this.segment = [0, 0, 0];
        }
        MM.prototype.write = function (code, pcb) {
            var codeArray = code.split(" ");
            var pcbNum = _PCBList.indexOf(pcb);
            _PCBList[pcbNum].segment = this.checkMem();
            this.segment[_PCBList[pcbNum].segment] = 1;
            var arrayCount = 0;
            _PCBList[pcbNum].base = this.base(_PCBList[pcbNum].segment);
            _PCBList[pcbNum].limit = this.limit(_PCBList[pcbNum].segment);
            for (var i = _PCBList[pcbNum].base; i < _PCBList[pcbNum].limit; i++) {
                _Memory.memory[i] = codeArray[arrayCount];
                arrayCount++;
                if (i == codeArray.length + (_PCBList[pcbNum].base) - 1) {
                    i++;
                    _Memory.memory[i] = 'Done';
                    break;
                }
            }
            _StdOut.putText('The process successfully loaded and has a PID of: ' + pcbNum);
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
        MM.prototype.checkMem = function () {
            var avaialbeSeg;
            for (var j = 0; j < this.segment.length; j++) {
                if (this.segment[j] == 0)
                    avaialbeSeg = j;
            }
            return avaialbeSeg;
        };
        MM.prototype.run = function (PCB) {
        };
        return MM;
    }());
    PotatOS.MM = MM;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=memoryManager.js.map