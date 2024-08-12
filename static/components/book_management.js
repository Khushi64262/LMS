export default {
  template: `
    <div>
      <h2>Book Management</h2>
      
      <!-- Dropdown to select a section -->
      <div>
        <label for="sectionSelect">Select Section:</label>
        <select id="sectionSelect" v-model="selectedSection" @change="fetchBooks">
          <option v-for="section in sections" :key="section.id" :value="section.id">
            {{ section.name }}
          </option>
        </select>
      </div>
  
      <!-- List of books in the selected section -->
      <table class="table" v-if="books.length">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Author</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in books" :key="book.id">
            <td>{{ book.id }}</td>
            <td>
              <input v-model="book.title" :disabled="!book.isEditing" />
            </td>
            <td>
              <input v-model="book.author" :disabled="!book.isEditing" />
            </td>
            <td>
              <button class="btn btn-warning" v-if="!book.isEditing" @click="editBook(book)">Edit</button>
              <button class="btn btn-success" v-if="book.isEditing" @click="saveBook(book)">Save</button>
              <button class="btn btn-danger" @click="deleteBook(book.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Add new book -->
      <h3>Add New Book</h3>
      <div>
        <input type="text" v-model="newBook.title" placeholder="Title" />
        <input type="text" v-model="newBook.author" placeholder="Author" />
        <button class="btn btn-primary" @click="addBook">Add Book</button>
      </div>
    </div>
  `,
  data() {
    return {
      sections: [],
      selectedSection: null,
      books: [],
      newBook: {
        title: '',
        author: ''
      }
    };
  },
  methods: {
    async fetchSections() {
      const res = await fetch('/api/sections', {
        headers: {
          'Content-Type': 'application/json',
          'Authentication-token': localStorage.getItem('auth-token')
        }
      });
      this.sections = await res.json();
      if (this.sections.length) {
        this.selectedSection = this.sections[0].id; // Default to first section
        this.fetchBooks();
      }
    },
    async fetchBooks() {
      const res = await fetch(`/api/ebooks?section_id=${this.selectedSection}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authentication-token': localStorage.getItem('auth-token')
        }
      });
      this.books = await res.json();
      this.books = this.books.map(book => ({ ...book, isEditing: false })); // Add an isEditing flag
    },
    async addBook() {
      const res = await fetch('/api/ebooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-token': localStorage.getItem('auth-token')
        },
        body: JSON.stringify({
          ...this.newBook,
          section_id: this.selectedSection
        })
      });
      if (res.ok) {
        this.fetchBooks(); // Refresh the list
        this.newBook.title = '';
        this.newBook.author = '';
      } else {
        console.error('Failed to add book');
      }
    },
    editBook(book) {
      // Enable editing mode for the selected book
      this.books.forEach(b => (b.isEditing = false)); // Disable editing for other books
      book.isEditing = true;
    },
    async saveBook(book) {
      const bookData = {
        title: book.title,
        author: book.author,
        section_id: this.selectedSection // Include the section_id if your API requires it
      };
      
      console.log('Sending PUT request with data:', bookData); // Debugging log
    
      try {
        const res = await fetch(`/api/ebooks/${book.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-token': localStorage.getItem('auth-token')
          },
          body: JSON.stringify(bookData)
        });
    
        if (res.ok) {
          book.isEditing = false; // Disable editing mode after successful save
          this.fetchBooks(); // Optionally refresh the list to ensure data consistency
        } else {
          const errorResponse = await res.json();
          console.error('Failed to update book:', errorResponse.message || 'Unknown error');
        }
      } catch (error) {
        console.error('An error occurred while updating the book:', error);
      }
    },
    async deleteBook(id) {
      const res = await fetch(`/api/ebooks/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-token': localStorage.getItem('auth-token')
        }
      });
      if (res.ok) {
        this.fetchBooks(); // Refresh the list
      } else {
        console.error('Failed to delete book');
      }
    }
  },
  mounted() {
    this.fetchSections();
  }
};
