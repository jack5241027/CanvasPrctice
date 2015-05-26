 $(document).ready(function() {

     var snum = [0, 0, 0, 0];
     var ms = 0;
     var sc = document.getElementById("stickerCanvas");
     var sctx = sc.getContext("2d");
     var iw;
     var ih;

     var theCanvas = document.getElementById("bottleCanvas");
     var context = theCanvas.getContext("2d");
     var numShapes = 0;
     var shapes = [];
     var dragIndex;
     var dragging;
     var mouseX;
     var mouseY;
     var dragHoldX;
     var dragHoldY;
     var timer;
     var targetX;
     var targetY;
     var TO_RADIANS = Math.PI / 180;
     var boxAngle;
     var bw;
     var bh;


     function init() {
         drawScreen();
         window.addEventListener("mousedown", mouseDownListener, false);
         window.addEventListener("mousemove", mouseMoveListener, false);
         theCanvas.addEventListener("touchstart", mouseDownListener, false);
         theCanvas.addEventListener("touchmove", mouseMoveListener, false);
     }

     $(".stickers li span img").click(function() {
         attachShape("http://drmilker-mybottlecard.com/addons/default/themes/drmilker/img/sticker/b7.png", 0, 0, parseInt($(this).width()), parseInt($(this).height()));
         if (ms < 4) snum[ms]++;
     });

     function attachShape(imgPath, x, y, w, h) {
         img = new Image();
         img.src = imgPath;
         img.onload = function() {
             img.w = w;
             img.h = h;
             img.bw = w;
             img.bh = h;
             img.tx = x;
             img.ty = y;
             img.scale = 1;
             img.angle = 0;
             img.selected = true;
             shapes.push(img);
             numShapes++;
             smoothDraw(sc, sctx, context, img, x, y, w, h);
             drawScreen();
         }
     }

     function smoothDraw(tempCanvas, tempCtx, targetCtx, img, x, y, w, h) {
         //0
         tempCanvas.width = tempCanvas.width;
         //1
         iw = img.width;
         ih = img.height
         tempCanvas.width = iw;
         tempCanvas.height = ih;
         //sctx.drawImage(img, 0, 0, sc.width, sc.height);
         tempCtx.drawImage(img, iw * 0.5, ih * 0.5, iw * 0.5, ih * 0.5);
         //2
         tempCtx.drawImage(tempCanvas, iw * 0.5, ih * 0.5, iw * 0.5, ih * 0.5, 0, 0, iw * 0.25, ih * 0.25);
         //3
         targetCtx.drawImage(tempCanvas, 0, 0, iw * 0.25, ih * 0.25, x, y, w, h);

         //TIP:
         //You can calculate total number of steps needed, using this formula (it includes the final step to set target size):
         //steps = Math.ceil(Math.log(sourceWidth / targetWidth) / Math.log(2))
     }

     function drawScreen() {
         theCanvas.width = theCanvas.width;
         for (var i = 0; i < numShapes; i++) {
             context.save();
             context.setTransform(1, 0, 0, 1, 0, 0);
             context.translate(shapes[i].tx + shapes[i].w / 2, shapes[i].ty + shapes[i].h / 2);
             context.scale(shapes[i].scale, shapes[i].scale);
             if (i == numShapes - 1) {
                 boxAngle = ((shapes[i].angle * TO_RADIANS > Math.PI * 0.5 && shapes[i].angle * TO_RADIANS < Math.PI * 1) || (shapes[i].angle * TO_RADIANS > Math.PI * 1.5 && shapes[i].angle * TO_RADIANS < Math.PI * 2)) ? Math.PI - shapes[i].angle * TO_RADIANS : shapes[i].angle * TO_RADIANS;
                 bw = Math.abs(Math.sin(boxAngle) * shapes[i].h) + Math.abs(Math.cos(boxAngle) * shapes[i].w);
                 bh = Math.abs(Math.sin(boxAngle) * shapes[i].w) + Math.abs(Math.cos(boxAngle) * shapes[i].h);

                 //fix scale of rot start
                 if (bw * shapes[i].scale > theCanvas.width) {
                     shapes[i].scale -= Math.ceil((bw * shapes[i].scale / theCanvas.width) * 10) / 10 - 1;
                 } else if (bh * shapes[i].scale > theCanvas.height) {
                     shapes[i].scale -= Math.ceil((bh * shapes[i].scale / theCanvas.height) * 10) / 10 - 1;
                 }
                 context.setTransform(1, 0, 0, 1, 0, 0);
                 context.translate(shapes[i].tx + shapes[i].w / 2, shapes[i].ty + shapes[i].h / 2);
                 context.scale(shapes[i].scale, shapes[i].scale);
                 //fix scale of rot end

                 //fix offset of scale start
                 if (shapes[i].tx + shapes[i].w / 2 + (bw * shapes[i].scale) / 2 > theCanvas.width) {
                     shapes[i].tx -= (shapes[i].tx + shapes[i].w / 2 + (bw * shapes[i].scale) / 2) - theCanvas.width;
                 }
                 if (shapes[i].ty + shapes[i].h / 2 + (bh * shapes[i].scale) / 2 > theCanvas.height) {
                     shapes[i].ty -= (shapes[i].ty + shapes[i].h / 2 + (bh * shapes[i].scale) / 2) - theCanvas.height;
                 }
                 //fix offset of scale end

                 shapes[i].bw = bw * shapes[i].scale;
                 shapes[i].bh = bh * shapes[i].scale;
                 context.beginPath();
                 if (shapes[i].selected) {
                     context.strokeStyle = '#d3ab71';
                     context.rect(-(bw / 2), -(bh / 2), bw, bh);
                     context.stroke();
                 }
                 //ref : http://jsfiddle.net/oscarpalacious/ZdQKg/
             }
             context.rotate(shapes[i].angle * TO_RADIANS);
             context.translate(-(shapes[i].tx + shapes[i].w / 2), -(shapes[i].ty + shapes[i].h / 2));
             context.drawImage(shapes[i], shapes[i].tx, shapes[i].ty, shapes[i].w, shapes[i].h);
             context.rotate(-shapes[i].angle * TO_RADIANS);
             context.restore();
         }
     }

     // function mouseDownListener(evt) {
     //     evt.preventDefault();
     //     var mousePos = getMousePos(theCanvas, evt);
     //     mouseX = mousePos.x;
     //     mouseY = mousePos.y;
     //     for (var i = 0; i < numShapes; i++) {
     //         if (hitMouseTest(shapes[i], mouseX, mouseY)) {
     //             dragging = true;
     //             shapes[i].selected = true;
     //             dragIndex = i;
     //         } else {
     //             var tc = $(evt.target).attr('class');
     //             if (!(tc == "scale-up" || tc == "scale-down" || tc == "rot-right" || tc == "rot-left")) {
     //                 shapes[i].selected = false;
     //             }
     //         }
     //     }
     //     drawScreen();
     //     if (dragging) {
     //         $(".area").show();
     //         shapes.push(shapes.splice(dragIndex, 1)[0]);
     //         dragHoldX = mouseX - shapes[numShapes - 1].tx;
     //         dragHoldY = mouseY - shapes[numShapes - 1].ty;
     //         targetX = mouseX - dragHoldX;
     //         targetY = mouseY - dragHoldY;
     //         timer = setInterval(onTimerTick, 1000 / 30);
     //     }
     //     window.removeEventListener("mousedown", mouseDownListener, false);
     //     window.addEventListener("mouseup", mouseUpListener, false);
     //     theCanvas.removeEventListener("touchstart", mouseDownListener, false);
     //     theCanvas.addEventListener("touchend", mouseUpListener, false);

     //     //code below prevents the mouse down from having an effect on the main browser window:
     //     if (evt.preventDefault) {
     //         evt.preventDefault();
     //     } //standard
     //     else if (evt.returnValue) {
     //         evt.returnValue = false;
     //     } //older IE
     //     return false;
     // }

     // function mouseMoveListener(evt) {
     //     evt.preventDefault();
     //     if (dragging) {
     //         var mousePos = getMousePos(theCanvas, evt);
     //         mouseX = mousePos.x;
     //         mouseY = mousePos.y;

     //         var posX;
     //         var posY;
     //         var offSetX = (shapes[numShapes - 1].w - shapes[numShapes - 1].bw) / 2;
     //         var offSetY = (shapes[numShapes - 1].h - shapes[numShapes - 1].bh) / 2;
     //         var maxX = theCanvas.width - shapes[numShapes - 1].w + offSetX;
     //         var maxY = theCanvas.height - shapes[numShapes - 1].h + offSetY;
     //         posX = mouseX - dragHoldX;
     //         posX = (posX < -offSetX) ? -offSetX : ((posX > maxX) ? maxX : posX);
     //         posY = mouseY - dragHoldY;
     //         posY = (posY < -offSetY) ? -offSetY : ((posY > maxY) ? maxY : posY);
     //         targetX = posX;
     //         targetY = posY;
     //     } else {
     //         var mousePos = getMousePos(theCanvas, evt);
     //         mouseX = mousePos.x;
     //         mouseY = mousePos.y;
     //         $("#bottleCanvas").removeClass("cursorMove");
     //         for (var i = 0; i < numShapes; i++) {
     //             if (hitMouseTest(shapes[i], mouseX, mouseY)) {
     //                 $("#bottleCanvas").addClass("cursorMove");
     //             }
     //         }
     //     }
     // }

     // function mouseUpListener(evt) {
     //     evt.preventDefault();
     //     window.addEventListener("mousedown", mouseDownListener, false);
     //     window.removeEventListener("mouseup", mouseUpListener, false);
     //     theCanvas.addEventListener("touchstart", mouseDownListener, false);
     //     theCanvas.removeEventListener("touchend", mouseUpListener, false);
     //     if (dragging) {
     //         dragging = false;
     //         $(".area").hide();
     //         clearInterval(timer);
     //     }
     // }

 });
