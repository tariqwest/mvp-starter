import React from 'react';
import ReactDOM from 'react-dom';
import {GoogleApiWrapper} from 'google-maps-react';
import { Map, Marker, InfoWindow } from 'google-maps-react';

export class Container extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      map: null
    }
  }

  // setMap(){
  //   if(this.props.loaded){
  //     if(this.state.map === null){
  //       var map = this.props.google.maps;
  //       console.log('Maps prop:', map);
  //         this.setState({
  //           map: map
  //         });
  //         //console.log(this.state.map);
  //     }
  //   }
  // }

  // componentDidMount(){
  //   console.log('Mount:', this.props);
  // }

  // componentDidUpdate(){
  //   console.log('Update:', this.props);
  //   this.setMap();

  // }

  render() {
    if (!this.props.loaded) {
      return <div>Loading...</div>
    }

    return (
      <div id="map-div">
      <Map google={this.props.google} zoom={18} center={this.props.location}>

        <Marker 
          onClick={this.onMarkerClick}
          name={'Current location'}
          position={this.props.location}
        />
      </Map>
      </div>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyDxNNH0iTkW6wmwxxajMt_lDiwvic_f9a8'
})(Container)