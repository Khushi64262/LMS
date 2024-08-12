export default {
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">Navbar</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <!-- Items for logged-out users -->
          <li v-if="!is_logged_in" class="nav-item active">
            <a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
          </li>
          <li v-if="!is_logged_in" class="nav-item">
            <a class="nav-link" href="#">Link</a>
          </li>
          <li v-if="!is_logged_in" class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Dropdown
            </a>
            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
              <a class="dropdown-item" href="#">Action</a>
              <a class="dropdown-item" href="#">Another action</a>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" href="#">Something else here</a>
            </div>
          </li>
          <li v-if="!is_logged_in" class="nav-item">
            <a class="nav-link disabled" href="#">Disabled</a>
          </li>

          <!-- Items for logged-in librarians -->
          <li v-if="is_logged_in && isLibrarian" class="nav-item">
            <span class="nav-link" href="#">Role: Librarian</span>
          </li>
          <li v-if="is_logged_in && isLibrarian" class="nav-item">
            <a class="nav-link" href="/">Home</a>
          </li>
          <li v-if="is_logged_in && isLibrarian" class="nav-item">
            <a class="nav-link" href="#/section_management">Section Management</a>
          </li>
          <li v-if="is_logged_in && isLibrarian" class="nav-item">
            <a class="nav-link" href="#/book_management">Book Management</a>
          </li>
          <li v-if="is_logged_in && isLibrarian" class="nav-item">
            <a class="nav-link" href="#/book_requests">Book Requests</a>
          </li>
          <li v-if="is_logged_in && isLibrarian" class="nav-item">
            <a class="nav-link" href="#">Item-5</a>
          </li>

          <!-- Items for logged-in regular users -->
          <li v-if="is_logged_in && isUser" class="nav-item">
            <span class="nav-link" href="#">Role: User</span>
          </li>
          <li v-if="is_logged_in && isUser" class="nav-item">
            <a class="nav-link" href="#/available_books">Available Books</a>
          </li>
          <li v-if="is_logged_in && isUser" class="nav-item">
            <a class="nav-link" href="#/my_books">My Books</a>
          </li>
          <li v-if="is_logged_in && isUser" class="nav-item">
            <a class="nav-link" href="#">Item-3</a>
          </li>
          <li v-if="is_logged_in && isUser" class="nav-item">
            <a class="nav-link" href="#">Item-4</a>
          </li>
          <li v-if="is_logged_in && isUser" class="nav-item">
            <a class="nav-link" href="#">Item-5</a>
          </li>

          <!-- Login button for logged-out users -->
          <li v-if="!is_logged_in" class="nav-item">
            <button class="nav-link btn" @click="login">LOGIN</button>
          </li>
          
          <!-- Logout button for logged-in users -->
          <li v-if="is_logged_in" class="nav-item">
            <button class="nav-link btn" @click="logout">LOGOUT</button>
          </li>
        </ul>
        <!-- Search bar -->
        <form class="form-inline my-2 my-lg-0" @submit.prevent="search">
          <input class="form-control mr-sm-2" v-model="searchQuery" type="search" placeholder="Search" aria-label="Search">
          <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
        </form>
      </div>
    </nav>
  `,
  data() {
    return {
      is_logged_in: !!localStorage.getItem('auth-token'), // Check if user is logged in
      user_role: localStorage.getItem('user-role'), // Retrieve the role from localStorage
      searchQuery: ''
    };
  },
  computed: {
    isLibrarian() {
      return this.user_role === 'librarian';
    },
    isUser() {
      return this.user_role === 'user';
    }
  },
  methods: {
    login() {
      this.$router.push('/login');
    },
    logout() {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-role');
      this.is_logged_in = false;
      this.$router.push('/login');
    },
    async search() {
      if (this.searchQuery.trim()) {
        try {
          let response;

          // Attempt to search for books
          response = await fetch(`/api/books?query=${encodeURIComponent(this.searchQuery)}`, {
            headers: {
              'Authentication-token': localStorage.getItem('auth-token')
            }
          });

          if (!response.ok) {
            // If no books found, search for sections
            response = await fetch(`/api/sections?query=${encodeURIComponent(this.searchQuery)}`, {
              headers: {
                'Authentication-token': localStorage.getItem('auth-token')
              }
            });
          }

          const data = await response.json();

          if (response.ok) {
            // Process and display the search results (this part will depend on your specific frontend setup)
            console.log('Search Results:', data);
            // You might want to route to a search results page and display the data there
            this.$router.push({ path: '/search_results', query: { data: JSON.stringify(data) } });
          } else {
            console.log('No results found.');
            alert(data.message || 'No results found.');
          }
        } catch (error) {
          console.error('Error during search:', error);
        }
      }
    }
  },
  watch: {
    is_logged_in(newValue) {
      if (newValue) {
        // Redirect based on role after login
        if (this.user_role === 'librarian') {
          this.$router.push('/librarian_home');
        } else {
          this.$router.push('/');
        }
      }
    }
  }
};

