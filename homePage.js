//Selecting Homepage Time
const Playnow = document.querySelector('.btn');
const timeControl = document.querySelector('#timePlay');
timeControl.addEventListener('change', function(e){
    const time = timeControl.value;
    Playnow.style.display = "flex";
    localStorage.setItem("timeControl",time);
})