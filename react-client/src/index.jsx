// TODO:
  // Create new or auth existing user (to remember their places, and photo collections)
  // Get location of user - done
  // Place user location on google map - done
  // Send location/google map bounds to flickr - 
  // Receive photo options
  // Select photos
  // Publish selected photos

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
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
      photos: [{}, {}, {}],
    }
  }

  getUserLocation() {

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

  componentDidMount() {
    this.getUserLocation();
  }

  render () {
    return (
      <div>
      <Container location={this.state.location} />
      <List items={this.state.photos} />
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));