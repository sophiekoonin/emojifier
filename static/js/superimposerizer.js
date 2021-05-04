document.getElementById('form').onsubmit = superimpose;
document.getElementById('form').onreset = reset;

let numImages = 2;
let loadedImages = 0;
const images = {
  img1: new Image(),
  img2: new Image(),
};

let konvaImages = [];

function reset(event) {
  event.target.reset();
  baseLayer.destroyChildren();
  konvaImages = [];

  document.getElementById('more-imgs-wrapper').classList.add('hidden');
  document.getElementById('more-imgs').classList.remove('hidden');
  document.getElementById('submit').setAttribute('disabled', 1);
}

function onAddMore() {
  document.getElementById('more-imgs-wrapper').classList.remove('hidden');
  document.getElementById('more-imgs').classList.add('hidden');
  document.getElementById('submit').setAttribute('disabled', 1);
}

const stage = new Konva.Stage({
  container: 'canvas',
  width: MAX_GIF_SIZE + MAX_GIF_SIZE / 2,
  height: MAX_GIF_SIZE + MAX_GIF_SIZE / 2,
});

async function onImageLoad(event) {
  const image = event.target.files[0];
  images[event.target.id].src = await toBase64(image);
  images[event.target.id].onload = () => {
    loadedImages++;
    if (loadedImages === numImages) {
      //finished!
      document.getElementById('submit').removeAttribute('disabled');
    }
  };
}
async function onImagesLoad(event) {
  const numFiles = event.target.files.length;
  for (let i = 0; i < numFiles; i++) {
    const file = event.target.files.item(i);
    numImages++;
    const image = new Image();
    image.src = await toBase64(file);
    image.onload = () => {
      images[`img${numImages}`] = image;
      loadedImages++;
      if (loadedImages === numImages) {
        //finished!
        document.getElementById('submit').removeAttribute('disabled');
      }
    };
  }
}

// TODO
function superimpose(event) {
  event.preventDefault();
  event.target.reset();
  init();
  stage.add(baseLayer);

  Object.keys(images).forEach((i) => {
    const image = images[i];
    const { width, height } = getScaledImageDimensions(
      image.width,
      image.height,
      MAX_GIF_SIZE / 2
    );

    const konvaImg = new Konva.Image({
      width,
      height,
      name: 'img',
      image,
      x: MAX_GIF_SIZE / 4 + width / 2,
      y: MAX_GIF_SIZE / 4 + height / 2,
      draggable: true,
      offsetX: width / 2,
      offsetY: height / 2,
    });

    konvaImages.push(konvaImg);

    baseLayer.add(konvaImg);
  });

  baseLayer.add(tr);
  tr.nodes(konvaImages);
  baseLayer.batchDraw();

  baseLayer.add(selectionRectangle);

  document.getElementById('download').onclick = (e) => {
    fitToScreen(() => {
      tr.nodes([]);
      var dataURL = stage.toDataURL();
      downloadURI(dataURL, `superimposerizer.png`);
    });
  };

  document.getElementById('actions').classList.remove('hidden');
}

document.getElementById('more-imgs').onclick = onAddMore;
document.getElementById('img1').onchange = onImageLoad;
document.getElementById('img2').onchange = onImageLoad;
document.getElementById('imgs').onchange = onImagesLoad;
