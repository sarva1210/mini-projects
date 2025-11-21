var isstatus = document.querySelector("h5")
var img = document.querySelector('img')
var love = document.querySelector('#love')
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
img.addEventListener('dblclick', function () {

    love.style.opacity = 1
    love.style.transform = 'translate(-50%,-50%) scale(1) rotate(0deg)'

    setTimeout(function () {
        love.style.transform = 'translate(-50%,-300%) scale(1) rotate(60deg)'
    }, 800)
    setTimeout(function () {
        love.style.opacity = 0
    }, 1000)
    setTimeout(function () {
        love.style.transform = 'translate(-50%,-50%) scale(0) rotate(-60deg)'
    }, 1200)

})