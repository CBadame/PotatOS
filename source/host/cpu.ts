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
                        this.writeAcc();
                        break;
                    case '6D':
                        this.addAcc();
                        break;
                    case 'A2':
                        this.loadXConst(codeArray[this.PC+1]);
                        break;
                    case 'AE':
                        this.loadXMem();
                        break;
                    case 'A0':
                        this.loadYConst(codeArray[this.PC+1]);
                        break;
                    case 'AC':
                        this.loadYMem();
                        break;
                    case 'EA':
                        this.PC++;
                        break;
                    case '00':
                        _CPU.isExecuting = false;
                        this.IR = '00';
                        this.terminate();
                        break;
                    case 'EC':
                        this.compareByteX();
                        break;
                    case 'D0':
                        this.branchZ(codeArray[this.PC+1]);
                        break;
                    case 'EE':
                        this.incrByte();
                        break;
                    case 'FF':
                        break;
                    case '0':
                        _CPU.isExecuting = false;
                        this.terminate();
                        break;
                    default:
                        _StdOut.putText('OP code is invalid. Nice job. It was ' + codeArray[this.PC] + ' if you care ' +
                            'enough to fix it. Or don\'t. Doesn\'t matter to me.');
                        this.isExecuting = false;
                        this.terminate();
                }
            }
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

        public writeAcc() {
            var addr = _MM.readAddr(this.PC+2, _PCBList[this.processIndex]);
            addr += _MM.readAddr(this.PC+1, _PCBList[this.processIndex]);
            addr = parseInt(addr, 16);
            var accVal = this.Acc.toString(16).toUpperCase();
            if (accVal.length != 2)
                accVal = '0' + accVal;
            _MM.writeAddr(addr, _PCBList[this.processIndex], accVal);
            this.IR = '8D';
            this.PC += 3;
        }

        public addAcc() {
            var value = _MM.readAddr(this.PC+2, _PCBList[this.processIndex]);
            value += _MM.readAddr(this.PC+1, _PCBList[this.processIndex]);
            value = parseInt(value, 16);
            this.Acc += parseInt(_MM.readAddr(value, _PCBList[this.processIndex]), 16);
            this.IR = '6D';
            this.PC += 3;
        }

        public loadXConst(constant: string) {
            this.PC += 2;
            this.Xreg = parseInt(constant, 16);
            this.IR = 'A2';
        }

        public loadXMem() {
            var value = _MM.readAddr(this.PC+2, _PCBList[this.processIndex]);
            value += _MM.readAddr(this.PC+1, _PCBList[this.processIndex]);
            value = parseInt(value, 16);
            this.Xreg = parseInt(_MM.readAddr(value, _PCBList[this.processIndex]), 16);
            this.IR = 'AE';
            this.PC += 3;
        }

        public loadYConst(constant: string) {
            this.PC += 2;
            this.Yreg = parseInt(constant, 16);
            this.IR = 'A0';
        }

        public loadYMem() {
            var value = _MM.readAddr(this.PC+2, _PCBList[this.processIndex]);
            value += _MM.readAddr(this.PC+1, _PCBList[this.processIndex]);
            value = parseInt(value, 16);
            this.Yreg = parseInt(_MM.readAddr(value, _PCBList[this.processIndex]), 16);
            this.IR = 'AC';
            this.PC += 3;
        }

        public terminate() {
            _StdOut.putText('PID: ' + _PCBList[this.processIndex].PID + ' has completed.');
            _MM.segment[_PCBList[this.processIndex].segment] = 0;
            _PCBList.splice(this.processIndex, 1);
            this.processIndex = 0;
        }

        public compareByteX() {
            var value = _MM.readAddr(this.PC+2, _PCBList[this.processIndex]);
            value += _MM.readAddr(this.PC+1, _PCBList[this.processIndex]);
            value = parseInt(value, 16);
            if (parseInt(_MM.readAddr(value, _PCBList[this.processIndex]), 16) == this.Xreg)
                this.Zflag = 1;
            else
                this.Zflag = 0;
            this.IR = 'EC';
            this.PC += 3;
        }

        public branchZ(constant: string) {
            if (this.Zflag == 0) {
                var bytes = parseInt(constant, 16);
                // Check to make sure the branch does not cause the process counter to exceed the the segment limit.
                // If it does, loop back to the base.
                if (this.PC + bytes <= _PCBList[this.processIndex].limit)
                    this.PC += bytes;
                else {
                    var difference = this.PC + bytes;
                    difference -= _PCBList[this.processIndex].limit;
                    this.PC = difference - 1;
                }
            }
            this.IR = 'D0';
        }

        public incrByte() {
            var addr = _MM.readAddr(this.PC+2, _PCBList[this.processIndex]);
            addr += _MM.readAddr(this.PC+1, _PCBList[this.processIndex]);
            addr = parseInt(addr, 16);
            var memVal = parseInt(_Memory.memory[addr], 16) + 1;
            var memString = memVal.toString(16).toUpperCase();
            if (memString.length != 2)
                memString = '0' + memString;
            _MM.writeAddr(addr, _PCBList[this.processIndex], memString);
            this.IR = 'EE';
            this.PC += 3;
        }

        public sysCall() {
            if (this.Xreg == 1)
                _StdOut.putText(this.Yreg.toString());
            else if (this.Xreg == 2) {
                var addr = this.Yreg;
                var addrVal = _MM.readAddr(addr, _PCBList[this.processIndex]);
                var result = parseInt(addrVal, 16);
                while (parseInt(addrVal, 16) != 0) {
                    
                }
            }
            this.PC++;
        }

    }
}
