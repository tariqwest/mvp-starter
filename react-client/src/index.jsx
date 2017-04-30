// TODO:
  // Create new or auth existing user -
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
      user: {
        name: null,
        id: null,
      },
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


  getUser(){
    $.ajax({
        url: '/users/current', 
        success: (data) => {
          console.log('success:', data);
          this.setState({
            user: {name: data.fb_name, id: data.fb_id}
          })
        },
        error: (err) => {
          console.log('err:', err);
        }
    });
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
      this.saveLocation();
      this.getLocationPhotos();
    };

    var error = (err) => {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    };

    navigator.geolocation.getCurrentPosition(success, error, options);

  }

  getLocationPhotos(){
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
        nojsoncallback: 1
        //sort: 'interestingness-desc'
        //is_commons: 'true'
      };

      console.log(flickrUrl + '?' + $.param(data, true));

      $.ajax({
        url: flickrUrl + '?' + $.param(data, true), 
        success: (data) => {
          console.log('success', data);
          this.setState({
            photos: data.photos.photo
          })
        },
        error: (err) => {
          console.log('err', err);
        }
      });
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

  saveLocation(){
    var data = {
      fb_id: this.state.user.id,
      location: {
        lat: this.state.location.lat,
        lng: this.state.location.lng  
      }
    }
    $.ajax({
        url: '/users/'+ this.state.user.id +'/locations',
        method: 'POST',
        data:  data,
        //processData: false,
        //contentType: 'application/json',
        success: (data) => {
          console.log('success', data);
        },
        error: (err) => {
          console.log('err', err);
        }
      });
  }

  saveSelectedPhotos(){

  }


  componentDidMount() {
    this.getUser();
    this.getUserLocation();
  }


  render () {

    if(this.state.photos.length < 2 || this.state.user.name === null){
      return (<div>Loading... Please give location access if requested...</div>)
    }else{
      return (
        <div>
          <div>Hi {this.state.user.name}!</div>
          <div>
            <img src={`https://maps.googleapis.com/maps/api/staticmap?center=${this.state.location.lat},${this.state.location.lng}&markers=color:red%7Clabel:C%7C${this.state.location.lat},${this.state.location.lng}&zoom=16&size=400x400&key=AIzaSyAcEoPnIMOVBKVvD00uKpt8yJ7Spur0pUQ`}>
            </img>
          </div>
          <List items={this.state.photos} addToSelectedPhotos={this.addToSelectedPhotos} removeFromSelectedPhotos={this.removeFromSelectedPhotos} />
        </div>
      ) 
    }

    // return (
    //   <div>
    //   <Container location={this.state.location} />
    //   <List items={this.state.photos} />
    //   </div>
    // )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));