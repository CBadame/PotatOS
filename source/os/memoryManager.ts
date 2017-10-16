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
            _PCBList[pcbNum].base = this.getBase(_PCBList[pcbNum].segment); _PCBList[pcbNum].limit = _PCBList[pcbNum].base + codeArray.length;
            for (var i = _PCBList[pcbNum].base; i < _PCBList[pcbNum].limit; i++) {
                _Memory.memory[i] = codeArray[arrayCount];
                arrayCount++;
            }
            _StdOut.putText('The process successfully loaded and has a PID of: ' + _PCBList[pcbNum].PID);
        }

        // Reads user program from memory
        public read(base: number, limit: number) {
            var codeArray = Array();
            for (var i = base; i < limit; i++)
                    codeArray.push(_Memory.memory[i]);
            return codeArray;
        }

        // Return base address for the given segment of memory
        public getBase(segment: number) {
            if (segment == 0)
                return 0;
            else if (segment == 1)
                return 256;
            else if (segment == 2)
                return 512;
        }

        public checkMem() {
            var availableSeg;
            for (var j = 0; j < this.segment.length; j++) {
                if (this.segment[j] == 0)
                    availableSeg = j;
            }
            return availableSeg;
        }

        public run(PCB: PCB) {
            _CPU.execute(PCB);
        }

        public readAddr(addr: number, pcb: PCB) {
            if (addr >= 0 && addr <= pcb.limit)
                return _Memory.memory[pcb.base + addr];
        }

        public writeAddr(addr: number, pcb: PCB, code: string): void {
            if (addr >= 0 && addr <= pcb.limit)
                _Memory.memory[pcb.base + addr] = code;
        }

    }

}