import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Moment from 'moment';
import './App.css';

import Project from './Project';

const Abstract = require('abstract-sdk');

const token = process.env.REACT_APP_ABSTRACT_TOKEN

const abstract = new Abstract.Client({
  accessToken: token,
  previewUrl: "https://cors-anywhere.herokuapp.com/previews.goabstract.com"
});

let orgID = "64a05564-1b30-48a2-8388-445a15026e52"


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      isLoaded: false,
    }
  }

  componentDidMount() {
    abstract.projects.list().then(projects => {
      let filteredProjects = projects.filter(project => (!project.archivedAt && project.organizationId === orgID))
      this.setState({
        isLoaded: true,
        projects: filteredProjects,
      })
    })
  }

  render() {
    let { isLoaded, projects } = this.state

    if (!isLoaded) {
      return <div className="App">Loading...</div>
    }

    return (
      <Router>
      <div className="App">
          <Route exact={true} path="/" render={() => (
                      <div className="cardContainer">
                      { projects.map(project => {
                        let date = new Date(project.updatedAt)
                        let convertedDate = Moment(date).fromNow()
                        return (
                          <Link to={`/project/${project.id}`} key={project.id} className="card">
                            <div className="vLine" style={{backgroundColor: project.color}}></div>
                            <div className="projectProperties">
                              <div className="topContent">
                                <h4>{project.name}</h4>
                                <div className="updatedAt">
                                  <span>Updated </span>
                                  <time dateTime={project.updatedAt}>{convertedDate}</time>
                                </div>
                              </div>
                              <div className="bottomContent">
                                <img className="createdByUserImage" src={project.createdByUser.avatarUrl} alt="Kevin Gutowski created this project."/>
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                      </div>
              )
          } />
          { projects && (
                <Route path="/project/:projectId" render={({match}) =>
                    <Project client={abstract} project={this.state.projects.find(p => p.id === match.params.projectId)}/>
                } />
              )
          }

      </div>
      </Router>
    );
  }
}

export default App;
