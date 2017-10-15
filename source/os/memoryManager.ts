module PotatOS {

    export class MM {

        //Get OP Codes from Memory
        public getCode(segment: number) {
            return _Memory.read(segment);
        }
        

        // Return base address for the given segment of memory
        public base(segment: number) {
            if (segment == 0)
                return 0;
            else if (segment == 1)
                return 256;
            else if (segment == 2)
                return 512;
        }

        // Return limit address for the given segment of memory
        public limit(segment: number) {
            if (segment == 0)
                return 256;
            else if (segment == 1)
                return 512;
            else if (segment == 2)
                return 768;
        }
    }

}