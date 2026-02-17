//Ui related tags ids
const ui = document.querySelector('#ui');
const menuToggle = {element: document.querySelector('#menuToggle'), state: 0};
const tabs = ui.querySelector('#tabs');
let activeTab = "carUi";

//files
let previewImageFile;


//mouse position stuff

window.addEventListener('mousemove', mouseMoveHandler);

let relativeX;
let relativeY;

let viewPortWidth = document.documentElement.clientWidth;
let viewPortHeight = document.documentElement.clientHeight;

let xBounds = {min: (viewPortWidth/100)*25, max: viewPortWidth};
let yBounds = {min: 0, max: viewPortHeight};


tabs.addEventListener("click", (event) => {
    tabs.querySelectorAll("li").forEach( (el) => {
        if(el.getAttribute("data-id") !== event.target.getAttribute("data-id")){
            el.removeAttribute("class","is-active");
        }
    });
    const tabID = event.target.getAttribute("data-id");

    tabs.querySelector("#"+tabID).setAttribute("class", "is-active" );
    activeTab = tabID;

    switch (activeTab){
        case "animations":
            activateAnimations();
    }
    //console.log(activeTab);
});


//MenuToggle

const moveRightAnim = [
    {transform:"translatex(0vw)"},
    {transform:"translatex(-23.7vw)"}
];

const moveLeftAnim = [
    {transform:"translatex(-23.7vw)"},
    {transform:"translatex(0vw)"}
];

const moveTiming = { 
  duration: 155,
  iterations: 1,
};


function checkMouse(){
    if(relativeX >= xBounds.min && relativeX <= xBounds.max 
    && relativeY >= yBounds.min && relativeY <= yBounds.max){
        return true;
    }

    return false;
}


function mouseMoveHandler(e){
    relativeX = e.clientX;
    relativeY = e.clientY;

    //console.log("x: "+relativeX, "y: "+relativeY);
}


//menuToggle button
menuToggle.element.addEventListener("click", (event) => {
    if(menuToggle.state == 0){
       ui.animate(moveRightAnim, moveTiming);
       ui.style.transform = "translatex(-23.7vw)";
       menuToggle.element.textContent = '>';
       menuToggle.state = 1;
       xBounds.min = 0;
    }else{
        ui.animate(moveLeftAnim, moveTiming);
        ui.style.transform = "translatex(0vw)";
        menuToggle.element.textContent = '<';
        menuToggle.state = 0;
        xBounds.min = (viewPortWidth/100)*25;
    }
});
