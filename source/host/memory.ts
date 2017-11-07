module PotatOS {

    export class Memory {

        constructor(public memory = Array()){}

        public init(): void {
            if (_Memory.memory.length != 0)
                _Memory.memory = Array();
            for(var i = 0; i < 768; i++) {
                this.memory.push('00');
            }
        }

    }

}