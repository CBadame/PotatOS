var PotatOS;
(function (PotatOS) {
    var MM = (function () {
        function MM() {
        }
        MM.prototype.getCode = function (segment) {
            return _Memory.read(segment);
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