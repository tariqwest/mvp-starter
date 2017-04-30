// TODO:
  // Create new or auth existing user -
  // Get location of user - done
  // Place user location on google map - done
  // Retrieve flickr photos matching location - done 
  // Capture user selected photos - done
  // Save user selected photos to DB - done
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
        lng: null,
        id: null,
        photos: null,
        saved: false
      },
      photos: sampleData.photos.photo,
      selectedPhotos: {},
      windowWidth: '500', 
      windowHeight: '500', 
    }
    this.saveLocation = this.saveLocation.bind(this);
    this.saveSelectedPhotos = this.saveSelectedPhotos.bind(this);
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
          lng: crd.longitude,
          id: null, 
          photos: null
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
          this.setState({'location': {
              lat: this.state.location.lat,
              lng: this.state.location.lng,
              id: data._id
            }
          });
        },
        error: (err) => {
          console.log('err', err);
        }
      });
  }

  saveSelectedPhotos(){
    var photos = [];
    for(var key in this.state.selectedPhotos){
      photos.push(this.state.selectedPhotos[key]);
    }
    console.log('Photos to save', photos);
    $.ajax({
        url: '/users/'+ this.state.user.id +'/locations/' + this.state.location.id,
        method: 'PUT',
        data:  JSON.stringify(photos),
        contentType: 'application/json',
        success: (data) => {
          console.log('success', data);
          this.setState({'location': {
              lat: this.state.location.lat,
              lng: this.state.location.lng,
              id: this.state.location.id,
              photos: photos
            }
          });
        },
        error: (err) => {
          console.log('err', err);
        }
      });
  }


  componentDidMount() {
    this.setState({ 
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight 
    });
    this.getUser();
    this.getUserLocation();
  }


  render () {

    if(this.state.photos.length < 2 || this.state.user.name === null){
      return (<div>Loading... Please give location access if requested...</div>)
    }else if(!this.state.location.photos){
      return (
        <div>
          <div>Hi {this.state.user.name}!</div>
          <div>
            <img style={ {objectFit: 'cover', width: '100%' } } src={`https://maps.googleapis.com/maps/api/staticmap?center=${this.state.location.lat},${this.state.location.lng}&markers=color:red%7Clabel:C%7C${this.state.location.lat},${this.state.location.lng}&zoom=20&size=${this.state.windowHeight}x${this.state.windowWidth}&key=AIzaSyAcEoPnIMOVBKVvD00uKpt8yJ7Spur0pUQ`} />
          </div>
          <a href="#" onClick={this.saveSelectedPhotos}>Save Selected Photos</a>
          <List items={this.state.photos} addToSelectedPhotos={this.addToSelectedPhotos} removeFromSelectedPhotos={this.removeFromSelectedPhotos} />
        </div>
      ) 
    }else if(this.state.location.photos){
      return (
        <div>
          <div>Hi {this.state.user.name}!</div>
          <div>
            <img style={ {objectFit: 'cover', width: '100%' } } src={`https://maps.googleapis.com/maps/api/staticmap?center=${this.state.location.lat},${this.state.location.lng}&markers=color:red%7Clabel:C%7C${this.state.location.lat},${this.state.location.lng}&zoom=20&size=${this.state.windowHeight}x${this.state.windowWidth}&key=AIzaSyAcEoPnIMOVBKVvD00uKpt8yJ7Spur0pUQ`} />

            <div>We've saved your images for this location. Post them to Facebook?</div>

              {this.state.location.photos.map(function(photo){  return <Image photo={photo} />  })}

          </div>
        </div>
      ) 
    }
  }
}

const Image = (props) => (
  <div>
        <img style={ {objectFit: 'cover', height: 300, width: 300 } }  src={ 'https://farm' + props.photo.farm + '.staticflickr.com/' + props.photo.server + '/' + props.photo.id + '_' + props.photo.secret + '.jpg' }/>
  </div>
)

ReactDOM.render(<App />, document.getElementById('app'));