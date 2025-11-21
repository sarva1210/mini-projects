var main = document.querySelector("#main");
var cursor = document.querySelector(".cursor");
var heads = document.querySelectorAll(".head");

// Cursor follow
main.addEventListener("mousemove", function(dets){
    cursor.style.left = dets.x + "px";
    cursor.style.top = dets.y + "px";
});

// Cursor effects
heads.forEach(function(head){
    head.addEventListener("mouseenter", function(){
        cursor.classList.add("big");

        if(head.classList.contains("red")) cursor.classList.add("redC");
        if(head.classList.contains("blue")) cursor.classList.add("blueC");
        if(head.classList.contains("green")) cursor.classList.add("greenC");
    });

    head.addEventListener("mouseleave", function(){
        cursor.className = "cursor"; 
    });
});
