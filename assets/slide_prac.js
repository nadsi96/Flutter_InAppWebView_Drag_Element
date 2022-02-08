let g_elem_dir_info;
let g_elem_dragger;
let g_elem_content;

function onInit(){
    console.log('hello');

    g_elem_dir_info = document.getElementById('dir_info');
    g_elem_dragger = document.getElementById('dragger');
    g_elem_content = document.getElementById('content');
    dragAnimationSetter.init(g_elem_dragger, "left");
    // changeDragDir("right");
}

let dir_info = {
    left: {
        text: "right to left",
        contentAlign: "right",
    },
    right: {
        text: "left to right",
        contentAlign: "left",
    },
    top: {
        text: "bottom to top",
        contentAlign: "center",
    },
    bottom: {
        text: "top to bottom",
        contentAlign: "center",
    },
};
function changeDragDir(dir){
    if(dir){
        dragAnimationSetter.clear();
        dragAnimationSetter.init(g_elem_dragger, dir);
        g_elem_dir_info.innerHTML = dir_info[dir].text;
        g_elem_content.style.textAlign = dir_info[dir].contentAlign;
    }
}

function appToWeb(msg){
    if(msg){
        if(["left", "right", "top", "bottom"].includes(msg)){
            changeDragDir(msg);
        }
    }
}

