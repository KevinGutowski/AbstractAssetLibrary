import React, { Component } from 'react';
import './Project.css';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'

const Abstract = require('abstract-sdk');

const token = process.env.REACT_APP_ABSTRACT_TOKEN

const abstract = new Abstract.Client({
  accessToken: token,
  previewUrl: "https://cors-anywhere.herokuapp.com/previews.goabstract.com"
});


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
        let layerId = assetObject.assets[j].layerId
        let nestedLayerId = assetObject.assets[j].nestedLayerId

        if (layerId === nestedLayerId) {
          // normal layer
          let previewURL = await abstract.previews.url({
            projectId: assetObject.assets[j].projectId,
            branchId: "master",
            fileId: assetObject.assets[j].fileId,
            layerId: layerId,
            nestedLayerId: nestedLayerId,
            sha: "latest"
          })
          assetCollection[i].assets[j].previewURL = previewURL
        } else {
          // nested layer objects
          const arrayBuffer = await abstract.assets.raw({
            assetId: assetObject.assets[j].id,
            projectId: assetObject.assets[j].projectId,
          }, {
            disableWrite: true
          });
          var blob = new Blob( [ arrayBuffer ], { type: "image/png" } )
          var urlCreator = window.URL || window.webkitURL
          var imageUrl = urlCreator.createObjectURL( blob )
          assetCollection[i].assets[j].previewURL = imageUrl
        }


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

    async function downloadAsset(asset) {
      console.log(asset)
      abstract.assets.raw({
        assetId: asset.id,
        projectId: asset.projectId
      });
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
            <button className="downloadButton" onClick={() => downloadAsset(asset)}><FontAwesomeIcon icon={faDownload}/> Download</button>
            <div className="info">
              <div>{asset.layerName}</div>
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
