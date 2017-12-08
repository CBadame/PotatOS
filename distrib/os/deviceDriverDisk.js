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
            var newData = "01";
            var tsb = '';
            var foundTsb = false;
            var pointerTsb = '';
            var newTsb = '';
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
                newTsb = _krnDiskDriver.findBlock();
                newData += "0" + newTsb[0] + "0" + newTsb[2] + "0" + newTsb[4];
                sessionStorage.setItem(newTsb, '01000000000000000000000000000000' +
                    '000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                    '000000000000000000');
            }
            newData += _krnDiskDriver.toHex(fName);
            if (newTsb == "") {
                _StdOut.putText("Not enough free space in HDD to store the file contents...Huh");
            }
            else {
                newData = _krnDiskDriver.zeroFill(newData);
                sessionStorage.setItem(tsb, newData);
                _StdOut.putText("File '" + fName + "' created at " + tsb);
                _DISK.FileList.push([tsb, fName]);
                PotatOS.Control.updateHDDDisplay();
            }
        };
        DeviceDriverDisk.prototype.checkFile = function (fileName) {
            var fileTsb = "";
            for (var i = 0; i < _DISK.FileList.length; i++) {
                if (fileName == _DISK.FileList[i][1]) {
                    fileTsb = _DISK.FileList[i][0];
                    i = _DISK.FileList.length + 1;
                }
            }
            return fileTsb;
        };
        DeviceDriverDisk.prototype.findBlock = function () {
            var pointerTsb = '';
            for (var i = 1; i <= 3; i++) {
                for (var j = 0; j <= 7; j++) {
                    for (var k = 0; k <= 7; k++) {
                        pointerTsb = _DISK.makeTSB(i, j, k);
                        var pointerData = sessionStorage.getItem(pointerTsb);
                        if (pointerData[0] + pointerData[1] == '00') {
                            return pointerTsb;
                        }
                    }
                }
            }
            return pointerTsb;
        };
        DeviceDriverDisk.prototype.toHex = function (value) {
            var hexVal = '';
            for (var i = 0; i < value.length; i++) {
                var hex = value.charCodeAt(i).toString(16);
                if (hex.length == 1) {
                    hex = '0' + hex;
                }
                hexVal += hex;
            }
            return hexVal;
        };
        DeviceDriverDisk.prototype.zeroFill = function (value) {
            var diff = 128 - value.length;
            for (var i = 0; i < diff; i++) {
                value += "0";
            }
            return value;
        };
        DeviceDriverDisk.prototype.write = function (tsb, fileData) {
            var data = sessionStorage.getItem(tsb);
            var newTsb = data[3] + ":" + data[5] + ":" + data[7];
            var newData = "01";
            var pointerTsb = _krnDiskDriver.findBlock();
            newData += "0" + pointerTsb[0] + "0" + pointerTsb[2] + "0" + pointerTsb[4];
            newData += _krnDiskDriver.toHex(fileData);
            if (newData.length > 128) {
                var diffData = newData.slice(129, newData.length);
                var diffString = '';
                for (var i = 0; i < diffData.length - 1; i++) {
                    diffString += String.fromCharCode(parseInt(diffData[i] + diffData[i + 1], 16));
                    i++;
                }
                newData = newData.slice(0, 128);
                sessionStorage.setItem(newTsb, newData);
                _krnDiskDriver.write(newTsb, diffString);
            }
            else {
                newData = _krnDiskDriver.zeroFill(newData);
                newData = "01000000" + newData.substring(8, 127);
                sessionStorage.setItem(newTsb, newData);
                PotatOS.Control.updateHDDDisplay();
            }
        };
        return DeviceDriverDisk;
    }(PotatOS.DeviceDriver));
    PotatOS.DeviceDriverDisk = DeviceDriverDisk;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=deviceDriverDisk.js.map