import React from 'react';
import ListItem from './ListItem.jsx';

const List = (props) => (
  <div>
    { props.items.map(item => <ListItem item={item} addToSelectedPhotos={props.addToSelectedPhotos} removeFromSelectedPhotos={props.removeFromSelectedPhotos} />)}
  </div>
)

export default List;