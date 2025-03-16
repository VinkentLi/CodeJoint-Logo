const { createCanvas } = require('canvas');
const GIFEncoder = require('gif-encoder-2');
const data = require("./data").data;
const fs = require('fs');

const WIDTH = 88;
const HEIGHT = 44;
const FRAME_COUNT = 157;
const FPS = 20; // 20 fps (50ms delay per frame)

// Initialize the encoder
const encoder = new GIFEncoder(WIDTH * 11, HEIGHT * 22); // Adjust the width/height for better visibility
encoder.createReadStream().pipe(fs.createWriteStream('ascii_animation.gif'));
encoder.start();
encoder.setRepeat(0); // Loop forever
encoder.setDelay(50); // 50ms delay = 20fps
encoder.setQuality(10); // Quality of the GIF
let transparent = true;
if (transparent) {
    encoder.setTransparent(0x00000000);
}

let a = 0, b = 0;
let buff = new Array(WIDTH * HEIGHT);
let zbuff = new Array(WIDTH * HEIGHT);
let sinA, sinB, cosA, cosB;

function project(x, y, z, xo, yo, zo) {
    let L = -z + 1;
    x += xo;
    y += yo;
    z += zo;
    const distFromCam = 5;
    let xr = x * cosB + sinB * (y * cosA + z * sinA);
    let yr = -x * sinB + cosB * (y * cosA + z * sinA);
    let zr = z * cosA - y * sinA + distFromCam;
    let ooz = 1 / (zr);
    const K = HEIGHT * distFromCam / 2.1;
    let xp = Math.floor(WIDTH / 2 + 2 * K * ooz * xr);
    let yp = Math.floor(HEIGHT / 2 + K * ooz * yr);
    let idx = xp + yp * WIDTH;
    if (L > 0) {
        if (xp >= 0 && xp < WIDTH - 1 && yp >= 0 && yp < HEIGHT) {
            if (ooz > zbuff[idx]) {
                zbuff[idx] = ooz;
                let lidx = Math.floor(L * 5.5);
                buff[idx] = ".,-~:;=!*#$@"[lidx];
            }
        }
    }
}

function asciiframe() {
    for (let i = 0; i < WIDTH * HEIGHT; i++) {
        buff[i] = i % WIDTH === WIDTH - 1 ? "\n" : " ";
        zbuff[i] = 0;
    }
    sinA = Math.sin(a);
    sinB = Math.sin(b);
    cosA = Math.cos(a);
    cosB = Math.cos(b);
    for (let r = 0; r < data.length; r += 2) {
        for (let c = 0; c < data[r].length; c += 2) {
            if (data[r][c] == 0) continue;
            let x = c / data[r].length * 2 - 1;
            let y = r / data.length * 2 - 1;
            for (let l = -1; l <= 1; l += 0.25) {
                project(0, 0, l, x, y, -l + l / 20);
            }
        }
    }
    a += 0.08;
    b += 0.04;
}

function generateFrame() {
    asciiframe();

    // Create canvas and draw ASCII frame
    const canvas = createCanvas(WIDTH * 11, HEIGHT * 22); // Adjust width/height for better visibility
    const ctx = canvas.getContext('2d');

    if (transparent) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Ensure transparency
    
        // Draw ASCII text in white
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "14pt monospace";
        ctx.textBaseline = "top";
        ctx.fillText(buff.join(""), 0, 0);
    } else {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#F92F2F");
        gradient.addColorStop(1, "#F92F5E");
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw ASCII text in black
        ctx.fillStyle = "#000000";
        ctx.font = "14pt monospace";
        ctx.textBaseline = "top";
        ctx.fillText(buff.join(""), 0, 0);
    }

    // Add frame to GIF encoder
    encoder.addFrame(ctx);
}

async function createGif() {
    for (let frame = 0; frame < FRAME_COUNT; frame++) {
        generateFrame();
        console.log(`Generated frame ${frame + 1}/${FRAME_COUNT}`);
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    encoder.finish(); // Finish the GIF creation
    console.log('GIF created successfully!');
}

createGif().catch(console.error);
