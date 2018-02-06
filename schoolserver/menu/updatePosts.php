<?php
    include_once('class.php');
    session_start();
    date_default_timezone_set('America/Chicago');
	$userName = $_SESSION['username'];
    $status = $_POST["status"];
    
    $postInformation = new Post();
    $postInformation->postTitle = $_POST["new_Title"];
    $postInformation->postDescription = $_POST["new_Post"];
    $postInformation->postTime = date(DATE_RFC2822);
    $postInformation->userID = $_SESSION['loginid'];

    $myPostsArray  =  array();

    if(file_exists("../storage/posts.txt")){
        $stringPostsData = file_get_contents("../storage/posts.txt"); //Array of Posts
        $myPostsArray = json_decode($stringPostsData);
        $postInformation->postID = count($myPostsArray)+1;
    }else{
        $myfile = fopen("../storage/posts.txt", "w+") or die("Unable to open file!");
        $postInformation->postID = 1;
    }

    $_SESSION['userInformation'] = $postInformation;

	if($status == 'delete' && $userName == "Administrator"){	// Admin delete post
		$index = count($myPostsArray) - $_POST["index"];

		$thingToReturn = ($myPostsArray[$index]);
		array_splice($myPostsArray,$index, 1);

		$myPostsArray = reIndexArray($myPostsArray);
		$stringPostsData = json_encode($myPostsArray);

		file_put_contents("../storage/posts.txt", $stringPostsData);
		echo json_encode($thingToReturn);
	}else if(isMatch($_SESSION['userInformation'], $myPostsArray)){
        if((postMatch($_SESSION['userInformation'], $myPostsArray)->userID) == ($_SESSION['userInformation']->userID)){
			if($status == 'update'){	// Edit post
				$index = ((postMatch($_SESSION['userInformation'], $myPostsArray)->postID)-1);
				array_splice($myPostsArray,$index, 1);

				$myPostsArray = array_values($myPostsArray);
				array_push($myPostsArray, $postInformation);

				$myPostsArray = reIndexArray($myPostsArray);
				$stringPostsData = json_encode($myPostsArray);

				file_put_contents("../storage/posts.txt", $stringPostsData);
				echo json_encode($postInformation);
			}else{
				echo 'false';
			}
		} else{ echo "false";}
    }else{													// Creat post
		array_push($myPostsArray, $postInformation);
		$stringPostsData = json_encode($myPostsArray);
		
		file_put_contents("../storage/posts.txt", $stringPostsData);
        echo json_encode($postInformation);
    }

    function isMatch($matchPost, $mP){
		if(postMatch($matchPost, $mP) != null && $matchPost->postTitle == postMatch($matchPost, $mP)->postTitle)
			return true;
		return false;
	}
	
	function postMatch($postToMatch, $mP){
		if(filesize("../storage/posts.txt") == 0){return null;}
		for($i = 0; $i<count($mP); $i++){
			if($mP[$i]->postTitle == $postToMatch->postTitle){	return $mP[$i];}
		}return null;
	}
	
	function reIndexArray($mP){
		for($i = 0; $i<count($mP); $i++){
			$mP[$i]->postID = ($i+1);
		}return $mP;
	}
?>