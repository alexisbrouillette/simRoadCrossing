import { ADN } from "./adn";
import { p5Glob } from "./index";
import { Individual } from "./individual";
import * as p5 from "p5";

let individuals: Individual[] = [];
const NUM_INDIVIDUALS = 500;


// Change this at the top of your script
export const obstacles = [
    //fences
    {
        x: 100,
        y: 500,
        w: 200,
        h: 15,
        deadly: false,
        color: [139, 69, 19]
    },
    {
        x: 320,
        y: 500,
        w: 200,
        h: 15,
        deadly: false,
        color: [139, 69, 19]
    },
    {
        x: 100,
        y: 615,
        w: 200,
        h: 15,
        deadly: false,
        color: [139, 69, 19]
    },
    {
        x: 320,
        y: 615,
        w: 200,
        h: 15,
        deadly: false,
        color: [139, 69, 19]
    },
    //roads
    {
        x: 0,
        y: 515,
        w: 600,
        h: 100,
        deadly: true,
        color: [0, 0, 0]
    }
  ];
  export const pipeGroups = [
    [
        {
            x: 300,
            y: 495,
            w: 20,
            h: 20,
            color: [135, 206, 250],
        },
        {
            x: 300,
            y: 615,
            w: 20,
            h: 20,
            color: [135, 206, 250],
        }
    ]

  ]

export const width = 600;
export const height = 1000;

export const roads = [
    {
        x: 0,
        y: 515,
        width: 600,
        height: 100,
        deadly: true,
        color: [0, 0, 0]
    }
]

export const adn = new ADN(3, 3, 400);


export function setup(p5: p5) {
    p5.createCanvas(width, height);
    for (let i = 0; i < NUM_INDIVIDUALS; i++) {
        individuals.push(new Individual());
    }
}
export function draw(p5: p5) {
    p5.background(240);

    // Draw rectangle
    p5.stroke(0);
    p5.noFill();
    // for (let obstacle of obstacles) {
    //     p5.fill(p5.color(obstacle.color));
    //     p5.rect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
    // }
    for(let fence of adn.fences){
        p5.fill(p5.color(fence.color));
        p5.rect(fence.x, fence.y, fence.width, fence.height);
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

    for (let individual of individuals) {
        if (individual.alive) {
            individual.move();
        }
        individual.display();
    }
}