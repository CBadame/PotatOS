var PotatOS;
(function (PotatOS) {
    var cpuScheduling = (function () {
        function cpuScheduling(quantum, qCount, runAll, schedule) {
            if (quantum === void 0) { quantum = 6; }
            if (qCount === void 0) { qCount = 0; }
            if (runAll === void 0) { runAll = false; }
            if (schedule === void 0) { schedule = 'rr'; }
            this.quantum = quantum;
            this.qCount = qCount;
            this.runAll = runAll;
            this.schedule = schedule;
        }
        cpuScheduling.prototype.init = function () {
            this.quantum = 5;
            this.qCount = 0;
            this.runAll = false;
            this.schedule = 'rr';
        };
        cpuScheduling.prototype.nextProcess = function () {
            var previousProcess = _CPU.processIndex;
            _cpuScheduling.qCount = 0;
            _PCBList[_CPU.processIndex].state = 'READY';
            if (_CPU.processIndex == _PCBList.length - 1)
                _CPU.processIndex = 0;
            else
                _CPU.processIndex++;
            if (_PCBList[_CPU.processIndex].location == "HDD") {
                if (this.schedule == 'rr') {
                    _krnDiskDriver.swap(_PCBList[previousProcess], _PCBList[_CPU.processIndex]);
                }
                else if (this.schedule == 'fcfs') {
                    var tsb = _krnDiskDriver.checkFile(_PCBList[_CPU.processIndex].PID.toString());
                    _MM.write(_krnDiskDriver.read(tsb), _PCBList[_CPU.processIndex]);
                    _krnDiskDriver["delete"](tsb);
                }
                else if (this.schedule == 'priority') {
                    _CPU.processIndex = this.findPriority();
                    var tsb = _krnDiskDriver.checkFile(_PCBList[_CPU.processIndex].PID.toString());
                    _MM.write(_krnDiskDriver.read(tsb), _PCBList[_CPU.processIndex]);
                    _krnDiskDriver["delete"](tsb);
                }
            }
            _Kernel.krnTrace('Scheduling switched to PID: ' + _PCBList[_CPU.processIndex].PID);
            _PCBList[_CPU.processIndex].state = 'RUNNING';
            _CPU.codeArray = _MM.read(_PCBList[_CPU.processIndex].base, _PCBList[_CPU.processIndex].limit);
            _CPU.updateCPU();
        };
        cpuScheduling.prototype.endProcess = function () {
            if (_CPU.processIndex > _PCBList.length - 1)
                _CPU.processIndex = 0;
            if (this.schedule == 'priority') {
                _CPU.processIndex = this.findPriority();
                _PCBList[_CPU.processIndex].state = 'RUNNING';
            }
            if (_PCBList[_CPU.processIndex].location == "HDD") {
                var tsb = _krnDiskDriver.checkFile(_PCBList[_CPU.processIndex].PID.toString());
                _MM.write(_krnDiskDriver.read(tsb), _PCBList[_CPU.processIndex]);
                _krnDiskDriver["delete"](tsb);
            }
            console.log("nextProcess: " + _PCBList[_CPU.processIndex].PID + ", priority: " + _PCBList[_CPU.processIndex].priority);
            _Kernel.krnTrace('Scheduling switched to PID: ' + _PCBList[_CPU.processIndex].PID);
            _cpuScheduling.qCount = 0;
            _CPU.codeArray = _MM.read(_PCBList[_CPU.processIndex].base, _PCBList[_CPU.processIndex].limit);
            _CPU.updateCPU();
            PotatOS.Control.updateMemoryDisplay();
            _StdOut.advanceLine();
        };
        cpuScheduling.prototype.findPriority = function () {
            var nextProcess = 0;
            for (var i = 0; i < _PCBList.length; i++) {
                if (_PCBList[i].priority < _PCBList[nextProcess].priority) {
                    nextProcess = i;
                }
            }
            return nextProcess;
        };
        return cpuScheduling;
    }());
    PotatOS.cpuScheduling = cpuScheduling;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=cpuScheduling.js.map