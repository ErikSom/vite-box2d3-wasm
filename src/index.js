import Box2DFactory from "box2d3-wasm";
import DebugDrawRenderer from "./utils/debugDraw.js";

init();

async function init() {
  const params = new URLSearchParams(window.location.search);
  const box2d = await Box2DFactory({
	locateFile: (file) => {
		if (file.endsWith('.wasm')) {
			console.log('Loading WASM file:', file);
		  return `./${file}`; // Served from Vite's /public directory
		}

		console.log('Loading JS file:', file);
		return file;
	  }
  });
  const canvas = document.getElementById("renderCanvas");
  const ctx = canvas.getContext("2d");

  runSimulation(box2d, ctx, canvas, params);
}

function runSimulation(box2d, ctx, canvas, params) {
  const pixelToMeters = 10;
  const subStepCount = 4;
  const hdRendering = params.get("hd") === "1";

  const debugDraw = new DebugDrawRenderer(box2d, ctx, {
    pixelToMeters,
    autoHD: hdRendering,
  });
  debugDraw.offset = { x: 40, y: -29 };

  const {
    b2DefaultWorldDef,
    b2CreateWorld,
    b2CreateBody,
    b2CreatePolygonShape,
    b2CreateSegmentShape,
    b2World_Step,
    b2MakeBox,
    b2DefaultBodyDef,
    b2DefaultShapeDef,
    b2BodyType,
    b2Segment,
    b2Vec2,
    b2Rot,
    TaskSystem,
    b2CreateThreadedWorld,
    b2World_GetProfile,
  } = box2d;

  const worldDef = b2DefaultWorldDef();
  worldDef.gravity.Set(0, -10);

  let worldId, taskSystem;
  const statsLevel = params.get("stats") || 2;

  if (params.get("threading") === "1") {
    taskSystem = new TaskSystem(navigator.hardwareConcurrency);
    worldId = b2CreateThreadedWorld(worldDef, taskSystem);
  } else {
    worldId = b2CreateWorld(worldDef);
  }

  createGround(box2d, worldId);

  const pyramidHeight = parseInt(params.get("pyramidHeight") || "10", 10);
  const boxGap = 0.1;
  createPyramid(box2d, worldId, pyramidHeight, boxGap);

  startLoop(
    worldId,
    ctx,
    canvas,
    box2d,
    debugDraw,
    subStepCount,
    taskSystem,
    statsLevel,
    hdRendering
  );
}

function createGround(box2d, worldId) {
  const {
    b2DefaultBodyDef,
    b2DefaultShapeDef,
    b2Segment,
    b2Vec2,
    b2CreateBody,
    b2CreateSegmentShape,
  } = box2d;

  const bd_ground = new b2DefaultBodyDef();
  const groundId = b2CreateBody(worldId, bd_ground);

  const shapeDef = new b2DefaultShapeDef();
  shapeDef.density = 1.0;
  shapeDef.material.friction = 0.3;

  const segments = [
    [
      [3, -4],
      [6, -7],
    ],
    [
      [3, -18],
      [22, -18],
    ],
    [
      [-100, -40],
      [100, -40],
    ],
  ];

  segments.forEach(([p1, p2]) => {
    const segment = new b2Segment();
    segment.point1 = new b2Vec2(...p1);
    segment.point2 = new b2Vec2(...p2);
    b2CreateSegmentShape(groundId, shapeDef, segment);
  });
}

function createPyramid(box2d, worldId, height, gap) {
  const {
    b2DefaultBodyDef,
    b2DefaultShapeDef,
    b2BodyType,
    b2Vec2,
    b2CreateBody,
    b2CreatePolygonShape,
    b2MakeBox,
  } = box2d;

  const boxWidth = 1.0;
  const boxHeight = 1.0;

  for (let row = 0; row < height; row++) {
    const boxesInRow = height - row;
    const startX = (-(boxesInRow - 1) * (boxWidth + gap)) / 2;

    for (let i = 0; i < boxesInRow; i++) {
      const bd = new b2DefaultBodyDef();
      bd.type = b2BodyType.b2_dynamicBody;
      const x = startX + i * (boxWidth + gap);
      const y = (boxHeight + gap) * row + boxHeight;
      bd.position = new b2Vec2().Set(x, y);

      const bodyId = b2CreateBody(worldId, bd);

      const shapeDef = new b2DefaultShapeDef();
      shapeDef.density = 1.0;
      shapeDef.material.friction = 0.3;

      const box = b2MakeBox(boxWidth / 2, boxHeight / 2);
      b2CreatePolygonShape(bodyId, shapeDef, box);
    }
  }
}

