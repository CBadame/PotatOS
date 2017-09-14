/* ------------
   Interrupt.ts
   ------------ */
var PotatOS;
(function (PotatOS) {
    var Interrupt = (function () {
        function Interrupt(irq, params) {
            this.irq = irq;
            this.params = params;
        }
        return Interrupt;
    })();
    PotatOS.Interrupt = Interrupt;
})(PotatOS || (PotatOS = {}));
