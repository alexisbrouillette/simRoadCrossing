import { roads, width } from "./sketch";

interface Fence{
    x: number;
    y: number;
    width: number;
    height: number;
    color: number[];
}

interface pipe{
    x: number;
    y: number;
    width: number;
    height: number;
    color: number[];
}


export class ADN{
    pipeGroups:  pipe[][] = [];
    fences: Fence[] = [];

    constructor(maxPipes: number, maxFences: number, maxFenceLength: number){
        this.generateFences(maxFences, maxFenceLength);
        this.generatePipeGroups(maxPipes);
    }

    private chooseRandomIndex(array: any[]): number{
        return Math.floor(Math.random() * array.length);
    }

    private generatePipeGroups(maxPipes: number): void {
        const road = roads[0]; // to update
        const pipeGroups = [];
        //check possible gaps between the fences
        const possibleGaps = [];
        for(let i = 0; i < this.fences.length - 1; i++){
            if(this.fences[i+1].x - this.fences[i].x - this.fences[i].width > 20){
                possibleGaps.push([this.fences[i].x + this.fences[i].width, this.fences[i+1].x]);
            }
        }
        //add the gap between the last fence and the edge of the screen
        if(width - this.fences[this.fences.length - 1].x - this.fences[this.fences.length - 1].width > 20)
            possibleGaps.push([this.fences[this.fences.length - 1].x + this.fences[this.fences.length - 1].width, width]);
        //add the gap between the first fence and the edge of the screen
        if(this.fences[0].x > 20)
            possibleGaps.push([0, this.fences[0].x]);
        //generate pipe groups
        let nbOfPipes = 0;
        while(nbOfPipes < maxPipes && possibleGaps.length > 0){
            const gapI = this.chooseRandomIndex(possibleGaps);
            
            const gap = possibleGaps[gapI];
            possibleGaps.splice(gapI, 1);
            const pipeX = gap[0] + Math.floor(Math.random() * (gap[1] - gap[0] - 20));
            const pipeGroup = [
                {
                    x: pipeX,
                    y: road.y-20,
                    width: 20,
                    height: 20,
                    color: [135, 206, 250],
                },
                {
                    x: pipeX,
                    y: road.y + road.height,
                    width: 20,
                    height: 20,
                    color: [135, 206, 250],
                }
            ];
            pipeGroups.push(pipeGroup);


        }
        this.pipeGroups = pipeGroups;
    }

    private genFenceLengths(maxFenceLength: number, maxFences: number): number[]{
        // Implementation for generating fence lengths
        const fenceLengths = [];
        let currentFenceLength = 0;
        
        while(currentFenceLength < maxFenceLength && fenceLengths.length < maxFences){
            const newFenceLength = Math.floor(Math.random() * maxFenceLength / maxFences) + 20;
            if(currentFenceLength + newFenceLength > maxFenceLength){
                fenceLengths.push(maxFenceLength - currentFenceLength);
                currentFenceLength = maxFenceLength;
            }
            else {
                fenceLengths.push(newFenceLength);
                currentFenceLength += newFenceLength;
            }
        }

        //add the remaining length / maxFences to all the fences
        const remainingLength = maxFenceLength - currentFenceLength;
        for(let i = 0; i < fenceLengths.length; i++){
            fenceLengths[i] += Math.floor(remainingLength / maxFences);
        }
    
        return fenceLengths;
    }

    private positionFences(fenceLength: number, fenceLengths: number[], xRange: number, road: any): void {
        // Implementation for positioning fences
        let currentX = 0;
        const maxOffset = Math.floor((road.width - fenceLength) / fenceLengths.length);
        for(let i = 0; i < fenceLengths.length; i++){
            const fenceOffset = Math.floor(Math.random() * maxOffset);
            currentX += fenceOffset
            this.fences.push({
                x: currentX,
                y: road.y-15,
                width: fenceLengths[i],
                height: 15,
                color: [139, 69, 19]
            });
            this.fences.push({
                x: currentX,
                y: road.y+ road.height,//on the other side of the road
                width: fenceLengths[i],
                height: 15,
                color: [139, 69, 19]
            });

            currentX += fenceLengths[i];
        }
    }

    private generateFences(maxFences: number, maxFenceLength: number): void {
        // Implementation for generating fences
        const maxFenceLengthByRoad = maxFenceLength / roads.length;

        const road = roads[0];
        const xRange = road.x + road.width;

        const fenceLengths = this.genFenceLengths(maxFenceLengthByRoad, maxFences);
        
        this.positionFences(maxFenceLengthByRoad, fenceLengths, xRange, road);
        
    }

}