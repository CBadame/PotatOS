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
            _Memory = new PotatOS.Memory();
            _Memory.init();
            _MM = new PotatOS.MM();
            _PCB = new PotatOS.PCB();
            _CPU = new PotatOS.Cpu();
            _CPU.init();
            _cpuScheduling = new PotatOS.cpuScheduling();
            _cpuScheduling.init();
            _DISK = new PotatOS.Disk();
            _DISK.init();
            _hardwareClockID = setInterval(PotatOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            _Kernel = new PotatOS.Kernel();
            _Kernel.krnBootstrap();
            PotatOS.Control.updateMemoryDisplay();
            PotatOS.Control.updateCPUDisplay();
            PotatOS.Control.updateProcessDisplay();
            PotatOS.Control.updateHDDDisplay();
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
            var hexPC = _CPU.PC.toString(16).toUpperCase();
            if (hexPC.length < 2)
                hexPC = '0' + hexPC;
            var str = '<tr style="border-collapse:collapse; border-bottom:1px solid black;">' +
                '<td style="border-collapse:collapse; width:23px; background-color:white">PC</td>' +
                '<td style="border-collapse:collapse; width:27px; background-color:white">AC</td>' +
                '<td style="border-collapse:collapse; width:23px; background-color:white">IR</td>' +
                '<td style="border-collapse:collapse; width:27px; background-color:white">X</td>' +
                '<td style="border-collapse:collapse; width:27px; background-color:white">Y</td>' +
                '<td style="border-collapse:collapse; background-color:white">Z</td></tr>';
            str += '<tr><td>' + hexPC + '</td><td>' + _CPU.Acc + '</td><td>' + displayIR + '</td><td>' + _CPU.Xreg +
                '</td><td>' + _CPU.Yreg + '</td><td>' + _CPU.Zflag + '</td></tr>';
            document.getElementById("tbCPU").innerHTML = str;
            document.getElementById("tbCPU").setAttribute("style", "width: auto; height: auto;");
        };
        Control.updateMemoryDisplay = function () {
            var str = '';
            var count = 0;
            var byteCount = 0;
            while (count < _Memory.memory.length) {
                if (count < 10)
                    str += '<tr><td style="border-right: 1px solid darkgrey;">0x00' + count.toString() + '</td>';
                else if (count >= 10 && count < 100)
                    str += '<tr><td style="border-right: 1px solid darkgrey;">0x0' + count.toString() + '</td>';
                else
                    str += '<tr><td style="border-right: 1px solid darkgrey;">0x' + count.toString() + '</td>';
                while (byteCount < 8) {
                    str += '<td style="border-bottom: 1px solid darkgrey;">' + _Memory.memory[count] + '</td>';
                    byteCount++;
                    count++;
                }
                str += '</tr>';
                byteCount = 0;
            }
            document.getElementById("tbMemory").innerHTML = str;
            document.getElementById("tbMemory").setAttribute("style", "width: auto;");
        };
        Control.updateProcessDisplay = function () {
            var str = '<tr style="border-collapse:collapse; border-bottom:1px solid black;">' +
                '<td style="border-collapse:collapse; width:23px;">PID</td>' +
                '<td style="border-collapse:collapse; width:23px;">PC</td>' +
                '<td style="border-collapse:collapse; width:27px;">AC</td>' +
                '<td style="border-collapse:collapse; width:23px;">IR</td>' +
                '<td style="border-collapse:collapse; width:27px;">X</td>' +
                '<td style="border-collapse:collapse; width:27px;">Y</td>' +
                '<td style="border-collapse:collapse; width:27px;">Z</td>' +
                '<td style="border-collapse:collapse; width:75px;">State</td>' +
                '<td style="border-collapse:collapse;">Segment</td></tr>';
            document.getElementById("tbPCB").setAttribute("style", "width: auto; height: auto; margin-right: auto");
            var i = 0;
            while (i < _PCBList.length) {
                var hexPC = _PCBList[i].PC.toString(16).toUpperCase();
                if (hexPC.length < 2) {
                    hexPC = '0' + hexPC;
                }
                var segment;
                if (_PCBList[i].segment == -1) {
                    segment = "HDD";
                }
                else {
                    segment = _PCBList[i].segment;
                }
                str += '<tr><td>' + _PCBList[i].PID + '</td><td>' + hexPC + '</td><td>' + _PCBList[i].Acc +
                    '</td><td>' + _PCBList[i].IR + '</td><td>' + _PCBList[i].Xreg + '</td><td>' + _PCBList[i].Yreg +
                    '</td><td>' + _PCBList[i].Zflag + '</td><td>' + _PCBList[i].state + '</td><td>' +
                    segment + '</td>';
                i++;
            }
            document.getElementById("tbPCB").innerHTML = str;
        };
        Control.updateHDDDisplay = function () {
            var str = '';
            for (var i = 0; i <= 3; i++) {
                for (var j = 0; j <= 7; j++) {
                    for (var k = 0; k <= 7; k++) {
                        var tsb = _DISK.makeTSB(i, j, k);
                        str += '<tr><td style="border-right: 1px solid darkgrey;">' + tsb +
                            '</td><td style="border-bottom: 1px solid darkgrey;">' +
                            sessionStorage.getItem(tsb) + '</td></tr>';
                    }
                }
            }
            document.getElementById("tbHDD").innerHTML = str;
            document.getElementById("tbHDD").setAttribute("style", "width: auto;");
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