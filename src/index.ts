import * as p5 from "p5";
import { draw, setup } from "./sketch";
import { ADN } from "./adn";

export let p5Glob: p5;



const sketch = (p5: p5) => {
  

  p5.setup = () => {
    p5Glob = p5;
    setup(p5); 
  };

  p5.draw = () => {
    draw(p5);
  };
};

new p5(sketch);
