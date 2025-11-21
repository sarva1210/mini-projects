var isstatus = document.querySelector("h5")
var btn = document.querySelector("#add")
var check = 0

btn.addEventListener("click",function(){
    if(check == 0){
        isstatus.innerHTML = "Friends"
        isstatus.style.color = "green"
        btn.innerHTML = "Remove Friend"
        btn.style.backgroundColor = "grey"
        btn.style.color = "black"
        check = 1
    }else{
        isstatus.innerHTML = "Stranger"
        isstatus.style.color = "red"
        btn.innerHTML = "Add Friend"
        btn.style.backgroundColor = "#5f9ea0"
        btn.style.color = "white"
        check = 0
    }
})
