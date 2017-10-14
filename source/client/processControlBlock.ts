module PotatOS {

    export class Process {

        constructor ( public PID: number = 0,
                      public PC: number = 0,
                      public Acc: number = 0,
                      public Xreg: number = 0,
                      public Yreg: number = 0,
                      public Zflag: number = 0,
                      public segment: number = 0,
                      public state: string = 'READY',
                      public priority: number = 0,
                      public runtime: number = 0){
        }

        public init(): void {
            this.PID = 0;
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.segment = 0;
            this.state = 'READY';
            this.priority = 0;
            this.runtime = 0;
        }
    }

    export class PCB {

        constructor (public processes = Array()) {
            this.processes = processes;
        }
    }

}