(function() {
  var _onload = function() {
      var pretag = document.getElementById('spinningOutput');
  
      var tmr1 = undefined;

      const WIDTH = 160;
      const HEIGHT = 44;
      console.log(WIDTH, HEIGHT);
      pretag.style = `background-color:#000; color:#ccc; font-size: 7pt; width: ${WIDTH}ch;`
      let a = 0, b = 0;
      let buff = new Array(WIDTH*HEIGHT);
      let zbuff = new Array(WIDTH*HEIGHT);
      let sinA, sinB, cosA, cosB;

      function project(x, y, z, xo, yo, zo) {
          let L = -z+1;
          x += xo;
          y += yo;
          z += zo;
          const distFromCam = 5;
          let xr = x*cosB+sinB*(y*cosA+z*sinA);
          let yr = -x*sinB+cosB*(y*cosA+z*sinA);
          let zr = z*cosA-y*sinA+distFromCam;
          let ooz = 1/(zr);
          const K = HEIGHT*distFromCam/2;
          let xp = Math.floor(WIDTH/2+2*K*ooz*xr);
          let yp = Math.floor(HEIGHT/2+K*ooz*yr);
          let idx = xp + yp*WIDTH;
          if (L > 0) {
              if (xp >= 0 && xp < WIDTH-1 && yp >= 0 && yp < HEIGHT) {
                  if (ooz > zbuff[idx]) {
                      zbuff[idx] = ooz;
                      let lidx = Math.floor(L*5.5);
                      buff[idx] = ".,-~:;=!*#$@"[lidx];
                  }
              }
          }
      }
      var asciiframe=function() {
          for (let i = 0; i < WIDTH*HEIGHT; i++) {
              buff[i] = i%WIDTH==WIDTH-1 ? "\n" : " ";
              zbuff[i] = 0;
          }
          sinA = Math.sin(a);
          sinB = Math.sin(b);
          cosA = Math.cos(a);
          cosB = Math.cos(b);
          for (let r = 0; r < data.length; r+=2) {
            for (let c = 0; c < data[r].length; c+=2) {
              if (data[r][c] == 0) continue;
              let x = c/data[r].length * 2 - 1;
              let y = r/data.length * 2 - 1;
              for (let l = -1; l <= 1; l += 0.25) {
                project(0, 0, l, x, y, -l+l/20);
              }
            }
          }
          a += 0.08;
          b += 0.04;
          pretag.innerHTML = buff.join("");
      };
  
    window.anim = function() {
      if(tmr1 === undefined) {
        tmr1 = setInterval(asciiframe, 50);
      } else {
        clearInterval(tmr1);
        tmr1 = undefined;
      }
    };
  
    if (pretag !== undefined) {
      asciiframe();
    }
  }
  
  if(document.all)
    window.attachEvent('onload',_onload);
  else
    window.addEventListener("load",_onload,false);
  })();