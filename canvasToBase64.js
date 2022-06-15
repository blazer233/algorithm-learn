/* <img id="imgbase" alt="" /> */
function imageURL2Base64(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject();
        return;
      }
      ctx.drawImage(image, 0, 0, image.width, image.height);
      const dataURL = canvas.toDataURL();
      resolve(dataURL);
    };
    image.onerror = error => {
      image.onerror = null;
      reject(error);
    };
    image.src = url;
  });
}
imageURL2Base64(
  "https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ece5b1d83e04420fb5127f47ad24e597~tplv-k3u1fbpfcp-zoom-crop-mark:1304:1304:1304:734.awebp?"
).then(res => (imgbase.src = res));
