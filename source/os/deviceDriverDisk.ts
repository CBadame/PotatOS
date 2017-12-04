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
            var foundPointer = false;
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
                for (var i = 1; i <= 3; i++) {
                    for (var j = 0; j <= 7; j++) {
                        for (var k = 0; k <= 7; k++) {
                            pointerTsb = _DISK.makeTSB(i,j,k);
                            var pointerData = sessionStorage.getItem(pointerTsb);
                            if (pointerData[0] + pointerData[1] == '00') {
                                foundPointer = true;
                                newData += "0" + i.toString() + "0" + j.toString() + "0" + k.toString();
                                sessionStorage.setItem(_DISK.makeTSB(i,j,k), '01000000000000000000000000000000' +
                                    '000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                                    '000000000000000000');
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

        }
    }

}