module PotatOS {

    export class cpuScheduling {

        constructor(public quantum: number = 6,
                    public qCount: number = 0,
                    public runAll: boolean = false,
                    public schedule: string = 'Round Robin') {
        }

        public init(): void {
            this.quantum = 5;
            this.qCount = 0;
            this.runAll = false;
            this.schedule = 'Round Robin';
        }

        public nextProcess() {
            var previousProcess = _CPU.processIndex;
            _cpuScheduling.qCount = 0;
            _PCBList[_CPU.processIndex].state = 'READY';
            if (_CPU.processIndex == _PCBList.length - 1)
                _CPU.processIndex = 0;
            else
                _CPU.processIndex++;
            if (_PCBList[_CPU.processIndex].location == "HDD") {
                if (this.schedule == 'Round Robin') {
                    _krnDiskDriver.swap(_PCBList[previousProcess], _PCBList[_CPU.processIndex]);
                }
            }
            _Kernel.krnTrace('Scheduling switched to PID: ' + _PCBList[_CPU.processIndex].PID);
            _PCBList[_CPU.processIndex].state = 'RUNNING';
            _CPU.codeArray = _MM.read(_PCBList[_CPU.processIndex].base, _PCBList[_CPU.processIndex].limit);
            _CPU.updateCPU();
        }

        public endProcess() {
            if (_CPU.processIndex > _PCBList.length - 1)
                _CPU.processIndex = 0;
            _Kernel.krnTrace('Scheduling switched to PID: ' + _PCBList[_CPU.processIndex].PID);
            _cpuScheduling.qCount = 0;
            _CPU.codeArray = _MM.read(_PCBList[_CPU.processIndex].base, _PCBList[_CPU.processIndex].limit);
            _CPU.updateCPU();
            PotatOS.Control.updateMemoryDisplay();
            _StdOut.advanceLine();
        }
    }
}