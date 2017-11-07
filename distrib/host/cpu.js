var PotatOS;
(function (PotatOS) {
    var Cpu = (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting, processIndex, IR, codeArray, singleStep) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (processIndex === void 0) { processIndex = 0; }
            if (IR === void 0) { IR = ''; }
            if (codeArray === void 0) { codeArray = new Array(); }
            if (singleStep === void 0) { singleStep = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.processIndex = processIndex;
            this.IR = IR;
            this.codeArray = codeArray;
            this.singleStep = singleStep;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.processIndex = -1;
            this.IR = '';
            this.codeArray = [0, 0, 0];
            this.singleStep = false;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            console.log('Running process: ' + _PCBList[this.processIndex].PID);
            if (this.isExecuting == true && this.PC <= this.codeArray.length - 1) {
                if (this.PC >= _MM.getLimit(_PCBList[this.processIndex].PID)) {
                    _StdOut.putText('Memory out of bounds.');
                    _OsShell.shellKill(_PCBList[this.processIndex]);
                }
                else {
                    this.execute(_PCBList[this.processIndex]);
                    if (this.singleStep)
                        this.isExecuting = false;
                }
            }
            else
                this.terminate(_PCBList[this.processIndex]);
            this.updateProcess();
            PotatOS.Control.updateCPUDisplay();
            PotatOS.Control.updateProcessDisplay();
            if (_cpuScheduling.runAll == true) {
                _cpuScheduling.qCount++;
                if (_cpuScheduling.qCount > _cpuScheduling.quantum)
                    _cpuScheduling.nextProcess();
            }
            else
                _cpuScheduling.runAll = false;
        };
        Cpu.prototype.execute = function (PCB) {
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
        };
        Cpu.prototype.loadAccConst = function (constant) {
            this.PC += 2;
            this.Acc = parseInt(constant, 16);
            this.IR = 'A9';
        };
        Cpu.prototype.loadAccMem = function () {
            var value = _Memory.memory[this.PC + 2 + _PCBList[this.processIndex].base];
            value += _Memory.memory[this.PC + 1 + _PCBList[this.processIndex].base];
            value = parseInt(value, 16) + _PCBList[this.processIndex].base;
            this.Acc = parseInt(_Memory.memory[value], 16);
            this.IR = 'AD';
            this.PC += 3;
        };
        Cpu.prototype.writeAcc = function () {
            var addr = _Memory.memory[this.PC + 2 + _PCBList[this.processIndex].base];
            addr += _Memory.memory[this.PC + 1 + _PCBList[this.processIndex].base];
            addr = parseInt(addr, 16) + _PCBList[this.processIndex].base;
            var accVal = this.Acc.toString(16).toUpperCase();
            if (accVal.length != 2)
                accVal = '0' + accVal;
            _MM.writeAddr(addr, _PCBList[this.processIndex], accVal);
            this.IR = '8D';
            this.PC += 3;
        };
        Cpu.prototype.addAcc = function () {
            var value = _Memory.memory[this.PC + 2 + _PCBList[this.processIndex].base];
            value += _Memory.memory[this.PC + 1 + _PCBList[this.processIndex].base];
            value = parseInt(value, 16) + _PCBList[this.processIndex].base;
            this.Acc += parseInt(_Memory.memory[value], 16);
            this.IR = '6D';
            this.PC += 3;
        };
        Cpu.prototype.loadXConst = function (constant) {
            this.PC += 2;
            this.Xreg = parseInt(constant, 16);
            this.IR = 'A2';
        };
        Cpu.prototype.loadXMem = function () {
            var value = _Memory.memory[this.PC + 2 + _PCBList[this.processIndex].base];
            value += _Memory.memory[this.PC + 1 + _PCBList[this.processIndex].base];
            value = parseInt(value, 16) + _PCBList[this.processIndex].base;
            this.Xreg = parseInt(_Memory.memory[value], 16);
            this.IR = 'AE';
            this.PC += 3;
        };
        Cpu.prototype.loadYConst = function (constant) {
            this.PC += 2;
            this.Yreg = parseInt(constant, 16);
            this.IR = 'A0';
        };
        Cpu.prototype.loadYMem = function () {
            var value = _Memory.memory[this.PC + 2 + _PCBList[this.processIndex].base];
            value += _Memory.memory[this.PC + 1 + _PCBList[this.processIndex].base];
            value = parseInt(value, 16) + _PCBList[this.processIndex].base;
            this.Yreg = parseInt(_Memory.memory[value], 16);
            this.IR = 'AC';
            this.PC += 3;
        };
        Cpu.prototype.terminate = function (pcb) {
            _StdOut.putText('PID: ' + pcb.PID + ' has ended.');
            _MM.segment[pcb.segment] = 0;
            for (var i = pcb.base; i < _MM.getLimit(pcb.segment); i++) {
                _Memory.memory[i] = '00';
            }
            var terminatedIndex = _PCBList.indexOf(pcb);
            console.log('Terminated process: ' + _PCBList[terminatedIndex].PID);
            _PCBList.splice(terminatedIndex, 1);
            function finalTerminate() {
                _CPU.processIndex = -1;
                _CPU.singleStep = false;
                document.getElementById("btnStep").disabled = true;
                _CPU.isExecuting = false;
                _CPU.codeArray = [0, 0, 0];
                PotatOS.Control.updateMemoryDisplay();
                _StdOut.advanceLine();
                _OsShell.putPrompt();
                _cpuScheduling.runAll = false;
            }
            if (_cpuScheduling.runAll == true) {
                if (_PCBList.length == 0) {
                    finalTerminate();
                }
                else
                    _cpuScheduling.endProcess();
            }
            else {
                finalTerminate();
            }
        };
        Cpu.prototype.compareByteX = function () {
            var value = _Memory.memory[this.PC + 2 + _PCBList[this.processIndex].base];
            value += _Memory.memory[this.PC + 1 + _PCBList[this.processIndex].base];
            value = parseInt(value, 16) + _PCBList[this.processIndex].base;
            if (parseInt(_Memory.memory[value], 16) == this.Xreg)
                this.Zflag = 1;
            else
                this.Zflag = 0;
            this.IR = 'EC';
            this.PC += 3;
        };
        Cpu.prototype.branchZ = function (constant) {
            if (this.Zflag == 0) {
                var bytes = parseInt(constant, 16);
                if ((this.PC + 2) + bytes + _PCBList[this.processIndex].base <= _MM.getLimit(_PCBList[this.processIndex].segment) - 1) {
                    this.PC += 2 + bytes;
                }
                else {
                    var difference = (this.PC + 2) + bytes + _PCBList[this.processIndex].base;
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
        };
        Cpu.prototype.incrByte = function () {
            var addr = _Memory.memory[this.PC + 2 + _PCBList[this.processIndex].base];
            addr += _Memory.memory[this.PC + 1 + _PCBList[this.processIndex].base];
            addr = parseInt(addr, 16) + _PCBList[this.processIndex].base;
            var memVal = parseInt(_Memory.memory[addr], 16) + 1;
            var memString = memVal.toString(16).toUpperCase();
            if (memString.length != 2)
                memString = '0' + memString;
            _MM.writeAddr(addr, _PCBList[this.processIndex], memString);
            this.IR = 'EE';
            this.PC += 3;
        };
        Cpu.prototype.sysCall = function () {
            if (this.Xreg == 1) {
                _StdOut.putText(this.Yreg.toString());
                _StdOut.advanceLine();
            }
            else if (this.Xreg == 2) {
                var addr = this.Yreg + _PCBList[this.processIndex].base;
                var addrVal = _Memory.memory[addr];
                var str = '';
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
        };
        Cpu.prototype.updateProcess = function () {
            if (this.processIndex != -1 && _PCBList[this.processIndex]) {
                _PCBList[this.processIndex].PC = _CPU.PC;
                _PCBList[this.processIndex].Acc = _CPU.Acc;
                _PCBList[this.processIndex].IR = _CPU.IR;
                _PCBList[this.processIndex].Xreg = _CPU.Xreg;
                _PCBList[this.processIndex].Yreg = _CPU.Yreg;
                _PCBList[this.processIndex].Zflag = _CPU.Zflag;
            }
        };
        Cpu.prototype.updateCPU = function () {
            this.PC = _PCBList[this.processIndex].PC;
            this.Acc = _PCBList[this.processIndex].Acc;
            this.IR = _PCBList[this.processIndex].IR;
            this.Xreg = _PCBList[this.processIndex].Xreg;
            this.Yreg = _PCBList[this.processIndex].Yreg;
            this.Zflag = _PCBList[this.processIndex].Zflag;
        };
        return Cpu;
    }());
    PotatOS.Cpu = Cpu;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=cpu.js.map