import "./index.scss";

// TYPES

type Light = {
  id: string;
  top: number;
  left: number;
  size: number;
  element: HTMLDivElement;
  level: number;
};

// GLOBALS

const DATA = {
  root: document.getElementById("root")!,
  box: document.getElementById("box")!,
  lightContainer: document.getElementById("lights")!,
  lights: new Map<string, Light>(),
  LIGHT_SIZE: 150,
  LIGHT_MIN_SIZE: 50,
  LIGHT_MAX_SIZE: 400,
};

// INIT

document.body.addEventListener("click", (ev) => {
  const middleX = DATA.root.clientWidth / 2;
  const middleY = DATA.root.clientHeight / 2;
  const newThing: Light = {
    id: randomID(),
    top: ev.clientY - middleY,
    left: ev.clientX - middleX,
    size: DATA.LIGHT_SIZE,
    level: 0.5,
    element: document.createElement("div"),
  };
  newThing.element.classList.add("light");
  DATA.lights.set(newThing.id, newThing);
  drawLight(newThing);
  initThing(newThing);
  drawShadows();
});

const initThing = (light: Light) => {
  DATA.lightContainer.append(light.element);

  const stopEv = (ev: MouseEvent) => ev.stopPropagation();

  light.element.addEventListener("click", stopEv);
  DATA.box.addEventListener("click", stopEv);

  light.element.addEventListener("dblclick", () => {
    DATA.lights.delete(light.id);
    DATA.lightContainer.removeChild(light.element);
    drawShadows();
  });

  light.element.addEventListener("mousedown", (downEv) => {
    const middleX = DATA.root.clientWidth / 2;
    const middleY = DATA.root.clientHeight / 2;
    const startX = downEv.clientX;
    const startY = downEv.clientY;
    const lightStartX = light.left;
    const lightStartY = light.top;
    const mousemove = (ev: MouseEvent) => {
      const deltaX = ev.clientX - startX;
      const deltaY = ev.clientY - startY;
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) > 5) {
        const margin = 10; // distance from the sides
        const padding = light.size / 2 + margin;
        light.left = constrain(
          padding - middleX,
          lightStartX + deltaX,
          middleX - padding,
        );
        light.top = constrain(
          padding - middleY,
          lightStartY + deltaY,
          middleY - padding,
        );
        drawLight(light);
      }
    };
    const mouseup = () => {
      document.body.removeEventListener("mousemove", mousemove);
      document.body.removeEventListener("mouseup", mouseup);
    };
    document.body.addEventListener("mousemove", mousemove);
    document.body.addEventListener("mouseup", mouseup);
  });

  light.element.addEventListener("wheel", (ev) => {
    if (ev.metaKey) {
      light.size = constrain(
        DATA.LIGHT_MIN_SIZE,
        light.size + ev.deltaY / 5,
        DATA.LIGHT_MAX_SIZE,
      );
    } else {
      light.level = constrain(0, light.level + ev.deltaY / 500, 1);
    }
    drawLight(light);
    drawShadows();
  });
};

// FNS

const drawLight = (light: Light) => {
  light.element.style.top = px(light.top - light.size / 2);
  light.element.style.left = px(light.left - light.size / 2);
  light.element.style.width = px(light.size);
  light.element.style.height = px(light.size);
  const level = (light.level * 100).toFixed(0);
  light.element.style.background = `linear-gradient(0deg, #010085 0%, #010085 ${level}%, #0200E5 ${level}%, #0200E5 100%)`;
  drawShadows();
};

const drawShadows = () => {
  const shadows: string[] = [];
  for (const light of DATA.lights.values()) {
    shadows.push(buildShadow(light));
  }
  DATA.box.style.boxShadow = shadows.join(",");
};

const buildShadow = (light: Light) => {
  const x = -light.left / 100;
  const y = -light.top / 100;
  const spread = light.size / 10;
  const color = `rgba(0, 0, 0, ${light.level * 0.25 + 0.05})`;
  return `${px(x)} ${px(y)} ${px(spread)} ${color}`;
};

const randomID = () => {
  return Math.random().toString(32).slice(2);
};

const px = (n: number) => {
  return `${n}px`;
};

const constrain = (min: number, n: number, max: number) => {
  return Math.min(max, Math.max(min, n));
};
