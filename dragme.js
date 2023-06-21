
import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

var canvas, scene, renderer, camera, controls;

var raycaster;  // A THREE.Raycaster for user mouse input.

var ground; // A square base on which the cylinders stand.
var cylinder;  // A cylinder that will be cloned to make the visible cylinders.

var world;  // An Object3D that contains all the mesh objects in the scene.
// Rotation of the scene is done by rotating the world about its
// y-axis.  (I couldn't rotate the camera about the scene since
// the Raycaster wouldn't work with a camera that was a child
// of a rotated object.)

var ROTATE = 1, DRAG = 2, ADD = 3, DELETE = 4;  // Possible mouse actions
var mouseAction;  // currently selected mouse action
var dragItem;  // the cylinder that is being dragged, during a drag operation
var intersects; //the objects intersected

var targetForDragging;  // An invisible object that is used as the target for raycasting while
// dragging a cylinder.  I use it to find the new location of the
// cylinder.  I tried using the ground for this purpose, but to get
// the motion right, I needed a target that is at the same height
// above the ground as the point where the user clicked the cylinder.

function render() {
    renderer.render(scene, camera);
}

function createWorld() {
    scene = new THREE.Scene();
    renderer.setClearColor(0x333333);
    camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);


    // const renderer = new THREE.WebGLRenderer();
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // document.body.appendChild(renderer.domElement);


    camera.position.z = 0;
    camera.position.x = 0;
    camera.position.y = 180;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    camera.add(new THREE.PointLight(0xffffff, 0.7)); // point light at camera position
    scene.add(camera);

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = false;
    controls.enabled = false;

    scene.add(new THREE.DirectionalLight(0xffffff, 0.5)); // light shining from above.

    world = new THREE.Object3D();
    scene.add(world);

    ground = new THREE.Mesh(
        new THREE.BoxGeometry(400, 1, 400),
        new THREE.MeshLambertMaterial({ color: "green" })
    );
    ground.position.y = -0.5;  // top of base lies in the plane y = -5;
    world.add(ground);



    const gridHelper = new THREE.GridHelper(400, 40);
    world.add(gridHelper);


    targetForDragging = new THREE.Mesh(
        new THREE.BoxGeometry(100, 0.01, 100),
        new THREE.MeshBasicMaterial()
    );
    targetForDragging.material.visible = false;

    targetForDragging.material.transparent = true;  // This was used for debugging
    targetForDragging.material.opacity = 0.1;
    world.add(targetForDragging);


    cylinder = new THREE.Mesh(
        new THREE.BoxGeometry(10, 10, 10), // .CylinderGeometry(1, 2, 6, 16, 32),
        new THREE.MeshLambertMaterial({ color: "yellow" })
    );

    // const geometry = new THREE.BoxGeometry(10, 10, 10);
    // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // const cylinder = new THREE.Mesh(geometry, material);





    cylinder.position.y = 3;  // places base at y = 0;



    addCylinder(10, 10);
    addCylinder(0, 15);

}

function addCylinder(x, z) {
    var obj = cylinder.clone();
    obj.position.x = x;
    obj.position.z = z;
    world.add(obj);
}

function doMouseDown(x, y) {
    if (mouseAction == ROTATE) {
        return true;
    }

    if (targetForDragging.parent == world) {
        world.remove(targetForDragging);  // I don't want to check for hits on targetForDragging
    }
    var a = 2 * x / canvas.width - 1;
    var b = 1 - 2 * y / canvas.height;
    raycaster.setFromCamera(new THREE.Vector2(a, b), camera);
    intersects = raycaster.intersectObjects(world.children);  // no need for recusion since all objects are top-level
    if (intersects.length == 0) {
        return false;
    }
    var item = intersects[0];
    var objectHit = item.object;
    switch (mouseAction) {
        case DRAG:
            if (objectHit == ground) {
                return false;
            }
            else {
                dragItem = objectHit;
                world.add(targetForDragging);
                targetForDragging.position.set(0, item.point.y, 0);
                render();
                return true;
            }
        case ADD:
            if (objectHit == ground) {
                var i = prompt("Enter row count  - ")
                var locationX = item.point.x;  // Gives the point of intersection in world coords
                var locationZ = item.point.z;
                var coords = new THREE.Vector3(locationX, 0, locationZ);
                world.worldToLocal(coords);  // to add cylider in correct position, neew local coords for the world object

                a = Math.min(199, Math.max(-199, coords.x));  // clamp coords to the range -19 to 19, so object stays on ground
                b = Math.min(199, Math.max(-199, coords.z));
                console.log(a, b);
                a = (Math.round(a / 10) * 10) - 5;
                b = (Math.round(b / 10) * 10) - 5;
                addCylinder(a, b);
                render();
            }
            return false;
        default: // DELETE
            if (objectHit != ground) {
                world.remove(objectHit);
                render();
            }
            return false;
    }
}

