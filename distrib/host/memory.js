var PotatOS;
(function (PotatOS) {
    var Memory = (function () {
        function Memory(memory) {
            if (memory === void 0) { memory = Array(); }
            this.memory = memory;
        }
        Memory.prototype.init = function () {
            if (_Memory.memory.length != 0)
                _Memory.memory = Array();
            for (var i = 0; i < 768; i++) {
                this.memory.push('00');
            }
        };
        return Memory;
    }());
    PotatOS.Memory = Memory;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=memory.js.map