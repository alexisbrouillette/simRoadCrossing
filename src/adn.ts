import { Individual } from "./individual";
import { roads, width } from "./sketch";

export interface Fence{
    x: number;
    y: number;
    width: number;
    height: number;
    color: number[];
}

export interface pipe{
    x: number;
    y: number;
    width: number;
    height: number;
    color: number[];
}


export class ADN{
    pipeGroups:  pipe[][] = [];
    fences: Fence[] = [];
    fitness: number = 0;
    individuals: Individual[] = [];
    nbOfInd: number = 0;

    constructor(maxPipes: number, maxFences: number, maxFenceLength: number, nbOfInd: number){
        this.generateFences(maxFences, maxFenceLength, maxPipes);
        this.generatePipeGroups(maxPipes);
        this.nbOfInd = nbOfInd;

        for (let i = 0; i < nbOfInd; i++) {
            this.individuals.push(new Individual(this));
        }
    }

    resetIndividuals(): void{
        this.individuals = [];
        for (let i = 0; i < this.nbOfInd; i++) {
            this.individuals.push(new Individual(this));
        }
    }


    private chooseRandomIndex(array: any[]): number{
        return Math.floor(Math.random() * array.length);
    }

    calculateFitness(): void{
        this.fitness = 0;
        for(let individual of this.individuals){
            this.fitness += individual.pipeUsages * 0.5;
            //count the nb of dead individual
            if(individual.alive)
                this.fitness += 1;

        }
    }


    findAllGaps(): number[][] {
        //find a gap between two fences
        const possibleGaps = this.findFencesGaps();
        if (possibleGaps.length === 0)
            return [];

        //take into account the pipe groups into the gaps
        const pipeGroups = this.pipeGroups;
        const finalGaps = [];
        for (let i = 0; i < pipeGroups.length; i++) {
            const pipeGroup = pipeGroups[i];
            for (const possibleGap of possibleGaps) {
                //if a pipe is present in the gap
                if (pipeGroup[0].x >= possibleGap[0] && pipeGroup[1].x + 20 <= possibleGap[1]) {
                    //find the gap between the pipe group and the gap
                    const gap1 = [possibleGap[0], pipeGroup[0].x];
                    const gap2 = [pipeGroup[1].x + 20, possibleGap[1]];
                    if (gap1[1] - gap1[0] >= 20)
                        finalGaps.push(gap1);
                }
                else
                    finalGaps.push(possibleGap);
            }
        }
        return finalGaps;
    }

    findFencesGaps(): number[][]{
        const possibleGaps = [];
        for(let i = 0; i < this.fences.length - 1; i++){
            if(this.fences[i+1].x - this.fences[i].x - this.fences[i].width >= 20){
                possibleGaps.push([this.fences[i].x + this.fences[i].width, this.fences[i+1].x]);
            }
        }
        //add the gap between the last fence and the edge of the screen
        if(width - this.fences[this.fences.length - 1].x - this.fences[this.fences.length - 1].width >= 20)
            possibleGaps.push([this.fences[this.fences.length - 1].x + this.fences[this.fences.length - 1].width, width]);
        //add the gap between the first fence and the edge of the screen
        if(this.fences[0].x >= 20)
            possibleGaps.push([0, this.fences[0].x]);
        return possibleGaps;
    }

    private generatePipeGroups(maxPipes: number): void {
        const road = roads[0]; // to update
        const pipeGroups = [];
        //check possible gaps between the fences
        const possibleGaps = this.findFencesGaps();
        //generate pipe groups
        let nbOfPipes = 0;
        while(nbOfPipes < maxPipes && possibleGaps.length > 0){
            console
            const gapI = this.chooseRandomIndex(possibleGaps);
            
            const gap = possibleGaps[gapI];
            possibleGaps.splice(gapI, 1);
            const pipeX = gap[0] + Math.floor(Math.random() * ((gap[1] - gap[0] - 20) / 20)) * 20;
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
            nbOfPipes += 1;

        }
        this.pipeGroups = pipeGroups;
    }

