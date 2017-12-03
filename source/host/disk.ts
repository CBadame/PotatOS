module PotatOS {

    export class Disk {

        constructor(){
            this.init();
        }

        public init(): void {
            for (var i = 0; i < 2; i++) {
                for (var j = 0; j < 7; j++) {
                    for (var k = 0; k < 7; k++) {
                        sessionStorage.setItem(_DISK.makeTSB(i,j,k), "000000000000000000000000000000000" +
                            "000000000000000000000000000000000000000000000000000000000");
                    }
                }
            }
        }

        public static makeTSB(t: number, s: number, b: number): string {
            var tsb = t.toString() + ":" + s.toString() + ":" + b.toString();
            return tsb;
        }

    }

}