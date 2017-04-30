import React from 'react';

class ListItem extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      selected: false
    };
    this.toggleSelect = this.toggleSelect.bind(this);
  }

  toggleSelect(){
    if(this.state.selected === true){
      this.props.removeFromSelectedPhotos(this.props.item);
      this.setState({selected: false});
    }else{
      this.props.addToSelectedPhotos(this.props.item);
      this.setState({selected: true});
    }
    
  }

  render(){
    return (
      <div>
        <img style={ {border: this.state.selected ? "1px solid red" : "1px solid #ccc", objectFit: 'cover', width: '98%', padding: '5px', margin: '15 0 15 0' } } onClick={this.toggleSelect} src={ 'https://farm' + this.props.item.farm + '.staticflickr.com/' + this.props.item.server + '/' + this.props.item.id + '_' + this.props.item.secret + '.jpg' }/>
      </div>
    )
  }

}

export default ListItem;