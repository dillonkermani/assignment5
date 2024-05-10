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
            const tagRegex = /#(\w+)/g; // Improved regex to ensure no unwanted characters
            let match;
            const tags = [];
        
            while ((match = tagRegex.exec(this.newPost.text)) !== null) {
                tags.push(match[1]); // Pushes only the word without the hash
            }
        
            console.log("Creating post with text: ", this.newPost.text, " and tags: ", tags);
        
            axios.post(create_post_url, {
                text: this.newPost.text, 
                tags: tags // Already correctly formatted
            }).then(response => {
                this.posts.unshift({
                    id: response.data.id, 
                    text: this.newPost.text, 
                    tags: tags
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
            console.log("Filtering posts by tag: ", tag);
            if (index > -1) {
                this.activeTags.splice(index, 1);
                console.log("Removed tag from active filters: ", tag);
            } else {
                this.activeTags.push(tag);
                console.log("Added tag to active filters: ", tag);
            }
        },
        update_tags() {
            const allTags = new Set();
            this.posts.forEach(post => {
                const tags = Array.isArray(post.tags) ? post.tags : [];
                tags.forEach(tag => {
                    const cleanTag = tag.replace(/[{}'"]/g, ""); // Remove unwanted characters
                    allTags.add(cleanTag);
                });
            });
            this.tags = Array.from(allTags);
            console.log("Updated tags list: ", this.tags);
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