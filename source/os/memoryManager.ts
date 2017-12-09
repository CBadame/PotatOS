module PotatOS {

    export class MM {

        // Keeps track of what segments of memory are still free
        public segment = [0,0,0];

        // Writes user program to memory
        public write(code: string, pcb: PCB): void {

            pcb.location = "Memory";

            var codeArray = code.split(" ");
            var pcbNum = _PCBList.indexOf(pcb);

            // Takes available segment of memory
            _PCBList[pcbNum].segment = this.checkMem();
            this.segment[_PCBList[pcbNum].segment] = 1;
            var arrayCount = 0;

            // Sets the PCB's base + limit, and writes the code to the given segment
            _PCBList[pcbNum].base = this.getBase(_PCBList[pcbNum].segment);
            _PCBList[pcbNum].limit = _PCBList[pcbNum].base + codeArray.length;
            for (var i = _PCBList[pcbNum].base; i < _PCBList[pcbNum].limit; i++) {
                _Memory.memory[i] = codeArray[arrayCount];
                arrayCount++;
            }
            PotatOS.Control.updateMemoryDisplay();
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

        // Get the limit address for a given segment
        public getLimit(segment: number) {
            if (segment == 0)
                return 255;
            else if (segment == 1)
                return 511;
            else if (segment == 2)
                return 767;
        }

        // Returns next available memory space
        public checkMem() {
            var availableSeg;
            for (var j = 0; j < this.segment.length; j++) {
                if (this.segment[j] == 0) {
                    availableSeg = j;
                    break;
                }
            }
            return availableSeg;
        }

        // Prepares the CPU for a new program to run
        public run(pcb: PCB) {
            _CPU.processIndex = _PCBList.indexOf(pcb);
            _CPU.isExecuting = true;
            _CPU.PC = pcb.PC;
            _CPU.Xreg = pcb.Xreg;
            _CPU.Yreg = pcb.Yreg;
            _CPU.Zflag = pcb.Zflag;
            _CPU.Acc = pcb.Acc;
            _PCBList[_CPU.processIndex].state = 'RUNNING';
        }


        // Writes to a specific area of memory for a process
        public writeAddr(addr: number, pcb: PCB, code: string): void {
            if (addr >= pcb.base && addr <= this.getLimit(pcb.segment)) {
                _Memory.memory[addr] = code;
                PotatOS.Control.updateMemoryDisplay();
            }
            else {
                _StdOut.putText('Memory access error. ');
                _CPU.terminate(pcb);
            }
        }

    }

}