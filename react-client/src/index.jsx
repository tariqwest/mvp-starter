// TODO:
  // Create new or auth existing user (to remember their places, and photo collections)
  // Get location of user - done
  // Place user location on google map
  // Send location/google map bounds to flickr
  // Receive photo options
  // Select photos
  // Publish selected photos

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import Container from './components/MapContainer.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      location: { 
        lat: null,
        lon: null
      }
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
      this.setState('')
      console.log('Your current position is:');
      console.log(`Latitude : ${crd.latitude}`);
      console.log(`Longitude: ${crd.longitude}`);
      console.log(`More or less ${crd.accuracy} meters.`);
    };

    var error = (err) => {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    };

    navigator.geolocation.getCurrentPosition(success, error, options);

  }

  componentDidMount() {
    // $.ajax({
    //   url: '/items', 
    //   success: (data) => {
    //     this.setState({
    //       items: data
    //     })
    //   },
    //   error: (err) => {
    //     console.log('err', err);
    //   }
    // });
    this.getUserLocation();
  }

  render () {
    return (
    <div>
      <Container location={this.state.location} />   
    </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));