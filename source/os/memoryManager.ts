module PotatOS {

    export class MM {

        // Keeps track of what segments of memory are still free
        public segment = [0,0,0];

        // Writes user program to memory
        public write(code: string, pcb: PCB): void {

            var codeArray = code.split(" ");
            var pcbNum = _PCBList.indexOf(pcb);

            // Takes available segment of memory
            _PCBList[pcbNum].segment = this.checkMem();
            this.segment[_PCBList[pcbNum].segment] = 1;
            var arrayCount = 0;

            // Sets the PCB's base + limit, and writes the code to the given segment
            _PCBList[pcbNum].base = this.base(_PCBList[pcbNum].segment); _PCBList[pcbNum].limit = this.limit(_PCBList[pcbNum].segment);
            for (var i = _PCBList[pcbNum].base; i < _PCBList[pcbNum].limit; i++) {
                _Memory.memory[i] = codeArray[arrayCount];
                arrayCount++;
                if (i == codeArray.length + (_PCBList[pcbNum].base) - 1){
                    i++;
                    _Memory.memory[i] = 'Done';
                    break;
                }
            }
            _StdOut.putText('The process successfully loaded and has a PID of: ' + pcbNum);
        }

        // Reads user program from memory
        public read(segment: number) {
            var codeArray = Array();
            for (var i = this.base(segment); i < this.limit(segment); i++) {
                if (_Memory.memory[i] != "Done")
                    codeArray.push(_Memory.memory[i]);
                else
                    break;
            }
            return codeArray;
        }

        // Return base address for the given segment of memory
        public base(segment: number) {
            if (segment == 0)
                return 0;
            else if (segment == 1)
                return 256;
            else if (segment == 2)
                return 512;
        }

        // Return limit address for the given segment of memory
        public limit(segment: number) {
            if (segment == 0)
                return 256;
            else if (segment == 1)
                return 512;
            else if (segment == 2)
                return 768;
        }

        public checkMem() {
            var avaialbeSeg;
            for (var j = 0; j < this.segment.length; j++) {
                if (this.segment[j] == 0)
                    avaialbeSeg = j;
            }
            return avaialbeSeg;
        }

        public run(PCB) {
            
        }

    }

}