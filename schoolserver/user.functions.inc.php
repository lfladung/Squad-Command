<?php
    /** 
     * user_exists
     * 
     * Checks if the username already exists in the DB
     * @param (string, string) new user info
     * @return (bool)
     */
    function user_exists($u, $p)
    {
        global $conn;

        //look for the user in the database.
        $name = "SELECT username FROM users WHERE username = '$u' AND password = '$p'";
        $nameResult = mysqli_query($conn, $name);
        $numOfNames = mysqli_num_rows($nameResult);


        if ($numOfNames != 1){
            return false;
        } else{
            // var_dump($numOfNames);
            // echo $numOfNames;
            return true;
        }
    }

    /** 
     * registerNewUser
     * 
     * Creates a new user
     * @param (string, string, string, string) new user info
     * @return (bool)
     */
    function registerNewUser($username, $password, $password2, $email)
    {
        global $conn;

        if (!valid_username($username) || !valid_password($password) ||
                !valid_email($email) || $password != $password2 || user_exists($username))
        {
            return false;
        }

        if(user_exists($username)){
            return false; // Username taken
        }

        $row = "SELECT userid FROM users";
        $rowResult = mysqli_query($conn, $row);
        $userid = mysqli_num_rows($rowResult) + 1;

        $registerQuery = "INSERT INTO users (userid, username, password, email) VALUES ('$userid','$username','$password','$email')";
        $succ = mysqli_query($conn, $registerQuery);

        $statQuery = "INSERT INTO STATS(UserId, win, loss, numKills, XP, Credits) VALUES ('$userid',0,0,0,0,0)";
        $thicc = mysqli_query($conn, $statQuery);

        if ($succ) {
            return true;
        } else{
            return false;
        }return false;
    }
?>
