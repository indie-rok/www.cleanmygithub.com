import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      username: '',
      userRepos: [],
      reposToDelete: [],
      userToken: '',
      deletedRepos: [],
      problematicRepos: [],
      isDeleting: false
    };
    this.getUserRepos = this.getUserRepos.bind(this);
    this.handleUserChange = this.handleUserChange.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleTokenUpdate = this.handleTokenUpdate.bind(this);
    this.deleteRepos = this.deleteRepos.bind(this);

  }

  getUserRepos() {
    fetch(`https://api.github.com/users/${this.state.username}/repos?per_page=100`).then(response => response.json()).then((userRepos) => {
      this.setState({userRepos})
    })
  }

  handleUserChange(event) {
    this.setState({username: event.target.value})
  }

  handleTokenUpdate(event) {
    this.setState({userToken: event.target.value})
  }

  handleAdd(event) {
    const repoName = event.target.dataset.repoName;
    let toDelete = []
    if (event.target.checked === true) {
      this.setState({reposToDelete: this.state.reposToDelete.concat(repoName)});
    } else {
      this.setState({
        reposToDelete: this.state.reposToDelete.filter(item => item !== repoName)
      });
    }
  }

  deleteRepos() {
    const confirmDelete = window.confirm(`Are you want to delete the following repos:  \n ${this.state.reposToDelete.join('\n')}`)
    if (confirmDelete) {
      this.setState({isDeleting: true})
      const authHeader = `token ${this.state.userToken}`
      this.state.reposToDelete.forEach(repoName => {
        const url = `https://api.github.com/repos/${this.state.username}/${repoName}`
        fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': authHeader
          }
        }).then(response => {
          if (response.status === 204) {
            //repo is deleted
            this.setState({deletedRepos: this.state.deletedRepos.concat(repoName)})
          }
        }).catch(error => {
          console.log(error);
          this.setState({problematicRepos: this.state.problematicRepos.concat(repoName)})
        })
      })
      this.setState({isDeleting: false})
    }
  }

  render() {
    return (<div className="App">
      <header className="jumbotron">
        <h1>Delete your public repos with one click</h1>
      </header>
      <section>
        <section className="card">
          <div className="card-body">
            <h2>1. Enter github username</h2>
            <div className="input-group mb-6">
              <input placeholder="write your github username here" type="text" className="form-control" value={this.state.username} onChange={this.handleUserChange}/>
              <div className="input-group-append">
                <button className="btn btn-primary" onClick={this.getUserRepos}>Search my repos</button>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-body">
            <h2>2. Select the repositories that you want to delete
            </h2>
            <section>{
                this.state.userRepos.map((repo) => {
                  return <div key={repo.id} className="card">
                    <div className="card-body">
                      <input className="form-check-input" type="checkbox" data-repo-name={repo.name} onClick={this.handleAdd}/>
                      <a className="card-link" target="_blank" href={repo.html_url}>{repo.name}</a>
                    </div>
                  </div>
                })
              }
            </section>
          </div>
        </section>

        <section className="card">
          <div className="card-body">
            <h2>3. Get your delete repo token from
              <a href="https://github.com/settings/tokens/new" target="_blank">
                this url
              </a>
              and paste it below</h2>
            <input className="form-control" type="text" placeholder="insert token here" onChange={this.handleTokenUpdate} value={this.state.userToken}/>
          </div>
        </section>

        <section className="card">
          <div className="card-body">
            <h2>4. Press the delete button below</h2>
            <button className="btn btn-danger" onClick={this.deleteRepos}>{
                (this.state.isDeleting)
                  ? "Borrando..."
                  : "Delete Repos"
              }</button>
          </div>
        </section>

        <section className="card">
          <div className="card-body">
            <h2>The following repos where deleted</h2>
            {
              this.state.deletedRepos.map(repoName => {
                return <p>{repoName}</p>
              })
            }

            <h2>We had problems with the following repos, check them manually</h2>
            {
              this.state.problematicRepos.map(repoName => {
                return <p>{repoName}</p>
              })
            }
          </div>
        </section>

      </section>
    </div>);
  }
}

export default App;
