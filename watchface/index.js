const digits = folder => Array.from({
  length: 10
}, (_, n) => `${folder}/${n}.png`);
const NORMAL = hmUI.show_level.ONLY_NORMAL;
const AOD = hmUI.show_level.ONAL_AOD;
const createWidget = (kind, props) => hmUI.createWidget(hmUI.widget[kind], {
  show_level: NORMAL,
  ...props
});
const createMetric = (type, y, unit) => createWidget('TEXT_IMG', {
  x: 66,
  y,
  w: 95,
  h: 28,
  type: hmUI.data_type[type],
  font_array: digits('small'),
  h_space: 1,
  align_h: hmUI.align.LEFT,
  invalid_image: 'small/invalid.png',
  negative_image: 'small/minus.png',
  ...(unit ? {
    unit_en: `small/${unit}.png`,
    unit_sc: `small/${unit}.png`,
    unit_tc: `small/${unit}.png`
  } : {})
});

function createArtwork(face) {
  createWidget('IMG', {
    x: 0,
    y: 0,
    src: 'background.png'
  });
  face.steam = createWidget('IMG_ANIM', {
    x: 166,
    y: 0,
    anim_path: 'steam',
    anim_prefix: 'frame',
    anim_ext: 'png',
    anim_fps: 30,
    anim_size: 90,
    repeat_count: 0,
    anim_repeat: true,
    anim_status: hmUI.anim_status.START,
    display_on_restart: true,
    default_frame_index: 0
  });
  createWidget('IMG', {
    x: 396,
    y: 264,
    src: 'title.png'
  });
}

function createClocks() {
  const clock = (folder, level) => createWidget('IMG_TIME', {
    hour_startX: 30,
    hour_startY: 122,
    hour_array: digits(folder),
    hour_space: 3,
    hour_zero: 1,
    hour_align: hmUI.align.LEFT,
    minute_startX: 30,
    minute_startY: 217,
    minute_array: digits(folder),
    minute_space: 3,
    minute_zero: 1,
    minute_follow: 0,
    minute_align: hmUI.align.LEFT,
    show_level: level
  });
  clock('time', NORMAL);
  clock('aod', AOD);
}

function createDate() {
  const weekImages = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => `date/${day}.png`);
  const monthImages = Array.from({
    length: 12
  }, (_, n) => `date/month-${n + 1}.png`);
  const dayImages = digits('date');
  createWidget('IMG_WEEK', {
    x: 34,
    y: 54,
    week_en: weekImages,
    week_sc: weekImages,
    week_tc: weekImages
  });
  createWidget('IMG_DATE', {
    month_startX: 34,
    month_startY: 84,
    month_is_character: true,
    month_en_array: monthImages,
    month_sc_array: monthImages,
    month_tc_array: monthImages,
    month_zero: 0,
    month_space: 0,
    day_startX: 85,
    day_startY: 84,
    day_en_array: dayImages,
    day_sc_array: dayImages,
    day_tc_array: dayImages,
    day_zero: 1,
    day_follow: 0,
    day_space: 1
  });
}

function createSteps() {
  createWidget('IMG', {
    x: 32,
    y: 331,
    src: 'icons/steps.png'
  });
  createMetric('STEP', 328);
}

function createHeartRate(face) {
  createWidget('IMG', {
    x: 32,
    y: 373,
    src: 'icons/heart.png'
  });
  face.heartText = createMetric('HEART', 370);
  face.heart = hmSensor.createSensor(hmSensor.id.HEART);
  face.updateHeart = () => {
    const current = face.heart.current;
    const last = face.heart.last;
    const valid = value => typeof value === 'number' && isFinite(value) && value > 0 && value <= 250;
    const value = valid(last) ? last : valid(current) ? current : null;
    face.heartText.setProperty(hmUI.prop.TEXT, value === null ? '--' : String(Math.round(value)));
  };
  face.heart.addEventListener(hmSensor.event.CURRENT, face.updateHeart);
  face.heart.addEventListener(hmSensor.event.LAST, face.updateHeart);
  face.updateHeart();
}

function createBattery(face) {
  createMetric('BATTERY', 412, 'percent');
  face.battery = hmSensor.createSensor(hmSensor.id.BATTERY);
  face.batteryIcon = createWidget('IMG', {
    x: 34,
    y: 414,
    src: 'battery/0.png'
  });
  face.updateBattery = () => {
    const raw = face.battery.current;
    const percent = typeof raw === 'number' && isFinite(raw) ? Math.max(0, Math.min(100, Math.round(raw))) : 0;
    face.batteryIcon.setProperty(hmUI.prop.MORE, {
      src: `battery/${percent}.png`
    });
  };
  face.battery.addEventListener(hmSensor.event.CHANGE, face.updateBattery);
  face.updateBattery();
}

function createWeather() {
  createWidget('IMG_LEVEL', {
    x: 30,
    y: 455,
    w: 28,
    h: 26,
    type: hmUI.data_type.WEATHER_CURRENT,
    image_array: Array.from({
      length: 29
    }, (_, n) => `weather/${n}.png`),
    image_length: 29
  });
  createMetric('WEATHER_CURRENT', 454, 'degree');
}

function createTouchTargets() {
  for (const [type, y] of [['STEP', 320], ['HEART', 362], ['BATTERY', 404], ['WEATHER_CURRENT', 446]]) {
    createWidget('IMG_CLICK', {
      x: 22,
      y,
      w: 143,
      h: 42,
      src: 'touch.png',
      type: hmUI.data_type[type]
    });
  }
}

WatchFace({
  build() {
    createArtwork(this);
    createClocks();
    createDate();
    createSteps();
    createHeartRate(this);
    createBattery(this);
    createWeather();
    createTouchTargets();
    createWidget('WIDGET_DELEGATE', {
      resume_call: () => {
        this.updateBattery();
        this.updateHeart();
      },
      pause_call: () => {}
    });
  },
  onDestroy() {
    if (this.battery && this.updateBattery) {
      this.battery.removeEventListener(hmSensor.event.CHANGE, this.updateBattery);
    }
    if (this.heart && this.updateHeart) {
      this.heart.removeEventListener(hmSensor.event.CURRENT, this.updateHeart);
      this.heart.removeEventListener(hmSensor.event.LAST, this.updateHeart);
    }
  }
});