function doMouseMove(x, y, evt, prevX, prevY) {
    if (mouseAction == ROTATE) {
        var dx = x - prevX;
        world.rotateY(dx / 200);
        render();
    }
    else {  // drag

        console.log("mouse drag", dragItem.geometry.type);
        if (dragItem.geometry.type != "BoxGeometry") {
            return 0;
        }
        var a = 2 * x / canvas.width - 1;
        var b = 1 - 2 * y / canvas.height;
        raycaster.setFromCamera(new THREE.Vector2(a, b), camera);
        intersects = raycaster.intersectObjects(world.children);  // no need for recusion since all objects are top-level
        if (intersects.length == 0) {
            return false;
        }
        var item = intersects[0];

        var locationX = item.point.x;  // Gives the point of intersection in world coords
        var locationZ = item.point.z;
        var coords = new THREE.Vector3(locationX, 0, locationZ);
        world.worldToLocal(coords);  // to add cylider in correct position, neew local coords for the world object

        a = Math.min(199, Math.max(-199, coords.x));  // clamp coords to the range -19 to 19, so object stays on ground
        b = Math.min(199, Math.max(-199, coords.z));
        console.log(a, b);
        a = (Math.round(a / 10) * 10) - 5;
        b = (Math.round(b / 10) * 10) - 5;
        dragItem.position.set(a, 3, b);
        console.log(a, 3, b);
        render(); 

return 1;


        var a = 2 * x / canvas.width - 1;
        var b = 1 - 2 * y / canvas.height;
        // console.log(a,b )

        raycaster.setFromCamera(new THREE.Vector2(a, b), camera);
        intersects = raycaster.intersectObject(targetForDragging);
        if (intersects.length == 0) {
            debugger;
            return;
        }
        var locationX = intersects[0].point.x;
        var locationZ = intersects[0].point.z;
        console.log(locationX, locationZ)
        var coords = new THREE.Vector3(locationX, 0, locationZ);
        world.worldToLocal(coords);


        a = Math.min(199, Math.max(-199, coords.x));  // clamp coords to the range -19 to 19, so object stays on ground
        b = Math.min(199, Math.max(-199, coords.z));
        console.log(a, b);
        a = (Math.round(a / 10) * 10) - 5;
        b = (Math.round(b / 10) * 10) - 5;


        //   b =(20-5);
        dragItem.position.set(a, 3, b);
        console.log(a, 3, b);
        render();
    }
}


function doJoyStickMove(x, y, evt, prevX, prevY) {
    if (mouseAction == ROTATE) {
        var dx = x - prevX;
        world.rotateY(dx / 200);
        render();
    }
    else {  // drag
        //var a = 2*x/canvas.width - 1;
        //var b = 1 - 2*y/canvas.height;
        //raycaster.setFromCamera( new THREE.Vector2(a,b), camera );
        //var intersects = raycaster.intersectObject( targetForDragging ); 
        //if (intersects.length == 0) {
        //	return;
        //}
        var locationX = intersects[0].point.x;
        var locationZ = intersects[0].point.z;
        var coords = new THREE.Vector3(locationX, 0, locationZ);
        world.worldToLocal(coords);
        a = Math.min(199, Math.max(-199, coords.x));  // clamp coords to the range -19 to 19, so object stays on ground
        b = Math.min(199, Math.max(-199, coords.z));
        dragItem.position.set(a + x, 3, b + y);
        render();
    }
}



function doChangeMouseAction() {
    if (document.getElementById("mouseRotate").checked) {
        mouseAction = ROTATE;
    }
    else if (document.getElementById("mouseDrag").checked) {
        mouseAction = DRAG;
    }
    else if (document.getElementById("mouseAdd").checked) {
        mouseAction = ADD;
    }
    else {
        mouseAction = DELETE;
    }
}

function init() {
    try {
        canvas = document.getElementById("maincanvas");
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML = "<p><b>Sorry, an error occurred:<br>" +
            e + "</b></p>";
        return;
    }
    document.getElementById("mouseDrag").checked = true;
    mouseAction = DRAG;
    document.getElementById("mouseRotate").onchange = doChangeMouseAction;
    document.getElementById("mouseDrag").onchange = doChangeMouseAction;
    document.getElementById("mouseAdd").onchange = doChangeMouseAction;
    document.getElementById("mouseDelete").onchange = doChangeMouseAction;
    createWorld();
    setUpMouseHander(canvas, doMouseDown, doMouseMove);
    setUpTouchHander(canvas, doMouseDown, doMouseMove);
    raycaster = new THREE.Raycaster();
    render();
}




window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    function (callback) {
        setTimeout(function () {
            callback(Date.now());
        }, 1000 / 60);
    };

