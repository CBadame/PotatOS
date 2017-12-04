var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var PotatOS;
(function (PotatOS) {
    var DeviceDriverDisk = (function (_super) {
        __extends(DeviceDriverDisk, _super);
        function DeviceDriverDisk() {
            var _this = _super.call(this) || this;
            _this.driverEntry = _this.krnDiskDriverEntry;
            return _this;
        }
        DeviceDriverDisk.prototype.krnDiskDriverEntry = function () {
            this.status = "loaded";
        };
        DeviceDriverDisk.prototype.createFile = function (fName) {
            fName = fName.toString();
            var newData = "01";
            var tsb = '';
            var foundTsb = false;
            var pointerTsb = '';
            var foundPointer = false;
            var hexName = '';
            for (var j = 0; j <= 7; j++) {
                for (var k = 0; k <= 7; k++) {
                    tsb = _DISK.makeTSB(0, j, k);
                    var tsbData = sessionStorage.getItem(tsb);
                    if (tsbData[0] + tsbData[1] == '00') {
                        foundTsb = true;
                        j = k = 100;
                        break;
                    }
                }
            }
            if (!foundTsb) {
                return "No available storage space. I'm not sure how this happened...";
            }
            else {
                for (var i = 1; i <= 3; i++) {
                    for (var j = 0; j <= 7; j++) {
                        for (var k = 0; k <= 7; k++) {
                            pointerTsb = _DISK.makeTSB(i, j, k);
                            var pointerData = sessionStorage.getItem(pointerTsb);
                            if (pointerData[0] + pointerData[1] == '00') {
                                foundPointer = true;
                                newData += "0" + i.toString() + "0" + j.toString() + "0" + k.toString();
                                i = j = k = 100;
                                break;
                            }
                        }
                    }
                }
            }
            for (var i = 0; i < fName.length; i++) {
                var hex = fName.charCodeAt(i).toString(16);
                if (hex.length == 1) {
                    hex = '0' + hex;
                }
                hexName += hex;
            }
            newData += hexName;
            console.log(hexName);
            if (!foundPointer) {
                return "Not enough free space in HDD to store the file contents...Huh";
            }
            else {
                var diff = 128 - newData.length;
                for (var i = 0; i < diff; i++) {
                    newData += "0";
                }
                sessionStorage.setItem(tsb, newData);
                console.log(fName);
                _StdOut.putText("File '" + fName + "' created at " + tsb);
                PotatOS.Control.updateHDDDisplay();
            }
        };
        return DeviceDriverDisk;
    }(PotatOS.DeviceDriver));
    PotatOS.DeviceDriverDisk = DeviceDriverDisk;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=deviceDriverDisk.js.map