    //generate fence lengths
    //maxFenceLength MUST be a multiple of 20
    private genFenceLengths(maxFenceLength: number, maxFences: number): number[]{
        const fenceLengths = [];
        let currentFenceLength = 0;
        
        while(currentFenceLength < maxFenceLength && fenceLengths.length < maxFences){
            const maxPossibleLength = Math.floor((maxFenceLength - currentFenceLength) / 20) * 20;
            const newFenceLength = Math.floor(Math.random() * (maxPossibleLength / 20)) * 20 + 20;
            if(currentFenceLength + newFenceLength > maxFenceLength){
                fenceLengths.push(maxFenceLength - currentFenceLength);
                currentFenceLength = maxFenceLength;
            }
            else {
                fenceLengths.push(newFenceLength);
                currentFenceLength += newFenceLength;
            }
        }
    
        const remainingLength = maxFenceLength - currentFenceLength;
        if(remainingLength > 0){
            fenceLengths.push(remainingLength);
        }
        return fenceLengths;
    }

    private positionFences(fenceLength: number, fenceLengths: number[], road: any, nbOfPipes: number): void {
        // Implementation for positioning fences
        let currentX = 0;
        //let maxOffset = Math.floor((road.width - fenceLength) / nbOfPipes);
        let maxOffset = road.width - fenceLength;
        
        for(let i = 0; i < fenceLengths.length; i++){
            const fenceOffset = Math.floor(Math.random() * (maxOffset / 20)) * 20;
            maxOffset -= fenceOffset;
            currentX += fenceOffset;
            this.fences.push({
                x: currentX,
                y: road.y-15,
                width: fenceLengths[i],
                height: 15,
                color: [139, 69, 19]
            });

            currentX += fenceLengths[i];
        }
    }

    private generateFences(maxFences: number, maxFenceLength: number, nbOfPipes: number): void {
        // Implementation for generating fences
        const maxFenceLengthByRoad = maxFenceLength / roads.length;

        const road = roads[0];

        const fenceLengths = this.genFenceLengths(maxFenceLengthByRoad, maxFences);
        
        this.positionFences(maxFenceLengthByRoad, fenceLengths, road, nbOfPipes);
        
    }




    //SELECTION STEPS

    private moveFence(){
        //remove a fence block(20px) randomly
        const fenceToRemoveIdx = Math.floor(Math.random() * this.fences.length);
        
        if(this.fences[fenceToRemoveIdx].width > 20)
            this.fences[fenceToRemoveIdx].width -= 20;
        //remove the fence
        else
            this.fences.splice(fenceToRemoveIdx, 1);
        //add a fence block(20px) randomly
        const fenceToAddIdx = Math.floor(Math.random() * this.fences.length);

        // check if the fence is not out of the screen
        if(this.fences[fenceToAddIdx].x + this.fences[fenceToAddIdx].width < width){
            this.fences[fenceToAddIdx].width += 20;
        }
    }

    private movePipeGroup(){
        const road = roads[0]; // to update
        //option 2 move a pipe
        const pipeGroupRemoveIdx = Math.floor(Math.random() * this.pipeGroups.length);
        this.pipeGroups.splice(pipeGroupRemoveIdx, 1);

        const gaps = this.findFencesGaps().filter(gap => gap[1] - gap[0] >= 20);
        const gapI = Math.floor(Math.random() * gaps.length);
        const gap = gaps[gapI];
        const pipeX = gap[0] + Math.floor(Math.random() * ((gap[1] - gap[0] - 20) / 20)) * 20;
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
        this.pipeGroups.push(pipeGroup);
    }

    mutate(): void{
        const mutationType = Math.random();
        if(mutationType < 0.5){
            this.moveFence();
        }
        else{
            this.movePipeGroup();
        }
    }
}