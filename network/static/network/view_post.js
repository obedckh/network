document.addEventListener('DOMContentLoaded', function() {

    document.querySelector('#allPost').addEventListener('click', () => load_post_viewport('allpost'));
    if (isAuthenticated){
        document.querySelector('#following').addEventListener('click', (event) => {
            event.preventDefault();
            load_post_viewport('following', 1)
        });
        document.querySelector('#username-btn').addEventListener('click', () => {
            const user_id = currentUserId;
            load_profile(user_id)
        });
    }
    //load_post_viewport('allpost');
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view') || 'allpost';
    load_post_viewport(view, 1);

    

    document.addEventListener('click', event => {
        const element = event.target;

        if (element.id === 'unfollowBtn' || element.id === 'followBtn') {
            const userId = element.getAttribute('data-user-id');
            const action = element.id === 'unfollowBtn' ? 'unfollow' : 'follow';
            fetch(`${action}/${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    console.log(data.message);
                    console.log('Calling load_profile after follow/unfollow');
                    load_profile(userId);
                } else if (data.error) {
                    console.error(data.error);
                }
            });
        }

        if (element.id === 'edit_btn'){
            update_post(element, 'edit');
        }
        if (element.id === 'like_btn'){
            update_post(element, 'like');
        }
    });

});

// return single post as object by given post_id
async function get_post_obj(post_id) {
    console.log(`get_post_obj() fetching getpost/${parseInt(post_id, 10)}`);
    try {
        const response = await fetch(`getpost/${parseInt(post_id, 10)}`);
        const post_obj = await response.json();
        console.log(post_obj);
        return post_obj;
    } catch (error) {
        console.error('Error:', error);
    }
}

// handle edit post and like, unlike post, and then update individual post without reloading
async function update_post(element, mode){

    // Function to get CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    console.log("Element:", element);
    console.log("Parent Element ID:", element.parentElement.id);

    const post_id = parseInt(element.parentElement.id, 10);
    const post_card_body_div = element.parentElement;
    const postContentElement = post_card_body_div.querySelector('#post_content');
    const editBtnElement = post_card_body_div.querySelector('#edit_btn');
    const likeBtnElement = post_card_body_div.querySelector('#like_count');
    const likeCountElement = post_card_body_div.querySelector('#like_btn');
    const likeBtnDiv = post_card_body_div.querySelector('#like_div');

    console.log('update_post function', post_id, post_card_body_div);
    if (mode === 'edit'){
        const originalContent = postContentElement.innerHTML;
        editBtnElement.style.display = "none";
        postContentElement.innerHTML="";
        let editContentDiv = document.createElement('div');
        editContentDiv.innerHTML = `
            <form id="editForm">
            <div class="form-group">
            <textarea class="form-control" name="editpost" id="editpost" rows="1">${originalContent}</textarea>
            </div>
            <button type="submit" class="btn btn-outline-primary">Save</button>
            </form>
            `
        postContentElement.append(editContentDiv);

        document.getElementById('editForm').addEventListener('submit', event => {
            event.preventDefault();
            const updatedContent = document.getElementById('editpost').value;
            console.log(post_id, mode, updatedContent);
            fetch(`/update_post/${post_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') // Include CSRF token
                },
                body: JSON.stringify({
                    content: updatedContent,
                    mode: mode
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    editBtnElement.style.display = "block";
                    postContentElement.innerHTML = updatedContent;
                } else {
                    console.error(data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    
        });
    }
    else if (mode === 'like'){
        console.log(post_id, "type of post id: ", typeof(post_id));
        fetch(`/update_post/${post_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken') // Include CSRF token
            },
            body: JSON.stringify({
                mode: element.getAttribute('data-action')
            })
        })
        .then(response => response.json())
        .then(async data => {
            if (data.success) {
                console.log("update_post() called return success")
                const post_obj = await get_post_obj(post_id);
                likeBtnElement.innerHTML = "";
                console.log(post_obj.likes);
                likeBtnElement.innerHTML = `❤️ ${post_obj.likes}`;
                if (post_obj.liked_user && post_obj.liked_user.includes(currentUserId)) {
                    element.innerHTML = "Unlike";
                    element.setAttribute('data-action', 'unlike');
                } else {
                    element.innerHTML = "Like";
                    element.setAttribute('data-action', 'like');
                }
            } else {
                console.error(data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}


// get user profile metrics by id and render in profile page
function get_profile_info(id){
    fetch(`profileInfo/${id}`)
    .then(response => response.json())
    .then(user_info => {
        console.log('get_profile_info called', user_info);
        document.querySelector('#follow-div').style.display = 'none';
        document.querySelector('#profile-username').innerHTML = "";
        document.querySelector('#post-number').innerHTML = "";
        document.querySelector('#follower-number').innerHTML = "";
        document.querySelector('#following-number').innerHTML = "";
        document.querySelector('#profile-username').innerHTML = `${user_info[0].username}`;
        document.querySelector('#post-number').innerHTML = `<b>${user_info[0].post_count}</b>`;
        document.querySelector('#follower-number').innerHTML = `<b>${user_info[0].follower_count}</b>`;
        document.querySelector('#following-number').innerHTML = `<b>${user_info[0].following_count}</b>`;
        if (currentUserId === parseInt(user_info[0].id, 10)){
            document.querySelector('#create-div').style.display = 'block';
            //console.log("Hiding follow-div");
            document.querySelector('#follow-div').style.display = 'none';
        }        
        else if (currentUserId !== parseInt(user_info[0].id, 10)){
            document.querySelector('#create-div').style.display = 'none';
            //console.log("Showing follow-div");
            document.querySelector('#follow-div').style.display = 'block';
            console.log("following: ",user_info[0].following_id);
            
            //render follow button according to follow status
            console.log("get_profile_info() user_info[0]", user_info[0]);
            show_follow_status(user_info[0]);
        }
        

    })
    .catch(error => {
        console.error('Error:', error);
    });
}


function show_follow_status(user_object) {
    console.log('show follow status()', user_object);
    let followDiv = document.querySelector('#follow-div .col-3');
    followDiv.innerHTML = "";
    let followBtnDiv = document.createElement('div');
    let followBtn = "";
    console.log(user_object.following_id);
    if (user_object.following_id.includes(currentUserId)) {
        console.log('following this user');
        followBtn = `<button class="btn btn-light" id="unfollowBtn" data-user-id="${user_object.id}">Unfollow</button>`;
    } else {
        console.log('not following this user');
        followBtn = `<button class="btn btn-light" id="followBtn" data-user-id="${user_object.id}">Follow</button>`;
    }

    followBtnDiv.innerHTML = followBtn;
    followDiv.append(followBtnDiv);
}

function load_profile(user_id){

    //fetch profile
    function get_profile(id, page = 1){
        console.log(`Fetching URL: user/${id}?page=${page}`);
        fetch(`post/${id}?page=${page}`)
        .then(response => response.json())
        .then(data => {
            console.log(data.posts);
            render_post(data.posts);
            setup_pagination(data, `${id}`);
            
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    console.log('2 - load profile - show/ hide views')
    document.querySelector('#viewportTitle').innerHTML = "";
    if (isAuthenticated){
        //document.querySelector('#edit-view').style.display = 'none';
        document.querySelector('#profile-view').style.display = 'block';        
    }
    document.querySelector('#posts-view').style.display = 'block';
    console.log('profile view')
    get_profile_info(user_id);
    get_profile(user_id, 1);

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
function fetch_post(view, page = 1){    
    console.log(`Fetching URL: post/${view}?page=${page}`);
    fetch(`/post/${view}?page=${page}`)
    .then(response => response.json())
    .then(data => {
        console.log(data.posts);
        render_post(data.posts);
        setup_pagination(data, view);        
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function setup_pagination(data, view) {
    console.log(view);
    const pagination_div = document.querySelector('#pagination-div');
    const prev_button = document.querySelector('#previous');
    const next_button = document.querySelector('#next');

    // Remove existing event listeners
    prev_button.replaceWith(prev_button.cloneNode(true));
    next_button.replaceWith(next_button.cloneNode(true));

    const new_prev_button = document.querySelector('#previous');
    const new_next_button = document.querySelector('#next');

    pagination_div.style.display = "none";
    new_prev_button.style.display = "none";
    new_next_button.style.display = "none";

    if (data.has_previous) {
        pagination_div.style.display = "block";
        new_prev_button.style.display = "block";
        new_prev_button.addEventListener('click', () => fetch_post(view, data.current_page - 1));
        //pagination_div.append(prev_button);
    }

    if (data.has_next) {
        pagination_div.style.display = "block";
        new_next_button.style.display = "block";
        new_next_button.addEventListener('click', () => fetch_post(view, data.current_page + 1));
        //pagination_div.append(next_button);
    }
}

// return correct div (bootstrap card) for each post in list of posts return from views.py Fns
function construct_post_div(post_object){
    //console.log("post_object.liked_user: ", post_object.liked_user, "type: ", typeof(post_object.liked_user));    
    let editButton = '';
    if (parseInt(post_object.owner_id, 10) === currentUserId) {
        editButton = `<a id="edit_btn" href="javascript:void(0);">Edit</a>`;
    }

    let likeButton = '';
    let likeBtn = `<a id="like_btn" href="javascript:void(0);" data-action="like">Like</a>`;
    let unlikeBtn = `<a id="like_btn" href="javascript:void(0);" data-action="unlike">Unlike</a>`;
    likeButton = likeBtn;
    
    if (post_object.liked_user !== null) {
        if (post_object.liked_user.includes(currentUserId)){
            
            likeButton = unlikeBtn;
        }
    }
    return(`
        <div class="card mt-3">
            <div class="card-body" id="${post_object.id}">
                <h6><b><a href="" id="user-profile-btn" data-owner-id="${post_object.owner_id}">${post_object.post_owner}</a></b></h6>
                <h6 id="post_content"> ${post_object.content}</h6>
                ${editButton}
                <p class="grey_text"> ${post_object.timestamp}</p>
                <p id="like_count">❤️ ${post_object.likes}</p>
                ${likeButton}
                
            </div>
        </div>
        `);
}

function load_post_viewport(viewport, page = 1){

    // show/hide appropriate view div
    console.log('1 - show/ hide views')
    if (isAuthenticated){
        //document.querySelector('#edit-view').style.display = 'none';
        document.querySelector('#profile-view').style.display = 'none';
        document.querySelector('#follow-div').style.display = 'none';
        document.querySelector('#create-div').style.display = 'block';
    }
    document.querySelector('#posts-view').style.display = 'block';
    

    if (viewport === 'allpost'){
        document.querySelector('#viewportTitle').innerHTML = "All Post";
        console.log('all post view')
        fetch_post('allpost', page);
    } 
    else if (viewport === 'following'){
        document.querySelector('#viewportTitle').innerHTML = "Following";
        console.log('following post view')
        fetch_post('following', page);
        

    } 
}

