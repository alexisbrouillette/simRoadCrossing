import * as p5 from "p5";
import { draw, setup } from "./sketch";
import { ADN } from "./adn";
import { Population } from "./population";

export let p5Glob: p5;



const sketch = (p5: p5) => {
  let t: Population;
  let d = 0;

  p5.setup = () => {
    p5Glob = p5;
    t = new Population(500, 100, 700)
    
    setup(p5, t.adns[0]); 
  };

  p5.draw = () => {

    if (d === 200) {
      t.evolve();
      d = 0;
    }
    else {
      draw(p5, t.adns[0]);
      for (let i = 1; i < t.adns.length; i++) {
        const individuals = t.adns[i].individuals;
        for (let individual of individuals) {
          if (individual.alive) {
            individual.move();
          }
        }
      }
      d++;
    }
  };
};

new p5(sketch);
