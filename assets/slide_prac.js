let g_rtlDragger;
let g_rtlDragger_left;
let g_rtlDragger_prePos;

let g_returnRate = 0.9;

function onInit(){
    console.log('hello');

    g_rtlDragger = document.getElementById('rtl_dragger');

    // g_rtlDragger.addEventListener('mousedown', dragStart);
    g_rtlDragger.addEventListener('touchstart', dragStart);


}

function dragStart(event){
    event = event || window.event;
    event.preventDefault();

    // mouse event
    // g_rtlDragger_prePos = event.clientX;
    // touch event
    g_rtlDragger_prePos = event.touches[0].clientX;

    // mouse event
    // document.onmouseup = dragEnd;
    // document.onmousemove = onDrag;
    // touch event
    document.ontouchend = dragEnd;
    document.ontouchmove = onDrag;
}

function onDrag(e){
    e = e || window.event;
    // e.preventDefault();

    // mouse event
    // let posL = g_rtlDragger_prePos - e.clientX; // left 변화량
    // g_rtlDragger_left = g_rtlDragger.offsetLeft - posL; // 적용할 left 값
    // touch event
    let posL = g_rtlDragger_prePos - e.touches[0].clientX;
    g_rtlDragger_left = g_rtlDragger.offsetLeft - posL; // 적용할 left 값

    // 범위 안에서만 변화
    if(g_rtlDragger_left <= 0 && g_rtlDragger_left >= g_rtlDragger.offsetWidth * -g_returnRate){
        // mouse event
        // g_rtlDragger_prePos = e.clientX;
        // touch event
        g_rtlDragger_prePos = e.touches[0].clientX;

        g_rtlDragger.style.left = g_rtlDragger_left + "px";
    }
    console.log(g_rtlDragger_left);
}
function dragEnd(e){
    // document.onmouseup = null;
    // document.onmousemove = null;
    document.ontouchmove = null;
    document.ontouchend = null;

    if(g_rtlDragger.offsetWidth * -g_returnRate < g_rtlDragger_left){
        animate({
            duration: 3000,
            timing: makeEaseOut(bounce),
            draw: function(progress){
                g_rtlDragger.style.left = progress * -g_rtlDragger_left + "px"; // 손을 땐 위치부터 위치변화
            }
        });
    }
}

function animate(options){
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

function makeEaseOut(timing){
    return function(timeFraction){
        return -timing(1 - timeFraction); // -1 ~ 0
    }
}

function bounce(timeFraction){
    for(let a=0,b=1; true; a += b, b /= 2){
        if(timeFraction >= (7-4*a)/11){
            return -Math.pow((11-6*a-11*timeFraction) /4, 2) + Math.pow(b, 2);
        }
    }
}