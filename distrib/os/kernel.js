var PotatOS;
(function (PotatOS) {
    var Kernel = (function () {
        function Kernel() {
        }
        Kernel.prototype.krnBootstrap = function () {
            PotatOS.Control.hostLog("bootstrap", "host");
            _KernelInterruptQueue = new PotatOS.Queue();
            _KernelBuffers = new Array();
            _KernelInputQueue = new PotatOS.Queue();
            _Console = new PotatOS.Console();
            _Console.init();
            _StdIn = _Console;
            _StdOut = _Console;
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new PotatOS.DeviceDriverKeyboard();
            _krnKeyboardDriver.driverEntry();
            this.krnTrace(_krnKeyboardDriver.status);
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new PotatOS.Shell();
            _OsShell.init();
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        };
        Kernel.prototype.krnShutdown = function () {
            this.krnTrace("begin shutdown OS");
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            this.krnTrace("end shutdown OS");
        };
        Kernel.prototype.krnOnCPUClockPulse = function () {
            if (_KernelInterruptQueue.getSize() > 0) {
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            }
            else if (_CPU.isExecuting) {
                _CPU.cycle();
            }
            else {
                this.krnTrace("Idle");
            }
        };
        Kernel.prototype.krnEnableInterrupts = function () {
            PotatOS.Devices.hostEnableKeyboardInterrupt();
        };
        Kernel.prototype.krnDisableInterrupts = function () {
            PotatOS.Devices.hostDisableKeyboardInterrupt();
        };
        Kernel.prototype.krnInterruptHandler = function (irq, params) {
            this.krnTrace("Handling IRQ~" + irq);
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);
                    _StdIn.handleInput();
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        };
        Kernel.prototype.krnTimerISR = function () {
        };
        Kernel.prototype.krnTrace = function (msg) {
            if (_Trace) {
                if (msg === "Idle") {
                    if (_OSclock % 10 == 0) {
                        PotatOS.Control.hostLog(msg, "OS");
                    }
                }
                else {
                    PotatOS.Control.hostLog(msg, "OS");
                }
            }
        };
        Kernel.prototype.krnTrapError = function (msg) {
            PotatOS.Control.hostLog("OS ERROR - TRAP: " + msg);
            _StdOut.putText('It looks like you broke something...way to go.');
            document.getElementById('display').style.backgroundColor = '#0000FF';
            this.krnShutdown();
        };
        return Kernel;
    }());
    PotatOS.Kernel = Kernel;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=kernel.js.map