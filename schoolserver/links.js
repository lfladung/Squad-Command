/**
 * loginWindow - reroutes the user to ./index.php
 *
 */
function loginWindow()
{
	window.location = "index.php";
}


/**
 * signUpWindow - reoutes the user to ./register.php
 */
function signUpWindow()
{
	window.location = "register.php";
}


/**
 * goToMenu - reroutes the user to ./menu.index
 */
function goToMenu()
{
	window.location = "menu.index";
}

function spectate()
{
	window.location.href = "http://squad-command.herokuapp.com/spectator";
}