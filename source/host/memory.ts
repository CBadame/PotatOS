module PotatOS {

    export class Memory {

        constructor(public memory = Array()){}

        public init(): void {
            for(var i = 0; i < 768; i++) {
                this.memory.push(0);
            }
        }

        public write(code: string): void {
            var codeArray = code.split(" ");
            for (var i = 0; i < 256; i++) {
                this.memory[i] = codeArray[i];
                if (i == codeArray.length - 1) {
                    i++;
                    this.memory[i] = 'Done';
                    break;
                }
            }
        }

        public read(): void {
            var codeArray = Array();
            for (var i = 0; i < 256; i++) {
                if (this.memory[i] != "Done")
                    codeArray.push(this.memory[i]);
                else
                    break;
            }
        }

    }


}