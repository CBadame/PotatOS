module PotatOS {

    export class MM {

        static write(code: string, segment: number): void {
            var codeArray = code.split(" ");
            for (var i = this.base(segment); i < this.limit(segment); i++) {
                _Memory.memory[i] = codeArray[i];
                if (i == codeArray.length - 1) {
                    i++;
                    _Memory.memory[i] = 'Done';
                    break;
                }
            }
        }

        static read(segment: number): void {
            var codeArray = Array();
            for (var i = this.base(segment); i < this.limit(segment); i++) {
                if (_Memory.memory[i] != "Done")
                    codeArray.push(_Memory.memory[i]);
                else
                    break;
            }
        }

        // Return base address for the given segment of memory
        static base(segment: number) {
            if (segment == 0)
                return 0;
            else if (segment == 1)
                return 256;
            else if (segment == 2)
                return 512;
        }

        // Return limit address for the given segment of memory
        static limit(segment: number) {
            if (segment == 0)
                return 256;
            else if (segment == 1)
                return 512;
            else if (segment == 2)
                return 768;
        }
    }

}