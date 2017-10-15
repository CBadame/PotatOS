var PotatOS;
(function (PotatOS) {
    var Memory = (function () {
        function Memory(memory) {
            if (memory === void 0) { memory = Array(); }
            this.memory = memory;
        }
        Memory.prototype.init = function () {
            for (var i = 0; i < 768; i++) {
                this.memory.push(0);
            }
        };
        Memory.prototype.write = function (code, segment) {
            var codeArray = code.split(" ");
            for (var i = _MM.base(segment); i < _MM.limit(segment); i++) {
                this.memory[i] = codeArray[i];
                if (i == codeArray.length - 1) {
                    i++;
                    this.memory[i] = 'Done';
                    break;
                }
            }
        };
        Memory.prototype.read = function (segment) {
            var codeArray = Array();
            for (var i = _MM.base(segment); i < _MM.limit(segment); i++) {
                if (this.memory[i] != "Done")
                    codeArray.push(this.memory[i]);
                else
                    break;
            }
        };
        return Memory;
    }());
    PotatOS.Memory = Memory;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=memory.js.map