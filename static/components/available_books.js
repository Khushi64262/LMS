export default {
  data() {
    return {
      books: [], // Array to hold the books and their status
    };
  },
  methods: {
    async fetchBooks() {
      const res = await fetch('/api/non_granted_books', {
        headers: {
          'Content-Type': 'application/json',
          'Authentication-token': localStorage.getItem('auth-token')
        }
      });
      this.books = await res.json();
    },
    async requestBook(bookId) {
      const res = await fetch(`/api/request_book/${bookId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-token': localStorage.getItem('auth-token')
        }
      });
      if (res.ok) {
        alert('book requested successfully')
        this.fetchBooks(); // Refresh the book list
      } 
      else if(res.status===400){
        alert('You have already requested this book');
      }
      else {
        console.error('Failed to request book');
      }
    },
  },
  mounted() {
    this.fetchBooks();
  },
  template: `
    <div class="books-container">
      <div v-for="book in books" :key="book.id" class="book-card">
        <h3>{{ book.title }}</h3>
        <p>Author: {{ book.author }}</p>
        <p>Section: {{ book.section.name }}</p>
        <p v-if="book.isIssued" class="flag">Currently issued by another user</p>
        <button v-else @click="requestBook(book.id)">Request</button>
      </div>
    </div>
  `
};
