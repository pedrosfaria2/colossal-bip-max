const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'assets/bip-max.s');
const cream = '#ded9cc';
const transparent = {
  r: 0,
  g: 0,
  b: 0,
  alpha: 0
};
const canvas = (w, h) => sharp({
  create: {
    width: w,
    height: h,
    channels: 4,
    background: transparent
  }
});
const svg = (body, w, h) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);
const saveSVG = (name, body, w, h) => sharp(svg(body, w, h)).png().toFile(path.join(out, name));

async function label(text, file, width, height, font, color = cream, fontfile) {
  const input = await sharp({
    text: {
      text: `<span foreground="${color}">${text}</span>`,
      font,
      fontfile,
      rgba: true
    }
  }).png().toBuffer();
  const {
    width: w,
    height: h
  } = await sharp(input).metadata();
  const resized = await sharp(input).resize({
    width: Math.min(w, width),
    height: Math.min(h, height),
    fit: 'inside'
  }).toBuffer();
  const m = await sharp(resized).metadata();
  await canvas(width, height).composite([{
    input: resized,
    left: 0,
    top: Math.floor((height - m.height) / 2)
  }]).png().toFile(path.join(out, file));
}

async function createBaseAssets() {
  for (const folder of ['time', 'aod', 'small', 'date', 'icons', 'battery', 'weather', 'steam']) {
    await fs.mkdir(path.join(out, folder), {
      recursive: true
    });
  }
  await sharp(path.join(root, 'art/source/background.png')).resize(432, 514).png().toFile(path.join(out, 'background.png'));
  await canvas(143, 42).png().toFile(path.join(out, 'touch.png'));
}

async function createTypography() {
  const oswald = path.join(root, 'art/fonts/Oswald.ttf');
  for (let n = 0; n < 10; n++) {
    await label(String(n), `time/${n}.png`, 47, 89, 'Oswald Light 103', '#b92e24', oswald);
    await label(String(n), `aod/${n}.png`, 47, 89, 'Oswald Light 103', '#bcbcbc', oswald);
    await label(String(n), `small/${n}.png`, 14, 28, 'DejaVu Sans 22');
    await label(String(n), `date/${n}.png`, 13, 23, 'DejaVu Serif 19');
  }
  for (const [text, name, width] of [['%', 'percent', 21], ['°', 'degree', 12], ['−', 'minus', 15], ['--', 'invalid', 25]]) {
    await label(text, `small/${name}.png`, width, 28, 'DejaVu Sans 22');
  }
  for (const d of ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']) {
    await label(d.toUpperCase(), `date/${d}.png`, 87, 23, 'DejaVu Serif 19');
  }
  for (const [i, month] of ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].entries()) {
    await label(month, `date/month-${i + 1}.png`, 48, 23, 'DejaVu Serif 17');
  }
}

async function createStatusIcons() {
  await saveSVG('icons/heart.png', `<path fill="${cream}" d="M12 22L2.8 12.6C-4 5.7 5.5-1.3 12 5.4 18.5-1.3 28 5.7 21.2 12.6Z"/>`, 24, 24);
  await saveSVG('icons/steps.png', `<g fill="${cream}" transform="rotate(15 12 12)"><ellipse cx="7" cy="8" rx="3.6" ry="6"/><ellipse cx="7" cy="18" rx="3.2" ry="3.7"/><ellipse cx="18" cy="5" rx="3.6" ry="6"/><ellipse cx="18" cy="15" rx="3.2" ry="3.7"/></g>`, 24, 26);
}

async function createBatteryIcons() {
  for (let n = 0; n <= 100; n++) {
    const h = 18 * n / 100;
    await saveSVG(`battery/${n}.png`, `<rect x="6" y="0" width="8" height="3" rx="1" fill="${cream}"/><rect x="2" y="4" width="16" height="23" rx="2" fill="none" stroke="${cream}" stroke-width="2"/>${n ? `<rect x="5" y="${24 - h}" width="10" height="${h}" fill="${cream}"/>` : ''}`, 20, 28);
  }
}

async function createWeatherIcons() {
  const cloud = '<path d="M5 20h17a5 5 0 000-10 7 7 0 00-13-2A6 6 0 005 20Z"/>';
  const sun = '<circle cx="14" cy="13" r="5"/><path d="M14 1v4m0 16v4M2 13h4m16 0h4M5 4l3 3m12 12 3 3M5 22l3-3M20 7l3-3"/>';
  const moon = '<path d="M20 3A10 10 0 101 14C14 18 20 12 20 3Z"/>';
  for (let n = 0; n < 29; n++) {
    let body = cloud;
    if (n === 3) {
      body = sun;
    } else if (n === 28) {
      body = moon;
    } else if ([1, 5, 7, 10, 18, 21, 24, 27].includes(n)) {
      body = cloud + '<path d="M8 22l-2 3m9-3-2 3m9-3-2 3"/>';
    } else if ([2, 6, 8, 9, 12, 16, 19].includes(n)) {
      body = cloud + '<path d="M8 22v4m-2-2h4m8-2v4m-2-2h4"/>';
    } else if ([15, 20].includes(n)) {
      body = cloud + '<path d="M15 16l-5 6h6l-3 4"/>';
    } else if ([11, 13, 14, 17, 22, 23].includes(n)) {
      body = '<path d="M2 8h23M6 13h17M2 18h23M6 23h17"/>';
    } else if (n === 25) {
      body = '<path d="M9 8a5 5 0 0110 0c0 4-5 4-5 8m0 4v2"/>';
    }
    await saveSVG(`weather/${n}.png`, `<g fill="none" stroke="${cream}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</g>`, 28, 28);
  }
}

