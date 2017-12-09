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

        public write(tsb: string, fileData: string) {
            var data = sessionStorage.getItem(tsb);
            var newTsb = data[3] + ":" + data[5] + ":" + data[7];
            var newData = "01";
            var pointerTsb = _krnDiskDriver.findBlock();
            newData += "0" + pointerTsb[0] + "0" + pointerTsb[2] + "0" + pointerTsb[4];
            newData += _krnDiskDriver.toHex(fileData);
            console.log(newData);

            // Break the data into multiple blocks if needed
            if (newData.length > 128) {
                var diffData = newData.slice(128, newData.length);
                var diffString = '';
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
            for (var i = 0; i < tsbList.length - 1; i++) {
                data = sessionStorage.getItem(tsbList[i]);
                output += data.slice(8, 128);
            }
            data = sessionStorage.getItem(tsbList[tsbList.length - 1]);

            // Append final block of data to output
            for (var i = 8; i < data.length; i++) {
                if (data[i] + data[i+1] == "00") {
                    i = 200;
                }
                else {
                    output += data[i] + data[i+1];
                }
                i++;
            }

            // Convert hex to string
            var outputText = "";
            for (var i = 0; i < output.length; i++) {
                outputText += String.fromCharCode(parseInt(output[i] + output[i + 1], 16));
                i++;
            }

            _StdOut.putText(outputText);
        }

        // Works similarly to the read() function, but deletes each block instead of printing them
        public delete(tsb: string) {
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

    }

}