function setUpMouseHander(element, mouseDownFunc, mouseDragFunc, mouseUpFunc) {
    /*
           element -- either the element itself or a string with the id of the element
           mouseDownFunc(x,y,evt) -- should return a boolean to indicate whether to start a drag operation
           mouseDragFunc(x,y,evt,prevX,prevY,startX,startY)
           mouseUpFunc(x,y,evt,prevX,prevY,startX,startY)
       */
    if (!element || !mouseDownFunc || !(typeof mouseDownFunc == "function")) {
        throw "Illegal arguments in setUpMouseHander";
    }
    if (typeof element == "string") {
        element = document.getElementById(element);
    }
    if (!element || !element.addEventListener) {
        throw "first argument in setUpMouseHander is not a valid element";
    }
    var dragging = false;
    var startX, startY;
    var prevX, prevY;

    function doMouseDown(evt) {
        if (dragging) {
            return;
        }
        var r = element.getBoundingClientRect();
        var x = evt.clientX - r.left;
        var y = evt.clientY - r.top;
        prevX = startX = x;
        prevY = startY = y;
        dragging = mouseDownFunc(x, y, evt);
        if (dragging) {
            document.addEventListener("mousemove", doMouseMove);
            document.addEventListener("mouseup", doMouseUp);
        }
    }

    function doMouseMove(evt) {
        if (dragging) {
            if (mouseDragFunc) {
                var r = element.getBoundingClientRect();
                var x = evt.clientX - r.left;
                var y = evt.clientY - r.top;
                mouseDragFunc(x, y, evt, prevX, prevY, startX, startY);
            }
            prevX = x;
            prevY = y;
        }
    }

    function doMouseUp(evt) {
        if (dragging) {
            document.removeEventListener("mousemove", doMouseMove);
            document.removeEventListener("mouseup", doMouseUp);
            if (mouseUpFunc) {
                var r = element.getBoundingClientRect();
                var x = evt.clientX - r.left;
                var y = evt.clientY - r.top;
                mouseUpFunc(x, y, evt, prevX, prevY, startX, startY);
            }
            dragging = false;
        }
    }
    element.addEventListener("mousedown", doMouseDown);
}

function setUpTouchHander(element, touchStartFunc, touchMoveFunc, touchEndFunc, touchCancelFunc) {
    /*
           element -- either the element itself or a string with the id of the element
           touchStartFunc(x,y,evt) -- should return a boolean to indicate whether to start a drag operation
           touchMoveFunc(x,y,evt,prevX,prevY,startX,startY)
           touchEndFunc(evt,prevX,prevY,startX,startY)
           touchCancelFunc()   // no parameters
       */
    if (!element || !touchStartFunc || !(typeof touchStartFunc == "function")) {
        throw "Illegal arguments in setUpTouchHander";
    }
    if (typeof element == "string") {
        element = document.getElementById(element);
    }
    if (!element || !element.addEventListener) {
        throw "first argument in setUpTouchHander is not a valid element";
    }
    var dragging = false;
    var startX, startY;
    var prevX, prevY;

    function doTouchStart(evt) {
        if (evt.touches.length != 1) {
            doTouchEnd(evt);
            return;
        }
        evt.preventDefault();
        if (dragging) {
            doTouchEnd();
        }
        var r = element.getBoundingClientRect();
        var x = evt.touches[0].clientX - r.left;
        var y = evt.touches[0].clientY - r.top;
        prevX = startX = x;
        prevY = startY = y;
        dragging = touchStartFunc(x, y, evt);
        if (dragging) {
            element.addEventListener("touchmove", doTouchMove);
            element.addEventListener("touchend", doTouchEnd);
            element.addEventListener("touchcancel", doTouchCancel);
        }
    }

    function doTouchMove(evt) {
        if (dragging) {
            if (evt.touches.length != 1) {
                doTouchEnd(evt);
                return;
            }
            evt.preventDefault();
            if (touchMoveFunc) {
                var r = element.getBoundingClientRect();
                var x = evt.touches[0].clientX - r.left;
                var y = evt.touches[0].clientY - r.top;
                touchMoveFunc(x, y, evt, prevX, prevY, startX, startY);
            }
            prevX = x;
            prevY = y;
        }
    }

    function doTouchCancel() {
        if (touchCancelFunc) {
            touchCancelFunc();
        }
    }


    function doTouchEnd(evt) {
        if (dragging) {
            dragging = false;
            element.removeEventListener("touchmove", doTouchMove);
            element.removeEventListener("touchend", doTouchEnd);
            element.removeEventListener("touchcancel", doTouchCancel);
            if (touchEndFunc) {
                touchEndFunc(evt, prevX, prevY, startX, startY);
            }
        }
    }
    element.addEventListener("touchstart", doTouchStart);
}


function moveSelectedObj() {
    if (mouseAction == ROTATE) {
        controls.enableDamping = true;
        controls.enabled = true;
        controls.update()
    } else {
        controls.enabled = false;
        controls.enableDamping = false
    }
    requestAnimationFrame(moveSelectedObj);
}
requestAnimationFrame(moveSelectedObj);
init();
