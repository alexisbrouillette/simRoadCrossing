import p5 from "p5";
import {p5Glob} from "./index";
import { height, roads, width } from "./sketch";
import { ADN } from "./adn";

export class Individual {
    size: number;
    x: number;
    y: number;
    speedX: number;
    speedY: number;
    color: p5.Color;
    alive: boolean;
    pipeUsages: number;
    adn: ADN;

    constructor(adn: ADN) {
        this.size = 10;
        const startingPoints = [
            { x: 200, y: 100 },
            { x: 800, y: 100 },
        ];
        const randomIndex = p5Glob.floor(p5Glob.random(startingPoints.length));
        this.x = startingPoints[randomIndex].x;
        this.y = startingPoints[randomIndex].y;
        // this.x = p5Glob.random(this.size, width - this.size);
        // this.y = p5Glob.random(this.size, height - this.size);
        this.speedX = p5Glob.random(-2, 2);
        this.speedY = p5Glob.random(-2, 2);
        this.color =  p5Glob.color(p5Glob.random(100, 255), p5Glob.random(100, 255), p5Glob.random(100, 255));
        this.alive = true;
        this.pipeUsages = 0;
        this.adn = adn;
    }

    horizontalCollision(nextX: number, nextY: number, obstacle: any) {
        return (nextX + this.size / 2 > obstacle.x && nextX - this.size / 2 < obstacle.x + obstacle.width &&
            this.y + this.size / 2 > obstacle.y && this.y - this.size / 2 < obstacle.y + obstacle.h)
    }

    verticalCollision(nextX: number, nextY: number, obstacle: any) {
        return (nextY + this.size / 2 > obstacle.y && nextY - this.size / 2 < obstacle.y + obstacle.height &&
            this.x + this.size / 2 > obstacle.x && this.x - this.size / 2 < obstacle.x + obstacle.width)
    }

    rectCollision(nextX: number, nextY: number, obstacle: any) {
        return (nextX + this.size / 2 > obstacle.x && nextX - this.size / 2 < obstacle.x + obstacle.width &&
            nextY + this.size / 2 > obstacle.y && nextY - this.size / 2 < obstacle.y + obstacle.height)
    }

    intersectsLine(nextX: number, nextY: number) {
        // Check collisions with obstacle
        // Horizontal collision (left and right sides)
        for (let obstacle of this.adn.fences) {
            const otherSide = { x: obstacle.x, y: (obstacle.y + roads[0].height + obstacle.height), width: obstacle.width, height: obstacle.height };
            if(this.horizontalCollision(nextX, nextY, obstacle) || this.horizontalCollision(nextX, nextY, otherSide)){
            
                this.speedX *= -1;
                if (this.x < obstacle.x) {
                    this.x = obstacle.x - this.size / 2;

                } else {
                    this.x = obstacle.x + obstacle.width + this.size / 2;
                }
            }

            // Vertical collision (top and bottom sides)
            if (this.verticalCollision(nextX, nextY, obstacle)) {
                this.speedY = 0;
                this.speedX = p5Glob.random(-2, 2)
                if (this.y < obstacle.y) {
                    this.y = obstacle.y - this.size / 2;
                } else {
                    this.y = obstacle.y + obstacle.height + this.size / 2;
                }
            }
            else if(this.verticalCollision(nextX, nextY, otherSide)){
                this.speedY = 0;
                this.speedX = p5Glob.random(-2, 2)
                if (this.y < otherSide.y) {
                    this.y = otherSide.y - this.size / 2;
                } else {
                    this.y = otherSide.y + otherSide.height + this.size / 2;
                }
            }
        }
    }

    //when colliding with pipes
    intersectPipe(nextX: number, nextY: number) {
        for (const pipes of this.adn.pipeGroups) {
            if (this.rectCollision(nextX, nextY, pipes[0])) {
                this.handlePipeCollision(pipes[1]);
                this.pipeUsages++;
            } else if (this.rectCollision(nextX, nextY, pipes[1])) {
                this.handlePipeCollision(pipes[0]);
                this.pipeUsages++;
            }
        }
    }

    handlePipeCollision(targetPipe: any) {
        let teleportedX = targetPipe.x + targetPipe.width / 2;
        let teleportedY = targetPipe.y + targetPipe.height * 1.5;

        for (const road of roads) {
            if (this.rectCollision(teleportedX, teleportedY, road)) {
                teleportedY = targetPipe.y - targetPipe.height * 1.5;
            }
        }
        this.x = teleportedX;
        this.y = teleportedY;
    }

    move() {
        // Add small random changes to direction
        this.speedX += p5Glob.random(-0.5, 0.5);
        this.speedY += p5Glob.random(-0.5, 0.5);

        // Limit speed
        this.speedX = p5Glob.constrain(this.speedX, -4, 4);
        this.speedY = p5Glob.constrain(this.speedY, -4, 4);

        // Calculate next position
        let nextX = this.x + this.speedX;
        let nextY = this.y + this.speedY;

        // Check collisions with obstacle
        this.intersectsLine(nextX, nextY);

        // Check collisions with pipes
        this.intersectPipe(nextX, nextY);

        if(this.rectCollision(nextX, nextY, roads[0])){
            this.alive = false;
        }


        // Update position
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off canvas edges
        if (this.x <= this.size || this.x >= width - this.size) {
            this.speedX *= -1;
            this.x = p5Glob.constrain(this.x, this.size, width - this.size);
        }
        if (this.y <= this.size || this.y >= height - this.size) {
            this.speedY *= -1;
            this.y = p5Glob.constrain(this.y, this.size, height - this.size);
        }
    }


    display() {
        if (this.alive) {
            p5Glob.fill(this.color);
        } else {
            p5Glob.fill(30);  // dark gray when dead
        }
        p5Glob.noStroke();
        p5Glob.square(this.x - this.size / 2, this.y - this.size / 2, this.size);
    }
}