// 터치이벤트로 드래그
var dragAnimationSetter = {
    dragger: null,          // 드래그할 elem
    dragger_pos: null,      // dragger의 left/right/top/bottom
    offset: null,           // 드래그 방향(dir) 수평: offsetLeft, 수직: offsetTop
    offsetDir: null,        // left, top: -1, right, bottom: 1
    prePos: null,           // 드래그 중, 이전 위치값(elem에서의 마우스 위치)
    clientPos: null,        // 드래그 방향 수평: clientX, 수직: clientY
    returnRange: null,      //
    dir: null,              // 드래그 방향(left/right/top/bottom)
    bounceEaseOut: null,    // 손 놓은 경우, elem이 돌아올 때, 끝에서 튕기도록
    dragging: null,         // 현재 드래그 중인지 확인. 끝에서 튕기는 애니메이션 출력 중에 드래그하면 애니메이션 중단

    // dragger - 드래그할 elem
    // dir - 드래그 방향 (left, right, top, bottom)
    init: function(dragger, dir){
        if(dragger == null){
            return false;
        }
        this.dragger = dragger;

        this.dir = dir || "left";
        if(["left", "right"].includes(this.dir)){
            this.offset = "offsetLeft";
            this.clientPos = "clientX";
            this.returnRange = this.dragger.offsetWidth * 0.8 * -1;
        }
        else if(["top", "bottom"].includes(this.dir)){
            this.offset = "offsetTop";
            this.clientPos = "clientY";
            this.returnRange = this.dragger.offsetHeight * 0.8 * -1;
        }
        else{
            console.log('error');
            return false;
        }

        if(["left", "top"].includes(this.dir)){
            this.offsetDir = -1;
        }
        else{
            this.offsetDir = 1;
        }

        this.bounceEaseOut = this.makeEaseOut(this.bounce);

        this.dragger.addEventListener('touchstart', this.dragStart);
    },
    clear: function(){
        let elem = this.dragger;
        elem.removeEventListener('touchstart', this.dragStart);
        elem.style.left = '';
        elem.style.right = '';
        elem.style.top = '';
        elem.style.bottom = '';

        this.dragger = null;
        this.dragger_pos = null;
        this.offset = null;
        this.offsetDir = null;
        this.prePos = null;
        this.clientPos = null;
        this.returnRange = null;
        this.dir = null;
        this.bounceEaseOut = null;
        this.dragging = null;
    },
    dragStart: function(e){
        e = e || window.event;
        e.preventDefault();

        dragAnimationSetter.prePos = e.touches[0][dragAnimationSetter.clientPos];
        dragAnimationSetter.dragging = true;

        this.addEventListener('touchmove', dragAnimationSetter.onDrag);
        this.addEventListener('touchend', dragAnimationSetter.dragEnd);
    },
    onDrag: function(e){
        e = e || window.event;
        // e.preventDefault();

        let clientPos = e.touches[0][dragAnimationSetter.clientPos]; // elem에서 현재 마우스 위치
        let pos = dragAnimationSetter.prePos - clientPos; // 이동거리 = elem에서 이전 마우스 위치 - 현재 마우스 위치
        dragAnimationSetter.dragger_pos = (-dragAnimationSetter.offsetDir * this[dragAnimationSetter.offset]) + (dragAnimationSetter.offsetDir * pos);
        // dragger_pos < 0
        if(dragAnimationSetter.dragger_pos <= 0 && dragAnimationSetter.dragger_pos >= dragAnimationSetter.returnRange){
            dragAnimationSetter.prePos = clientPos;
            this.style[dragAnimationSetter.dir] = dragAnimationSetter.dragger_pos + "px";
        }
    },
    dragEnd: function(e){
        this.removeEventListener('mousemove', dragAnimationSetter.onDrag);
        this.removeEventListener('mouseup', dragAnimationSetter.dragEnd);

        let pos = dragAnimationSetter.dragger_pos;
        dragAnimationSetter.dragging = false;

        // returnRange 범위 안이면 다시 원래대로 돌아오면서 끝에서 튕기는 애니메이션 적용
        if(dragAnimationSetter.returnRange < pos && pos < 0){
            dragAnimationSetter.animate({
                duration: 3000,
                timing: dragAnimationSetter.bounceEaseOut,
                draw: function(progress){
                    dragAnimationSetter.dragger.style[dragAnimationSetter.dir] = progress * (dragAnimationSetter.offsetDir * dragAnimationSetter.dragger_pos) + "px";
                }
            })
        }
    },
    makeEaseOut: function(timing){
        return function(timeFraction){
            return -timing(1 - timeFraction); // -1 ~ 0
        }
    },
    bounce: function(timeFraction){
        for(let a=0,b=1; !dragAnimationSetter.dragging; a += b, b /= 2){
            if(timeFraction >= (7-4*a)/11){
                return (Math.pow((11-6*a-11*timeFraction)/4, 2) - Math.pow(b, 2)) * dragAnimationSetter.offsetDir;
            }
        }
    },
    animate: function(options){
        let start = performance.now();

        requestAnimationFrame(function animate(time){
            let timeFraction = (time - start) / options.duration;
            if(timeFraction > 1){
                timeFraction = 1;
            }

            let progress = options.timing(timeFraction);
            options.draw(progress);
            if(timeFraction < 1){
                requestAnimationFrame(animate);
            }
        });
    }
};
/*
// 마우스 이벤트
var dragAnimationSetter = {
    dragger: null,          // 드래그할 elem
    dragger_pos: null,      // dragger의 left/right/top/bottom
    offset: null,           // 드래그 방향(dir) 수평: offsetLeft, 수직: offsetTop
    offsetDir: null,        // left, top: -1, right, bottom: 1
    prePos: null,           // 드래그 중, 이전 위치값(elem에서의 마우스 위치)
    clientPos: null,        // 드래그 방향 수평: clientX, 수직: clientY
    returnRange: null,      //
    dir: null,              // 드래그 방향(left/right/top/bottom)
    bounceEaseOut: null,    // 손 놓은 경우, elem이 돌아올 때, 끝에서 튕기도록
    dragging: null,         // 현재 드래그 중인지 확인. 끝에서 튕기는 애니메이션 출력 중에 드래그하면 애니메이션 중단

    // dragger - 드래그할 elem
    // dir - 드래그 방향 (left, right, top, bottom)
    init: function(dragger, dir){
        if(dragger == null){
            return false;
        }
        this.dragger = dragger;

        this.dir = dir || "left";
        if(["left", "right"].includes(this.dir)){
            this.offset = "offsetLeft";
            this.clientPos = "clientX";
            this.returnRange = this.dragger.offsetWidth * 0.8 * -1;
        }
        else if(["top", "bottom"].includes(this.dir)){
            this.offset = "offsetTop";
            this.clientPos = "clientY";
            this.returnRange = this.dragger.offsetHeight * 0.8 * -1;
        }
        else{
            console.log('error');
            return false;
        }

        if(["left", "top"].includes(this.dir)){
            this.offsetDir = -1;
        }
        else{
            this.offsetDir = 1;
        }

        this.bounceEaseOut = this.makeEaseOut(this.bounce);

        this.dragger.addEventListener('mousedown', this.dragStart);
    },
    clear: function(){
        let elem = this.dragger;
        elem.removeEventListener('mousedown', this.dragStart);
        elem.style.left = '';
        elem.style.right = '';
        elem.style.top = '';
        elem.style.bottom = '';

        this.dragger = null;
        this.dragger_pos = null;
        this.offset = null;
        this.offsetDir = null;
        this.prePos = null;
        this.clientPos = null;
        this.returnRange = null;
        this.dir = null;
        this.bounceEaseOut = null;
        this.dragging = null;
    },
    dragStart: function(e){
        e = e || window.event;
        e.preventDefault();

        dragAnimationSetter.prePos = e[dragAnimationSetter.clientPos];
        dragAnimationSetter.dragging = true;

        this.addEventListener('mousemove', dragAnimationSetter.onDrag);
        this.addEventListener('mouseup', dragAnimationSetter.dragEnd);
    },
    onDrag: function(e){
        e = e || window.event;
        e.preventDefault();

        let clientPos = e[dragAnimationSetter.clientPos]; // elem에서 현재 마우스 위치
        let pos = dragAnimationSetter.prePos - clientPos; // 이동거리 = elem에서 이전 마우스 위치 - 현재 마우스 위치
        dragAnimationSetter.dragger_pos = (-dragAnimationSetter.offsetDir * this[dragAnimationSetter.offset]) + (dragAnimationSetter.offsetDir * pos);
        // dragger_pos < 0
        if(dragAnimationSetter.dragger_pos <= 0 && dragAnimationSetter.dragger_pos >= dragAnimationSetter.returnRange){
            dragAnimationSetter.prePos = clientPos;
            this.style[dragAnimationSetter.dir] = dragAnimationSetter.dragger_pos + "px";
        }
    },
    dragEnd: function(e){
        this.removeEventListener('mousemove', dragAnimationSetter.onDrag);
        this.removeEventListener('mouseup', dragAnimationSetter.dragEnd);

        let pos = dragAnimationSetter.dragger_pos;
        dragAnimationSetter.dragging = false;

        // returnRange 범위 안이면 다시 원래대로 돌아오면서 끝에서 튕기는 애니메이션 적용
        if(dragAnimationSetter.returnRange < pos && pos < 0){
            dragAnimationSetter.animate({
                duration: 3000,
                timing: dragAnimationSetter.bounceEaseOut,
                draw: function(progress){
                    dragAnimationSetter.dragger.style[dragAnimationSetter.dir] = progress * (dragAnimationSetter.offsetDir * dragAnimationSetter.dragger_pos) + "px";
                }
            })
        }
    },
    makeEaseOut: function(timing){
        return function(timeFraction){
            return -timing(1 - timeFraction); // -1 ~ 0
        }
    },
    bounce: function(timeFraction){
        for(let a=0,b=1; !dragAnimationSetter.dragging; a += b, b /= 2){
            if(timeFraction >= (7-4*a)/11){
                return (Math.pow((11-6*a-11*timeFraction)/4, 2) - Math.pow(b, 2)) * dragAnimationSetter.offsetDir;
            }
        }
    },
    animate: function(options){
        let start = performance.now();

        requestAnimationFrame(function animate(time){
            let timeFraction = (time - start) / options.duration;
            if(timeFraction > 1){
                timeFraction = 1;
            }

            let progress = options.timing(timeFraction);
            options.draw(progress);
            if(timeFraction < 1){
                requestAnimationFrame(animate);
            }
        });
    }
};
*/