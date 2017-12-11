module PotatOS {

    export class cpuScheduling {

        constructor(public quantum: number = 6,
                    public qCount: number = 0,
                    public runAll: boolean = false,
                    public schedule: string = 'rr') {
        }

        public init(): void {
            this.quantum = 5;
            this.qCount = 0;
            this.runAll = false;
            this.schedule = 'rr';
        }

        public nextProcess() {
            var previousProcess = _CPU.processIndex;
            _cpuScheduling.qCount = 0;
            _PCBList[_CPU.processIndex].state = 'READY';

            // Jump back to the start of the PCB list if the index is out of bounds
            if (_CPU.processIndex == _PCBList.length - 1)
                _CPU.processIndex = 0;
            else
                _CPU.processIndex++;

            // Swap process into memory if it is located in the HDD
            if (_PCBList[_CPU.processIndex].location == "HDD") {
                if (this.schedule == 'rr') {
                    _krnDiskDriver.swap(_PCBList[previousProcess], _PCBList[_CPU.processIndex]);
                }
                else if (this.schedule == 'fcfs') {
                    var tsb = _krnDiskDriver.checkFile(_PCBList[_CPU.processIndex].PID.toString());
                    _MM.write(_krnDiskDriver.read(tsb), _PCBList[_CPU.processIndex]);
                    _krnDiskDriver.delete(tsb);
                }
                else if (this.schedule == 'priority') {
                    _CPU.processIndex = this.findPriority();
                    var tsb = _krnDiskDriver.checkFile(_PCBList[_CPU.processIndex].PID.toString());
                    _MM.write(_krnDiskDriver.read(tsb), _PCBList[_CPU.processIndex]);
                    _krnDiskDriver.delete(tsb);
                }
            }
            _Kernel.krnTrace('Scheduling switched to PID: ' + _PCBList[_CPU.processIndex].PID);
            _PCBList[_CPU.processIndex].state = 'RUNNING';
            _CPU.codeArray = _MM.read(_PCBList[_CPU.processIndex].base, _PCBList[_CPU.processIndex].limit);
            _CPU.updateCPU();
        }

        public endProcess() {
            // Jump back to the start of the PCB list if the index is out of bounds
            if (_CPU.processIndex > _PCBList.length - 1)
                _CPU.processIndex = 0;

            // Changes index to next highest priority process if scheduler is set to priority
            if (this.schedule == 'priority') {
                _CPU.processIndex = this.findPriority();
                _PCBList[_CPU.processIndex].state = 'RUNNING';
            }

            // Swap process into memory if it isn't already
            if (_PCBList[_CPU.processIndex].location == "HDD") {
                var tsb = _krnDiskDriver.checkFile(_PCBList[_CPU.processIndex].PID.toString());
                _MM.write(_krnDiskDriver.read(tsb), _PCBList[_CPU.processIndex]);
                _krnDiskDriver.delete(tsb);
            }
            console.log("nextProcess: " + _PCBList[_CPU.processIndex].PID + ", priority: " + _PCBList[_CPU.processIndex].priority);
            _Kernel.krnTrace('Scheduling switched to PID: ' + _PCBList[_CPU.processIndex].PID);
            _cpuScheduling.qCount = 0;
            _CPU.codeArray = _MM.read(_PCBList[_CPU.processIndex].base, _PCBList[_CPU.processIndex].limit);
            _CPU.updateCPU();
            PotatOS.Control.updateMemoryDisplay();
            _StdOut.advanceLine();
        }

        public findPriority() {
            var nextProcess = 0;
            for (var i = 0; i < _PCBList.length; i++) {
                if (_PCBList[i].priority < _PCBList[nextProcess].priority) {
                    nextProcess = i;
                }
            }
            return nextProcess;
        }
    }
}