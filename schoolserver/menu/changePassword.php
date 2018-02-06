<?php
    session_start();
    include("../db_connect.inc.php");
    global $conn;

    $user = $_SESSION['username'];
    $oPass = mysqli_escape_string($conn, $_POST['oPass']);
    $nPass = mysqli_escape_string($conn, $_POST['nPass']);

    $query = "SELECT password FROM users WHERE username = '$user' AND password = '$oPass'";
    $match = mysqli_query($conn, $query);
    $num = mysqli_num_rows($match);

    if($num != 1){
        echo false;
    } else {
        $update = "UPDATE users SET password = '$nPass' WHERE username = '$user' AND password = '$oPass'";
        $result = mysqli_query($conn, $update);
        if ($result) {
            echo true;
        } else {
            echo false;
        }
    }
?>