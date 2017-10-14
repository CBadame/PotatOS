var PotatOS;
(function (PotatOS) {
    var Process = (function () {
        function Process(PID, PC, Acc, Xreg, Yreg, Zflag, segment, state, priority, runtime) {
            if (PID === void 0) { PID = 0; }
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (segment === void 0) { segment = 0; }
            if (state === void 0) { state = 'READY'; }
            if (priority === void 0) { priority = 0; }
            if (runtime === void 0) { runtime = 0; }
            this.PID = PID;
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.segment = segment;
            this.state = state;
            this.priority = priority;
            this.runtime = runtime;
        }
        Process.prototype.init = function () {
            this.PID = 0;
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.segment = 0;
            this.state = 'READY';
            this.priority = 0;
            this.runtime = 0;
        };
        return Process;
    }());
    PotatOS.Process = Process;
    var PCB = (function () {
        function PCB(processes) {
            if (processes === void 0) { processes = Array(); }
            this.processes = processes;
            this.processes = processes;
        }
        return PCB;
    }());
    PotatOS.PCB = PCB;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=processControlBlock.js.map