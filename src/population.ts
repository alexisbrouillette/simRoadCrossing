import { ADN, Fence } from "./adn";
import { Individual } from "./individual";
import { roads, width } from "./sketch";

export class Population{
    adns: Array<ADN> = [];
    indivuals: Individual[] = [];
    fencesLength: number = 0;

    constructor(nbOfInd: number, nbnOfSimulations: number, maxFenceLength: number){
        //generate the initial population
        this.fencesLength = maxFenceLength;
        this.generatePopulation(nbOfInd, nbnOfSimulations);
        
    }

    evolve(){
        //calculate the fitness of each individual
        this.adns.forEach(adn => {
            adn.calculateFitness();
            adn.resetIndividuals();
        });

        this.selection();

        //mutate all the population
        this.mutate();

    }

    private generatePopulation(nbOfInd: number, nbnOfSimulations: number){
        for(let i = 0; i < nbnOfSimulations; i++){
            const nbOfPipes = Math.floor(Math.random() * 1) + 1;
            const nbOfFences = Math.floor(Math.random() * 4) + 1;
            this.adns.push(new ADN(2, nbOfFences, this.fencesLength, nbOfInd));
        
        }
    }


    private crossover(adn1: ADN, adn2: ADN): ADN {
        const fences1 = [...adn1.fences];
        const fences2 = [...adn2.fences];
        const targetLength = this.fencesLength
        let pipeGroups: Fence[][] = [];
    
        // First half from adn1
        const newFences1 = fences1.filter(fence => fence.x + fence.width < width / 2);
    
        // Handle fence that crosses the middle
        const fenceToCut1 = fences1.find(fence => 
            fence.x < width / 2 && fence.x + fence.width >= width / 2
        );
    
        if (fenceToCut1) {
            const cutPoint = width / 2;
            const leftPortion = {
                ...fenceToCut1,
                width: cutPoint - fenceToCut1.x
            };
            if (leftPortion.width > 0) {
                newFences1.push(leftPortion);
            }
        }
    
        // Get pipe groups from left side
        pipeGroups = adn1.pipeGroups.filter(pipeGroup => pipeGroup[0].x < width / 2);
    
        // Choose the side from adn2 with more fences
        const fences2Right = fences2.filter(fence => fence.x >= width / 2);
        const fences2Left = fences2.filter(fence => fence.x < width / 2);
        
        const rightLength = fences2Right.reduce((acc, fence) => acc + fence.width, 0);
        const leftLength = fences2Left.reduce((acc, fence) => acc + fence.width, 0);
    
        // Combine fences and adjust positions if needed
        let newFences = [...newFences1];
        if (rightLength > leftLength) {
            newFences.push(...fences2Right);
            pipeGroups.push(...adn2.pipeGroups.filter(pg => pg[0].x >= width / 2));
        } else {
            const adjustedLeft = fences2Left.map(fence => ({
                ...fence,
                x: fence.x + width / 2
            }));
            newFences.push(...adjustedLeft);
            
            const leftPipeGroups = adn2.pipeGroups
                .filter(pg => pg[0].x < width / 2)
                .map(pg => pg.map(pipe => ({ ...pipe, x: pipe.x + width / 2 })));
            pipeGroups.push(...leftPipeGroups);
        }

        //remove randomly pipeGroups until we have the same number of pipeGroups as the first parent
        while(pipeGroups.length > adn1.pipeGroups.length){
            pipeGroups.splice(Math.floor(Math.random() * pipeGroups.length), 1);
        }
    
        // Adjust total length to match target
        let currentLength = newFences.reduce((acc, fence) => acc + fence.width, 0);
        
        // If too long, reduce fence sizes systematically
        while (currentLength > targetLength) {
            // Find the largest fence that can be reduced
            const reducibleFences = newFences.filter(f => f.width >= 22);
            if (reducibleFences.length === 0) break;
            
            const largestFence = reducibleFences.reduce((a, b) => 
                a.width > b.width ? a : b
            );
            
            const reduction = Math.min(20, currentLength - targetLength);
            largestFence.width -= reduction;
            currentLength -= reduction;
        }

        const newAdn = new ADN(pipeGroups.length, 2, this.fencesLength, adn1.individuals.length);
        newAdn.fences = newFences;
        newAdn.pipeGroups = pipeGroups;

        // If too short, add new fences in gaps
        while (currentLength < targetLength) {
            const gaps = newAdn.findAllGaps();
            const viableGaps = gaps.filter(gap => gap[1] - gap[0] >= 20);
            
            if (viableGaps.length === 0) break;
            
            const gap = viableGaps[Math.floor(Math.random() * viableGaps.length)];
            const newFence = {
                x: gap[0],
                y: roads[0].y - 15,
                width: Math.min(20, targetLength - currentLength),
                height: 15,
                color: [139, 69, 19]
            };
            
            newAdn.fences.push(newFence);
            currentLength += newFence.width;
        }
        return newAdn;
    }


    private selection(){
        //sort the adns by score
        this.adns.sort((a, b) => b.fitness - a.fitness);

        //show bet and worst fitness
        console.log("best fitness: ", this.adns[0].fitness);
        console.log("worst fitness: ", this.adns[this.adns.length - 1].fitness);

        //ELITISM
        //keep the best 20% of the adns
        const newAdns = this.adns.slice(0, Math.floor(this.adns.length * 0.2));

        //CROSSOVER
        //get the rest of the adns by crossover
        while(newAdns.length < this.adns.length){
            const adn1 = this.adns[Math.floor(Math.random() * this.adns.length)];
            const adn2 = this.adns[Math.floor(Math.random() * this.adns.length)];
            newAdns.push(this.crossover(adn1, adn2));
        }
        this.adns = newAdns;
    }

    //mutate
    private mutate(){
        //only mutate the last 80% of the population
        for(let i = Math.floor(this.adns.length * 0.2); i < this.adns.length; i++){
            const r = Math.random() * 100;
            if(r < 5)
                this.adns[i].mutate();
            
        }
        
    }
}