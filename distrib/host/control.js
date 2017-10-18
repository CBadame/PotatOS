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
            PotatOS.Control.updateMemoryDisplay();
            PotatOS.Control.updateCPUDisplay();
            PotatOS.Control.updateProcessDisplay();
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
            var displayIR = '00';
            if (_CPU.IR != '')
                displayIR = _CPU.IR;
            var str = '<tr><td>PC</td><td>AC</td><td>IR</td><td>X</td><td>Y</td><td>Z</td></tr>';
            str += '<tr><td>' + _CPU.PC + '</td><td>' + _CPU.Acc + '</td><td>' + displayIR + '</td><td>' + _CPU.Xreg +
                '</td><td>' + _CPU.Yreg + '</td><td>' + _CPU.Zflag + '</td></tr>';
            document.getElementById("tbCPU").innerHTML = str;
        };
        Control.updateMemoryDisplay = function () {
            var str = '';
            var count = 0;
            var byteCount = 0;
            while (count < _Memory.memory.length) {
                if (count < 10)
                    str += '<tr><td>0x00' + count.toString() + '</td>';
                else if (count >= 10 && count < 100)
                    str += '<tr><td>0x0' + count.toString() + '</td>';
                else
                    str += '<tr><td>0x' + count.toString() + '</td>';
                while (byteCount < 8) {
                    str += '<td>' + _Memory.memory[count] + '</td>';
                    byteCount++;
                    count++;
                }
                str += '</tr>';
                byteCount = 0;
            }
            document.getElementById("tbMemory").innerHTML = str;
        };
        Control.updateProcessDisplay = function () {
            var str = '<tr><td>PID</td><td>PC</td><td>AC</td><td>IR</td><td>X</td><td>Y</td><td>Z</td>' +
                '<td>State</td><td>Segment</td></tr>';
            var i = 0;
            while (i < _PCBList.length) {
                str += '<tr><td>' + _PCBList[i].PID + '</td><td>' + _PCBList[i].PC + '</td><td>' + _PCBList[i].Acc +
                    '</td><td>' + _PCBList[i].IR + '</td><td>' + _PCBList[i].Xreg + '</td><td>' + _PCBList[i].Yreg +
                    '</td><td>' + _PCBList[i].Zflag + '</td><td>' + _PCBList[i].state + '</td><td>' +
                    _PCBList[i].segment + '</td><td>';
                i++;
            }
            document.getElementById("tbPCB").innerHTML = str;
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
                _CPU.isExecuting = true;
            }
        };
        return Control;
    }());
    PotatOS.Control = Control;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=control.js.map