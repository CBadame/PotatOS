///<reference path="../globals.ts" />

/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module PotatOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false,
                    public processIndex = 0,
                    public IR = '') {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.processIndex = 0;
            this.IR = '';
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
        }

        public execute(PCB: PCB): void {
            this.processIndex = _PCBList.indexOf(PCB);
            console.log(PCB.base + ' ' + PCB.limit);
            var codeArray = _MM.read(PCB.base, PCB.limit);
            _CPU.isExecuting = true;
            while (_CPU.isExecuting == true && this.PC <= codeArray.length - 1) {
                switch (codeArray[this.PC]) {
                    case 'A9':
                        this.loadAccConst(codeArray[this.PC+1]);
                        break;
                    case 'AD':
                        this.loadAccMem();
                        break;
                    case '8D':
                        break;
                    case '6D':
                        break;
                    case 'A2':
                        break;
                    case 'AE':
                        break;
                    case 'A0':
                        break;
                    case 'AC':
                        break;
                    case 'EA':
                        break;
                    case '00':
                        break;
                    case 'EC':
                        break;
                    case 'D0':
                        break;
                    case 'EE':
                        break;
                    case 'FF':
                        break;
                    case '0':
                        _CPU.isExecuting = false;
                        break;
                    default:
                        _StdOut.putText('OP code is invalid. Nice job. It was ' + codeArray[this.PC] + ' if you care ' +
                            'enough to fix it. Or don\'t. Doesn\'t matter to me.');
                        this.PC++;
                }
            }
            _CPU.isExecuting = false;
        }

        public loadAccConst(constant: string) {
            this.PC += 2;
            this.Acc = parseInt(constant, 16);
            this.IR = 'A9';
        }

        public loadAccMem() {
            var value = _MM.readAddr(this.PC+2, _PCBList[this.processIndex]);
            value += _MM.readAddr(this.PC+1, _PCBList[this.processIndex]);
            value = parseInt(value, 16);
            this.Acc = parseInt(_MM.readAddr(value, _PCBList[this.processIndex]), 16);
            this.IR = 'AD';
            this.PC += 3;
        }

    }
}