function drawProfile(
  ctx,
  debugDraw,
  profile,
  duration,
  taskSystem,
  statsLevel,
  hdRendering
) {
  const scale = hdRendering
    ? Math.min(window.devicePixelRatio || 1, 2) || 1
    : 1;
  ctx.font = `${16 * scale}px Arial`;
  ctx.fillStyle = "black";

  if (statsLevel < 1) return;
  ctx.fillText(`fps: ${Math.floor(1000 / duration)}`, 10 * scale, 20 * scale);
  ctx.fillText(
    `threading: ${taskSystem ? "on" : "off"}`,
    100 * scale,
    20 * scale
  );

  debugDraw.debugMemory = true;
  if (statsLevel < 2) return;

  const lines = [
    `step: ${profile.step.toFixed(2)}ms`,
    `pairs: ${profile.pairs.toFixed(2)}ms`,
    `collide: ${profile.collide.toFixed(2)}ms`,
    `solve: ${profile.solve.toFixed(2)}ms`,
    `mergeIslands: ${profile.mergeIslands.toFixed(2)}ms`,
    `prepareStages: ${profile.prepareStages.toFixed(2)}ms`,
    `solveConstraints: ${profile.solveConstraints.toFixed(2)}ms`,
    `prepareConstraints: ${profile.prepareConstraints.toFixed(2)}ms`,
    `integrateVelocities: ${profile.integrateVelocities.toFixed(2)}ms`,
    `warmStart: ${profile.warmStart.toFixed(2)}ms`,
    `solveImpulses: ${profile.solveImpulses.toFixed(2)}ms`,
    `integratePositions: ${profile.integratePositions.toFixed(2)}ms`,
    `applyRestitution: ${profile.applyRestitution.toFixed(2)}ms`,
    `storeImpulses: ${profile.storeImpulses.toFixed(2)}ms`,
    `transforms: ${profile.transforms.toFixed(2)}ms`,
    `splitIslands: ${profile.splitIslands.toFixed(2)}ms`,
    `hitEvents: ${profile.hitEvents.toFixed(2)}ms`,
    `refit: ${profile.refit.toFixed(2)}ms`,
    `bullets: ${profile.bullets.toFixed(2)}ms`,
    `sleepIslands: ${profile.sleepIslands.toFixed(2)}ms`,
    `sensors: ${profile.sensors.toFixed(2)}ms`,
  ];

  lines.forEach((line, i) => {
    ctx.fillText(line, 10 * scale, (40 + i * 20) * scale);
  });
}

function startLoop(
  worldId,
  ctx,
  canvas,
  box2d,
  debugDraw,
  subStepCount,
  taskSystem,
  statsLevel,
  hdRendering
) {
  const { b2World_Step, b2World_GetProfile } = box2d;

  function loop(prevMs) {
    const nowMs = window.performance.now();
    requestAnimationFrame(() => loop(nowMs));

    const deltaMs = Math.min(nowMs - prevMs, 1000 / 120);

    const start = performance.now();
    b2World_Step(worldId, deltaMs / 1000, subStepCount);
    const end = performance.now();

    taskSystem?.ClearTasks();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    debugDraw.Draw(worldId);

    const profile = b2World_GetProfile(worldId);
    drawProfile(
      ctx,
      debugDraw,
      profile,
      end - start,
      taskSystem,
      statsLevel,
      hdRendering
    );
    profile.delete();
  }

  loop(window.performance.now());
}
