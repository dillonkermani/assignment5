"use strict";

// Complete. 
const app = Vue.createApp({
    data() {
      return {
        newPostText: '',
        posts: [],
        tags: [],
        activeTags: [],
        userId: 'currentUserId', // This should be dynamically set based on the logged-in user
        isLoggedIn: true // This should be dynamically checked
      };
    },
    computed: {
      filteredPosts() {
        if (this.activeTags.length === 0) {
          return this.posts;
        }
        return this.posts.filter(post => post.tags.some(tag => this.activeTags.includes(tag)));
      }
    },
    methods: {
      createPost() {
        const tags = this.newPostText.match(/#\w+/g) || [];
        axios.post('/create_post', { text: this.newPostText, tags: tags.map(tag => tag.slice(1)) })
          .then(response => {
            this.posts.unshift(response.data);
            this.newPostText = '';
            this.updateTags();
          });
      },
      deletePost(postId) {
        axios.post('/delete_post', { postId })
          .then(() => {
            this.posts = this.posts.filter(post => post.id !== postId);
            this.updateTags();
          });
      },
      toggleTag(tag) {
        const index = this.activeTags.indexOf(tag);
        if (index > -1) {
          this.activeTags.splice(index, 1);
        } else {
          this.activeTags.push(tag);
        }
      },
      updateTags() {
        const allTags = new Set();
        this.posts.forEach(post => {
          post.tags.forEach(tag => allTags.add(tag));
        });
        this.tags = Array.from(allTags);
      }
    },
    mounted() {
      axios.get('/posts').then(response => {
        this.posts = response.data.posts;
        this.updateTags();
      });
    }
  });
  
  app.mount('#app');
  