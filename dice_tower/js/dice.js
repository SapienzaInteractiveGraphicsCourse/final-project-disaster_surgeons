import { D6 } from "./D6.js";
import { D20 } from "./D20.js";

export function createDice(type, visual, world) {

    if (type === "d6") {
        const dice = new D6(visual, world);
        world.addBody(dice.body);
        return dice;
    }

    if (type === "d20") {
        const dice = new D20(visual, world);
        world.addBody(dice.body);
        return dice;
    }

    throw new Error("Unknown dice type: " + type);
}