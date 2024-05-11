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
            email: "",
        };
    },
    computed: {
        filtered_posts() {
            if (this.activeTags.length === 0) {
                return this.posts;
            }
            console.log("Filtering posts by tags: ", this.activeTags.map(tag => tag));
            console.log("Post tags: ", this.posts.flatMap(post => post.tags.map(tag => tag)));
            return this.posts.filter(post => 
                post.tags.some(postTag => {
                    const cleanTags = postTag.replace(/[{}'"]/g, "").split(','); // Split tags by comma
                    return cleanTags.some(cleanTag => {
                        const trimmedTag = cleanTag.trim(); // Remove leading and trailing whitespace
                        return this.activeTags.includes(trimmedTag);
                    });
                })
            );
        }
    },
    methods: {
        get_email() {
            axios.get(get_email_url).then(response => {
                console.log("Email: ", response.data.email);
                return response.data.email;
            });
        },
        create_post() {
            const tagRegex = /#(\w+)/g; // Improved regex to ensure no unwanted characters
            let match;
            const tags = [];
        
            while ((match = tagRegex.exec(this.newPost.text)) !== null) {
                tags.push(match[1]); // Pushes only the word without the hash
            }
        
            console.log("Creating post with text: ", this.newPost.text, " and tags: ", tags);
        
            axios.post(create_post_url, {
                text: this.newPost.text.replace(/[{}'"]/g, ""), 
                tags: tags, // Already correctly formatted
            }).then(response => {
                this.posts.unshift({
                    id: response.data.id, 
                    text: this.newPost.text, 
                    tags: tags,
                    user_email: this.email,

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
            tag.toggle = !tag.toggle;  // This toggles the state

            const index = this.activeTags.indexOf(tag);
            console.log("Filtering posts by tag: ", tag.name);
            if (!tag.toggle) {
                this.activeTags.splice(index, 1);
                console.log("Removed tag from active filters: ", tag.name);
            } else {
                this.activeTags.push(tag.name);
                console.log("Added tag to active filters: ", tag.name);
                console.log("Active tags: ", this.activeTags.map(tag => tag.name));
            }

            
        },
        update_tags() {
            const allTags = new Set();
            this.posts.forEach(post => {
                const tags = Array.isArray(post.tags) ? post.tags : [];
                tags.forEach(tag => {
                    const cleanTag = tag.replace(/[{}'"]/g, ""); // Remove unwanted characters
                    const splitTags = cleanTag.split(','); // Split tags by comma
                    splitTags.forEach(splitTag => {
                        const trimmedTag = splitTag.trim(); // Remove leading and trailing whitespace
                        allTags.add(trimmedTag);
                    });
                });
            });
            this.tags = Array.from(allTags).map(tag => ({name: tag, toggle: false}));
            console.log("Updated tags: ", this.tags.map(tag => tag.name));
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
        app.vue.email = response.data.email;
        app.vue.posts = response.data.posts;
        console.log("Loaded posts: ", app.vue.posts);
        app.vue.update_tags();
    }).catch(function(error) {
        console.log('error loading posts: ', error);
    });  
};
	
app.load_data(); // Load the initial data