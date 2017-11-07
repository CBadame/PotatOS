var PotatOS;
(function (PotatOS) {
    var cpuScheduling = (function () {
        function cpuScheduling(quantum, qCount, runAll) {
            if (quantum === void 0) { quantum = 6; }
            if (qCount === void 0) { qCount = 0; }
            if (runAll === void 0) { runAll = false; }
            this.quantum = quantum;
            this.qCount = qCount;
            this.runAll = runAll;
        }
        cpuScheduling.prototype.init = function () {
            this.quantum = 5;
            this.qCount = 0;
            this.runAll = false;
        };
        cpuScheduling.prototype.nextProcess = function () {
            _cpuScheduling.qCount = 0;
            _PCBList[_CPU.processIndex].state = 'READY';
            if (_CPU.processIndex == _PCBList.length - 1)
                _CPU.processIndex = 0;
            else
                _CPU.processIndex++;
            _PCBList[_CPU.processIndex].state = 'RUNNING';
            _CPU.codeArray = _MM.read(_PCBList[_CPU.processIndex].base, _PCBList[_CPU.processIndex].limit);
            _CPU.updateCPU();
        };
        cpuScheduling.prototype.endProcess = function () {
            if (_CPU.processIndex > _PCBList.length - 1)
                _CPU.processIndex = 0;
            _cpuScheduling.qCount = 0;
            _CPU.codeArray = _MM.read(_PCBList[_CPU.processIndex].base, _PCBList[_CPU.processIndex].limit);
            _CPU.updateCPU();
            PotatOS.Control.updateMemoryDisplay();
            _StdOut.advanceLine();
        };
        return cpuScheduling;
    }());
    PotatOS.cpuScheduling = cpuScheduling;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=cpuScheduling.js.map