import React, { Component } from 'react';
import './Project.css';
import { Link } from 'react-router-dom';

class Project extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      assets: [],
      files: []
    }
  }

  async componentDidMount() {
    let abstract = this.props.client
    let projectId = this.props.project.id

    let files = await abstract.files.list({
      projectId: projectId,
      branchId: "master",
      sha: "latest"
    })

    this.setState({
      isLoaded: true,
      files: files
    })

    let assetCollection = []

    for (let i = 0; i < files.length; i++) {
      let assets = await abstract.assets.file({
        projectId: projectId,
        branchId: "master",
        fileId: files[i].id,
        sha: "latest"
      }, { limit: 50 })
      assetCollection.push({ assets: assets, file: files[i]})
    }

    assetCollection.forEach((assetObject,index) => {
      let deduped = removeDuplicates(assetObject.assets, "nestedLayerId")
      assetCollection[index].assets = deduped
    })

    this.setState({
      assets: assetCollection,
    })

    for (let i = 0; i < assetCollection.length; i++) {
      let assetObject = assetCollection[i]
      for (let j = 0; j < assetObject.assets.length; j++) {
        let previewURL = await abstract.previews.url({
          projectId: assetObject.assets[j].projectId,
          branchId: 'master',
          fileId: assetObject.assets[j].fileId,
          layerId: assetObject.assets[j].layerId,
          sha: "latest"
        })
        assetCollection[i].assets[j].previewURL = previewURL

        this.setState({
          assets: assetCollection,
        })
      }
    }
  }

  render() {
    let { isLoaded, assets, files } = this.state

    if (!isLoaded) {
      return (
        <div className="Project">
            <Link to="/">All Projects</Link>
            <h1>{this.props.project.name}</h1>
        </div>
      )
    }

    const names = assets.map(asset => {
      if (asset.assets.length === 0) {
        return <li key={asset.file.id}>{asset.file.name}</li>
      } else {
        let assetnames  = asset.assets.map(asset => (
          <div key={asset.id} className="asset">
            <div className="imgContainer">
              <img className="resizeFitCenter" src={asset.previewURL} alt=""/>
            </div>
            <div className="info">
              <div>layerName: {asset.layerName}</div>
              <div>layerId: {asset.layerId}</div>
              <div>nestedLayerId: {asset.nestedLayerId}</div>
              <div>fileFormat: {asset.fileFormat} @ {asset.formatName}</div>
            </div>
          </div>
        ))
        return (
          <li key={asset.file.id}>{asset.file.name}
              <div className="assetCollectionForFile">{assetnames}</div>
          </li>
        )
      }
    })

    if (assets.length > 0) {
      return (
        <div className="Project">
            <Link to="/">All Projects</Link>
            <h1>{this.props.project.name}</h1>
            <ul>{names}</ul>
        </div>
      )
    }

    const fileItems = files.map(file => {
      return <li key={file.id}>{file.name}</li>
    })

    if (files.length > 0) {
      return (
        <div className="Project">
            <Link to="/">All Projects</Link>
            <h1>{this.props.project.name}</h1>
            <ul>{fileItems}</ul>
        </div>
      )
    }
  }
}

function removeDuplicates(array, prop) {
  return Array.from(new Map(array.map(i => [(prop in i) ? i[prop] : i, i])).values());
}

export default Project;
