module PotatOS {

    export class PCB {

        constructor ( public PC: number = 0,
                      public Acc: number = 0,
                      public Xreg: number = 0,
                      public Yreg: number = 0,
                      public Zflag: number = 0,
                      public PID: number = _PIDCount++,
                      public IR: string = '',
                      public segment: number = 0,
                      public base: number = _MM.base(segment),
                      public limit: number = _MM.limit(segment),
                      public state: string = 'NEW',
                      public priority: number = 0,
                      public runtime: number = 0,
                      public waitTime: number = 0){
        }

    }

}