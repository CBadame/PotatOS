var PotatOS;
(function (PotatOS) {
    var Control = (function () {
        function Control() {
        }
        Control.hostInit = function () {
            _Canvas = document.getElementById('display');
            _DrawingContext = _Canvas.getContext("2d");
            PotatOS.CanvasTextFunctions.enable(_DrawingContext);
            document.getElementById("taHostLog").value = "";
            document.getElementById("btnStartOS").focus();
            PotatOS.Utils.currentDate();
            setInterval(function () { PotatOS.Utils.currentDate(); }, 1000);
            if (typeof Glados === "function") {
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        };
        Control.hostLog = function (msg, source) {
            if (source === void 0) { source = "?"; }
            var clock = _OSclock;
            var now = new Date().getTime();
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
        };
        Control.hostBtnStartOS_click = function (btn) {
            btn.disabled = true;
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            document.getElementById("btnSingleStep").disabled = false;
            document.getElementById("display").focus();
            _CPU = new PotatOS.Cpu();
            _CPU.init();
            _hardwareClockID = setInterval(PotatOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            _Kernel = new PotatOS.Kernel();
            _Kernel.krnBootstrap();
            _Memory = new PotatOS.Memory();
            _Memory.init();
            _MM = new PotatOS.MM();
            _PCB = new PotatOS.PCB();
        };
        Control.hostBtnHaltOS_click = function (btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            _Kernel.krnShutdown();
            clearInterval(_hardwareClockID);
        };
        Control.hostBtnReset_click = function (btn) {
            location.reload(true);
        };
        Control.updateCPUDisplay = function () {
        };
        Control.updateMemoryDisplay = function () {
        };
        Control.updateProcessDisplay = function () {
        };
        Control.singleStep_click = function (btn) {
            if (_CPU.singleStep) {
                document.getElementById("btnStep").disabled = true;
                _CPU.singleStep = false;
                _CPU.isExecuting = true;
            }
            else {
                if (_CPU.isExecuting) {
                    document.getElementById("btnStep").disabled = false;
                    _CPU.singleStep = true;
                }
            }
        };
        Control.step_click = function (btn) {
            if (_CPU.codeArray != [0, 0, 0]) {
                console.log(_CPU.singleStep);
                _CPU.isExecuting = true;
            }
        };
        return Control;
    }());
    PotatOS.Control = Control;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=control.js.map