const AppComponent = {
  props: {
    delays: {
      type: Array,
      default() {
        return [1,5,10]
      }
    }
  },
  data() {
    return {
      tasks: [],
      resultSubscriberId: null
    }
  },
  template:
    `<div>
      <h1>Task creation</h1>
      <div class="buttons">
        <button class="task-button" v-for="delay in delays" :key="delay" @click="sendTask(delay)">
          {{ delay }}
        </button/>
      </div>
      <div v-if="error" class="error">
        {{ error }}
      </div>
      <h2>Results</h2>
      <table class="result-table" border-spacing="0">
        <thead>
          <tr>
            <th>id</th>
            <th>state</th>
            <th>result</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in tasks" :key="task.id">
            <td>{{ task.id }}</td>
            <td>{{ task.state }}</td>
            <td v-if="task.result">
              {{ task.result}}
            </td>
            <td v-else>
              Pending...
            </td>
          </tr>
        </tbody>
      <table/>
    </div>`,
  methods: {
    sendTask(delay) {
      this.error = "";

      const data = new FormData();
      data.append("type", delay);

      fetch("/tasks/", {
        method: "POST",
        body: data
      }).then((resp) => {
        return resp.json();
      }).then((data) => {
        this.tasks.push({
          id: data.id,
          delay: delay,
          result: null
        });
        this.fetchResults();
      }).catch((err) => {
        this.error = err.message;
      })
    },
    _fetchResults() {
      if(this.resultSubscriberId) {
        return
      }

      this.resultSubscriberId = setInterval(()=> {
        
        const subsTasks = this.tasks.filter((task) => {
          return task.state != "FAILURE" && task.state != "SUCCESS"
        });
        
        if(!subsTasks.length) {
          //clearInterval(this.resultSubscriberId);
          //this.resultSubscriberId = null;
          return;
        }

        const taskIds = subsTasks.map((task) => task.id);
        
        fetch("/tasks/result", {
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(taskIds)
        })
        .then(resp => resp.json())
        .then((results) => {
          results.forEach((result) => {
            task = this.tasks.find(t=>t.id === result.id);
            if(task){
              task.state = result.state;
              task.result = result.result;
            }
          })
        });
      }, 1000);  
    },
    fetchResults() {
      if(this.resultSubscriberId) {
        return
      }

      this.resultSubscriberId = setInterval(()=> {
        
        const subsTasks = this.tasks.filter((task) => {
          return task.state != "FAILURE" && task.state != "SUCCESS"
        });
        
        if(!subsTasks.length) {
          //clearInterval(this.resultSubscriberId);
          //this.resultSubscriberId = null;
          return;
        }

        const fetchers = subsTasks.map((task) => {
          return fetch(`/tasks/${task.id}/`)
            .then((resp) => resp.json())
        });

        Promise.all(fetchers).then((results) => {
          results.forEach((result) => {
            task = this.tasks.find(t=>t.id === result.id);
            if(task){
              task.state = result.state;
              task.result = result.result;
            }
              
          })
        });
      }, 1000);
    }

  }
}

const { createApp } = Vue;

const app = createApp(AppComponent);
const vm = app.mount("#app");