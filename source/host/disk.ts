module PotatOS {

    export class Disk {

        constructor(){
        }

        // Initializes a blank HDD
        public init(): void {
            for (var i = 0; i <= 3; i++) {
                for (var j = 0; j <= 7; j++) {
                    for (var k = 0; k <= 7; k++) {
                        sessionStorage.setItem(_DISK.makeTSB(i,j,k), "0000000000000000000000000000000000000000" +
                            "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
                    }
                }
            }
            // Set the active flag for the mbr so that no one can write to it
            sessionStorage.setItem('0:0:0', '0100000000000000000000000000000000000000' +
            '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000');
        }

        // Converts three numbers to a tsb
        public makeTSB(t: number, s: number, b: number): string {
            var tsb = t.toString() + ":" + s.toString() + ":" + b.toString();
            return tsb;
        }

        // Checks if the given tsb is marked active
        public inUse(tsb: string) {
            var tsbValue: string = sessionStorage.getItem(tsb);
            if (tsbValue[0] + tsbValue[1] == "00") {
                return false;
            }
            if (tsbValue[0] + tsbValue[1] == "01") {
                return true;
            }
        }

        // Gets the next tsb that is being pointed to
        public getTSB(tsb: string) {
            var tsbValue: string = sessionStorage.getItem(tsb);
            var nextTrack: number = parseInt(tsbValue[2] + tsbValue[3], 16);
            var nextSector: number = parseInt(tsbValue[4] + tsbValue[5], 16);
            var nextBlock: number = parseInt(tsbValue[6] + tsbValue[7], 16);
            var nextTSB: string = nextTrack.toString() + ":" + nextSector.toString() + ":" + nextBlock.toString();
            return nextTSB;
        }

    }

}