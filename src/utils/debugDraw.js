const defaultDebugDrawOptions = {
	pixelToMeters: 32,
	autoHD: true,
	maxDebugDrawCommands: 10000,
	debugMemory: false,
  };
  
  export default class DebugDrawRenderer {
	constructor(Module, context, options = {}) {
	  const { pixelToMeters, autoHD, maxDebugDrawCommands, debugMemory } = {
		...defaultDebugDrawOptions,
		...options,
	  };
  
	  this.Module = Module;
	  this.ctx = context;
	  this.baseScale = pixelToMeters;
	  this.offset = { x: 0, y: 0 };
  
	  this.autoHD = autoHD;
	  this.dpr = autoHD ? Math.min(window.devicePixelRatio || 1, 2) : 1;
	  this.finalScale = this.baseScale * this.dpr;
  
	  this.debugDrawCommandBuffer = new Module.DebugDrawCommandBuffer(
		maxDebugDrawCommands
	  );
	  this.colorCache = {};
	  this.colorCache[1.0] = this.initializeColorCache();
	  this.colorCache[0.5] = this.initializeColorCache(0.5);
  
	  this.debugMemory = debugMemory;
	}
  
	initializeColorCache(alpha = 1.0) {
	  const b2HexColor = {
		b2_colorAliceBlue: 0xf0f8ff,
		b2_colorAntiqueWhite: 0xfaebd7,
		b2_colorAqua: 0x00ffff,
		b2_colorAquamarine: 0x7fffd4,
		b2_colorAzure: 0xf0ffff,
		b2_colorBeige: 0xf5f5dc,
		b2_colorBisque: 0xffe4c4,
		b2_colorBlack: 0x000000,
		b2_colorBlanchedAlmond: 0xffebcd,
		b2_colorBlue: 0x0000ff,
		b2_colorBlueViolet: 0x8a2be2,
		b2_colorBrown: 0xa52a2a,
		b2_colorBurlywood: 0xdeb887,
		b2_colorCadetBlue: 0x5f9ea0,
		b2_colorChartreuse: 0x7fff00,
		b2_colorChocolate: 0xd2691e,
		b2_colorCoral: 0xff7f50,
		b2_colorCornflowerBlue: 0x6495ed,
		b2_colorCornsilk: 0xfff8dc,
		b2_colorCrimson: 0xdc143c,
		b2_colorCyan: 0x00ffff,
		b2_colorDarkBlue: 0x00008b,
		b2_colorDarkCyan: 0x008b8b,
		b2_colorDarkGoldenRod: 0xb8860b,
		b2_colorDarkGray: 0xa9a9a9,
		b2_colorDarkGreen: 0x006400,
		b2_colorDarkKhaki: 0xbdb76b,
		b2_colorDarkMagenta: 0x8b008b,
		b2_colorDarkOliveGreen: 0x556b2f,
		b2_colorDarkOrange: 0xff8c00,
		b2_colorDarkOrchid: 0x9932cc,
		b2_colorDarkRed: 0x8b0000,
		b2_colorDarkSalmon: 0xe9967a,
		b2_colorDarkSeaGreen: 0x8fbc8f,
		b2_colorDarkSlateBlue: 0x483d8b,
		b2_colorDarkSlateGray: 0x2f4f4f,
		b2_colorDarkTurquoise: 0x00ced1,
		b2_colorDarkViolet: 0x9400d3,
		b2_colorDeepPink: 0xff1493,
		b2_colorDeepSkyBlue: 0x00bfff,
		b2_colorDimGray: 0x696969,
		b2_colorDodgerBlue: 0x1e90ff,
		b2_colorFireBrick: 0xb22222,
		b2_colorFloralWhite: 0xfffaf0,
		b2_colorForestGreen: 0x228b22,
		b2_colorFuchsia: 0xff00ff,
		b2_colorGainsboro: 0xdcdcdc,
		b2_colorGhostWhite: 0xf8f8ff,
		b2_colorGold: 0xffd700,
		b2_colorGoldenRod: 0xdaa520,
		b2_colorGray: 0x808080,
		b2_colorGreen: 0x008000,
		b2_colorGreenYellow: 0xadff2f,
		b2_colorHoneyDew: 0xf0fff0,
		b2_colorHotPink: 0xff69b4,
		b2_colorIndianRed: 0xcd5c5c,
		b2_colorIndigo: 0x4b0082,
		b2_colorIvory: 0xfffff0,
		b2_colorKhaki: 0xf0e68c,
		b2_colorLavender: 0xe6e6fa,
		b2_colorLavenderBlush: 0xfff0f5,
		b2_colorLawnGreen: 0x7cfc00,
		b2_colorLemonChiffon: 0xfffacd,
		b2_colorLightBlue: 0xadd8e6,
		b2_colorLightCoral: 0xf08080,
		b2_colorLightCyan: 0xe0ffff,
		b2_colorLightGoldenRodYellow: 0xfafad2,
		b2_colorLightGray: 0xd3d3d3,
		b2_colorLightGreen: 0x90ee90,
		b2_colorLightPink: 0xffb6c1,
		b2_colorLightSalmon: 0xffa07a,
		b2_colorLightSeaGreen: 0x20b2aa,
		b2_colorLightSkyBlue: 0x87cefa,
		b2_colorLightSlateGray: 0x778899,
		b2_colorLightSteelBlue: 0xb0c4de,
		b2_colorLightYellow: 0xffffe0,
		b2_colorLime: 0x00ff00,
		b2_colorLimeGreen: 0x32cd32,
		b2_colorLinen: 0xfaf0e6,
		b2_colorMagenta: 0xff00ff,
		b2_colorMaroon: 0x800000,
		b2_colorMediumAquaMarine: 0x66cdaa,
		b2_colorMediumBlue: 0x0000cd,
		b2_colorMediumOrchid: 0xba55d3,
		b2_colorMediumPurple: 0x9370db,
		b2_colorMediumSeaGreen: 0x3cb371,
		b2_colorMediumSlateBlue: 0x7b68ee,
		b2_colorMediumSpringGreen: 0x00fa9a,
		b2_colorMediumTurquoise: 0x48d1cc,
		b2_colorMediumVioletRed: 0xc71585,
		b2_colorMidnightBlue: 0x191970,
		b2_colorMintCream: 0xf5fffa,
		b2_colorMistyRose: 0xffe4e1,
		b2_colorMoccasin: 0xffe4b5,
		b2_colorNavajoWhite: 0xffdead,
		b2_colorNavy: 0x000080,
		b2_colorOldLace: 0xfdf5e6,
		b2_colorOlive: 0x808000,
		b2_colorOliveDrab: 0x6b8e23,
		b2_colorOrange: 0xffa500,
		b2_colorOrangeRed: 0xff4500,
		b2_colorOrchid: 0xda70d6,
		b2_colorPaleGoldenRod: 0xeee8aa,
		b2_colorPaleGreen: 0x98fb98,
		b2_colorPaleTurquoise: 0xafeeee,
		b2_colorPaleVioletRed: 0xdb7093,
		b2_colorPapayaWhip: 0xffefd5,
		b2_colorPeachPuff: 0xffdab9,
		b2_colorPeru: 0xcd853f,
		b2_colorPink: 0xffc0cb,
		b2_colorPlum: 0xdda0dd,
		b2_colorPowderBlue: 0xb0e0e6,
		b2_colorPurple: 0x800080,
		b2_colorRebeccaPurple: 0x663399,
		b2_colorRed: 0xff0000,
		b2_colorRosyBrown: 0xbc8f8f,
		b2_colorRoyalBlue: 0x4169e1,
		b2_colorSaddleBrown: 0x8b4513,
		b2_colorSalmon: 0xfa8072,
		b2_colorSandyBrown: 0xf4a460,
		b2_colorSeaGreen: 0x2e8b57,
		b2_colorSeaShell: 0xfff5ee,
		b2_colorSienna: 0xa0522d,
		b2_colorSilver: 0xc0c0c0,
		b2_colorSkyBlue: 0x87ceeb,
		b2_colorSlateBlue: 0x6a5acd,
		b2_colorSlateGray: 0x708090,
		b2_colorSnow: 0xfffafa,
		b2_colorSpringGreen: 0x00ff7f,
		b2_colorSteelBlue: 0x4682b4,
		b2_colorTan: 0xd2b48c,
		b2_colorTeal: 0x008080,
		b2_colorThistle: 0xd8bfd8,
		b2_colorTomato: 0xff6347,
		b2_colorTurquoise: 0x40e0d0,
		b2_colorViolet: 0xee82ee,
		b2_colorWheat: 0xf5deb3,
		b2_colorWhite: 0xffffff,
		b2_colorWhiteSmoke: 0xf5f5f5,
		b2_colorYellow: 0xffff00,
		b2_colorYellowGreen: 0x9acd32,
		b2_colorBox2DRed: 0xdc3132,
		b2_colorBox2DBlue: 0x30aebf,
		b2_colorBox2DGreen: 0x8cc924,
		b2_colorBox2DYellow: 0xffee8c,
	  };
  
	  const cache = {};
	  for (const [name, hex] of Object.entries(b2HexColor)) {
		const hexString = this.colorToHTML(hex, alpha);
		cache[hex] = hexString;
	  }
	  return cache;
	}
  
	prepareCanvas() {
	  this.ctx.save();
	  this.ctx.scale(this.finalScale, -this.finalScale);
	  this.ctx.translate(this.offset.x, this.offset.y);
	  this.ctx.lineWidth = 1 / this.finalScale;
	}
  
	restoreCanvas() {
	  this.ctx.restore();
	}
  
	processCommands(ptr, size, stride) {
	  this.prepareCanvas();
  
	  // type: 0 (uint8_t)
	  // color: 4 (uint32_t)
	  // vertexCount: 8 (uint16_t)
	  // data: 12 (float[32])
  
	  const { DebugDrawCommandType } = this.Module;
  
	  for (let i = 0; i < size; i++) {
		const baseOffset = ptr + i * stride;
		const cmd = {
		  type: this.Module.HEAPU8[baseOffset],
		  color: this.Module.HEAPU32[(baseOffset + 4) >> 2], // Divide by 4 for 32-bit alignment
		  vertexCount: this.Module.HEAPU16[(baseOffset + 8) >> 1], // Divide by 2 for 16-bit alignment
		  data: new Float32Array(this.Module.HEAPU8.buffer, baseOffset + 12, 32),
		};
  
		switch (cmd.type) {
		  case DebugDrawCommandType.e_polygon.value:
			this.drawPolygon(cmd);
			break;
		  case DebugDrawCommandType.e_solidPolygon.value:
			this.drawSolidPolygon(cmd);
			break;
		  case DebugDrawCommandType.e_circle.value:
			this.drawCircle(cmd);
			break;
		  case DebugDrawCommandType.e_solidCircle.value:
			this.drawSolidCircle(cmd);
			break;
		  case DebugDrawCommandType.e_solidCapsule.value:
			this.drawSolidCapsule(cmd);
			break;
		  case DebugDrawCommandType.e_segment.value:
			this.drawSegment(cmd);
			break;
		  case DebugDrawCommandType.e_transform.value:
			this.drawTransform(cmd);
			break;
		  case DebugDrawCommandType.e_point.value:
			this.drawPoint(cmd);
			break;
		  case DebugDrawCommandType.e_string.value:
			this.drawString(cmd);
			break;
		}
	  }
  
	  this.restoreCanvas();
	}
  
	toMB = (bytes) => (bytes / 1048576).toFixed(4);
  
	drawPolygon(cmd) {
	  this.ctx.beginPath();
	  for (let i = 0; i < cmd.vertexCount; i++) {
		const x = cmd.data[i * 2];
		const y = cmd.data[i * 2 + 1];
		if (i === 0) {
		  this.ctx.moveTo(x, y);
		} else {
		  this.ctx.lineTo(x, y);
		}
	  }
	  this.ctx.closePath();
	  this.ctx.strokeStyle = this.colorToHTML(cmd.color);
	  this.ctx.stroke();
	}
  
	drawSolidPolygon(cmd) {
	  const xf = {
		p: { x: cmd.data[0], y: cmd.data[1] },
		q: { s: cmd.data[2], c: cmd.data[3] },
	  };
	  const radius = cmd.data[4];
  
	  this.ctx.beginPath();
	  const vertCount = cmd.vertexCount;
  
	  if (radius <= 0) {
		for (let i = 0; i < vertCount; i++) {
		  const v = this.transformPoint(xf, {
			x: cmd.data[i * 2 + 5],
			y: cmd.data[i * 2 + 6],
		  });
		  if (i === 0) {
			this.ctx.moveTo(v.x, v.y);
		  } else {
			this.ctx.lineTo(v.x, v.y);
		  }
		}
	  } else {
		let prevPoint = null;
		let prevAngle = 0;
  
		for (let i = 0; i < vertCount + 2; i++) {
		  const idx = i % vertCount;
		  const v = this.transformPoint(xf, {
			x: cmd.data[idx * 2 + 5],
			y: cmd.data[idx * 2 + 6],
		  });
  
		  if (i !== 0) {
			const angle = Math.atan2(v.y - prevPoint.y, v.x - prevPoint.x);
			if (i !== 1) {
			  this.ctx.arc(
				prevPoint.x,
				prevPoint.y,
				radius,
				prevAngle - Math.PI / 2,
				angle - Math.PI / 2
			  );
			}
			prevAngle = angle;
		  }
		  prevPoint = v;
		}
	  }
  
	  this.ctx.closePath();
	  this.ctx.fillStyle = this.colorToHTML(cmd.color, 0.5);
	  this.ctx.fill();
	  this.ctx.strokeStyle = this.colorToHTML(cmd.color);
	  this.ctx.stroke();
	}
  
	drawCircle(cmd) {
	  this.ctx.beginPath();
	  this.ctx.arc(cmd.data[0], cmd.data[1], cmd.data[2], 0, 2 * Math.PI);
	  this.ctx.strokeStyle = this.colorToHTML(cmd.color);
	  this.ctx.stroke();
	}
  
	drawSolidCircle(cmd) {
	  const xf = {
		p: { x: cmd.data[0], y: cmd.data[1] },
		q: { s: cmd.data[2], c: cmd.data[3] },
	  };
	  const radius = cmd.data[4];
  
	  this.ctx.beginPath();
	  this.ctx.arc(xf.p.x, xf.p.y, radius, 0, 2 * Math.PI);
	  this.ctx.fillStyle = this.colorToHTML(cmd.color, 0.5);
	  this.ctx.fill();
	  this.ctx.strokeStyle = this.colorToHTML(cmd.color);
	  this.ctx.stroke();
  
	  const p2 = {
		x: xf.p.x + radius * xf.q.c,
		y: xf.p.y + radius * xf.q.s,
	  };
	  this.ctx.beginPath();
	  this.ctx.moveTo(xf.p.x, xf.p.y);
	  this.ctx.lineTo(p2.x, p2.y);
	  this.ctx.stroke();
	}
  
	drawSolidCapsule(cmd) {
	  const p1 = { x: cmd.data[0], y: cmd.data[1] };
	  const p2 = { x: cmd.data[2], y: cmd.data[3] };
	  const radius = cmd.data[4];
  
	  const dx = p2.x - p1.x;
	  const dy = p2.y - p1.y;
	  const length = Math.sqrt(dx * dx + dy * dy);
	  if (length < 0.001) return;
  
	  const axis = { x: dx / length, y: dy / length };
	  const angle = Math.atan2(axis.y, axis.x);
  
	  this.ctx.beginPath();
	  this.ctx.moveTo(p1.x + radius * axis.y, p1.y - radius * axis.x);
	  this.ctx.lineTo(p2.x + radius * axis.y, p2.y - radius * axis.x);
	  this.ctx.arc(p2.x, p2.y, radius, angle - Math.PI / 2, angle + Math.PI / 2);
	  this.ctx.lineTo(p1.x - radius * axis.y, p1.y + radius * axis.x);
	  this.ctx.arc(
		p1.x,
		p1.y,
		radius,
		angle + Math.PI / 2,
		angle + (3 * Math.PI) / 2
	  );
	  this.ctx.closePath();
  
	  this.ctx.fillStyle = this.colorToHTML(cmd.color, 0.5);
	  this.ctx.fill();
	  this.ctx.strokeStyle = this.colorToHTML(cmd.color);
	  this.ctx.stroke();
  
	  this.ctx.beginPath();
	  this.ctx.moveTo(p1.x, p1.y);
	  this.ctx.lineTo(p2.x, p2.y);
	  this.ctx.strokeStyle = this.colorToHTML(cmd.color);
	  this.ctx.stroke();
	}
  
	drawSegment(cmd) {
	  this.ctx.beginPath();
	  this.ctx.moveTo(cmd.data[0], cmd.data[1]);
	  this.ctx.lineTo(cmd.data[2], cmd.data[3]);
	  this.ctx.strokeStyle = this.colorToHTML(cmd.color);
	  this.ctx.stroke();
	}
  
	drawTransform(cmd) {
	  const xf = {
		p: { x: cmd.data[0], y: cmd.data[1] },
		q: { s: cmd.data[2], c: cmd.data[3] },
	  };
  
	  const k_axisScale = 0.2;
  
	  const p2x = {
		x: xf.p.x + k_axisScale * xf.q.c,
		y: xf.p.y + k_axisScale * xf.q.s,
	  };
  
	  this.ctx.beginPath();
	  this.ctx.moveTo(xf.p.x, xf.p.y);
	  this.ctx.lineTo(p2x.x, p2x.y);
	  this.ctx.strokeStyle = this.colorToHTML(0xff0000);
	  this.ctx.stroke();
  
	  const p2y = {
		x: xf.p.x - k_axisScale * xf.q.s,
		y: xf.p.y + k_axisScale * xf.q.c,
	  };
  
	  this.ctx.beginPath();
	  this.ctx.moveTo(xf.p.x, xf.p.y);
	  this.ctx.lineTo(p2y.x, p2y.y);
	  this.ctx.strokeStyle = this.colorToHTML(0x00ff00);
	  this.ctx.stroke();
	}
  
	drawPoint(cmd) {
	  this.ctx.beginPath();
	  this.ctx.arc(
		cmd.data[0],
		cmd.data[1],
		cmd.data[2] / 2 / this.finalScale,
		0,
		2 * Math.PI
	  );
	  this.ctx.fillStyle = this.colorToHTML(cmd.color);
	  this.ctx.fill();
	}
  
	drawString(cmd) {
	  let text = "";
	  const x = cmd.data[0];
	  const y = cmd.data[1];
  
	  for (let i = 2; i < 32; i++) {
		const code = cmd.data[i];
		if (code <= 0) break;
		const char = String.fromCharCode(Math.round(code));
		text += char;
	  }
  
	  const fontSize = 12 * this.dpr;
  
	  this.ctx.save();
	  this.ctx.setTransform(1, 0, 0, 1, 0, 0);
	  this.ctx.font = `${fontSize}px Arial`;
	  this.ctx.fillStyle = "rgb(230, 230, 230)";
  
	  const screenX = (x + this.offset.x) * this.finalScale;
	  const screenY = (-y - this.offset.y) * this.finalScale;
  
	  this.ctx.fillText(text, screenX, screenY);
	  this.ctx.restore();
	}
  
	drawMemoryUsage() {
	  const fontSize = 12 * this.dpr;
	  const padding = 6 * this.dpr;
  
	  this.ctx.font = `${fontSize}px Arial`;
	  this.ctx.fillStyle = "rgba(230, 230, 230, 1)";
  
	  const memoryStats = this.Module.GetMemoryStats();
  
	  const allocated = `${this.toMB(memoryStats.allocatedSpace)} MB`;
	  const free = `${this.toMB(memoryStats.freeSpace)} MB`;
	  const total = `${this.toMB(memoryStats.totalSpace)} MB`;
  
	  let maxWidth = 0;
	  [allocated, free, total].forEach((text) => {
		const width = this.ctx.measureText(text).width;
		maxWidth = Math.max(maxWidth, width);
	  });
  
	  const lines = 4;
  
	  const x = this.ctx.canvas.width - padding;
	  let y = this.ctx.canvas.height - fontSize * lines + fontSize / 2;
  
	  const allocatedText = "Allocated:";
	  const allocatedSize = this.ctx.measureText(allocatedText).width;
  
	  const totalWidth = maxWidth + padding + allocatedSize;
	  this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
	  this.ctx.fillRect(
		x - totalWidth - padding,
		y - fontSize,
		totalWidth + padding * 2,
		fontSize * lines + padding
	  );
  
	  const currentAlign = this.ctx.textAlign;
  
	  this.ctx.fillStyle = "rgba(160, 160, 160, 1)";
	  this.ctx.textAlign = "right";
	  this.ctx.fillText("WASM Memory", x, y);
	  this.ctx.fillStyle = "rgba(230, 230, 230, 1)";
	  y += fontSize;
	  this.ctx.fillText(allocated, x, y);
	  this.ctx.fillText(allocatedText, x - maxWidth - padding, y);
	  y += fontSize;
	  this.ctx.fillText(free, x, y);
	  this.ctx.fillText("Free:", x - maxWidth - padding, y);
	  y += fontSize;
	  this.ctx.fillText(total, x, y);
	  this.ctx.fillText("Total:", x - maxWidth - padding, y);
  
	  this.ctx.textAlign = currentAlign;
	}
  
	colorToHTML(color, alpha = 1.0) {
	  if (this.colorCache[alpha] && this.colorCache[alpha][color]) {
		return this.colorCache[alpha][color];
	  }
  
	  const r = (color >> 16) & 0xff;
	  const g = (color >> 8) & 0xff;
	  const b = color & 0xff;
	  return `rgba(${r},${g},${b},${alpha})`;
	}
  
	transformPoint(xf, v) {
	  return {
		x: xf.p.x + xf.q.c * v.x - xf.q.s * v.y,
		y: xf.p.y + xf.q.s * v.x + xf.q.c * v.y,
	  };
	}
  
	SetFlags(flags) {
	  const debugDraw = this.debugDrawCommandBuffer.GetDebugDraw();
	  for (const [key, value] of Object.entries(flags)) {
		debugDraw[key] = value;
	  }
	}
  
	Draw(worldId, camera) {
	  if (camera) {
		this.ctx.canvas.width = camera.width * this.dpr;
		this.ctx.canvas.height = camera.height * this.dpr;
		this.ctx.canvas.style.width = `${camera.width}px`;
		this.ctx.canvas.style.height = `${camera.height}px`;
  
		const transform = camera.getTransform();
		this.baseScale = transform.scale.x;
		this.finalScale = this.baseScale * this.dpr;
		this.offset.x = transform.offset.x;
		this.offset.y = transform.offset.y;
	  } else {
		const clientWidth = this.ctx.canvas.clientWidth;
		const clientHeight = this.ctx.canvas.clientHeight;
  
		this.ctx.canvas.width = clientWidth * this.dpr;
		this.ctx.canvas.height = clientHeight * this.dpr;
		this.ctx.canvas.style.width = `${clientWidth}px`;
		this.ctx.canvas.style.height = `${clientHeight}px`;
	  }
  
	  this.Module.b2World_Draw(
		worldId,
		this.debugDrawCommandBuffer.GetDebugDraw()
	  );
	  const commandsPtr = this.debugDrawCommandBuffer.GetCommandsData();
	  const commandsSize = this.debugDrawCommandBuffer.GetCommandsSize();
	  const commandStride = this.debugDrawCommandBuffer.GetCommandStride();
	  this.processCommands(commandsPtr, commandsSize, commandStride);
	  this.debugDrawCommandBuffer.ClearCommands();
  
	  if (this.debugMemory) this.drawMemoryUsage();
	}
  }
  