var PotatOS;
(function (PotatOS) {
    var PCB = (function () {
        function PCB(PC, Acc, Xreg, Yreg, Zflag, segment, state, priority, runtime, waitTime) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (segment === void 0) { segment = 0; }
            if (state === void 0) { state = 'READY'; }
            if (priority === void 0) { priority = 0; }
            if (runtime === void 0) { runtime = 0; }
            if (waitTime === void 0) { waitTime = 0; }
        }
        return PCB;
    }());
    PotatOS.PCB = PCB;
})(PotatOS || (PotatOS = {}));
fewfwe;
