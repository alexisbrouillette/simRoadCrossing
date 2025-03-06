import { ADN } from "./adn";
import { p5Glob } from "./index";
import { Individual } from "./individual";
import * as p5 from "p5";

// let individuals: Individual[] = [];
// const NUM_INDIVIDUALS = 500;

export const width = 1000;
export const height = 400;

export const roads = [
    {
        x: 0,
        y: height / 2,
        width: width,
        height: 75,
        deadly: true,
        color: [0, 0, 0]
    }
]

export function setup(p5: p5, adn: ADN) {
    p5.createCanvas(width, height);
}
export function draw(p5: p5, adn: ADN) {
    p5.background(240);

    // Draw rectangle
    p5.stroke(0);
    p5.noFill();
    // for (let obstacle of obstacles) {
    //     p5.fill(p5.color(obstacle.color));
    //     p5.rect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
    // }
    for(const fence of adn.fences){
        p5.fill(p5.color(fence.color));
        p5.rect(fence.x, (fence.y), fence.width, fence.height);

        p5.fill(p5.color(fence.color));
        p5.rect(fence.x, fence.y + roads[0].height + fence.height, fence.width, fence.height);
    }
    // for (let pipes of pipeGroups) {
    //     for (let pipe of pipes) {
    //         p5.fill(p5.color(pipe.color));
    //         p5.rect(pipe.x, pipe.y, pipe.w, pipe.h);
    //     }
    // }
    for(let pipeGroup of adn.pipeGroups){
        for(let pipe of pipeGroup){
            p5.fill(p5.color(pipe.color));
            p5.rect(pipe.x, pipe.y, pipe.width, pipe.height);
        }
    }

    for (let road of roads) {
        p5.fill(p5.color(road.color));
        p5.rect(road.x, road.y, road.width, road.height);
    }
    
    for (let individual of adn.individuals) {
        if (individual.alive) {
            individual.move();
        }
        individual.display();
    }
}