<?php
    /**
     * isLoggedIn
     *
     * Checks if the user is logged in
     *
     * @param (void)
     * @return (bool)
    */
    function isLoggedIn()
    {
        if (isset($_SESSION['loginid']) && isset($_SESSION['username']))
        {
            return true; // the user is loged in
        } else
        {
            return false; // not logged in
        }
    
        return false;
    
    }
    /**
     * checkLogin
     *
     * Checks if the login is valid
     *
     * @param (void)
     * @return (bool)
    */
    function checkLogin($u, $p)
    {
        global $seed; // global because $seed is declared in the header.php file
        global $conn;
        if (!valid_username($u)){
            var_dump("Invalid username");
            return false;
        } 
        if (!valid_password($p)){
            var_dump("Invalid password");
            return false;
        } 
        if(!user_exists($u, $p)){
            var_dump("No username");
            return false; // the name was not valid, or the password, or the username did not exist
        }
        
        $user = mysqli_escape_string($conn, $u);
        $pass = mysqli_escape_string($conn, $p);

        $name = "SELECT userid, username FROM users WHERE username = '$user' AND password = '$pass'";
        $nameResult = mysqli_query($conn, $name)or die(mysql_error);
        $row = mysqli_fetch_array($nameResult);
        
        if(!empty($row['username'])){
            var_dump($row);
        }else{
            echo "row is empty";
        }
        $_SESSION['loginid'] = $row['userid'];
        // var_dump($_SESSION['loginid']);
        
        $_SESSION['username'] = $row['username'];

        return true;
    }

?>