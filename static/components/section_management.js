export default {
    template: `
      <div>
        <h2>Section Management</h2>
        
        <!-- List of sections -->
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Date Created</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="section in sections" :key="section.id">
              <td>{{ section.id }}</td>
              
              <!-- Conditional rendering for name -->
              <td v-if="editingSection === section.id">
                <input v-model="section.name" />
              </td>
              <td v-else>
                {{ section.name }}
              </td>
              
              <!-- Display date created -->
              <td>{{ section.date_created }}</td>
              
              <!-- Conditional rendering for description -->
              <td v-if="editingSection === section.id">
                <input v-model="section.description" />
              </td>
              <td v-else>
                {{ section.description }}
              </td>
              
              <!-- Actions: Edit/Save and Delete -->
              <td>
                <button v-if="editingSection === section.id" class="btn btn-success" @click="saveEdit(section)">Save</button>
                <button v-else class="btn btn-primary" @click="editSection(section.id)">Edit</button>
                <button class="btn btn-danger" @click="deleteSection(section.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Add new section -->
        <h3>Add New Section</h3>
        <div>
          <input type="text" v-model="newSection.name" placeholder="Name" />
          <input type="text" v-model="newSection.description" placeholder="Description" />
          <button class="btn btn-primary" @click="addSection">Add Section</button>
        </div>
      </div>
    `,
    data() {
      return {
        sections: [],
        newSection: {
          name: '',
          description: ''
        },
        editingSection: null  // Tracks the ID of the section being edited
      };
    },
    methods: {
      async fetchSections() {
        const res = await fetch('/api/sections', {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-token': localStorage.getItem('auth-token')
          },
        });
        this.sections = await res.json();
      },
      async addSection() {
        const res = await fetch('/api/sections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-token': localStorage.getItem('auth-token')
          },
          body: JSON.stringify(this.newSection)
        });
        if (res.ok) {
          this.fetchSections(); // Refresh the list
          this.newSection.name = '';
          this.newSection.description = '';
        } else {
          console.error('Failed to add section');
        }
      },
      editSection(id) {
        this.editingSection = id;  // Set the section to be edited
      },
      async saveEdit(section) {
        const res = await fetch(`/api/sections/${section.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-token': localStorage.getItem('auth-token')
          },
          body: JSON.stringify({
            name: section.name,
            description: section.description
          })
        });
        if (res.ok) {
          this.editingSection = null; // Reset the editing state
        } else {
          console.error('Failed to update section');
        }
      },
      async deleteSection(id) {
        const res = await fetch(`/api/sections/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-token': localStorage.getItem('auth-token')
          }
        });
        if (res.ok) {
          this.fetchSections(); // Refresh the list
        } else {
          console.error('Failed to delete section');
        }
      }
    },
    mounted() {
      this.fetchSections();
    }
  };
  