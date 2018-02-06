<?php
    
    #### Display Functions ####
    /**
     * show_userbox
     *
     * Shows the user info
     *
     * @param (void) about this param
     * @return (void)
    */
    function show_userbox()
    {
        // retrieve the session information
        $u = $_SESSION['username'];
        $uid = $_SESSION['loginid'];
        // display the user box
        echo "<div id='userbox'>
                Welcome $u
                <ul>
                    <li><a href='./changepassword.php'>Change Password</a></li>
                    <li><a href='menu/logout.php'>Logout</a></li>
                </ul>
            </div>";
    }
    
    
    /**
     * show_loginform
     *
     * Shows the user the login form
     *
     * @param (bool) about this param
     * @return (void)
    */
    function show_loginform($disabled = false)
    {
    
        echo '<form name="login-form" id="login-form" method="post" action="./index.php">
    <fieldset>
    <h1>Squad Command</h1>
    <dl>
        <dt><label title="Username">Username: </label></dt>
        <dd><input tabindex="1" accesskey="u" name="username" type="text" maxlength="16" placeholder="Enter username" id="username" /></dd>
    </dl>
    <dl>
        <dt><label title="Password">Password: </label></dt>
        <dd><input tabindex="2" accesskey="p" name="password" type="password" maxlength="16" placeholder="Enter password" id="password" /></dd>
    </dl>
    <p><input tabindex="3" accesskey="l" type="submit" name="cmdlogin" value="Login"
   ';
        if ($disabled == true)
        {
            echo 'disabled="disabled"';
        }
        echo ' </p></fieldset><br>
        <br>
        <p>I just want to spectate</p>
        <input type="Button" id="spec" value="spectate" onclick="spectate()"></input><br>
        <br>
        <p> I do not have an account made</p>
        <input type="Button" id="goToSignup" value="Go To Signup Page" onclick="signUpWindow()"></input>
        </form> ';
    
    
    }
    
    /**
     * show_registration_form
     *
     * Shows the user the regristration form
     *
     * @param (bool) about this param
     * @return (void)
    */
    function show_registration_form(){
    
        echo '<form action="./register.php" method="post">
        <fieldset>
        <h1>Squad Command</h1>
    <dl>
        <dt><label for="username">Username:</label></dt>
        <dd><input name="username" type="text" id="username" maxlength="16" placeholder="Max 16">
        </dd>
    </dl>
    <dl>
        <dt><label for="password">Password:</label></dt>
        <dd><input name="password" type="password" id="password" maxlength="16" placeholder="Max 16">
        </dd>
    </dl>
    <dl>
        <dt><label for="password2">Re-type password:</label></dt>
        <dd><input name="password2" type="password" id="password2" maxlength="16" placeholder="Max 16">
        </dd>
    </dl>
    <dl>
        <dt><label for="email">email:</label></dt>
        <dd><input name="email" type="text" id="email" maxlength="255" placeholder="Enter email">
        </dd>
    </dl>
    <p>
        <input name="reset" type="reset" value="Reset">
        <input name="register" type="submit" value="Register">
    </p>
    </fieldset>
    <br>
    <p> I already have an account made</p>
    <input type="button" id="goToLogin" value="Go To Login Page" onclick="loginWindow()"></input>
    </form>';
    
    }
?>
