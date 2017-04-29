import React from 'react';
import ReactDOM from 'react-dom';
import {GoogleApiWrapper} from 'google-maps-react';
import { Map, Marker, InfoWindow } from 'google-maps-react';

export class Container extends React.Component {
  render() {
    if (!this.props.loaded) {
      return <div>Loading...</div>
    }
    return (
      <Map google={this.props.google} zoom={18} center={this.props.location}>
        <Marker 
          onClick={this.onMarkerClick}
          name={'Current location'}
          position={this.props.location}
        />
      </Map>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyDxNNH0iTkW6wmwxxajMt_lDiwvic_f9a8'
})(Container)