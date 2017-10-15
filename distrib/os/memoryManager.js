var PotatOS;
(function (PotatOS) {
    var MM = (function () {
        function MM() {
        }
        MM.write = function (code, segment) {
            var codeArray = code.split(" ");
            for (var i = this.base(segment); i < this.limit(segment); i++) {
                _Memory.memory[i] = codeArray[i];
                if (i == codeArray.length - 1) {
                    i++;
                    _Memory.memory[i] = 'Done';
                    break;
                }
            }
        };
        MM.read = function (segment) {
            var codeArray = Array();
            for (var i = this.base(segment); i < this.limit(segment); i++) {
                if (_Memory.memory[i] != "Done")
                    codeArray.push(_Memory.memory[i]);
                else
                    break;
            }
        };
        MM.base = function (segment) {
            if (segment == 0)
                return 0;
            else if (segment == 1)
                return 256;
            else if (segment == 2)
                return 512;
        };
        MM.limit = function (segment) {
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