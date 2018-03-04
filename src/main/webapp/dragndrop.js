function dragHandler(event) {
    event.stopPropagation();
    event.preventDefault();

    var drop_area = document.getElementById("drop_area");
    drop_area.className = "area drag";
}

function filesDroped(event) {

    var files = Array();

    try {
        event.stopPropagation();
        event.preventDefault();
        files = event.dataTransfer.files; //It returns a FileList object
    }catch(e){
        console.log(document.getElementById("file").files[0]);
        files.push(document.getElementById("file").files[0]);
    }

    if($("#transaction-id").val() == ""){
        window.alert("please provide transaction ID");
        return false;
    }

    drop_area.className = "area";


    var filesInfo = "";

    for (var i = 0; i < files.length; i++) {

        var toType = function(obj) {
            return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
        }

        var r = new FileReader();
        var output = document.getElementById("result");

        r.onload = function(){
            console.log(this.result);
            console.log(toType(this.result));
            var sha = CryptoJS.SHA256(CryptoJS.enc.Latin1.parse(this.result));
            var bitArray = sjcl.hash.sha256.hash(CryptoJS.enc.Latin1.parse(this.result));
            var digest_sha256 = sjcl.codec.hex.fromBits(bitArray);

            $("#sha-res").html("<p> SHA calculated : " + sha + "</p>");

            var protocol = location.protocol;
            var slashes = protocol.concat("//");
            var host = slashes.concat(window.location.hostname) + ":8080/";
            var id = 1;

            $("#result").append("<p>Checking authenticity </p></br>");

            $.ajax({
                type: 'GET',
                contentType: 'application/json',
                url: host + "microservicenooauth/api/getDigest?Transaction=" + $("#transaction-id").val(),
                dataType: "json",
                success: function(data){
                    console.log("test response : " + data.digest)
                    if (data.digest == sha.toString()) {
                        $("#result").append("<h1 class=\"display-15\" style=\"color: green;\"> <i class=\"fa fa-check\"></i> authentication success </h1></br>");
                    }else{
                        $("#result").append("<h1 class=\"display-15\" style=\"color: red;\"> <i class=\"fa fa-times\"></i> authentication failed </h1></br>");
                    }
                },
                error: function(jqXHR, textStatus, errorThrown){
                    alert("Error while processing request");
                }
            });

        }

        var file = files[i];

        filesInfo += "<li>Name: " + file.name + "</br>" + " Size: " + file.size + " bytes</br>" + " Type: " + file.type + "</br>" + " Modified Date: " + file.lastModifiedDate + "</li>";
        r.readAsBinaryString(file);
        //console.log(r.readAsBinaryString(file));
        // var filecontent = r.readAsArrayBuffer(file);
        // console.log(r.result);
        // var sha = CryptoJS.SHA256(r.result);
        // console.log(sha.toString());
    }

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
