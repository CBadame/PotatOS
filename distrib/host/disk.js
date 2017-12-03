var PotatOS;
(function (PotatOS) {
    var Disk = (function () {
        function Disk() {
        }
        Disk.prototype.init = function () {
            for (var i = 0; i <= 3; i++) {
                for (var j = 0; j <= 7; j++) {
                    for (var k = 0; k <= 7; k++) {
                        sessionStorage.setItem(_DISK.makeTSB(i, j, k), "0000000000000000000000000000000000000000" +
                            "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
                    }
                }
            }
            sessionStorage.setItem('0:0:0', '0100000000000000000000000000000000000000' +
                '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000');
        };
        Disk.prototype.makeTSB = function (t, s, b) {
            var tsb = t.toString() + ":" + s.toString() + ":" + b.toString();
            return tsb;
        };
        Disk.prototype.inUse = function (tsb) {
            var tsbValue = sessionStorage.getItem(tsb);
            if (tsbValue[0] + tsbValue[1] == "00") {
                return false;
            }
            if (tsbValue[0] + tsbValue[1] == "01") {
                return true;
            }
        };
        Disk.prototype.getTSB = function (tsb) {
            var tsbValue = sessionStorage.getItem(tsb);
            var nextTrack = parseInt(tsbValue[2] + tsbValue[3], 16);
            var nextSector = parseInt(tsbValue[4] + tsbValue[5], 16);
            var nextBlock = parseInt(tsbValue[6] + tsbValue[7], 16);
            var nextTSB = nextTrack.toString() + ":" + nextSector.toString() + ":" + nextBlock.toString();
            return nextTSB;
        };
        return Disk;
    }());
    PotatOS.Disk = Disk;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=disk.js.map