async function createTitle() {
  const titleParts = [];
  for (const [i, char] of [...'進撃の巨人'].entries()) {
    const input = await sharp({
      text: {
        text: `<span foreground="#161310">${char}</span>`,
        font: 'MS Gothic Bold 24',
        fontfile: '/mnt/c/Windows/Fonts/msgothic.ttc',
        rgba: true
      }
    }).png().toBuffer();
    titleParts.push({
      input,
      left: 2,
      top: i * 27
    });
  }
  await canvas(30, 137).composite(titleParts).png().toFile(path.join(out, 'title.png'));
}

async function createSteamAnimation() {
  const sw = 456,
    sh = 594,
    width = 266,
    height = 514;
  const {
    data: source
  } = await sharp(path.join(root, 'art/source/steam.png')).resize(sw, sh, {
    fit: 'fill'
  }).ensureAlpha().raw().toBuffer({
    resolveWithObject: true
  });
  const sample = (sx, sy, c) => {
    sx = Math.max(0, Math.min(sw - 1.001, sx));
    sy = Math.max(0, Math.min(sh - 1.001, sy));
    const x = Math.floor(sx),
      y = Math.floor(sy),
      fx = sx - x,
      fy = sy - y;
    const at = (xx, yy) => source[(yy * sw + xx) * 4 + c];
    return (at(x, y) * (1 - fx) + at(x + 1, y) * fx) * (1 - fy) + (at(x, y + 1) * (1 - fx) + at(x + 1, y + 1) * fx) * fy;
  };
  for (let frame = 0; frame < 90; frame++) {
    const pixels = Buffer.alloc(width * height * 4);
    const phase = frame / 90,
      phases = [phase, (phase + 0.5) % 1];
    const weights = phases.map(t => Math.sin(Math.PI * t) ** 2);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const gx = x + 166;
        const rgba = [0, 0, 0, 0];
        for (let k = 0; k < 2; k++) {
          const age = phases[k],
            weight = weights[k];
          const sx = gx + 29 - age * 44;
          const sy = y + 12 + age * 54;
          const alpha = sample(sx, sy, 3) / 255 * weight;
          rgba[3] += alpha;
          for (let c = 0; c < 3; c++) {
            rgba[c] += sample(sx, sy, c) * alpha;
          }
        }
        const off = (y * width + x) * 4;
        if (rgba[3] > 0) {
          for (let c = 0; c < 3; c++) {
            pixels[off + c] = Math.round(rgba[c] / rgba[3]);
          }
        }
        pixels[off + 3] = Math.round(rgba[3] * 255 * Math.min(1, x / 12));
      }
    }
    await sharp(pixels, {
      raw: {
        width,
        height,
        channels: 4
      }
    }).png().toFile(path.join(out, 'steam/frame_' + frame + '.png'));
  }
}

async function createPreview() {
  const layers = [{
    input: path.join(out, 'steam/frame_0.png'),
    left: 166,
    top: 0
  }, {
    input: path.join(out, 'title.png'),
    left: 396,
    top: 264
  }];
  const place = (file, x, y) => layers.push({
    input: path.join(out, file),
    left: x,
    top: y
  });
  place('date/tue.png', 34, 54);
  place('date/month-4.png', 34, 84);
  place('date/1.png', 85, 84);
  place('date/6.png', 99, 84);
  for (const [text, y] of [['10', 122], ['08', 217]]) {
    [...text].forEach((n, i) => place(`time/${n}.png`, 30 + i * 50, y));
  }
  for (const [text, y] of [['7432', 328], ['72', 370], ['84', 412], ['24', 454]]) {
    [...text].forEach((n, i) => place(`small/${n}.png`, 66 + i * 15, y));
  }
  place('icons/steps.png', 32, 331);
  place('icons/heart.png', 32, 373);
  place('battery/84.png', 34, 414);
  place('small/percent.png', 96, 412);
  place('weather/0.png', 30, 455);
  place('small/degree.png', 96, 454);
  await sharp(path.join(out, 'background.png')).composite(layers).png().toFile(path.join(root, 'art/preview.png'));
  await sharp(path.join(root, 'art/preview.png')).resize(294, 350).png().toFile(path.join(out, 'preview.png'));
}

async function main() {
  await createBaseAssets();
  await createTypography();
  await createStatusIcons();
  await createBatteryIcons();
  await createWeatherIcons();
  await createTitle();
  await createSteamAnimation();
  await createPreview();
}
main().catch(e => {
  process.stderr.write(`${e.message}\n`);
  process.exitCode = 1;
});
