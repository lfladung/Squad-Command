<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
	<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <audio id="soundtrack" preload="auto" src="media/sounds/menu.mp3" loop="true" volume=".35" autobuffer>
        Unsupported in Firefox
    </audio>
    <style>
        body {
            background: #777;
        }

        table {
            border-collapse: collapse;
        }

        table,
        th,
        td {
            border: 1px solid black;
            vertical-align: top;
            text-align: left;
        }

        input#volumeslider {
            width: 70px;
        }

        input[type='range'] {
            -webkit-appearance: none !important;
            margin: 0px;
            padding: 0px;
            background: #000;
            height: 13px;
            border-bottom: #333 1px solid;
        }

        input[type='range']::-ms-fill-lower {
            background: #000;
        }

        input[type='range']::-ms-fill-upper {
            background: #000;
        }

        input[type='range']::-moz-range-track {
            border: none;
            background: #000;
        }

        input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none !important;
            background: radial-gradient(#FFF, #333);
            height: 11px;
            width: 11px;
            border-radius: 100%;
            cursor: pointer;
        }

        input[type='range']::-moz-range-thumb {
            background: radial-gradient(#FFF, #333);
            height: 11px;
            width: 11px;
            border-radius: 100%;
            cursor: pointer;
        }

        input[type='range']::-ms-thumb {
            -webkit-appearance: none !important;
            background: radial-gradient(#FFF, #333);
            height: 11px;
            width: 11px;
            border-radius: 100%;
            cursor: pointer;
        }
    </style>
    <title>LOBBY</title>
</head>

<body>
    <?php
        session_start();
        
        if(!file_exists("posts.txt")){
            $myPArray = null;
        }else{
            $stringPostsData = file_get_contents("posts.txt");	#Array of Posts
            $myPArray = json_decode($stringPostsData);
        }
    ?>
    <script>
        localStorage.setItem("user", "<?php echo $_SESSION['username'];?>");
    </script>

    <legend id="username" style="font-family:verdana"></legend>
    <input style="cursor: pointer;" type="Button" name="FIGHT!" id="fightbtn" value="FIGHT!"></input>
    <input style="cursor: pointer;" type="Button" name="Menu" id="menubtn" value="Menu"></input>
    <img style="cursor: pointer;" id="muteicon" src="media/img/Speaker_Icon.png" height="14px">
    <input style="cursor: pointer;" id="volumeslider" type="range" min="0" max="1" value="" step=".05"></input>

    <form id="formID">
        <fieldset>
            <p style="font-family:verdana">Message Title</p>
            <input id="messageTitle" style="font-family:verdana" type="text" placeholder="Enter Title"></input>
            <p style="font-family:verdana">Message</p>
            <textarea style="width:100%;font-family:verdana" id="myTextArea" rows="5" cols="80" placeholder="Type your message here!"></textarea>
            <br>
            <input type="Button" style="cursor: pointer;font-family:verdana" name="Post" id="postbtn" value="Make Post"></input>
            <input type="Button" style="cursor: pointer;font-family:verdana" name="checkInboxButton" id="checkInboxButton" value="Check Inbox"></input>
            <input type="Button" style="cursor: pointer;font-family:verdana" name="sendMessage" id="sendMessageButton" value="send Message"></input>
        </fieldset>
    </form>

    <form>
        <fieldset>
            <legend>Post Board</legend>
            <p div="currentMessages">
                <table id="postBoard" type="text">
                    <tr>
                        <th style="width:15%">Title</th>
                        <th style="width:58%">Description</th>
                        <th>Time</th>
                        <th>Update</th>
                    </tr>
                    <?php
                        if(!file_exists("../storage/posts.txt")){
                            $postArray = null;
                        }else{
                            $stringPostsData = file_get_contents("../storage/posts.txt");
                            $postArray = json_decode($stringPostsData);
                            $numPost = count($postArray);
                        }
                        if($postArray != null && $numPost > 0){
                            $posts = $postArray;
                            foreach($posts as $post){
                                $post_d = json_decode(json_encode($post), true);
                                ?>
                                <script>
                                    var table = document.getElementById("postBoard");
                                    data = <?php echo json_encode($post_d)?>;
                                    var row = table.insertRow(1);
                                    var cell1 = row.insertCell(0);
                                    var cell2 = row.insertCell(1);
                                    var cell3 = row.insertCell(2);
                                    var cell4 = row.insertCell(3);
                                    cell1.innerHTML = data['postTitle'];
                                    cell2.innerHTML = data['postDescription'];
                                    cell3.innerHTML = data['postTime'];
                                    var username = localStorage.getItem("user");
                                    if(username == "Administrator"){
                                        cell4.innerHTML = "<input type=\"Button\" name=\"delete\" id=\"deleteBtn\" value=\"Delete\"></input>";
                                        $("#deleteBtn").on("click", function(e){
                                            var row = this.parentNode.parentNode;
                                            aD(row);
                                        });
                                    }else{
                                        cell4.innerHTML = "<input type=\"Button\" name=\"update\" id=\"updateBtn\" value=\"Update\"></input>";
                                        $("#updateBtn").on("click", function(e){
                                            uP();
                                        });
                                    }
                                    </script>
                                <?php
                            }
                        }
                    ?>
                </table>
            </p>
        </feildset>
    </form>

</body>
<script>
    var title = $("#messageTitle");
    var post = $("#myTextArea");
    $(document).ready(function () {
        var username = localStorage.getItem("user");
        document.getElementById("username").innerHTML = username;
        $("#sendMessageButton").click(function(){
            window.location.href = "sendMessage.php";
        });
        $("#checkInboxButton").on("click", function(){
            window.location.href = "inbox.php";
        }); //checkInboxButton.click
        $("#postbtn").on("click", function(e){
            makePost();				
        });
        $("#fightbtn").click(function () {
            if(username == "Administrator")
                window.location.href = "http://squad-command.herokuapp.com/admin";
            else
                window.location.href = "http://squad-command.herokuapp.com/player";
        });
        $("#menubtn").click(function () {
            window.location.href = "http://proj-309-gk-b-7.cs.iastate.edu/menu/menu.html";
        });

        function makePost(){
            if(title.val().length > 0 && post.val().length > 0){
                $.post("updatePosts.php",
                {
                    new_Title:title.val(),
                    new_Post:post.val(),
                    status:'post'
                },
                function(data, status){
                    console.log("Data: " + data + "\n\nStatus: " + status);
                    if(status == "success" && data != "false"){
                        var json = JSON.parse(data);
                        insertFreshRow(json);
                    }else{
                        alert("Please choose a unique title");
                    }
                });
            }else{
                alert("You need to fill out the title and messgae values");
            }
        }

        uP = function updatePost(){
            $.post("updatePosts.php",
            {
                new_Title:title.val(),
                new_Post:post.val(),
                status:"update"
            },
            function(data, status){
                var json= JSON.parse(data);
                if(json != "false"){
                    deleteFreshRow(json);
                }else{
                    alert("Can't update post");
                }
            })
        };

        function insertFreshRow(data){
            var table = document.getElementById("postBoard");
            var row = table.insertRow(1);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);

            cell1.innerHTML = data['postTitle'];
            cell2.innerHTML = data['postDescription'];
            cell3.innerHTML = data['postTime'];

            if(username == "Administrator"){
                cell4.innerHTML = "<input type=\"Button\" name=\"delete\" id =\"deleteBtn\" value=\"Delete\"></input>";
                $("#deleteBtn").on("click", function(e){
                    var row= this.parentNode.parentNode;
                    aD(row);
                });
            }else{
                cell4.innerHTML = "<input type=\"Button\" name=\"update\" id=\"updateBtn\" value=\"Update\"></input>";
                $("#updateBtn").on("click", function(e){
                    uP();
                });
            }
        };

        aD = function adminDelete(index){
            $.post("updatePosts.php", 
            {
                new_Title:title.val(),
                new_Post:post.val(),
                index:index.rowIndex,
                status:"delete"
            },
            function(data, status){
                console.log("Data: " + data + "\n\nStatus: " + status);
                var json = JSON.parse(data);
                adminDeleteRow(index);
            })
        };

        function adminDeleteRow(row){
            var oTable = document.getElementById('postBoard');
            oTable.deleteRow(row.rowIndex);
        }

        function deleteFreshRow(titleToRemove){
            var oTable = document.getElementById("postBoard");
            var rowLength = oTable.rows.length;
            
            for(i = 0; i< rowLength; i++){
                var oCells = oTable.rows.item(i).cells;
                var cellLength = oCells.length;
                for(var j = 0; j< cellLength; j++){
                    var cellVal = oCells.item(j).innerHTML;
                    if(cellVal == titleToRemove['postTitle']){
                        oTable.deleteRow(i);
                        insertFreshRow(titleToRemove);
                        break;
                    }
                }
            }
        }
        //Music Stuff Begin
        function setCookie(c_name, value, exdays) {
            var exdate = new Date();
            exdate.setDate(exdate.getDate() + exdays);
            var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
            document.cookie = c_name + "=" + c_value;
        }

        function getCookie(c_name) {
            var i, x, y, ARRcookies = document.cookie.split(";");
            for (i = 0; i < ARRcookies.length; i++) {
                x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
                y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
                x = x.replace(/^\s+|\s+$/g, "");
                if (x == c_name) {
                    return unescape(y);
                }
            }
        }

        var song = document.getElementsByTagName('audio')[0];
        var played = false;
        var tillPlayed = getCookie('timePlayed');

        function update() {
            if (!played) {
                if (tillPlayed) {
                    song.currentTime = tillPlayed;
                    song.play();
                    played = true;
                } else {
                    song.play();
                    played = true;
                }
            } else {
                setCookie('timePlayed', song.currentTime);
            }
        }
        setInterval(update, 1000);

        var muted = false;

        var mutebtn = document.getElementById("#mutebtn");
        var audio = document.getElementById("soundtrack");
        var volumeslider = document.getElementById("volumeslider");
        volumeslider.value = localStorage.getItem("musicVol");
        audio.volume = localStorage.getItem("musicVol");
        var prevousVol = audio.volume;

        volumeslider.addEventListener("mousemove", function () {
            if (!muted) {
                audio.volume = prevousVol = this.value;
            }
        });

        $("#muteicon").click(function () {
            mute(this);
        });

        function mute(img) {
            if (muted) {
                muted = false;
                img.src = "media/img/Speaker_Icon.png";
                audio.volume = prevousVol;
            } else {
                muted = true;
                img.src = "media/img/Mute_Icon.png";
                audio.volume = 0;
            }
        }   // Music Stuff Ends
    }); //document ready

    $.get("isLoggedIn.php", function(data, status){
        if(!data){
            window.location = "../index.php";
        }
    });  
</script>

</html>