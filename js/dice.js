import { D6 } from "./d6.js";
import { D20 } from "./d20.js";
import { D12 } from "./d12.js";
import { D8 } from "./d8.js";

export function createDice(type, visual, world) {

    if (type === "d6") {
        const dice = new D6(visual, world);
        //world.addBody(dice.body);
        return dice;
    }

    if (type === "d8") {
        const dice = new D8(visual, world);
        //world.addBody(dice.body);
        return dice;
    }

    if (type === "d12") {
        const dice = new D12(visual, world);
        //world.addBody(dice.body);
        return dice;
    }

    if (type === "d20") {
        const dice = new D20(visual, world);
        //world.addBody(dice.body);
        return dice;
    }

    throw new Error("Unknown dice type: " + type);
}