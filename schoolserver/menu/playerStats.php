<?php
    header("Content-Type: application/json; charset=UTF-8");
    include("../db_connect.inc.php");

    global $conn;
    session_start();

    $data = json_decode($_GET["x"], false);
    $kills = $data->enemyTroopsKilled;
    $xp = $data->xp;
    $won = $data->won;
    $loss = !$won;
    $userid = $_SESSION['loginid'];

    $oldQuery = "SELECT * FROM STATS WHERE UserId = '$userid'";
    $oldMatch = mysqli_query($conn, $oldQuery);
    $oldArray = $oldMatch->fetch_array(MYSQL_ASSOC);

    $newKills = $oldArray['numKills'] + $kills;
    $newXp = $oldArray['XP'] + $xp;
    if($won){
        $newWon = $oldArray['win'] + 1;
    }else{
        $newWon = $oldArray['win'];
    }
    if($loss){
        $newLoss = $oldArray['loss'] + 1;
    }else{
        $newLoss = $oldArray['loss'];
    }

    $query = "UPDATE STATS SET win = '$newWon', loss = '$newLoss', numKills = '$newKills', XP = '$newXp', Credits = 0 WHERE UserId = '$userid'";
    $match = mysqli_query($conn, $query);
?>