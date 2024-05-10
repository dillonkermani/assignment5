"use strict";

let app = {};
// Complete. 
app.data = {
    data() {
        return {
            newPost: {
                    text: "",
                    tags: []
            },
            posts: [],
            tags: [],
            activeTags: [],
            isLoggedIn: true // This should be dynamically checked
        };
    },
    computed: {
        filtered_posts() {
            if (this.activeTags.length === 0) {
                return this.posts;
            }
            return this.posts.filter(post => post.tags.some(tag => this.activeTags.includes(tag)));
        }
    },
    methods: {
        create_post() {
            const tags = this.newPost.text.match(/#\w+/g) || [];
            console.log("Creating post with text: ", this.newPost.text, " and tags: ", tags);

            axios.post(create_post_url, {
                text: this.newPost.text, 
                tags: tags.map(tag => tag.slice(1)) 
            }).then(response => {
                console.log("Post created with ID: ", response.data.id);
                this.posts.unshift({
                        id: response.data.id, 
                        text: this.newPost.text, 
                        tags: tags.map(tag => tag.slice(1))
                });
                this.reset_new_post();
                this.update_tags();
            });
        },
        delete_post(post) {
            let self = this;
            let idx = self.find_post_idx(post);
            if (idx === null) {
                    console.log("Post not found: " + post.text);
                    return;
            }
            let post_id = self.posts[idx].id; // Get the post's id
            axios.post(delete_post_url, {
                    id: post_id, // Use the post's id here
            }).then(function (r) {
                    self.posts.splice(idx, 1); // Removes the post from sight.
                    console.log("Deleted post " + post.text);
                    self.update_tags();

            });
        },
        filter_by(tag) {
            const index = this.activeTags.indexOf(tag);
            if (index > -1) {
                this.activeTags.splice(index, 1);
            } else {
                this.activeTags.push(tag);
            }
        },
        update_tags() {
            const allTags = new Set();
            this.posts.forEach(post => {
                    // Check if 'tags' exists and is an array; if not, treat it as an empty array.
                    const tags = Array.isArray(post.tags) ? post.tags : [];
                    tags.forEach(tag => allTags.add(tag));
            });
            this.tags = Array.from(allTags);
        },
        find_post_idx: function(post) {
            // Finds the index of an item in the list.
            for (let i = 0; i < this.posts.length; i++) {
                if (this.posts[i] === post) {
                        return i;
                }
            }
            return null;
        },
        reset_new_post() {
            this.newPost = {
                text: "",
                tags: []
            };
        },
    },
};
		
app.vue = Vue.createApp(app.data).mount('#app');

app.load_data = function() {
    console.log("Starting to load data...");
    axios.get(get_posts_url).then(response => {
        app.vue.posts = response.data.posts;
        console.log("Loaded posts: ", app.vue.posts);
        app.vue.update_tags();
    }).catch(function(error) {
        console.log('error loading posts: ', error);
    });  
};
	
app.load_data(); // Load the initial data