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
                    public IR = '',
                    public codeArray = new Array(),
                    public singleStep: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.processIndex = -1;
            this.IR = '';
            this.codeArray = [0,0,0];
            this.singleStep = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            if (this.isExecuting == true && this.PC <= this.codeArray.length - 1) {

                // Keeps track of turnaround and wait times
                for (var i = 0; i < _PCBList.length; i++) {
                    _PCBList[i].taTime++;
                    if (this.processIndex != i) {
                        _PCBList[i].waitTime++;
                    }
                }
                if (this.singleStep)
                    this.isExecuting = false;

                this.execute(_PCBList[this.processIndex]);
            }
            else
                this.terminate(_PCBList[this.processIndex]);

            this.updateProcess();
            PotatOS.Control.updateCPUDisplay();
            PotatOS.Control.updateProcessDisplay();


            // Handles Round-Robin Scheduling
            if (_cpuScheduling.runAll == true) {
                if (_cpuScheduling.schedule == 'rr') {
                    _cpuScheduling.qCount++;
                    if (_cpuScheduling.qCount > _cpuScheduling.quantum)
                        _cpuScheduling.nextProcess();
                }
                // THIS IS WHERE THE OTHER SCHEDULING ALGORITHMS WILL GO



                ////////////////////////////////////////////////////////
            }
            // It needed this for some reason
            else
                _cpuScheduling.runAll = false;
        }

        public execute(PCB: PCB): void {
            this.processIndex = _PCBList.indexOf(PCB);
            this.codeArray = _MM.read(PCB.base, PCB.limit);
            switch (this.codeArray[this.PC]) {
                case 'A9':
                    this.loadAccConst(this.codeArray[this.PC + 1]);
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
                    this.loadXConst(this.codeArray[this.PC + 1]);
                    break;
                case 'AE':
                    this.loadXMem();
                    break;
                case 'A0':
                    this.loadYConst(this.codeArray[this.PC + 1]);
                    break;
                case 'AC':
                    this.loadYMem();
                    break;
                case 'EA':
                    this.PC++;
                    break;
                case '00':
                    this.IR = '00';
                    this.terminate(_PCBList[this.processIndex]);
                    break;
                case 'EC':
                    this.compareByteX();
                    break;
                case 'D0':
                    this.branchZ(this.codeArray[this.PC + 1]);
                    break;
                case 'EE':
                    this.incrByte();
                    break;
                case 'FF':
                    this.sysCall();
                    break;
                default:
                    _StdOut.putText('OP code is invalid. Nice job. It was ' + this.codeArray[this.PC] + ' if you care ' +
                        'enough to fix it. Or don\'t. Doesn\'t matter to me.');
                    _StdOut.advanceLine();
                    this.terminate(_PCBList[this.processIndex]);
            }
        }

        public loadAccConst(constant: string) {
            this.PC += 2;
            this.Acc = parseInt(constant, 16);
            this.IR = 'A9';
        }

        // Grabs Little Endian Address and loads accumulator from it
        public loadAccMem() {
            var value = _Memory.memory[this.PC+2 + _PCBList[this.processIndex].base];
            value += _Memory.memory[this.PC+1 + _PCBList[this.processIndex].base];
            value = parseInt(value, 16) + _PCBList[this.processIndex].base;
            this.Acc = parseInt(_Memory.memory[value], 16);
            this.IR = 'AD';
            this.PC += 3;
        }

        // Grabs Little Endian Address and writes accumulator to it
        public writeAcc() {
            var addr = _Memory.memory[this.PC+2 + _PCBList[this.processIndex].base];
            addr += _Memory.memory[this.PC+1 + _PCBList[this.processIndex].base];
            addr = parseInt(addr, 16) + _PCBList[this.processIndex].base;
            var accVal = this.Acc.toString(16).toUpperCase();
            if (accVal.length != 2)
                accVal = '0' + accVal;
            _MM.writeAddr(addr, _PCBList[this.processIndex], accVal);
            this.IR = '8D';
            this.PC += 3;
        }

        // Grabs Little Endian Address and adds value of address to the accumulator
        public addAcc() {
            var value = _Memory.memory[this.PC+2 + _PCBList[this.processIndex].base];
            value += _Memory.memory[this.PC+1 + _PCBList[this.processIndex].base];
            value = parseInt(value, 16) + _PCBList[this.processIndex].base;
            this.Acc += parseInt(_Memory.memory[value], 16);
            this.IR = '6D';
            this.PC += 3;
        }

        public loadXConst(constant: string) {
            this.PC += 2;
            this.Xreg = parseInt(constant, 16);
            this.IR = 'A2';
        }

        public loadXMem() {
            var value = _Memory.memory[this.PC+2 + _PCBList[this.processIndex].base];
            value += _Memory.memory[this.PC+1 + _PCBList[this.processIndex].base];
            value = parseInt(value, 16) + _PCBList[this.processIndex].base;
            this.Xreg = parseInt(_Memory.memory[value], 16);
            this.IR = 'AE';
            this.PC += 3;
        }

        public loadYConst(constant: string) {
            this.PC += 2;
            this.Yreg = parseInt(constant, 16);
            this.IR = 'A0';
        }

        public loadYMem() {
            var value = _Memory.memory[this.PC+2 + _PCBList[this.processIndex].base];
            value += _Memory.memory[this.PC+1 + _PCBList[this.processIndex].base];
            value = parseInt(value, 16) + _PCBList[this.processIndex].base;
            this.Yreg = parseInt(_Memory.memory[value], 16);
            this.IR = 'AC';
            this.PC += 3;
        }

        // Ends process, removes it from the PCB List, and removes it from memory
        public terminate(pcb: PCB) {
            // Prints the finished PID along with the turnaround + wait times
            _StdOut.advanceLine();
            _StdOut.putText('PID: ' + pcb.PID + ' has ended.');
            _StdOut.advanceLine();
            _StdOut.putText('Turnaround Time: ' + pcb.taTime);
            _StdOut.advanceLine();
            _StdOut.putText('Wait Time: ' + pcb.waitTime);
            _StdOut.advanceLine();

            // Removes the terminated program from memory and the PCB List
            _MM.segment[pcb.segment] = 0;
            for (var i = pcb.base; i < _MM.getLimit(pcb.segment); i++) {
                _Memory.memory[i] = '00';
            }
            var terminatedIndex = _PCBList.indexOf(pcb);
            _PCBList.splice(terminatedIndex, 1);

            // Sets variables accordingly when there are no more programs left to run
            function finalTerminate() {
                _CPU.processIndex = -1;
                _CPU.singleStep = false;
                (<HTMLButtonElement>document.getElementById("btnStep")).disabled = true;
                _CPU.isExecuting = false;
                _CPU.codeArray = [0, 0, 0];
                PotatOS.Control.updateMemoryDisplay();
                _StdOut.advanceLine();
                _OsShell.putPrompt();
                _cpuScheduling.runAll = false;
            }

            if (_cpuScheduling.runAll == true) {
                // If there are no more processes in ready queue, then end everything
                if (_PCBList.length == 0) {
                    finalTerminate();
                }
                // Otherwise, move to next process and continue with regular scheduling
                else
                    _cpuScheduling.endProcess();
            }
            else {
                finalTerminate();
            }
        }

        public compareByteX() {
            var value = _Memory.memory[this.PC+2 + _PCBList[this.processIndex].base];
            value += _Memory.memory[this.PC+1 + _PCBList[this.processIndex].base];
            value = parseInt(value, 16) + _PCBList[this.processIndex].base;
            if (parseInt(_Memory.memory[value], 16) == this.Xreg)
                this.Zflag = 1;
            else
                this.Zflag = 0;
            this.IR = 'EC';
            this.PC += 3;
        }

        // Jumps the PC forward the desired amount of bytes
        public branchZ(constant: string) {
            if (this.Zflag == 0) {
                var bytes = parseInt(constant, 16);
                // Check to make sure the branch does not cause the process counter to exceed the the segment limit.
                // If it does, loop back to the base.
                if ((this.PC+2) + bytes + _PCBList[this.processIndex].base <= _MM.getLimit(_PCBList[this.processIndex].segment) - 1) {
                    this.PC += 2+bytes;
                }
                else {
                    var difference = (this.PC+2) + bytes + _PCBList[this.processIndex].base;
                    difference = difference - 256;
                    while (difference > _MM.getLimit(_PCBList[this.processIndex].segment) - 1) {
                        difference = difference - 256;
                    }
                    this.PC = difference - _PCBList[this.processIndex].base;
                }
            }
            else {
                this.PC += 2;
            }
            this.IR = 'D0';
        }

        // Increments the desired byte by 1 and saves it in memory
        public incrByte() {
            var addr =  _Memory.memory[this.PC+2 + _PCBList[this.processIndex].base];
            addr += _Memory.memory[this.PC+1 + _PCBList[this.processIndex].base];
            addr = parseInt(addr, 16) + _PCBList[this.processIndex].base;
            var memVal = parseInt(_Memory.memory[addr], 16) + 1;
            var memString = memVal.toString(16).toUpperCase();
            if (memString.length != 2)
                memString = '0' + memString;
            _MM.writeAddr(addr, _PCBList[this.processIndex], memString);
            this.IR = 'EE';
            this.PC += 3;
        }

        // Converts all hex after the yreg address to text if xreg == 2. Otherwise if xreg == 1, it just prints the
        // value of the yreg.
        public sysCall() {
            if (this.Xreg == 1) {
                _StdOut.putText(this.Yreg.toString());
                _StdOut.advanceLine();
            }
            else if (this.Xreg == 2) {
                var addr = this.Yreg + _PCBList[this.processIndex].base;
                var addrVal = _Memory.memory[addr];
                var str:string = '';
                while (addrVal != 0 && addr < 768) {
                    str += String.fromCharCode(parseInt(addrVal, 16));
                    addr++;
                    addrVal = _Memory.memory[addr];
                }
                _StdOut.putText(str);
                _StdOut.advanceLine();
            }
            else {
                _StdOut.putText('System Call Failed: Xreg does not equal 1 or 2.');
                _StdOut.advanceLine();
            }
            this.IR = 'FF';
            this.PC++;
        }

        public updateProcess() {
            if (this.processIndex != -1 && _PCBList[this.processIndex]) {
                _PCBList[this.processIndex].PC = _CPU.PC;
                _PCBList[this.processIndex].Acc = _CPU.Acc;
                _PCBList[this.processIndex].IR = _CPU.IR;
                _PCBList[this.processIndex].Xreg = _CPU.Xreg;
                _PCBList[this.processIndex].Yreg = _CPU.Yreg;
                _PCBList[this.processIndex].Zflag = _CPU.Zflag;
            }
        }

        public updateCPU() {
            this.PC = _PCBList[this.processIndex].PC;
            this.Acc = _PCBList[this.processIndex].Acc;
            this.IR = _PCBList[this.processIndex].IR;
            this.Xreg = _PCBList[this.processIndex].Xreg;
            this.Yreg = _PCBList[this.processIndex].Yreg;
            this.Zflag = _PCBList[this.processIndex].Zflag;
        }

    }
}
                   