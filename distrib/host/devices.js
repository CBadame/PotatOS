var PotatOS;
(function (PotatOS) {
    var Devices = (function () {
        function Devices() {
            _hardwareClockID = -1;
        }
        Devices.hostClockPulse = function () {
            _OSclock++;
            _Kernel.krnOnCPUClockPulse();
        };
        Devices.hostEnableKeyboardInterrupt = function () {
            document.addEventListener("keydown", Devices.hostOnKeypress, false);
        };
        Devices.hostDisableKeyboardInterrupt = function () {
            document.removeEventListener("keydown", Devices.hostOnKeypress, false);
        };
        Devices.hostOnKeypress = function (event) {
            if (event.target.id === "display") {
                event.preventDefault();
                var params = new Array(event.which, event.shiftKey);
                _KernelInterruptQueue.enqueue(new PotatOS.Interrupt(KEYBOARD_IRQ, params));
            }
        };
        return Devices;
    }());
    PotatOS.Devices = Devices;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=devices.js.map