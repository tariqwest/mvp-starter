// TODO:
  // Create new or auth existing user (to remember their places, and photo collections)
  // Get location of user - done
  // Place user location on google map - done
  // Retrieve flickr photos matching location - done 
  // Capture user selected photos - done
  // Save user selected photos to DB -
  // Publish selected photos to FB -

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import sampleData from './sampleData.jsx';
import Container from './components/MapContainer.jsx';
import List from './components/List.jsx';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      location: { 
        lat: null,
        lng: null
      },
      photos: sampleData.photos.photo,
      selectedPhotos: {}
    }
    this.addToSelectedPhotos = this.addToSelectedPhotos.bind(this);
    this.removeFromSelectedPhotos = this.removeFromSelectedPhotos.bind(this);
  }

  getUserLocation() {

    console.log(this.state.photos);

    var options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    var success = (pos) => {
      var crd = pos.coords;
      this.setState({'location': {
          lat: crd.latitude,
          lng: crd.longitude
        }
      });

      var flickrKey = '1c9f777eb7446f34a7261dc1a54be4b2';
      var flickrUrl = 'https://api.flickr.com/services/rest';
      var flickrMethod = 'flickr.photos.search';
      var data = {
        method: flickrMethod,
        api_key: flickrKey,
        lat: this.state.location.lat,
        lon: this.state.location.lng,
        radius: 1,
        radius_units: 'km',
        format: 'json',
        per_page: 20,
        sort: 'interestingness-desc'
        //is_commons: 'true'
      };

      console.log(flickrUrl + '?' + $.param(data, true));

      $.ajax({
        url: flickrUrl + '?' + $.param(data, true), 
        success: (data) => {
          console.log('success', JSON.parse(data.split('(')[1].split(')')[0]).photos.photo);
          this.setState({
            photos: JSON.parse(data.split('(')[1].split(')')[0]).photos.photo
          })
        },
        error: (err) => {
          console.log('err', err);
        }
      });
    };

    var error = (err) => {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    };

    navigator.geolocation.getCurrentPosition(success, error, options);

  }

  addToSelectedPhotos(photo){
    console.log('Adding to selected photos: ', photo);
    var selectedPhotos = this.state.selectedPhotos;
    selectedPhotos[JSON.stringify(photo)] = photo;
    this.setState({selectedPhotos: selectedPhotos});
  }

  removeFromSelectedPhotos(photo){
    console.log('Removing from selected photos: ', photo);
    var selectedPhotos = this.state.selectedPhotos;
    delete selectedPhotos[JSON.stringify(photo)];
    this.setState({selectedPhotos: selectedPhotos});
  }

  componentDidMount() {
    this.getUserLocation();
  }

  render () {
    return (
      <div>
        <div>
          <img src={`https://maps.googleapis.com/maps/api/staticmap?center=${this.state.location.lat},${this.state.location.lng}&markers=color:red%7Clabel:C%7C${this.state.location.lat},${this.state.location.lng}&zoom=16&size=400x400&key=AIzaSyAcEoPnIMOVBKVvD00uKpt8yJ7Spur0pUQ`}>
          </img>
        </div>
        <List items={this.state.photos} addToSelectedPhotos={this.addToSelectedPhotos} removeFromSelectedPhotos={this.removeFromSelectedPhotos} />
      </div>
    )
    // return (
    //   <div>
    //   <Container location={this.state.location} />
    //   <List items={this.state.photos} />
    //   </div>
    // )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));