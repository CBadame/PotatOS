var PotatOS;
(function (PotatOS) {
    var Disk = (function () {
        function Disk() {
            this.init();
        }
        Disk.prototype.init = function () {
            for (var i = 0; i < 2; i++) {
                for (var j = 0; j < 7; j++) {
                    for (var k = 0; k < 7; k++) {
                        sessionStorage.setItem(_DISK.makeTSB(i, j, k), "000000000000000000000000000000000" +
                            "000000000000000000000000000000000000000000000000000000000");
                    }
                }
            }
        };
        Disk.makeTSB = function (t, s, b) {
            var tsb = t.toString() + ":" + s.toString() + ":" + b.toString();
            return tsb;
        };
        return Disk;
    }());
    PotatOS.Disk = Disk;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=disk.js.map