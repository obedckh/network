document.addEventListener('DOMContentLoaded', function() {

    document.querySelector('#allPost').addEventListener('click', () => load_post_viewport('allpost'));
    if (isAuthenticated){
        document.querySelector('#following').addEventListener('click', () => load_post_viewport('following'));
        document.querySelector('#username-btn').addEventListener('click', () => {
            const user_id = currentUserId;
            load_profile(user_id)
        });
    }
    load_post_viewport('allpost');

});

// get user profile metrics by id and render in profile page
function get_profile_info(id){
    fetch(`profileInfo/${id}`)
    .then(response => response.json())
    .then(user_info => {
        document.querySelector('#follow-div').style.display = 'none';
        document.querySelector('#profile-username').innerHTML = "";
        document.querySelector('#post-number').innerHTML = "";
        document.querySelector('#follower-number').innerHTML = "";
        document.querySelector('#following-number').innerHTML = "";
        document.querySelector('#profile-username').innerHTML = `${user_info[0].username}`;
        document.querySelector('#post-number').innerHTML = `<b>${user_info[0].post_count}</b>`;
        document.querySelector('#follower-number').innerHTML = `<b>${user_info[0].follower_count}</b>`;
        document.querySelector('#following-number').innerHTML = `<b>${user_info[0].following_count}</b>`;
        if (currentUserId !== parseInt(user_info[0].id, 10)){
            //console.log("Showing follow-div");
            document.querySelector('#follow-div').style.display = 'block';
        }
        else if (currentUserId === parseInt(user_info[0].id, 10)){
            //console.log("Hiding follow-div");
            document.querySelector('#follow-div').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function load_profile(user_id){

    //fetch profile
    function get_profile(id){
        console.log(`Fetching URL: user/${id}`);
        fetch(`user/${id}`)
        .then(response => response.json())
        .then(posts => {
            console.log(posts)
            render_post(posts)
            get_profile_info(id)
            }
        )
        .catch(error => {
            console.error('Error:', error);
        });
    }

    console.log('2 - load profile - show/ hide views')
    document.querySelector('#viewportTitle').innerHTML = "";
    if (isAuthenticated){
        document.querySelector('#edit-view').style.display = 'none';
        document.querySelector('#profile-view').style.display = 'block';
        //document.querySelector('#follow-div').style.display = 'none';
        document.querySelector('#create-div').style.display = 'block';
    }
    document.querySelector('#posts-view').style.display = 'block';
    console.log('profile view')
    get_profile(user_id);

}

// clear post-div.innerHtml and then render correct contents
function render_post(posts){
	console.log('1 start render post')
	const post_view = document.querySelector('#post-div');
	post_view.innerHTML = '';
	let allPosts = [];
	allPosts = posts;
	if (allPosts.length > 0){
		console.log('2 there are post to render')
		for (let i = 0; i< allPosts.length; i++){
			const post_object = allPosts[i];
			const post_div = document.createElement('div');
			post_div.innerHTML = construct_post_div(post_object);
			post_view.append(post_div);
		}
	}
	else if (allPosts.length === 0){
		console.log('3 NO post to render')
		const post_div = document.createElement('div');
		post_div.innerHTML = `<div class="card border-0">
				<div class="card-body">
					<p> No post.. </p>
				</div>
			</div>`;
		post_view.append(post_div);
	}


    // Add event listeners after posts are rendered
    document.querySelectorAll('#user-profile-btn').forEach((element) => {
        element.addEventListener('click', (event)=> {
            event.preventDefault(); // Prevent the default link behavior
            const post_owner_id = element.getAttribute('data-owner-id');
            load_profile(post_owner_id);
        });

    });

}

// fetch correspinding urls from views.py
function fetch_post(view){    
    console.log(`Fetching URL: post/${view}`);
    fetch(`post/${view}`)
    .then(response => response.json())
    .then(posts => {
        console.log(posts)
        render_post(posts)
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// return correct div (bootstrap card) for each post in list of posts return from views.py Fns
function construct_post_div(post_object){
        
    let editButton = '';
    if (parseInt(post_object.owner_id, 10) === currentUserId) {
        editButton = `<a id="edit-btn" href="">Edit</a>`;
    }
    
    return(`
        <div class="card mt-3">
            <div class="card-body">
                <h4><a href="" id="user-profile-btn" data-owner-id="${post_object.owner_id}">${post_object.post_owner}</a></h4>
                ${editButton}
                <p> ${post_object.content}</p>
                <p class="grey_text"> ${post_object.timestamp}</p>
                <p id="like_count">❤️ ${post_object.likes}</p>
                <p>commment</p>
            </div>
        </div>
        `);
}

function load_post_viewport(viewport){

    // show/hide appropriate view div
    console.log('1 - show/ hide views')
    if (isAuthenticated){
        document.querySelector('#edit-view').style.display = 'none';
        document.querySelector('#profile-view').style.display = 'none';
        document.querySelector('#follow-div').style.display = 'none';
        document.querySelector('#create-div').style.display = 'block';
    }
    document.querySelector('#posts-view').style.display = 'block';
    

    if (viewport === 'allpost'){
        document.querySelector('#viewportTitle').innerHTML = "All Post";
        console.log('all post view')
        fetch_post('allpost');
    } 
    else if (viewport === 'following'){
        document.querySelector('#viewportTitle').innerHTML = "Following";
        console.log('following post view')
        fetch_post('following');

    } 
}

