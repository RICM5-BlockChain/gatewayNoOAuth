function dragHandler(event) {
    event.stopPropagation();
    event.preventDefault();

    var drop_area = document.getElementById("drop_area");
    drop_area.className = "area drag";
}

function filesDroped(event) {
    event.stopPropagation();
    event.preventDefault();

    drop_area.className = "area";

    var files = event.dataTransfer.files; //It returns a FileList object
    var filesInfo = "";

    for (var i = 0; i < files.length; i++) {
        var file = files[i];

        filesInfo += "<li>Name: " + file.name + "</br>" + " Size: " + file.size + " bytes</br>" + " Type: " + file.type + "</br>" + " Modified Date: " + file.lastModifiedDate + "</li>";

    }

    var output = document.getElementById("result");

    output.innerHTML = "<ul>" + filesInfo + "</ul>";
}

window.onload = function() {

    //Check File API support
    if (window.File && window.FileList) {
        var drop_area = document.getElementById("drop_area");

        drop_area.addEventListener("dragover", dragHandler);
        drop_area.addEventListener("drop", filesDroped);

    }
    else {
        console.log("Your browser does not support File API");
    }
}
