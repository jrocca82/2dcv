import { SCALE_FACTOR } from "./constants";
import { k } from "./kaboomContext";
import { displayDialogue, setCamScale } from "./utils";


// Load assets
k.loadSprite("spritesheet", "./spritesheet.png", {
    sliceX: 39,
    sliceY: 31,
    anims: {
        "idle-down": 952,
        "walk-down": { from: 952, to: 955, loop: true, speed: 8 },
        "idle-side": 991,
        "walk-side": { from: 991, to: 994, loop: true, speed: 8 },
        "idle-up": 1030,
        "walk-up": { from: 1030, to: 1033, loop: true, speed: 8 },
    }
});

k.loadSprite("map", "./map.png");

// Set canvas color
k.setBackground(k.Color.fromHex("#311047"));

// Draw Map
k.scene("main", async () => {
    const mapData = await (await fetch("./map.json")).json();
    const layers = mapData.layers;

    const map = k.add([
        // Object we are drawing
        k.sprite("map"),
        // Where we are drawing it
        k.pos(0),
        // make it bigger
        k.scale(SCALE_FACTOR)
    ]);

    const player = k.make([
        k.sprite("spritesheet", { anim: "idle-down" }),
        // Create hit box around character
        k.area({
            shape: new k.Rect(k.vec2(0, 3), 10, 10)
        }),
        // Add physics
        k.body(),
        // Draw from the center
        k.anchor("center"),
        // TODO: Pass spawn point
        k.pos(),
        k.scale(SCALE_FACTOR),
        // Character attributes/props
        {
            speed: 250,
            direction: "down",
            isInDialogue: false
        },
    ]);

    for (const layer of layers) {
        // Add boundaries to the map
        if (layer.name === "boundaries") {
            for (const boundary of layer.objects) {
                map.add([
                    k.area({
                        shape: new k.Rect(k.vec2(0), boundary.width, boundary.height)
                    }),
                    // Makes it so player cannot pass through
                    k.body({ isStatic: true }),
                    k.pos(boundary.x, boundary.y),
                    boundary.name
                ]);

                if (boundary.name) {
                    player.onCollide(boundary.name, () => {
                        player.isInDialogue = true;
                        displayDialogue("test", () => { player.isInDialogue = false })
                    })
                }
            }
            continue;
        }

        if (layer.name === "spawnpoint") {
            for (const entity of layer.objects) {
                if (entity.name === "player") {
                    player.pos = k.vec2(
                        (map.pos.x + entity.x) * SCALE_FACTOR,
                        (map.pos.y + entity.y) * SCALE_FACTOR
                    );
                    k.add(player);
                    continue;
                }
            }
        }
    }

    setCamScale(k);

    k.onResize(() => setCamScale(k));

    k.onUpdate(() => {
        // Camera follows player
        k.camPos(player.pos.x, player.pos.y + 100)
    });

    // Moving the player
    k.onMouseDown((mouseBtn) => {
        if (mouseBtn !== "left" || player.isInDialogue) {
            return;
        }

        const worldMousePos = k.toWorld(k.mousePos());
        player.moveTo(worldMousePos, player.speed);

        const mouseAngle = player.pos.angle(worldMousePos);

        const lowerBound = 50;
        const upperBound = 125;

        if (mouseAngle > lowerBound && mouseAngle < upperBound && player.curAnim() !== "walk-up") {
            player.play("walk-up");
            player.direction = "up";
            return;
        }

        if (mouseAngle < -lowerBound && mouseAngle > -upperBound && player.curAnim() !== "walk-down") {
            player.play("walk-down");
            player.direction = "down";
            return;
        }

        if (Math.abs(mouseAngle) > upperBound) {
            player.flipX = false;
            if (player.curAnim() !== "walk-side") player.play("walk-side");
            player.direction = "right";
            return;
        }

        if (Math.abs(mouseAngle) < lowerBound) {
            player.flipX = true;
            if (player.curAnim() !== "walk-side") player.play("walk-side");
            player.direction = "left";
            return;
        }
    });

    k.onMouseRelease(() => {
        if (player.direction === "down") {
            player.play("idle-down");
            return
        }
        if (player.direction === "up") {
            player.play("idle-up");
            return
        }
        player.play("idle-side");
        return
    })
});

// Start at this scene
k.go("main");