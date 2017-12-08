module PotatOS {

    // Extends DeviceDriver
    export class DeviceDriverDisk extends DeviceDriver {

        constructor() {
            // Override the base method pointers.
            super();
            this.driverEntry = this.krnDiskDriverEntry;
        }

        public krnDiskDriverEntry() {
            // Initialization routine for this, the kernel-mode Disk Device Driver.
            this.status = "loaded";
            // More?
        }

        public createFile(fName: string) {
            var newData = "01";
            var tsb = '';
            var foundTsb = false;
            var pointerTsb = '';
            var newTsb = '';
            var hexName = '';

            // Find a block in the first track that is available
            for (var j = 0; j <= 7; j++) {
                for (var k = 0; k <= 7; k++) {
                    tsb = _DISK.makeTSB(0,j,k);
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
            // Find a block that can be pointed to from the first track
            else {
                    newTsb = _krnDiskDriver.findBlock();
                    newData += "0" + newTsb[0] + "0" + newTsb[2] + "0" + newTsb[4];
                    sessionStorage.setItem(newTsb, '01000000000000000000000000000000' +
                        '000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                        '000000000000000000');
            }

            // convert the file name to hex
            newData += _krnDiskDriver.toHex(fName);

            if (newTsb == "") {
                _StdOut.putText("Not enough free space in HDD to store the file contents...Huh");
            }
            // Fill the leftover space in the block with 0's
            else {
                newData = _krnDiskDriver.zeroFill(newData);
                sessionStorage.setItem(tsb, newData);
                _StdOut.putText("File '" + fName + "' created at " + tsb);
                _DISK.FileList.push([tsb, fName]);
                PotatOS.Control.updateHDDDisplay();
            }
        }

        public checkFile(fileName: string) {
            var fileTsb = "";
            for (var i = 0; i < _DISK.FileList.length; i++) {
                if (fileName == _DISK.FileList[i][1]) {
                    fileTsb = _DISK.FileList[i][0];
                    i = _DISK.FileList.length + 1;
                }
            }
            return fileTsb;
        }

        public findBlock() {
            var pointerTsb = '';
            for (var i = 1; i <= 3; i++) {
                for (var j = 0; j <= 7; j++) {
                    for (var k = 0; k <= 7; k++) {
                        pointerTsb = _DISK.makeTSB(i,j,k);
                        var pointerData = sessionStorage.getItem(pointerTsb);
                        if (pointerData[0] + pointerData[1] == '00') {
                            return pointerTsb;
                        }
                    }
                }
            }
            return pointerTsb;
        }

        public toHex(value: string) {
            var hexVal = '';
            for (var i = 0; i < value.length; i++) {
                var hex = value.charCodeAt(i).toString(16);
                if (hex.length == 1) {
                    hex = '0' + hex;
                }
                hexVal += hex;
            }
            return hexVal;
        }

        // Used to fill empty space in a block with zeroes
        public zeroFill(value: string) {
            var diff = 128 - value.length;
            for (var i = 0; i < diff; i++) {
                value += "0";
            }
            return value;
        }

        public write(tsb: string, fileData: string) {
            var data = sessionStorage.getItem(tsb);
            var newTsb = data[3] + ":" + data[5] + ":" + data[7];
            var newData = "01";
            var pointerTsb = _krnDiskDriver.findBlock();
            newData += "0" + pointerTsb[0] + "0" + pointerTsb[2] + "0" + pointerTsb[4];
            newData += _krnDiskDriver.toHex(fileData);

            // Break the data into multiple blocks if needed
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
                // If data does not fill an entire block, fill the empty space with zeroes
                newData = _krnDiskDriver.zeroFill(newData);
                newData = "01000000" + newData.substring(8, 127);
                sessionStorage.setItem(newTsb, newData);
                PotatOS.Control.updateHDDDisplay();
            }
        }

    }

}