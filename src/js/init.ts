import { ThreeScene } from "./threeScene.js";
import eventBus from "../store/index.js";

const threeScene = new ThreeScene();
setTimeout(() => {
    eventBus.emit("threeScene",threeScene); 
}, 0);
