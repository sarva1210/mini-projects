var icons = document.querySelectorAll('.desktop-icon');
var desktopArea = document.querySelector('.desktop-area')
icons.forEach(icons => {
    icons.addEventListener('click', (e) => {
        e.stopPropagation();
        removeSelection();
        icons.classList.add('selected');
    });
});

desktopArea.addEventListener('click', () => {
    removeSelection();
});
function removeSelection() {
    icons.forEach(icon => {
        icon.classList.remove('selected');
    });
}

var contextMenu = document.querySelector('#context-menu')
desktopArea.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    contextMenu.style.left = e.clientX + "px";
    contextMenu.style.top = e.clientY + "px";
    contextMenu.classList.add("active");
})

document.addEventListener('click', () => {
    contextMenu.classList.remove("active");
});