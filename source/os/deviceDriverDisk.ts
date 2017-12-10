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
                _StdOut.put("No available storage space. I'm not sure how this happened...");
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
                _DISK.FileList.push([tsb, fName]);
                PotatOS.Control.updateHDDDisplay();
                return tsb;
            }
        }

        // Checks to see if a file with the given name exists
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

        // Finds the next free block in the HDD
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

        // Does as the name describes
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
            var diff = 127 - value.length;
            for (var i = 0; i < diff; i++) {
                value += "0";
            }
            return value;
        }

        public write(tsb: string, inputData) {

            // Convert input into a string in case an array is passed in
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

            // Break the data into multiple blocks if needed
            if (newData.length > 128) {
                var diffData = newData.slice(128, newData.length);
                var diffString = '';

                // Convert input data back to string from hex for recursive call
                for (var i = 0; i < diffData.length; i++) {
                    diffString += String.fromCharCode(parseInt(diffData[i] + diffData[i + 1], 16));
                    i++;
                }

                // Write the first 128 nibbles and then call write() on the rest
                newData = newData.slice(0, 128);
                sessionStorage.setItem(newTsb, newData);
                _krnDiskDriver.write(newTsb, diffString);
            }
            else {
                // If data does not fill an entire block, fill the empty space with zeroes
                newData = "01000000" + newData.slice(8, newData.length);
                sessionStorage.setItem(pointerTsb, '0000000000000000000000000000000000000000' +
                    '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000');
                newData = _krnDiskDriver.zeroFill(newData);
                sessionStorage.setItem(newTsb, newData);
                PotatOS.Control.updateHDDDisplay();
            }
        }

        public read(tsb: string) {
            var data = sessionStorage.getItem(tsb);
            var output = "";
            var tsbList = new Array();
            var nextTsb = data[3] + ":" + data[5] + ":" + data[7];
            // Store each tsb associated with file data in a list
            while (nextTsb != "0:0:0") {
                tsbList.push(nextTsb);
                data = sessionStorage.getItem(nextTsb);
                nextTsb = data[3] + ":" + data[5] + ":" + data[7];
            }
            // Append the file data for each block to
            for (var i = 0; i < tsbList.length; i++) {
                data = sessionStorage.getItem(tsbList[i]);
                output += data.slice(8, 128);
            }

            // Convert hex to string
            var outputText = "";
            for (var i = 0; i < output.length; i++) {
                outputText += String.fromCharCode(parseInt(output[i] + output[i + 1], 16));
                i++;
            }

            return outputText;
        }

        // Works similarly to the read() function, but deletes each block instead of printing them
        public delete(tsb: string) {
            // Removes the file from file list
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
            // Store each tsb associated with file data in a list
            while (nextTsb != "0:0:0") {
                tsbList.push(nextTsb);
                data = sessionStorage.getItem(nextTsb);
                nextTsb = data[3] + ":" + data[5] + ":" + data[7];
            }
            for (var i = 0; i < tsbList.length; i++) {
                data = sessionStorage.setItem(tsbList[i],"0000000000000000000000000000000000000000" +
                    "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
            }
            PotatOS.Control.updateHDDDisplay();
        }

        public format() {
            _DISK.init();
            _DISK.FileList = new Array();
            for (var i = 0; i < _PCBList.length; i++) {
                if (_PCBList[i].location == "HDD") {
                    _PCBList.splice(i, 1);
                }
            }
            PotatOS.Control.updateProcessDisplay();
            PotatOS.Control.updateHDDDisplay();
        }

        public swap(pcbMem: PCB, pcbDisk: PCB) {
            // Move the first process out of memory and write it to disk
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


            // Move the second process out of disk and into memory
            var tsb = _krnDiskDriver.checkFile(pcbDisk.PID.toString());
            _MM.write(_krnDiskDriver.read(tsb), pcbDisk);
            _krnDiskDriver.delete(tsb);

        }

    }

}