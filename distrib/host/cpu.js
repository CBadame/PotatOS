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
        };
        Cpu.prototype.execute = function (PCB) {
            this.processIndex = _PCBList.indexOf(PCB);
            console.log(PCB.base + ' ' + PCB.limit);
            var codeArray = _MM.read(PCB.base, PCB.limit);
            _CPU.isExecuting = true;
            while (_CPU.isExecuting == true && this.PC <= codeArray.length - 1) {
                switch (codeArray[this.PC]) {
                    case 'A9':
                        this.loadAccConst(codeArray[this.PC + 1]);
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
        return Cpu;
    }());
    PotatOS.Cpu = Cpu;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=cpu.js.map