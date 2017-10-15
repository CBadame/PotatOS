var PotatOS;
(function (PotatOS) {
    var PCB = (function () {
        function PCB(PC, Acc, Xreg, Yreg, Zflag, PID, IR, segment, base, limit, state, priority, runtime, waitTime) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (PID === void 0) { PID = _PIDCount++; }
            if (IR === void 0) { IR = ''; }
            if (segment === void 0) { segment = 0; }
            if (base === void 0) { base = _MM.base(segment); }
            if (limit === void 0) { limit = _MM.limit(segment); }
            if (state === void 0) { state = 'NEW'; }
            if (priority === void 0) { priority = 0; }
            if (runtime === void 0) { runtime = 0; }
            if (waitTime === void 0) { waitTime = 0; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.PID = PID;
            this.IR = IR;
            this.segment = segment;
            this.base = base;
            this.limit = limit;
            this.state = state;
            this.priority = priority;
            this.runtime = runtime;
            this.waitTime = waitTime;
        }
        return PCB;
    }());
    PotatOS.PCB = PCB;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=processControlBlock.js.map