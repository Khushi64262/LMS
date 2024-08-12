export default {
    template: `
      <div>
        <div class="form-group">
          <label for="exampleInputUsername">Username</label>
          <input type="text" class="form-control" id="exampleInputUsername" aria-describedby="usernameHelp" placeholder="Enter Username" v-model="credentials.username">
          <small id="usernameHelp" class="form-text text-muted">We'll never share your username with anyone else.</small>
        </div>
        <div class="form-group">
          <label for="exampleInputPassword1">Password</label>
          <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password" v-model="credentials.password">
        </div>
        <div class="form-check">
          <input type="checkbox" class="form-check-input" id="exampleCheck1">
          <label class="form-check-label" for="exampleCheck1">Check me out</label>
        </div>
        <button type="submit" class="btn btn-primary" @click="login">Submit</button>
      </div>`,
  
    data() {
      return {
        credentials: {
          username: null,
          password: null,
        },
        error: null,
      };
    },
  
    methods: {
      async login() {
        try {
          const res = await fetch('/user-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.credentials),
          });
  
          const data = await res.json();
  
          if (res.ok) {
            if (data.token) {
              localStorage.setItem('auth-token', data.token);
              localStorage.setItem('user-role', data.role);
              localStorage.setItem('user-id', data.user_id);
  
              // Redirect based on the user's role
              if (data.role === 'librarian') {
                this.$router.push({ path: '/librarian_home' });
              } else {
                this.$router.push({ path: '/' });
              }
            }
          } else {
            this.error = data.message;
            console.error(data.message);
          }
        } catch (error) {
          console.error("An error occurred during login:", error);
        }
      },
    },
  };
  