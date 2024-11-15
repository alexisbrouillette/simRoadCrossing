import p5 from "p5";
import {p5Glob} from "./index";
import { height, obstacles, pipeGroups, width } from "./sketch";

export class Individual {
    size: number;
    x: number;
    y: number;
    speedX: number;
    speedY: number;
    color: p5.Color;
    alive: boolean;

    constructor() {
        this.size = 10;
        this.x = p5Glob.random(this.size, width - this.size);
        this.y = p5Glob.random(this.size, height - this.size);
        this.speedX = p5Glob.random(-2, 2);
        this.speedY = p5Glob.random(-2, 2);
        this.color =  p5Glob.color(p5Glob.random(100, 255), p5Glob.random(100, 255), p5Glob.random(100, 255));
        this.alive = true;
    }

    horizontalCollision(nextX: number, nextY: number, obstacle: any) {
        return (nextX + this.size / 2 > obstacle.x && nextX - this.size / 2 < obstacle.x + obstacle.w &&
            this.y + this.size / 2 > obstacle.y && this.y - this.size / 2 < obstacle.y + obstacle.h)
    }

    verticalCollision(nextX: number, nextY: number, obstacle: any) {
        return (nextY + this.size / 2 > obstacle.y && nextY - this.size / 2 < obstacle.y + obstacle.h &&
            this.x + this.size / 2 > obstacle.x && this.x - this.size / 2 < obstacle.x + obstacle.w)
    }

    rectCollision(nextX: number, nextY: number, obstacle: any) {
        return (nextX + this.size / 2 > obstacle.x && nextX - this.size / 2 < obstacle.x + obstacle.w &&
            nextY + this.size / 2 > obstacle.y && nextY - this.size / 2 < obstacle.y + obstacle.h)
    }

    intersectsLine(nextX: number, nextY: number) {
        // Check collisions with obstacle
        // Horizontal collision (left and right sides)
        for (let obstacle of obstacles) {
            if(this.horizontalCollision(nextX, nextY, obstacle)){
            
                this.speedX *= -1;
                if (this.x < obstacle.x) {
                    this.x = obstacle.x - this.size / 2;

                } else {
                    this.x = obstacle.x + obstacle.w + this.size / 2;
                }
                if (obstacle.deadly) {
                    this.alive = false;
                }
            }

            // Vertical collision (top and bottom sides)
            if (this.verticalCollision(nextX, nextY, obstacle)) {
                this.speedY = 0;
                this.speedX = p5Glob.random(-2, 2)
                if (this.y < obstacle.y) {
                    this.y = obstacle.y - this.size / 2;
                } else {
                    this.y = obstacle.y + obstacle.h + this.size / 2;
                }
                if (obstacle.deadly) {
                    this.alive = false;
                }
            }
        }
    }

    //when colliding with pipes
    intersectPipe(nextX: number, nextY: number) {
        for (const pipes of pipeGroups) {
            if (this.rectCollision(nextX, nextY, pipes[0])) {
                this.handlePipeCollision(pipes[1], pipes[0]);
            } else if (this.rectCollision(nextX, nextY, pipes[1])) {
                this.handlePipeCollision(pipes[0], pipes[1]);
            }
        }
    }

    handlePipeCollision(targetPipe: any, sourcePipe: any) {
        console.log(`collided with pipe${sourcePipe === pipeGroups[0][0] ? '0' : '1'}`);
        let teleportedX = targetPipe.x + targetPipe.w / 2;
        let teleportedY = targetPipe.y + targetPipe.h * 1.5;

        for (const obstacle of obstacles) {
            if (this.rectCollision(teleportedX, teleportedY, obstacle)) {
                teleportedY = targetPipe.y - targetPipe.h * 1.5;
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
