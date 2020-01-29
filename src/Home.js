import React, { Component } from 'react';
import './App.css';
import Moment from 'moment';
import { Link } from 'react-router-dom';

const Abstract = require('abstract-sdk');

const token = "044a7de45641be78fe2c14180ba1481de1a8e615f918292a74c29d713a573956";

const abstract = new Abstract.Client({
  accessToken: token,
});

let orgID = "64a05564-1b30-48a2-8388-445a15026e52"

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      isLoaded: false,
    }
  }

  componentDidMount() {
    abstract.projects.list().then(projects => {
      let filteredProjects = projects.filter(project => (!project.archivedAt && project.organizationId == orgID))
      this.setState({
        isLoaded: true,
        projects: filteredProjects,
      })
    })
  }

  render() {

    let { isLoaded, projects } = this.state

    if (!isLoaded) {
      return <div>Loading...</div>
    }

    return (
      <>
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
        )}
      )}
      </>
    )
  }
}

export default Home;
