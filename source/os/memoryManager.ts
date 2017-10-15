module PotatOS {

    export class MM {

        // Keeps track of what segments of memory are still free
        public segment = -1;

        // Writes user program to memory
        public write(code: string, pcb): void {
            var codeArray = code.split(" ");
            if (this.segment < 2) {
                this.segment++;
                var arrayCount = 0;
                for (var i = this.base(this.segment); i < this.limit(this.segment); i++) {
                    _Memory.memory[i] = codeArray[arrayCount];
                    arrayCount++;
                    console.log(_Memory.memory[i]);
                    if (i == codeArray.length + (this.base(this.segment) - 1)) {
                        i++;
                        _Memory.memory[i] = 'Done';
                        console.log(_Memory.memory[i]);
                        break;
                    }
                }
                _StdOut.putText('The process successfully loaded and has a PID of: ' + pcb.PID);
            }
            else
                _StdOut.putText('No more free memory.');
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
    }

}