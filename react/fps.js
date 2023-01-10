const calFps = () => {
  let count = 0;
  let prevTimestamp;
  const loop = timestamp => {
    count += 1;
    if (!prevTimestamp) prevTimestamp = timestamp;
    if (timestamp - prevTimestamp >= 1000) {
      console.log(count);
      count = 0;
      prevTimestamp = timestamp;
    }
    window.requestAnimationFrame(loop);
  };
  window.requestAnimationFrame(loop);
};
