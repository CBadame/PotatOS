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
                _StdOut.put("No available storage space. I'm not sure how this happened...");
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
                _DISK.FileList.push([tsb, fName]);
                PotatOS.Control.updateHDDDisplay();
                return tsb;
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
            var diff = 127 - value.length;
            for (var i = 0; i < diff; i++) {
                value += "0";
            }
            return value;
        };
        DeviceDriverDisk.prototype.write = function (tsb, inputData) {
            var fileData = '';
            for (var i = 0; i < inputData.length - 1; i++) {
                fileData += inputData[i].toString();
                if (inputData[i].length == 2) {
                    fileData += " ";
                }
            }
            fileData += inputData[inputData.length - 1].toString();
            var data = sessionStorage.getItem(tsb);
            var newTsb = data[3] + ":" + data[5] + ":" + data[7];
            var newData = "01";
            var pointerTsb = _krnDiskDriver.findBlock();
            newData += "0" + pointerTsb[0] + "0" + pointerTsb[2] + "0" + pointerTsb[4];
            sessionStorage.setItem(pointerTsb, '0100000000000000000000000000000000000000' +
                '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000');
            newData += _krnDiskDriver.toHex(fileData);
            if (newData.length > 128) {
                var diffData = newData.slice(128, newData.length);
                var diffString = '';
                for (var i = 0; i < diffData.length; i++) {
                    diffString += String.fromCharCode(parseInt(diffData[i] + diffData[i + 1], 16));
                    i++;
                }
                newData = newData.slice(0, 128);
                sessionStorage.setItem(newTsb, newData);
                _krnDiskDriver.write(newTsb, diffString);
            }
            else {
                newData = "01000000" + newData.slice(8, newData.length);
                sessionStorage.setItem(pointerTsb, '0000000000000000000000000000000000000000' +
                    '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000');
                newData = _krnDiskDriver.zeroFill(newData);
                sessionStorage.setItem(newTsb, newData);
                PotatOS.Control.updateHDDDisplay();
            }
        };
        DeviceDriverDisk.prototype.read = function (tsb) {
            var data = sessionStorage.getItem(tsb);
            var output = "";
            var tsbList = new Array();
            var nextTsb = data[3] + ":" + data[5] + ":" + data[7];
            while (nextTsb != "0:0:0") {
                tsbList.push(nextTsb);
                data = sessionStorage.getItem(nextTsb);
                nextTsb = data[3] + ":" + data[5] + ":" + data[7];
            }
            for (var i = 0; i < tsbList.length; i++) {
                data = sessionStorage.getItem(tsbList[i]);
                output += data.slice(8, 128);
            }
            var outputText = "";
            for (var i = 0; i < output.length; i++) {
                outputText += String.fromCharCode(parseInt(output[i] + output[i + 1], 16));
                i++;
            }
            return outputText;
        };
        DeviceDriverDisk.prototype["delete"] = function (tsb) {
            for (var i = 0; i < _DISK.FileList.length; i++) {
                if (_DISK.FileList[i][0] == tsb) {
                    _DISK.FileList.splice(i, 1);
                }
            }
            var data = sessionStorage.getItem(tsb);
            var output = "";
            var tsbList = new Array();
            var nextTsb = data[3] + ":" + data[5] + ":" + data[7];
            sessionStorage.setItem(tsb, "0000000000000000000000000000000000000000" +
                "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
            while (nextTsb != "0:0:0") {
                tsbList.push(nextTsb);
                data = sessionStorage.getItem(nextTsb);
                nextTsb = data[3] + ":" + data[5] + ":" + data[7];
            }
            for (var i = 0; i < tsbList.length; i++) {
                data = sessionStorage.setItem(tsbList[i], "0000000000000000000000000000000000000000" +
                    "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
            }
            PotatOS.Control.updateHDDDisplay();
        };
        DeviceDriverDisk.prototype.format = function () {
            _DISK.init();
            _DISK.FileList = new Array();
            for (var i = 0; i < _PCBList.length; i++) {
                if (_PCBList[i].location == "HDD") {
                    _PCBList.splice(i, 1);
                }
            }
            PotatOS.Control.updateProcessDisplay();
            PotatOS.Control.updateHDDDisplay();
        };
        DeviceDriverDisk.prototype.swap = function (pcbMem, pcbDisk) {
            pcbDisk.segment = pcbMem.segment;
            var newTsb = _krnDiskDriver.createFile(pcbMem.PID.toString());
            _krnDiskDriver.write(newTsb, _MM.read(pcbMem.base, pcbMem.limit));
            for (var i = pcbMem.base; i < _MM.getLimit(pcbMem.segment); i++) {
                _Memory.memory[i] = '00';
            }
            _MM.segment[pcbMem.segment] = 0;
            pcbMem.base = -1;
            pcbMem.limit = -1;
            pcbMem.segment = -1;
            pcbMem.location = "HDD";
            var tsb = _krnDiskDriver.checkFile(pcbDisk.PID.toString());
            _MM.write(_krnDiskDriver.read(tsb), pcbDisk);
            _krnDiskDriver["delete"](tsb);
        };
        DeviceDriverDisk.prototype.deleteContents = function (tsb) {
            var data = sessionStorage.getItem(tsb);
            var tsbList = new Array();
            var nextTsb = data[3] + ":" + data[5] + ":" + data[7];
            while (nextTsb != "0:0:0") {
                tsbList.push(nextTsb);
                data = sessionStorage.getItem(nextTsb);
                nextTsb = data[3] + ":" + data[5] + ":" + data[7];
            }
            for (var i = 0; i < tsbList.length; i++) {
                sessionStorage.setItem(tsbList[i], "0100000000000000000000000000000000000000" +
                    "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
            }
            PotatOS.Control.updateHDDDisplay();
        };
        return DeviceDriverDisk;
    }(PotatOS.DeviceDriver));
    PotatOS.DeviceDriverDisk = DeviceDriverDisk;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=deviceDriverDisk.js.map