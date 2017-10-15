module PotatOS {

    export class Memory {

        constructor(public memory = Array()){}

        public init(): void {
            for(var i = 0; i < 768; i++) {
                this.memory.push(0);
            }
        }

    }

}