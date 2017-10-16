var PotatOS;
(function (PotatOS) {
    var Cpu = (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting, processIndex, IR) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (processIndex === void 0) { processIndex = 0; }
            if (IR === void 0) { IR = ''; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.processIndex = processIndex;
            this.IR = IR;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.processIndex = 0;
            this.IR = '';
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            if (this.isExecuting)
                this.execute(_PCBList[this.processIndex]);
        };
        Cpu.prototype.execute = function (PCB) {
            this.processIndex = _PCBList.indexOf(PCB);
            var codeArray = _MM.read(PCB.base, PCB.limit);
            _CPU.isExecuting = true;
            console.log(codeArray);
            console.log(this.PC);
            switch (codeArray[this.PC]) {
                case 'A9':
                    this.loadAccConst(codeArray[this.PC + 1]);
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
                    this.loadXConst(codeArray[this.PC + 1]);
                    break;
                case 'AE':
                    this.loadXMem();
                    break;
                case 'A0':
                    this.loadYConst(codeArray[this.PC + 1]);
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
                    this.branchZ(codeArray[this.PC + 1]);
                    break;
                case 'EE':
                    this.incrByte();
                    break;
                case 'FF':
                    this.sysCall();
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
            console.log(_PCBList);
            this.isExecuting = false;
            this.terminate();
        };
        Cpu.prototype.loadAccConst = function (constant) {
            this.PC += 2;
            this.Acc = parseInt(constant, 16);
            this.IR = 'A9';
        };
        Cpu.prototype.loadAccMem = function () {
            var value = _MM.readAddr(this.PC + 2, _PCBList[this.processIndex]);
            value += _MM.readAddr(this.PC + 1, _PCBList[this.processIndex]);
            value = parseInt(value, 16);
            this.Acc = parseInt(_MM.readAddr(value, _PCBList[this.processIndex]), 16);
            this.IR = 'AD';
            this.PC += 3;
        };
        Cpu.prototype.writeAcc = function () {
            var addr = _MM.readAddr(this.PC + 2, _PCBList[this.processIndex]);
            addr += _MM.readAddr(this.PC + 1, _PCBList[this.processIndex]);
            addr = parseInt(addr, 16);
            var accVal = this.Acc.toString(16).toUpperCase();
            if (accVal.length != 2)
                accVal = '0' + accVal;
            _MM.writeAddr(addr, _PCBList[this.processIndex], accVal);
            this.IR = '8D';
            this.PC += 3;
        };
        Cpu.prototype.addAcc = function () {
            var value = _MM.readAddr(this.PC + 2, _PCBList[this.processIndex]);
            value += _MM.readAddr(this.PC + 1, _PCBList[this.processIndex]);
            value = parseInt(value, 16);
            this.Acc += parseInt(_MM.readAddr(value, _PCBList[this.processIndex]), 16);
            this.IR = '6D';
            this.PC += 3;
        };
        Cpu.prototype.loadXConst = function (constant) {
            this.PC += 2;
            this.Xreg = parseInt(constant, 16);
            this.IR = 'A2';
        };
        Cpu.prototype.loadXMem = function () {
            var value = _MM.readAddr(this.PC + 2, _PCBList[this.processIndex]);
            value += _MM.readAddr(this.PC + 1, _PCBList[this.processIndex]);
            value = parseInt(value, 16);
            this.Xreg = parseInt(_MM.readAddr(value, _PCBList[this.processIndex]), 16);
            this.IR = 'AE';
            this.PC += 3;
        };
        Cpu.prototype.loadYConst = function (constant) {
            this.PC += 2;
            this.Yreg = parseInt(constant, 16);
            this.IR = 'A0';
        };
        Cpu.prototype.loadYMem = function () {
            var value = _MM.readAddr(this.PC + 2, _PCBList[this.processIndex]);
            value += _MM.readAddr(this.PC + 1, _PCBList[this.processIndex]);
            value = parseInt(value, 16);
            this.Yreg = parseInt(_MM.readAddr(value, _PCBList[this.processIndex]), 16);
            this.IR = 'AC';
            this.PC += 3;
        };
        Cpu.prototype.terminate = function () {
            _StdOut.putText('PID: ' + _PCBList[this.processIndex].PID + ' has completed.');
            _MM.segment[_PCBList[this.processIndex].segment] = 0;
            for (var i = 0; i < (_PCBList[this.processIndex].limit - _PCBList[this.processIndex].base); i++)
                _Memory.memory.push(0);
            _PCBList.splice(this.processIndex, 1);
            this.processIndex = 0;
        };
        Cpu.prototype.compareByteX = function () {
            var value = _MM.readAddr(this.PC + 2, _PCBList[this.processIndex]);
            value += _MM.readAddr(this.PC + 1, _PCBList[this.processIndex]);
            value = parseInt(value, 16);
            if (parseInt(_MM.readAddr(value, _PCBList[this.processIndex]), 16) == this.Xreg)
                this.Zflag = 1;
            else
                this.Zflag = 0;
            this.IR = 'EC';
            this.PC += 3;
        };
        Cpu.prototype.branchZ = function (constant) {
            if (this.Zflag == 0) {
                var bytes = parseInt(constant, 16);
                if (this.PC + bytes <= _PCBList[this.processIndex].limit)
                    this.PC += bytes;
                else {
                    var difference = this.PC + bytes;
                    difference -= _PCBList[this.processIndex].limit;
                    this.PC = difference - 1;
                }
            }
            this.IR = 'D0';
        };
        Cpu.prototype.incrByte = function () {
            var addr = _MM.readAddr(this.PC + 2, _PCBList[this.processIndex]);
            addr += _MM.readAddr(this.PC + 1, _PCBList[this.processIndex]);
            addr = parseInt(addr, 16);
            var memVal = parseInt(_Memory.memory[addr], 16) + 1;
            var memString = memVal.toString(16).toUpperCase();
            if (memString.length != 2)
                memString = '0' + memString;
            _MM.writeAddr(addr, _PCBList[this.processIndex], memString);
            this.IR = 'EE';
            this.PC += 3;
        };
        Cpu.prototype.sysCall = function () {
            if (this.Xreg == 1)
                _StdOut.putText(this.Yreg.toString());
            else if (this.Xreg == 2) {
                var addr = this.Yreg;
                var addrVal = _MM.readAddr(addr, _PCBList[this.processIndex]);
                addr++;
                while (parseInt(_MM.readAddr(addr, _PCBList[this.processIndex]), 16) != 0) {
                    addrVal += _MM.readAddr(addr, _PCBList[this.processIndex]);
                    addr++;
                }
                _StdOut.putText(addrVal.toString());
            }
            else
                _StdOut.putText('Xreg does not equal 1 or 2.');
            this.IR = 'FF';
            this.PC++;
        };
        return Cpu;
    }());
    PotatOS.Cpu = Cpu;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=cpu.js.map